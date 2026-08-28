---
toc: true
title: RAG 离线链路
weight: 23
tags: [RAG, 入门]
---

## 一. 文档加载

加载阶段的目标是把不同格式的文档统一读成纯文本。PDF 按页抽取文字，Word 按段落抽取文字，Markdown 等纯文本文件直接读取。

```python
from pathlib import Path

from docx import Document
from pypdf import PdfReader


def load_document(path: str) -> str:
    suffix = Path(path).suffix.lower()

    if suffix == ".pdf":
        reader = PdfReader(path)
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)

    if suffix == ".docx":
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)

    return Path(path).read_text(encoding="utf-8")


text = load_document("员工手册.pdf")
print(f"加载完成：{len(text)} 个字符")
```

示例输出：

```text
加载完成：4820 个字符
```

## 二. 数据切分


---

## 1. 递归/层级分块 (Recursive/Hierarchical Chunking)

### 1.1 核心理论

递归分块的核心思想是**维护语义单元的完整性**。它不会机械地从第一个字符切割，而是按照一个预定义的**分隔符优先级列表**，从最粗的粒度开始，层层递进地尝试切分。

**工作流程：**

1. **首选粗粒度分隔符**：例如，优先使用段落分隔符（`\n\n`）进行切分。
2. **检查块大小**：如果切出的某个块大小仍然超过设定的 `chunk_size` 上限。
3. **降级到次级分隔符**：在这个超长块内部，改用下一级分隔符（如句号 `。`、换行符 `\n`）再次尝试。
4. **递归进行，直到达标**：此过程递归执行，可能直到句子、词语，甚至字符级别，确保所有块都符合大小要求。

### 1.2 代码实现（基于 LangChain）

`RecursiveCharacterTextSplitter` 是这一策略的经典实现，也是 LangChain 官方推荐的通用起点。

#### 安装依赖

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. 初始化分块器
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,        # 每个块的最大字符数
    chunk_overlap=50,      # 相邻块的重叠字符数，用于缓解边界上下文丢失
    separators=["\n\n", "\n", "。", "，", " ", ""]  # 分隔符优先级列表
)

# 2. 待切分的长文本
long_text = "这是第一段。\n\n这是第二段，它包含了一些内容。并且它比较长。"

# 3. 执行切分
chunks = text_splitter.split_text(long_text)

# 4. 查看结果
for i, chunk in enumerate(chunks):
    print(f"块 {i+1}:\n{chunk}\n{'-'*20}")
```
## 2. 语义分块 (Semantic Chunking)
### 2.1 核心理论
语义分块不依赖固定的分隔符，而是借助机器学习模型理解文本语义。其核心是：将语义上紧密相关的句子聚合在一起，当语义发生明显跳跃时，则在此处切分。

工作流程：

- 句子切分：使用 NLP 工具（如 NLTK）将文本切分成独立的句子。

- 向量化：使用嵌入模型（如 all-MiniLM-L6-v2）为每个句子生成向量（Embedding），代表其语义。

- 计算相似度：遍历句子，计算相邻句子向量的余弦相似度。

- 动态切分：设定一个相似度阈值。如果两个相邻句子的相似度低于阈值，则认为语义发生转变，在此处分块。

### 2.2 代码实现（基于 Sentence-Transformers）
下面是一个基于 sentence-transformers 库的精炼实现，清晰展示了核心逻辑。

```python
from sentence_transformers import SentenceTransformer, util

# 1. 加载轻量级嵌入模型
model = SentenceTransformer("all-MiniLM-L6-v2")

