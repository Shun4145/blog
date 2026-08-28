# Shun 的技术博客

专注 Agent 与 RAG 的技术笔记与工程实践，使用 Hugo + Hextra 构建的个人博客。

线上地址：<https://shun-8sk.pages.dev/>

## 功能特性

- Agent / RAG 双栏目知识库，配套学习路径、栏目统计与文章卡片总览
- 站内搜索（FlexSearch）
- 标签归档与文章页右侧目录导航
- Mermaid 图表、代码高亮
- 新建文章自动生成 front matter 模板

## 技术栈

- Hugo
- Hextra 主题
- FlexSearch
- Mermaid
- Cloudflare Pages（静态部署）

## 目录结构

```text
.
├─ archetypes/            # 新文章自动生成的模板
│  ├─ default.md
│  ├─ agent.md
│  └─ rag.md
├─ assets/css/custom.css  # 站点自定义样式
├─ content/               # 博客内容
│  ├─ agent/
│  ├─ rag/
│  └─ tags/
├─ layouts/               # 自定义模板与 shortcode
├─ static/
├─ themes/hextra/         # Hugo 主题
├─ tools/hugo.exe         # 本地 Hugo 可执行文件
└─ hugo.yaml              # 站点配置
```

## 写文章

在 `content\rag\` 或 `content\agent\` 下新建文章，文件名用数字前缀控制顺序：

```text
01_xxx.md
02_yyy.md
03_zzz.md
```

也可以直接用 Hugo 命令创建，会自动带上模板：

```powershell
.\tools\hugo.exe new content/rag/01_文章标题.md
.\tools\hugo.exe new content/agent/01_文章标题.md
```

文章开头需要 front matter，例如：

```markdown
---
toc: true
title: 文章标题
weight: 20
tags: [RAG, 入门]
---

正文内容
```

其中 `title` 是页面显示名称，`tags` 用于标签归档，`toc` 控制文章页是否显示目录。文件名前缀只影响排序，不影响显示名称。

## 构建

```powershell
.\tools\hugo.exe
```

构建产物输出到 `public\` 目录。

## 部署

推送到 GitHub 后，Cloudflare Pages 自动构建上线。
