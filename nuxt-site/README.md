# Nuxt 工程

本目录是正式 Vue 3 博客工程，完整使用说明见仓库根目录 README。

- 内容：`content/notes/`，由 Nuxt Content 渲染。
- `npm run inventory`：更新清单及全文搜索；`-- --check` 检查一致性。
- `npm run dev`：开发服务，<http://127.0.0.1:1313/>。
- `npm run generate`：同步内容、预渲染、生成 sitemap/robots/RSS。
- `npm run check:static`：全站页面、链接、资源和旧锚点检查。
- `npm run check:mermaid`：47 个图表的语法检查。
- `npm run preview:static`：静态产物预览，默认 4173 端口，可用 `PORT` 覆盖。

Cloudflare Pages 根目录为本目录，输出 `.output/public`。Node.js 需要 22.16+，推荐 24。`NUXT_PUBLIC_SITE_URL` 应设置为正式域名源地址。Mermaid 按需加载本地 vendor 文件，许可证说明随文件保留。