def semantic_chunk(text, sim_threshold=0.7):
    """
    根据句子间的语义相似度进行分块。

    Args:
        text: 输入的整段文本。
        sim_threshold: 相似度阈值，低于此值则切分。建议从 0.7 开始尝试调整。

    Returns:
        一个由字符串组成的列表，每个字符串是一个语义块。
    """
    # 2. 简单分句（实际场景可换用更强大的分句工具）
    sentences = [s.strip() for s in text.split('。') if s.strip()]
    if not sentences:
        return []

    # 3. 计算所有句子的向量
    embeddings = model.encode(sentences)

    chunks = []
    current_chunk = [sentences[0]]  # 从第一句开始

    # 4. 遍历并比较相邻句子的相似度
    for i in range(1, len(sentences)):
        # 计算当前句子与前一句的余弦相似度
        sim = util.cos_sim(embeddings[i-1], embeddings[i]).item()

        # 5. 如果相似度低于阈值，则在此切分
        if sim < sim_threshold:
            chunks.append("。".join(current_chunk) + "。")
            current_chunk = [sentences[i]]  # 开启新块
        else:
            current_chunk.append(sentences[i])

    # 添加最后一个块
    if current_chunk:
        chunks.append("。".join(current_chunk) + "。")

    return chunks

# --- 使用示例 ---
doc = "人工智能技术发展迅速。机器学习是AI的核心技术。深度学习推动了AI革命。自然语言处理技术不断进步。聊天机器人越来越智能。计算机视觉应用广泛。图像识别准确率不断提高。"

result = semantic_chunk(doc, sim_threshold=0.6)
for i, chunk in enumerate(result):
    print(f"语义块 {i+1}: {chunk}")
```

## 三. BGE-M3 向量化并写入 Milvus

本步把每个子块同时编码成 Dense 向量和 Sparse 向量，并连同原文、来源和 `parent_id` 一起写入 Milvus Collection。

```python
from pymilvus import (
    Collection,
    CollectionSchema,
    DataType,
    FieldSchema,
    connections,
    utility,
)
from pymilvus.model.hybrid import BGEM3EmbeddingFunction

# 本地文件 uri 会自动启用 Milvus Lite；生产环境可换成 Milvus 服务地址
connections.connect(uri="./rag_demo.db")

ef = BGEM3EmbeddingFunction(use_fp16=False, device="cpu")
dense_dim = ef.dim["dense"]

collection_name = "rag_docs"
if utility.has_collection(collection_name):
    Collection(collection_name).drop()

fields = [
    FieldSchema(name="pk", dtype=DataType.VARCHAR, is_primary=True, auto_id=True, max_length=100),
    FieldSchema(name="parent_id", dtype=DataType.VARCHAR, max_length=64),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=2000),
    FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="sparse_vector", dtype=DataType.SPARSE_FLOAT_VECTOR),
    FieldSchema(name="dense_vector", dtype=DataType.FLOAT_VECTOR, dim=dense_dim),
]
collection = Collection(collection_name, schema=CollectionSchema(fields))

texts = [item["text"] for item in child_chunks]
embeddings = ef(texts)

collection.insert([
    [item["parent_id"] for item in child_chunks],
    texts,
    [item["source"] for item in child_chunks],
    embeddings["sparse"],
    embeddings["dense"],
])

collection.create_index(
    "sparse_vector",
    {"index_type": "SPARSE_INVERTED_INDEX", "metric_type": "IP"},
)
collection.create_index(
    "dense_vector",
    {"index_type": "AUTOINDEX", "metric_type": "IP"},
)
collection.load()

print(f"Collection {collection_name} 已创建")
print(f"入库数量：{collection.num_entities}")
print(f"Dense 向量维度：{dense_dim}")
```

示例输出：

```text
Collection rag_docs 已创建
入库数量：28
Dense 向量维度：1024
```

说明：

- Milvus Collection 同时保存 `sparse_vector` 和 `dense_vector`，这是后面 Hybrid Search 的数据基础
- `AUTOINDEX` 与 `SPARSE_INVERTED_INDEX` 分别是 Dense 和 Sparse 向量在 Milvus Lite 上的常用索引
- 更新知识时不能只替换原文件，必须重新切分、重新向量化并更新 Collection

