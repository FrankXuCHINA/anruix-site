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
- [Fuwari](https://github.com/saicaca/fuwari)
- TypeScript
- Tailwind CSS
- Svelte
- Swup
- Pagefind
- Markdown
- pnpm

站点采用静态生成，保留 Fuwari 的核心博客能力，并在其基础上进行了中文化、页面样式、导航、文章展示与交互等方面的个人定制。

## 🚀 本地运行

环境需要 Node.js 20+ 与 pnpm 9+。

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
src/config.ts            站点与个人信息配置
public/                   静态资源
```

## 🙏 致谢

本站基于 [saicaca/fuwari](https://github.com/saicaca/fuwari) 构建，并在原项目基础上进行个人化修改。

感谢 Fuwari 与其相关开源项目的作者和贡献者。

## 📄 License

代码部分遵循仓库中的 [MIT License](./LICENSE)。

博客文章、摄影作品与其他原创内容的版权归其原作者所有，除非对应内容另有说明。
