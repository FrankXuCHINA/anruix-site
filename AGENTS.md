# 安锐的小站：Codex 项目规则

本仓库是 `anruix.com` 的博客主仓库，也是已发布内容的最终来源（source of truth）。

## 博客内容

- 正式文章位于 `src/content/posts/`。
- 关于页面位于 `src/content/spec/about.md`。
- 新文章发布前应保持现有 Frontmatter 结构与站点约定一致。
- 对文章做最终发布或同步时，以本仓库中的最终 Markdown 为准；Notion 用于草稿、整理和可读备份。

## Notion 工作流

- Notion 总入口为「安锐的小站」。
- 博客文章路径为「安锐的小站 → 博客文章 → 分类 → 独立文章页面」。
- 固定分类为：`拍摄技巧`、`后期制作`、`创作记录`。
- 在 Notion 新建博客文章前，如果用户没有明确指定分类，必须先询问文章属于上述哪一个分类，再创建页面。
- 已发布文章需要回备份到 Notion 时，应优先读取本仓库最终 Markdown，再同步正文与图片链接；可将博客专用语法转换为更适合 Notion 阅读的原生块，但不要改变正文含义。

## 图片与 PicGo

- 本地博客图片上传优先使用 PicGo 官方 Agent Skill：`picgo-upload`。
- PicGo 桌面端已配置好腾讯云 COS 图床；不要重复配置 COS 凭据，也不要读取、保存或提交 SecretId / SecretKey。
- 当前本机 PicGo Server：`http://127.0.0.1:36677`。
- HTTP 上传接口：`POST http://127.0.0.1:36677/upload`。
- 请求体使用本地绝对路径，例如：

```json
{
  "list": [
    "D:\\path\\to\\image.png"
  ]
}
```

- 上传成功后使用 PicGo 返回的 URL；博客正式图片 URL 应优先为 `https://img.anruix.com/...`。
- 将返回 URL 写入 Markdown，不要仅保留本地图片路径。
- 除非用户明确要求，否则不要把博客原始配图文件直接提交到本仓库。
- PicGo 未运行或官方 Skill 无法完成上传时，可以回退到上述本地 HTTP API；不要绕过 PicGo 直接操作腾讯云 COS 上传接口。

## 删除与安全边界

- PicGo 相册中的删除只视为本地上传记录管理，不代表删除 COS 云端对象。
- 不要自动删除腾讯云 COS 中的任何对象，也不要实现或调用 COS 删除接口。
- COS 云端对象的实际删除由用户本人在腾讯云 COS 控制台手动完成。

## 发布检查

在完成文章或站点修改后，按任务范围运行适用的非破坏性检查：

- `pnpm format`
- `pnpm check`
- `pnpm build`

提交前检查 `git diff`，避免夹带无关文件。用户要求发布时再执行 commit / push；GitHub 更新后由现有部署流程自动发布。