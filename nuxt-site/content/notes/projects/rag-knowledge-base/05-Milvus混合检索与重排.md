---
toc: true
title: Milvus 混合检索与重排
description: 组合 Dense、Sparse 与 CrossEncoder，兼顾语义召回、精确匹配和候选结果精排。
date: 2026-06-26
lastmod: 2026-06-26
weight: 35
tags:
  - RAG
  - Milvus
  - 混合检索
  - 重排
path: /projects/rag-knowledge-base/05-milvus混合检索与重排
source: content/projects/rag-knowledge-base/05-Milvus混合检索与重排.md
kind: project-chapter
section: projects
featured: false
draft: false
migration:
  generator: nuxt-site/scripts/migrate-content.mjs
  sourceSha256: f778c8900d69f40cd09010b586d6f354e6f946b3058a7730dd9af1d850282c85
---

有一个场景几乎每个 RAG 项目都会踩：

用户问「报销单号 R-2024-001 走到哪一步了」，纯向量检索召不回来。
因为「R-2024-001」这种标识符没有语义，embedding 把它压缩成一个几乎无意义的向量，
余弦相似度给不出高分。而这类查询在内部知识库里非常高频。

## 先给结论

企业检索需要三种能力叠加，少一种都会在具体场景漏答案：

```text
语义匹配   dense 向量       —— 问法和文档用词不一致时救命
精确匹配   sparse 向量      —— 编号、术语、缩写的兜底
精排       CrossEncoder    —— 把正确答案从候选池里捞到最前面
```

## 一、一路模型，三路表示

项目用的是 BGE-M3，它的价值在于**一个模型同时产出三种表示**：

| 表示 | 作用 | 适合的场景 |
| --- | --- | --- |
| dense | 语义相似度 | 「怎么请假」匹配到「请假申请流程」 |
| sparse | 词级权重 | 编号、专有名词、缩写 |
| colbert | 细粒度交互 | 长文档里的局部匹配 |

多表示的意义不是「更强」，而是**互补**：dense 漏掉的由 sparse 兜住，
sparse 分不清的语义近似由 dense 补上。项目里做了 dense + sparse 的混合召回，
两路各自出候选，再统一进入重排。

## 二、HNSW：召回速度和准确率的交换

向量索引用的是 HNSW（分层可导航小世界图）。它的核心参数只有两个方向：

```text
M              每个节点的邻居数 -> 越大越准，内存越大
efConstruction 建索引时的搜索宽度 -> 越大索引质量越高，建库越慢
efSearch       查询时的搜索宽度 -> 越大越准，查询越慢
```

这不是「调优」，是**在固定硬件上选择你愿意付出多少延迟换多少召回**。
企业知识库的规模通常是万级到百万级 chunk，HNSW 的默认参数就够用，
真要调，也应该先用评测集确认「漏在了召回阶段还是排序阶段」，再决定调哪个参数。

## 三、重排：把 top20 变成可信的 top4

召回阶段拿回来的是候选，不是答案。当前链路的两级收敛是：

```text
召回：FAQ top_k = 20，文档 top_k = 20
重排：rerank_top_n = 5
入参：final_context_top_n = 4
```

为什么必须重排？因为向量检索是**双塔结构**：query 和 document 分别编码，
比较的是两个独立向量的距离，两者之间从未真正「见过面」。
CrossEncoder 把 query 和 doc 拼在一起送进同一个模型打分，判断精度高得多，
代价是无法预先建索引——只能对少量候选做，所以必须放在召回之后。

这一步的收益往往被低估：正确答案常常在召回结果的第 10–20 位，
如果没有重排、直接按 top_k=4 截断，它就永远进不了 prompt。

## 四、过滤：检索不能跨租户、跨版本

召回不是全局搜索，带三组约束：

- **数据域**：`tenant_id` / `dataset_id` / `visibility` / `allowed_roles`
- **知识分类**：`source_filter`（hr / it / finance）
- **版本有效期**：只召回当前 active 版本对应的 chunk 范围

过滤条件在检索前就下推到 Milvus 查询里，而不是拿回来再筛。
顺序反过来会带来两个问题：召回数量不足（筛完剩不下几条）、以及**越权召回**
（先把别的租户的数据取回内存，再在应用层过滤，一旦日志或异常栈打印出来就是泄露）。

## 五、版本兼容是真实存在的坑

`qa_core/retrieval/milvus_compat.py` 这个文件看起来不起眼，但它是被真实问题逼出来的：
Milvus 不同版本的 API 参数、返回结构、hybrid search 的调用方式会有差异。
把兼容逻辑收敛到一个模块，比在业务代码里到处写 `if version >= ...` 干净得多。
**如果你打算长期维护一个检索链路，专门留一个兼容层是值得的。**

## 动手验证

检索调试接口不调用 LLM，只返回中间结果，是观察检索质量最快的入口：

```powershell
# 看一次检索的完整中间态：召回、分数、重排前后顺序
curl -X POST http://127.0.0.1:18000/api/retrieval/debug -H "Content-Type: application/json" -d "{\"query\": \"报销单号 R-2024-001 走到哪一步了\", \"source_filter\": \"finance\"}"

# Milvus 基础操作（连接、建集合、写入、检索）
python scripts/demo/demo_ch04_milvus_basics.py
```

对比实验建议按这个顺序做：**只 dense → dense + sparse → 再加 CrossEncoder**，
每次只看同一个问题的候选顺序变化。这样你能准确知道收益来自哪一层，
而不是笼统地觉得「加了重排好像好一点」。

想深入原理可以配合两篇附录：`site/appendix/appendix-c-hnsw-index.html` 和
`site/appendix/appendix-d-crossencoder-reranker.html`。

## 取舍与边界

- **混合检索增加了延迟和复杂度**：两路召回 + 重排，比单路 dense 慢。
  如果语料里没有编号类查询、术语也很规范，单路 dense 就够。
- **重排模型吃 CPU/GPU 资源**：本地 `bge-reranker-large` 推理不便宜，
  候选数量要控制在合理范围（这里是 20 进 5）。
- **过滤条件必须能落到存储层**：如果你的向量库不支持元数据过滤，
  要么换库，要么在设计阶段就把租户拆成独立集合。

下一篇回到主链路：检索到的东西，凭什么敢拿它回答。
