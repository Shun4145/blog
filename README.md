# Shun · 技术与实践

Vue 3 / Nuxt / Nuxt Content 静态博客，记录 AI 应用、软件工程与个人实践。原 Hugo 的 28 个 Markdown 页面已迁移，保留文章网址、中文路径、项目章节和标题锚点。

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
date: '2026-10-01'
lastmod: '2026-10-01'
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

## 已迁移功能

- 12 篇技术文章、8 个项目章节及 8 个集合/介绍页面。
- 首页、专题、全文搜索、22 个标签页、文章目录、章节导航。
- 代码高亮与复制、47 个 Mermaid 图表、本地图片、主题切换和阅读进度。
- 158 个旧标题锚点别名、canonical/OG、RSS、sitemap、robots。

完整静态验证覆盖 52 个页面和所有本地链接、资源与目录锚点；Mermaid 检查验证语法。桌面和移动视觉及客户端交互仍需在实际浏览器确认。

## 旧站恢复

旧站源码、模板、主题、Hugo 工具和当前未提交修改保存在 `.migration-backup/hugo-before-vue-20260929.tar.gz`；旧文章源文件已逐字节验证备份一致。历史生成备份另存于 `.migration-backup/`。

如需恢复，先将压缩包解压到一个新的空目录，核对后再使用；不要直接覆盖当前 Nuxt 工程。清理记录见 `docs/nuxt-migration/phase-plan.md`。
