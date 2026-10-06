# Shun · 技术与实践

Vue 3 / Nuxt / Nuxt Content 静态博客，记录 AI 应用、软件工程与个人实践。

## 本地使用

需要 Node.js 22.16+（已使用 Node 24 验证）。在仓库根目录执行：

```powershell
npm run setup
npm run dev
```

开发地址：<http://127.0.0.1:1313/>。

## 写文章

唯一内容源为 `nuxt-site/content/notes/`。文章保留 YAML front matter，`path` 显式指定网址，示例：

```yaml
---
title: 我的工程笔记
description: 本文介绍解决问题的过程。
path: /engineering/my-note
kind: article
section: engineering
tags: [软件工程]
date: '2026-01-01'
lastmod: '2026-01-01'
draft: false
toc: true
---
``` 

编辑后运行 `npm run inventory` 更新文章列表和全文搜索索引。已有网址变更时需要显式建立重定向，脚本会阻止无意改动。源文件的历史 `source` 和 `migration` 字段仅记录迁移来源，不依赖 Hugo。

## 静态构建和部署

```powershell
npm run generate
npm run check
npm run preview
```

部署目录：`nuxt-site/.output/public`。静态预览：<http://127.0.0.1:4173/>。安装依赖、开发缓存和恢复备份不上传。

Cloudflare Pages 配置：项目根目录 `nuxt-site`，构建命令 `npm run generate`，输出目录 `.output/public`，Node 版本 `24`。环境变量 `NUXT_PUBLIC_SITE_URL` 设置实际网站地址，影响 canonical、OG、RSS 和 sitemap。目前默认地址沿用 `https://shun-8sk.pages.dev`。本地迁移没有修改 Cloudflare 线上项目配置。
