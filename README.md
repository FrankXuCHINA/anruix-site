# 安锐的小站

> 念念不忘，必有回响。

这是 [anruix.com](https://www.anruix.com) 的博客源码仓库。

安锐的小站是一个围绕 **摄影、摄像与后期制作** 的个人记录站，用来整理学习过程中真正理解的知识、方法与经验。相比零散地收藏教程，我更希望通过持续记录、实践和复盘，让每一次学习都留下清晰的痕迹，也方便以后重新查阅、补充和修正。

## 🌐 访问网站

**https://www.anruix.com**

## ✨ 主要内容

- **拍摄技巧**：曝光、对焦、构图、用光、运镜与拍摄参数等内容
- **后期制作**：修图、剪辑、调色、素材管理与输出流程等内容
- **创作记录**：摄影作品、视频创作、拍摄过程以及项目复盘

这里记录的是学习与实践中的阶段性理解，不一定是唯一答案。随着经验积累，部分内容也会持续补充、修正和更新。

## 🛠️ 技术栈

- [Astro](https://astro.build/)
- [Firefly](https://github.com/CuteLeaf/Firefly)
- TypeScript
- Tailwind CSS
- Svelte
- Swup
- Pagefind
- Markdown
- pnpm

站点以 Firefly 为主题底座进行静态生成，并接入本站内容、身份、分类、备案和 URL 等个人配置。

## 🚀 本地运行

环境需要 Node.js 22+ 与 pnpm 11+。

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

常用检查：

```bash
pnpm format
pnpm check
```

## 📂 内容位置

```text
src/content/posts/       博客文章
src/content/spec/        关于等独立内容页
src/config/              站点与个人信息配置
public/                   静态资源
```

## 🙏 致谢

本站基于 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly) 构建并进行个人化配置。Firefly 基于 [Fuwari](https://github.com/saicaca/fuwari) 发展，相关作者版权见 [LICENSE](./LICENSE)。

## 📄 License

代码部分遵循仓库中的 [MIT License](./LICENSE)。

博客文章、摄影作品与其他原创内容的版权归其原作者所有，除非对应内容另有说明。
