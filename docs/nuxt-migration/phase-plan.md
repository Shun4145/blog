# Vue 完整迁移与清理记录

## 迁移范围

28 个原 Markdown 页面全部进入 `nuxt-site/content/notes/`，包含 12 篇技术文章、8 个项目章节、8 个集合与介绍页。该目录成为唯一内容源，生成清单和搜索索引不再调用 Hugo。

原网址及中文编码路径保留；新增专题、搜索和 22 个标签页，共 52 个页面。文章索引包含技术文章与项目章节。

## 内容修复

- 在线链路的失效“离线链路”源链接指向现有对应文章。
- 不存在的“环境准备”页面引用改为明确的环境变量准备说明，未虚构对应页面。
- 关于页原 H1 降为 H2，保留正文，避免重复主标题。
- 项目第一章系列说明前的孤立代码围栏删除，说明恢复为正文。
- 三种短代码转换为三个 Vue 内容组件，47 个 Mermaid 图表保留。
- 为 158 个旧标题锚点提供兼容别名。

具体修复记录保存在 `nuxt-site/data/content-inventory.json` 的 migration 字段中。

## 验证（2026-10-01）

- 旧内容与迁移转换检查通过；28 个原 Markdown 与恢复压缩包逐字节一致。
- 独立 Nuxt 静态构建通过，不依赖旧模板、主题或 Hugo 可执行文件。
- 删除旧 Hugo 文件后再次从仓库根目录执行构建与检查，全部通过；部署目录含 207 个文件，合计约 7.98 MiB，最大文件约 3.41 MiB。
- 本地 1313 端口已切换为新站静态预览；52 个页面及 RSS、sitemap、robots、Mermaid、本地图片和内容数据库 HTTP 请求均返回 200。
- 全站静态检查覆盖 52 页、全部本地链接/图片/构建资源、目录锚点、158 个旧锚点。
- 47 个 Mermaid 图表使用本地库和 DOM 测试环境进行语法检查，通过。
- canonical/OG、站点地图、robots、30 个 RSS 订阅文件已生成。
- 浏览器扩展连接此前失败；桌面/移动视觉和真实客户端交互尚未完成验收，静态检查不代表这些项已通过。

## 清理与恢复

旧 Hugo 的 archetypes、assets、根 content、i18n、layouts、static、themes、tools、hugo.yaml 及旧构建产物和依赖已从活动工程移除。原内容和用户未提交修改已保存于 `.migration-backup/hugo-before-vue-20260929.tar.gz`；历史 public 备份已移入同一备份目录。安装下载缓存和临时打包文件已清理。

Nuxt 中的一次性迁移脚本和旧站锚点采集脚本移入恢复目录。日常更新只使用 `sync-content.mjs`，不会重复转换旧源文件。

## 使用与发布

仓库根目录 `npm run dev` 启动新站，继续使用 1313 端口。`npm run generate` 生成 `nuxt-site/.output/public`，`npm run check` 验证。

Cloudflare Pages 需要将根目录改为 `nuxt-site`、构建命令改为 `npm run generate`、输出目录改为 `.output/public`。本次没有修改线上部署、DNS 或域名。
