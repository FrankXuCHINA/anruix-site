# 安锐的小站

安锐的小站（Anruix）是一个用于记录摄影、影像、技术与生活的纯静态博客。项目基于 Astro 和 AstroPaper 6.1.0，使用 Astro SSG 生成静态页面。

当前项目只在本地运行，尚未部署到线上。

## 环境要求

- Node.js 22.12.0 或更高版本
- pnpm 11
- 只允许使用 pnpm，不要混用 npm、yarn 或 bun

## 安装依赖

```bash
pnpm install
```

## 本地开发

```bash
pnpm dev
```

默认访问地址为 `http://localhost:4321`。

## 检查与构建

```bash
pnpm format:check
pnpm lint
pnpm astro check
pnpm build
```

生产构建输出到 `dist/`。

## 本地预览生产构建

```bash
pnpm preview
```

## 内容目录

博客文章位于 `src/content/posts/`，支持标准 Markdown 和 MDX。新文章优先使用标准 Markdown。

站点基础配置位于 `astro-paper.config.ts`。

项目内置的 Google Sans Code 字体来自 Google Fonts 官方 v7.000 发布包，并按 `src/assets/fonts/OFL.txt` 中的 SIL Open Font License 1.1 自托管。
