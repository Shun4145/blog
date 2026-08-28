---
toc: true
title: 文档处理与对话历史
weight: 24
tags: [RAG, 入门,LangChain]
---

> 一句话总结：Loader、Splitter、VectorStore 负责把外部文档变成可检索的向量记忆，History 负责保存和读取多轮对话，让模型回答具备“知识”和“上下文”。

## 一、组件总览

| 组件 | 定位 | 常见实现 |
| --- | --- | --- |
| Loader | 从各种数据源读取数据，转换为 `Document` 对象 | `PyPDFLoader`、`TextLoader`、`WebBaseLoader` |
| Splitter | 将长文档切分成语义连贯的文本块 | `RecursiveCharacterTextSplitter`、`TokenTextSplitter` |
| VectorStore | 专门存储和检索向量的数据库 | `Chroma`、`Pinecone`、`Milvus`、`FAISS` |
| History | 存储和读取多轮对话消息列表 | `InMemoryChatMessageHistory`、`RedisChatMessageHistory` |

```text
PDF / TXT / 网页
    │ Loader
    ▼
Document 对象
    │ Splitter
    ▼
文本块 Chunk
    │ Embedding
    ▼
VectorStore
    │ 检索
    ▼
相似文本块 + History 历史消息 → 交给 Prompt
```

## 1 Loader（文档加载器）

### 11 定位

Loader 从各种数据源读取数据，并统一转换为 `Document` 对象。每个 `Document` 包含 `page_content` 和 `metadata` 两部分。

### 1.2 extLoader 加载 TXT

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("data/笔记.txt", encoding="utf-8")
docs = loader.load()

print(docs[0].page_content)  # 文本内容
print(docs[0].metadata)      # 来源、路径等元数据
```

### 1.3 PyPDFLoader 加载 PDF

```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("data/公司资料.pdf")
docs = loader.load()

print(len(docs))              # PDF 页数
print(docs[0].page_content)   # 第一页内容
```

### 1.4 WebBaseLoader 加载网页

```python
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://example.com/article")
docs = loader.load()

print(docs[0].page_content)
```

## 2. Splitter（文本分割器）

### 2.1 定位

Splitter 将长文档切分成语义连贯的文本块，解决大模型上下文长度限制，同时尽量保持每个 Chunk 语义完整。

核心类型：

- `RecursiveCharacterTextSplitter`：最推荐，按自然边界递归分割。
- `TokenTextSplitter`：按 Token 数量分割，更接近模型的实际计费粒度。

关键参数：

- `chunk_size`：每个文本块的大小。
- `chunk_overlap`：相邻文本块之间的重叠部分，避免上下文断裂。

### 2.2 RecursiveCharacterTextSplitter

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", "。", "！", "？", " ", ""],
)

chunks = splitter.split_documents(docs)
print(len(chunks))
print(chunks[0].page_content)
```

### 2.3 TokenTextSplitter

```python
from langchain_text_splitters import TokenTextSplitter

token_splitter = TokenTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
)

token_chunks = token_splitter.split_documents(docs)
print(len(token_chunks))
```

区别：`RecursiveCharacterTextSplitter` 按字符和自然边界切分，`TokenTextSplitter` 按 Token 数量切分，更适合精确控制模型上下文占用。

## 3. VectorStore（向量存储）

### 3.1 定位

VectorStore 是专门存储和检索向量的数据库。文本块先通过 Embedding 模型转换成高维向量，再写入 VectorStore；查询时通过语义相似度找到最相关的文本块。

常见实现：

- `Chroma`：本地轻量级向量库。
- `FAISS`：本地高性能向量检索库。
- `Pinecone`：云端托管向量库。
- `Milvus`：适合大规模生产环境的向量库。

### 3.2 创建向量库

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

embeddings = OpenAIEmbeddings()

vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",
)
```

### 3.3 核心操作

```python
# 1. 新增文档
vectorstore.add_documents([
    {"page_content": "公司成立于 2015 年，主营智能客服。", "metadata": {"source": "intro.txt"}},
])

# 2. 语义相似度检索
results = vectorstore.similarity_search("公司主营什么业务？", k=3)
for doc in results:
    print(doc.page_content)

# 3. 转换为 Retriever，供 RAG 链路使用
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
related_docs = retriever.invoke("公司主营什么业务？")
```

注意：`add_documents()` 接收的是 `Document` 对象列表；上面使用字典是为了展示数据结构，实际项目中应传入 `Document`。

## 4. History（消息历史）

### 4.1 定位

History 负责存储和读取多轮对话的消息列表，让模型记住用户之前说过什么，实现连续对话。

常见实现：

- `InMemoryChatMessageHistory`：内存存储，适合学习和测试。
- `RedisChatMessageHistory`：Redis 存储，适合多实例共享和生产环境。

### 4.2 InMemoryChatMessageHistory

```python
from langchain_core.chat_history import InMemoryChatMessageHistory

history = InMemoryChatMessageHistory()

history.add_user_message("你好，我想查询余额")
history.add_ai_message("好的，请提供你的账号。")
history.add_user_message("我的账号是 10086")

for message in history.messages:
    print(message.type, message.content)
```

### 4.3 RedisChatMessageHistory

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory

history = RedisChatMessageHistory(
    session_id="user_001",
    url="redis://localhost:6379/0",
)

history.add_user_message("你好")
history.add_ai_message("你好，有什么可以帮你？")

print(history.messages)
```

使用 Redis 方案前，需要确保本机或服务器上的 Redis 服务已启动。

### 4.4 与 Prompt 组合

History 中的消息可以通过 `MessagesPlaceholder` 动态插入提示词模板：

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一位智能客服"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}"),
])

result = prompt.invoke({
    "history": history.messages,
    "question": "我的账号还能正常使用吗？",
})

print(result.to_messages())
```

## 二、 小结

| 组件 | 核心任务 | 核心类型 / 操作 | 应用场景 |
| --- | --- | --- | --- |
| Loader | 读取数据并转换为 Document | `PyPDFLoader`、`TextLoader`、`WebBaseLoader` | 知识库文档导入 |
| Splitter | 长文档切成语义连贯文本块 | `RecursiveCharacterTextSplitter`、`TokenTextSplitter` | RAG 向量化前处理 |
| VectorStore | 存储和检索向量 | `add_documents()`、`similarity_search()`、`as_retriever()` | 语义检索、RAG 记忆库 |
| History | 存储和读取多轮对话 | `InMemoryChatMessageHistory`、`RedisChatMessageHistory` | 多轮对话、会话持久化 |

这四个组件共同构成 RAG 应用的“知识”与“上下文”基础：文档先经过 Loader、Splitter、VectorStore 变成可检索的知识，History 则负责保留每次对话的上下文。
