# 项目规格

## 项目与网站名称

- 本地项目名称：`anruix-site`
- 前台网站名称：安锐的小站
- 英文标识：Anruix
- 网站描述：摄影、影像、技术与生活记录

## 技术栈

- Astro 6
- AstroPaper 6.1.0 官方主题
- TypeScript
- Tailwind CSS
- Markdown / MDX
- Pagefind 静态搜索
- pnpm
- Astro SSG 纯静态生成
- 本地自托管 Google Sans Code v7.000（SIL OFL 1.1）
- 默认语言：`zh-CN`
- 默认时区：`Asia/Shanghai`

## 域名规划

- 正式网站域名：`https://www.anruix.com`
- 图片域名：`https://img.anruix.com`
- 当前阶段仅把正式网站域名写入站点配置，不进行 DNS、HTTPS 或域名绑定。

## 部署与图片规划

- 未来计划使用腾讯云 EdgeOne Pages 部署静态站点。
- 未来计划使用腾讯云 COS 存储图片，并通过 `https://img.anruix.com` 访问。
- 当前阶段不配置 EdgeOne Pages、COS、DNS、SSL、备案或任何云端资源。

## 阶段边界

### 第一阶段

- 建立干净的 AstroPaper 基础项目。
- 设置基本站点信息、语言、时区和正式域名。
- 保留主题演示内容与核心博客能力。
- 当前使用静态默认 OG 图片；中文动态 OG 留待后续视觉阶段恢复。
- 新增一篇简体中文测试文章。
- 安装依赖，验证格式、类型、Lint、Astro 检查和生产构建。
- 建立项目规范和本地开发说明。

### 后续阶段

- 增加个人介绍 Hero 和个人头像。
- 增加带封面图的文章卡片，并另行设计封面字段。
- 按需推进更完整的中文本地化和视觉定制。
- 经单独确认后再规划 EdgeOne Pages 部署与 COS 图片接入。

## 长期原则

项目保持纯静态、轻量、易迁移和少依赖。优先使用 AstroPaper 原有能力与标准 Markdown，避免引入不必要的服务端设施、运行时依赖和平台锁定。
