---
toc: true
title: RAG 效果评估与调优
weight: 25
tags:
  - RAG
  - 评估
  - LangSmith
description: 从检索侧到生成侧的评估指标与调优路径，用数据驱动 RAG 系统的持续改进。
date: 2026-05-26
lastmod: 2026-05-26
path: /rag/08_rag_评估调优
source: content/rag/08_RAG_评估调优.md
kind: article
section: rag
featured: false
draft: false
migration:
  generator: nuxt-site/scripts/migrate-content.mjs
  sourceSha256: 4f51574bf3364a4ab3cce76adf7f2ad7ccb2fff57cc4974dfa0b3447e0d2ffc7
---

## 1. 检索侧指标

| 指标 | 含义 |
| --- | --- |
| Recall@k | 正确答案是否出现在前 k 个结果中 |
| Hit Rate | 至少命中一个相关文档的查询占比 |
| MRR | 第一个正确答案排在第几位的平均倒数 |
| NDCG | 考虑排序位置的加权质量 |

## 2. 生成侧指标

| 指标 | 含义 |
| --- | --- |
| Faithfulness | 答案是否忠于提供的资料，不编造 |
| Answer Relevancy | 答案是否真的回答了问题 |
| Context Precision / Recall | 给模型的上下文是否精准、完整 |

## 3. 常用评估工具

常用评估工具：RAGAS、TruLens、LangSmith。可以把一批“问题 + 标准答案”的测试集跑一遍，用指标驱动优化，而不是只靠人工抽查。

## 4. 常见调优点

1. **切分策略**：父块 800 到 1200 字、子块 150 到 300 字、重叠 20 到 50 字是常用起点；表格、代码、合同条款可能需要专门的切分器。
2. **召回数量**：混合检索先召回 20 到 50 个候选，Reranker 精排后取 Top 3 到 5。
3. **融合权重**：`WeightedRanker(0.7, 1.0)` 表示更依赖语义检索；编号、型号类问题可以调高 Sparse 权重。
4. **元数据过滤**：按部门、文档类型、时间范围过滤，减少无关结果。
5. **查询改写**：多轮对话、指代模糊时，先改写查询再检索。
6. **提示词约束**：要求“资料中没有就说明不知道”，并在答案后附来源编号。

## 5. 进阶方向

- Agentic RAG：让模型自主决定什么时候检索、检索几次、调用哪些工具
- GraphRAG：用知识图谱组织实体关系，适合“关联性”问题
- 多路召回：FAQ 精确匹配 + 向量检索 + SQL/全文检索并行
- 长文档：分层摘要、段落定位、表格结构理解

## 6. 常见误区

1. 只做 Dense 检索，不做关键词召回：编号、型号、专业名词很容易漏。
2. 只做检索，不做 Reranker：粗排结果的前几名不一定最相关。
3. 把整个文档塞进上下文：超出窗口或稀释重点，应切块和精排。
4. 认为 RAG 不需要评估：切分、召回、排序、提示词每一步都可能引入问题。
5. 更新知识只替换文件：必须重新切分、重新向量化，并更新索引。

## 参考文档

- [BGE-M3 官方说明](https://bge-model.com/bge/bge_m3.html)
- [Milvus Hybrid Search with BGE-M3](https://milvus.io/docs/zh/hybrid_search_with_milvus.md)
- [DashScope 千问 API](https://help.aliyun.com/zh/model-studio/qwen-api-via-dashscope)
- [BAAI/bge-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3)
