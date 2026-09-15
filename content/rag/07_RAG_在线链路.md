---
toc: true
title: RAG 在线链路
weight: 24
tags: [RAG, Milvus, 混合检索, 重排]
description: Dense + Sparse 混合检索、Reranker 精排与流式生成，覆盖 RAG 在线链路的完整实战。
---

## 在线链路实战：混合检索、Reranker 精排与流式生成


## 0. 运行前准备

- 先运行 [RAG基础_离线链路](01_RAG基础_离线链路.md)，确保 `rag_docs` Collection 已创建并加载
- 已按 [RAG基础_环境准备](01_RAG基础_环境准备.md) 配置 `DASHSCOPE_API_KEY`
- 如果在独立脚本中运行，请先补齐下面的初始化代码，后续示例会复用 `ef` 变量

```python
from pymilvus import Collection, connections
from pymilvus.model.hybrid import BGEM3EmbeddingFunction

connections.connect(uri="./rag_demo.db")
ef = BGEM3EmbeddingFunction(use_fp16=False, device="cpu")
```

## 1. Dense + Sparse 混合检索

混合检索把两条检索路线并行执行：Dense 负责语义理解，Sparse 负责精确关键词匹配，再用 `WeightedRanker` 把两路结果融合成一份候选列表。

```python
from pymilvus import AnnSearchRequest, Collection, WeightedRanker


def hybrid_search(query: str, top_k: int = 20) -> list[dict]:
    collection = Collection("rag_docs")
    query_embeddings = ef([query])

    dense_req = AnnSearchRequest(
        [query_embeddings["dense"][0]],
        "dense_vector",
        {"metric_type": "IP", "params": {}},
        limit=top_k,
    )
    sparse_req = AnnSearchRequest(
        [query_embeddings["sparse"][[0]]],
        "sparse_vector",
        {"metric_type": "IP", "params": {}},
        limit=top_k,
    )

    results = collection.hybrid_search(
        [sparse_req, dense_req],
        rerank=WeightedRanker(0.7, 1.0),
        limit=top_k,
        output_fields=["text", "source", "parent_id"],
    )[0]

    return [
        {
            "id": hit.id,
            "text": hit.get("text"),
            "source": hit.get("source"),
            "parent_id": hit.get("parent_id"),
        }
        for hit in results
    ]


candidates = hybrid_search("新员工年假怎么计算？")
print(f"混合检索召回：{len(candidates)} 个候选片段")
for item in candidates[:3]:
    print(item["parent_id"], item["text"][:40])
```

示例输出：

```text
混合检索召回：20 个候选片段
P3C5 第三章 休假制度...
P3C2 年假计算规则...
P1C1 新员工入职流程...
```

说明：

- `query_embeddings["dense"][0]` 取 Dense 查询向量
- `query_embeddings["sparse"][[0]]` 取 Sparse 查询向量，必须使用二维索引，不能写成 `[0]`
- `WeightedRanker(0.7, 1.0)` 分别对应 Sparse 和 Dense 的权重，这里更依赖语义检索

## 2. BGE Reranker 精排

Reranker 对“问题 + 候选片段”逐对打分，从粗排结果中挑出最相关的 Top 5，弥补向量检索只看整体相似度的不足。

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("BAAI/bge-reranker-v2-m3")
pairs = [(query, item["text"]) for item in candidates]
scores = reranker.predict(pairs)

ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)[:5]

for rank, (item, score) in enumerate(ranked, start=1):
    print(f"{rank}. 得分 {score:.3f} | {item['parent_id']} | {item['text'][:40]}")
```

示例输出：

```text
1. 得分 0.921 | P3C5 | 正式员工入职满一年后，每年可享受 5 个工作日年假...
2. 得分 0.886 | P3C2 | 年假按自然年度计算，未休完部分可顺延至次年第一季度...
3. 得分 0.701 | P1C1 | 新员工入职流程：...
```

说明：`reranker` 会在后面的生成步骤中继续复用，因此本示例和下一步示例需要放在同一个 Python 进程里按顺序运行。

## 3. 上下文构建与 DashScope 流式生成

生成阶段把精排后的片段整理成带编号的参考资料，要求模型只依据资料回答，并在末尾用 `[编号]` 标注依据。

```python
import os

import dashscope
from dashscope import Generation


def build_context(items: list[tuple[dict, float]]) -> str:
    blocks = []
    for index, (item, _score) in enumerate(items, start=1):
        blocks.append(f"[{index}] {item['text']}\n来源：{item['source']}")
    return "\n\n".join(blocks)


def answer(question: str) -> str:
    candidates = hybrid_search(question)
    ranked = sorted(
        zip(candidates, reranker.predict([(question, item["text"]) for item in candidates])),
        key=lambda x: x[1],
        reverse=True,
    )[:5]
    context = build_context(ranked)

    prompt = f"""请仅根据以下资料回答问题。

资料：
{context}

问题：{question}

要求：
1. 如果资料中没有答案，请直接说明“资料中未找到相关信息”。
2. 回答末尾用 [编号] 标注依据，例如 [1]。
"""

    responses = Generation.call(
        model="qwen-plus",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        incremental_output=True,
    )

    answer_text = ""
    for response in responses:
        if response.status_code == 200:
            piece = response.output.text
            answer_text += piece
            print(piece, end="", flush=True)
    print()
    return answer_text


answer("新员工入职满一年能休几天年假？")
```

示例输出：

```text
根据《员工手册》第三章，正式员工入职满一年后，每年可享受 5 个工作日年假；年假按自然年度计算，未休完部分可顺延至次年第一季度 [1][2]。
```

说明：

- `stream=True` 开启流式输出，`incremental_output=True` 让每个分片只包含新增文本
- 最终返回的 `answer_text` 是完整答案，可保存到数据库或返回给前端
- 如果希望答案严格可溯源，可以把 `[编号]` 解析出来，再映射到原始文档页码或文件路径
