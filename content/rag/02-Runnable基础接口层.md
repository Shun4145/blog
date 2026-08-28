---
toc: true
title: 基础接口层
weight: 24
tags: [RAG, 入门,LangChain]
---

> 一句话总结：Runnable 是 LangChain 所有组件的统一接口协议，让 Prompt、LLM、Parser、Retriever 等组件可以用同一套方式调用、组合和扩展。

## 一、 Runnable 是什么

Runnable 是整个 LangChain 的基础接口层。只要某个组件实现了 Runnable，它就能：

- 用 `invoke()`、`ainvoke()`、`stream()`、`batch()` 统一调用。
- 通过 `|` 管道符与其他 Runnable 组合成链。
- 内置重试、回退和生命周期钩子能力。

常见的 Runnable 组件包括：

- Prompt 模板：`ChatPromptTemplate`
- 大模型：`ChatOpenAI`
- 输出解析器：`StrOutputParser`
- 检索器：`vectorstore.as_retriever()`

## 二、 核心方法

### 1. invoke：同步调用

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")

result = llm.invoke("请用一句话介绍 LangChain")
print(result.content)
```

### 2. ainvoke：异步调用

```python
import asyncio

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")


async def main():
    result = await llm.ainvoke("请用一句话介绍 LangChain")
    print(result.content)


asyncio.run(main())
```

### 3. stream：流式输出

`stream()` 会按顺序返回内容片段，适合实现打字机式的流式回答。

```python
for chunk in llm.stream("请用一句话介绍 LangChain"):
    print(chunk.content, end="")
```

### 4. batch：批量调用

`batch()` 同时处理多个输入，适合批量问答或批量文本处理。

```python
questions = [
    "LangChain 是什么？",
    "Runnable 是什么？",
]

results = llm.batch(questions)

for result in results:
    print(result.content)
```

### 5. 核心方法小结

| 方法 | 调用方式 | 适用场景 |
| --- | --- | --- |
| `invoke()` | 同步 | 普通单次调用 |
| `ainvoke()` | 异步 | 异步接口或并发场景 |
| `stream()` | 流式 | 逐字输出、实时展示 |
| `batch()` | 批量 | 多个输入一次处理 |

## 三、 管道符 `|` 组合

Runnable 最核心的能力是通过 `|` 把多个组件组合成一条链。前一个组件的输出会作为后一个组件的输入。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一位严谨的助手"),
    ("human", "请总结以下内容：{content}"),
])

llm = ChatOpenAI(model="gpt-4o-mini")
parser = StrOutputParser()

chain = prompt | llm | parser

result = chain.invoke({
    "content": "Runnable 是 LangChain 所有组件的统一接口协议。",
})

print(result)
```

组合后的 `chain` 本身也是一个 Runnable，所以同样支持：

```python
# 流式输出
for chunk in chain.stream({"content": "LangChain 是一个大模型应用开发框架"}):
    print(chunk, end="")

# 批量处理
results = chain.batch([
    {"content": "第一段文本"},
    {"content": "第二段文本"},
])

# 异步调用
import asyncio


async def main():
    answer = await chain.ainvoke({"content": "异步处理一段文本"})
    print(answer)


asyncio.run(main())
```

## 四、 内置重试与回退

### 1. 重试：with_retry

当模型调用失败时，可以自动重试，适合应对网络抖动、限流等临时错误。

```python
robust_llm = llm.with_retry(
    stop_after_attempt=3,  # 最多尝试 3 次
)

result = robust_llm.invoke("请介绍 LangChain")
print(result.content)
```

### 2.回退：with_fallbacks

主模型不可用时，自动切换到备用模型，提升整体可用性。

```python
primary_llm = ChatOpenAI(model="gpt-4o-mini")
backup_llm = ChatOpenAI(model="gpt-4o")

llm_with_fallback = primary_llm.with_fallbacks([backup_llm])

result = llm_with_fallback.invoke("请介绍 LangChain")
print(result.content)
```

## 五、 生命周期钩子

Runnable 在运行过程中会触发不同阶段的事件，可以通过 Callback 监听这些事件，例如记录日志、统计耗时、监控调用结果。

```python
from langchain_core.callbacks import BaseCallbackHandler
from langchain_openai import ChatOpenAI


class MyHandler(BaseCallbackHandler):
    def on_llm_start(self, serialized, prompts, **kwargs):
        print("LLM 开始调用")

    def on_llm_end(self, response, **kwargs):
        print("LLM 调用结束")


llm = ChatOpenAI(model="gpt-4o-mini")

result = llm.invoke(
    "请介绍 LangChain",
    config={"callbacks": [MyHandler()]},
)
```

除了 `on_llm_start`、`on_llm_end`，LangChain 还提供 `on_chain_start`、`on_chain_end`、`on_retriever_start`、`on_retriever_end` 等钩子，分别对应链路、模型和检索器的生命周期。

## 六、 小结

| 能力 | 作用 | 示例 |
| --- | --- | --- |
| 统一调用 | 所有组件用相同方法调用 | `invoke()`、`ainvoke()` |
| 流式与批量 | 适配实时展示和批量任务 | `stream()`、`batch()` |
| 管道组合 | 用 `|` 把组件组成链 | `prompt | llm | parser` |
| 重试与回退 | 提升调用稳定性 | `with_retry()`、`with_fallbacks()` |
| 生命周期钩子 | 监控组件运行过程 | `on_llm_start`、`on_chain_end` |

Runnable 是 LangChain 应用的地基，Prompt、LLM、Parser、Retriever 等组件都建立在这一接口之上。
