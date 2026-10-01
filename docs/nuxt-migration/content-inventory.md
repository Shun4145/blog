# Hugo → Nuxt 内容盘点

生成时间：2026-09-29T11:57:50.574Z。由 scripts/nuxt-content-inventory.mjs 自动生成，请勿手工修改。

## 数据来源与重跑

- URL：tools/hugo.exe list all --noBuildLock 的 permalink，使用 URL.pathname 保留百分号编码，未从文件名推导 slug。
- Hugo：hugo v0.165.0-76a5e1880ab46688155b02e99bab9be2a6134492+extended windows/amd64 BuildDate=2026-08-12T14:26:28Z VendorInfo=gohugoio
- metadata：使用 Nuxt 工程显式依赖 yaml 解析 YAML front matter。date 缺失为 null；lastmod 回退 date / publishDate。集合页不复制 Hugo 推导的子页日期。draft 使用 Hugo 实际列表值。
- 在仓库根目录运行 node scripts/nuxt-content-inventory.mjs；--check 检查产物是否过期，--patch 输出首次创建产物用的 apply_patch。依赖未安装会明确失败。
- entries / counts 未变化时保留 generatedAt，连续重跑不会产生时间戳噪音。缺失 URL、重复路径或无效 YAML 会中止。

## 分类与契约

共 28 个 Markdown 页面：知识笔记 12，项目章节 8，集合及其他页面 8。

- article：Agent / RAG 的普通知识笔记；project-chapter：projects 下普通章节；page：首页、关于、栏目集合、项目概览、标签入口。
- counts.pages 仅计 kind=page；三个计数相加才是 Markdown 总数。项目概览不计入章节。
- JSON 契约为 {generatedAt, counts:{articles,projectChapters,pages}, entries:[{source,title,description,path,section,kind,date,lastmod,tags,featured,draft,compatibility:{shortcodes,rawHtml,mermaid}}]}。
- shortcodes 为去重名称数组，rawHtml / mermaid 为布尔值。description 缺失为空串，tags 缺失为空数组；featured 缺失为 false。
- Hugo 自动产生的标签 term 页没有 Markdown 源文件，不列入 entries；后续须按 tags 生成并核对其真实 URL。

## 旧 URL 对照

| 源文件 | 标题 | 分类 | Hugo 旧路径 |
| --- | --- | --- | --- |
| content/_index.md | 首页 | page | / |
| content/about/_index.md | 关于 | page | /about/ |
| content/agent/01-FunctionCall函数调用.md | Function Call：让大模型学会调用外部工具 | article | /agent/01-functioncall%E5%87%BD%E6%95%B0%E8%B0%83%E7%94%A8/ |
| content/agent/02-MCP协议.md | MCP 协议：给大模型的工具装一个「Type-C 接口」 | article | /agent/02-mcp%E5%8D%8F%E8%AE%AE/ |
| content/agent/03-Agent智能体.md | Agent 智能体：从工具调用到多智能体协作的五种模式 | article | /agent/03-agent%E6%99%BA%E8%83%BD%E4%BD%93/ |
| content/agent/04-A2A协议.md | A2A 协议：让多个 Agent 像同事一样协作 | article | /agent/04-a2a%E5%8D%8F%E8%AE%AE/ |
| content/agent/_index.md | Agent 技术笔记 | page | /agent/ |
| content/articles/_index.md | 文章 | page | /articles/ |
| content/projects/_index.md | 项目 | page | /projects/ |
| content/projects/rag-knowledge-base/01-架构总览与阅读地图.md | 企业级 RAG 平台架构：一次提问背后的完整链路 | project-chapter | /projects/rag-knowledge-base/01-%E6%9E%B6%E6%9E%84%E6%80%BB%E8%A7%88%E4%B8%8E%E9%98%85%E8%AF%BB%E5%9C%B0%E5%9B%BE/ |
| content/projects/rag-knowledge-base/02-环境搭建与启动预热.md | RAG 环境搭建：六个容器与启动预热 | project-chapter | /projects/rag-knowledge-base/02-%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA%E4%B8%8E%E5%90%AF%E5%8A%A8%E9%A2%84%E7%83%AD/ |
| content/projects/rag-knowledge-base/03-知识入库与增量指纹.md | 知识入库与增量指纹 | project-chapter | /projects/rag-knowledge-base/03-%E7%9F%A5%E8%AF%86%E5%85%A5%E5%BA%93%E4%B8%8E%E5%A2%9E%E9%87%8F%E6%8C%87%E7%BA%B9/ |
| content/projects/rag-knowledge-base/04-意图识别与检索策略.md | 意图识别与检索策略 | project-chapter | /projects/rag-knowledge-base/04-%E6%84%8F%E5%9B%BE%E8%AF%86%E5%88%AB%E4%B8%8E%E6%A3%80%E7%B4%A2%E7%AD%96%E7%95%A5/ |
| content/projects/rag-knowledge-base/05-Milvus混合检索与重排.md | Milvus 混合检索与重排 | project-chapter | /projects/rag-knowledge-base/05-milvus%E6%B7%B7%E5%90%88%E6%A3%80%E7%B4%A2%E4%B8%8E%E9%87%8D%E6%8E%92/ |
| content/projects/rag-knowledge-base/06-主链路编排与置信度.md | 主链路编排与答案置信度 | project-chapter | /projects/rag-knowledge-base/06-%E4%B8%BB%E9%93%BE%E8%B7%AF%E7%BC%96%E6%8E%92%E4%B8%8E%E7%BD%AE%E4%BF%A1%E5%BA%A6/ |
| content/projects/rag-knowledge-base/07-缓存版本与隔离.md | 缓存、知识库版本与数据隔离 | project-chapter | /projects/rag-knowledge-base/07-%E7%BC%93%E5%AD%98%E7%89%88%E6%9C%AC%E4%B8%8E%E9%9A%94%E7%A6%BB/ |
| content/projects/rag-knowledge-base/08-质量门禁与评测闭环.md | 质量门禁与评测闭环 | project-chapter | /projects/rag-knowledge-base/08-%E8%B4%A8%E9%87%8F%E9%97%A8%E7%A6%81%E4%B8%8E%E8%AF%84%E6%B5%8B%E9%97%AD%E7%8E%AF/ |
| content/projects/rag-knowledge-base/_index.md | 企业内部知识问答助手 | page | /projects/rag-knowledge-base/ |
| content/rag/01_RAG基础_核心概念.md | RAG 核心概念 | article | /rag/01_rag%E5%9F%BA%E7%A1%80_%E6%A0%B8%E5%BF%83%E6%A6%82%E5%BF%B5/ |
| content/rag/02-Runnable基础接口层.md | 基础接口层 | article | /rag/02-runnable%E5%9F%BA%E7%A1%80%E6%8E%A5%E5%8F%A3%E5%B1%82/ |
| content/rag/03_核心抽象层.md | RAG 核心抽象层：Messages、Prompt、Parser | article | /rag/03_%E6%A0%B8%E5%BF%83%E6%8A%BD%E8%B1%A1%E5%B1%82/ |
| content/rag/04_LangChain-文档处理与对话历史.md | 文档处理与对话历史 | article | /rag/04_langchain-%E6%96%87%E6%A1%A3%E5%A4%84%E7%90%86%E4%B8%8E%E5%AF%B9%E8%AF%9D%E5%8E%86%E5%8F%B2/ |
| content/rag/05_智能体工具与中间件.md | Tools、create_agent 与 Middleware | article | /rag/05_%E6%99%BA%E8%83%BD%E4%BD%93%E5%B7%A5%E5%85%B7%E4%B8%8E%E4%B8%AD%E9%97%B4%E4%BB%B6/ |
| content/rag/06_RAG_离线链路.md | RAG 离线链路 | article | /rag/06_rag_%E7%A6%BB%E7%BA%BF%E9%93%BE%E8%B7%AF/ |
| content/rag/07_RAG_在线链路.md | RAG 在线链路 | article | /rag/07_rag_%E5%9C%A8%E7%BA%BF%E9%93%BE%E8%B7%AF/ |
| content/rag/08_RAG_评估调优.md | RAG 效果评估与调优 | article | /rag/08_rag_%E8%AF%84%E4%BC%B0%E8%B0%83%E4%BC%98/ |
| content/rag/_index.md | RAG 技术笔记 | page | /rag/ |
| content/tags/_index.md | 标签 | page | /tags/ |

