---
title: 企业内部知识问答助手
description: 企业级 RAG 知识问答项目，覆盖数据入库、意图路由、混合检索、答案生成、缓存隔离与质量评测。
path: /projects/rag-knowledge-base
source: content/projects/rag-knowledge-base/_index.md
kind: page
section: projects
weight: 0
tags: []
featured: false
draft: false
date: null
lastmod: null
migration:
  generator: nuxt-site/scripts/migrate-content.mjs
  sourceSha256: 13179fef9db971d42250bf3d1aaf52ea4296d14b6019538f695c5fb4b4b5d4e3
---

## 项目概览

面向企业内部知识问答场景的检索增强生成系统，覆盖 HR、IT 支持、财务采购等业务资料。项目重点解决知识分散、回答缺少依据和检索链路难以观测的问题。

![企业内部知识问答助手界面](/images/rag-knowledge-base-screenshot.png)

## 技术重点

| 模块 | 当前方向 |
| --- | --- |
| 文档处理 | 文档加载、清洗、分块与元数据管理 |
| 检索链路 | Dense + Sparse 混合检索与 Reranker 精排 |
| 回答生成 | 上下文约束、来源引用与流式输出 |
| 工程观测 | 检索结果追踪、状态反馈与效果评估 |
