# Shun 的技术博客

专注 Agent 与 RAG 的技术笔记与工程实践,使用 Hugo + Hextra 构建。

## 本地预览

```powershell
cd C:\Users\14337\Documents\ChatGPT\个人博客
tools\hugo.exe server --bind 127.0.0.1 --port 1313
```

浏览器打开 http://localhost:1313/

## 写文章

在 `content\rag\` 或 `content\agent\` 下新建 `数字_标题.md`,带 front matter:

```markdown
---
title: 文章标题
date: 2026-08-28
tags: [RAG]
---

正文内容
```

## 部署

推送到 GitHub 后,Cloudflare Pages 自动构建上线。