## 渲染兼容性

短代码名称：all-posts、projects、section-overview。含原始 HTML 的页面 0；含 Mermaid 的页面 5。

| 源文件 | 短代码 | HTML 标签 | Mermaid |
| --- | --- | --- | --- |
| content/agent/01-FunctionCall函数调用.md | — | — | 是 |
| content/agent/02-MCP协议.md | — | — | 是 |
| content/agent/03-Agent智能体.md | — | — | 是 |
| content/agent/04-A2A协议.md | — | — | 是 |
| content/agent/_index.md | section-overview | — | 否 |
| content/articles/_index.md | all-posts | — | 否 |
| content/projects/_index.md | projects | — | 否 |
| content/rag/01_RAG基础_核心概念.md | — | — | 是 |
| content/rag/_index.md | section-overview | — | 否 |

- section-overview 依赖栏目子页、排序、planned 与统计；all-posts 使用 site.RegularPages.ByLastmod.Reverse（包含项目章节）；projects 调用项目 partial。迁移时需用 Nuxt 查询和组件复现，不可原样渲染 Go 模板。
- Mermaid 在代码围栏中出现，需要客户端渲染、主题切换及图内 HTML 标签支持。普通代码示例中的 HTML 不计 rawHtml。
- hugo.yaml 启用 Goldmark unsafe；后续须决定 Nuxt 的 HTML 策略并视觉核对，不能根据 rawHtml=false 判断全文渲染已兼容。
- layouts/_shortcodes 还保留首页等组件；当前 Markdown 未调用的组件不进入 compatibility，首页布局仍需独立迁移。

## 图片与内部链接风险

| 源文件:行 | 类型 | 目标 | 检查结果 |
| --- | --- | --- | --- |
| content/projects/rag-knowledge-base/_index.md:10 | 图片/资源 | /images/rag-knowledge-base-screenshot.png | 静态资源存在；迁移至 Nuxt public 并保持路径 |
| content/rag/07_RAG_在线链路.md:16 | 链接 | 01_RAG基础_离线链路.md | 目标文件不存在；迁移前需修复 |
| content/rag/07_RAG_在线链路.md:17 | 链接 | 01_RAG基础_环境准备.md | 目标文件不存在；迁移前需修复 |

- 保留旧 URL 的大小写、下划线与百分号编码；Nuxt 路由应消费此 path，避免自行重新 slugify。导航须排除 draft。
- 扫描仅覆盖围栏和行内代码以外的简单 Markdown 链接、引用定义和 HTML src/href；嵌套括号、短代码参数、动态模板、跨行 HTML、远程资源可达性、标题锚点与渲染语义仍需后续验证。
- 图片扫描不等于完整资产清单：还需迁移 Hugo 配置和布局引用的 logo、favicon、OG 图片、JS/CSS；static 对应 Nuxt public，assets/resources 需单独审查。
