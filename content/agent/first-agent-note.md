---
toc: true
title: 我的第一篇 Agent 笔记
weight: 10
tags: [Agent, 入门]
description: 一篇用于验证站点功能的示例文章
---

这是一篇示例文章,用来验证目录导航、站内搜索、标签与代码高亮等功能。

## 什么是 Agent

Agent(智能体)是指能够自主感知环境、做出决策并执行动作的 AI 系统,通常由大语言模型、工具调用与记忆组件组成。

## 核心组件

| 组件 | 作用 |
| --- | --- |
| LLM | 推理与决策 |
| Tools | 调用外部能力,如搜索、代码执行 |
| Memory | 保存上下文与长期记忆 |

## 代码高亮示例

```python
def plan(prompt: str) -> str:
    return f"plan for: {prompt}"
```

## 总结

- 新建 `content/agent/xxx.md` 即为一篇文章
- 左侧目录与顶部导航可以切换栏目
- 右上角搜索支持全文检索
