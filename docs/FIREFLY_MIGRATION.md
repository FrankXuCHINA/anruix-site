# Firefly-first migration plan

## 当前有效规则（2026-09-10 架构校正）

本节及 cleanup 计划取代原 Phase 1/2 的实现保留规则。后附 Phase 0 与执行记录仅是历史事实，不能作为继续保留 Fuwari 内部代码、关闭 Firefly 功能或限制其布局的依据。原 Phase 2 继续暂停。

- 唯一上游依据：[CuteLeaf/Firefly@db331cff041a1b264026fcee36930fab4d2485db][ff-root]，源码版本标记 6.16.7。沿用已锁定快照，不采用浮动 master，也不将其称为已核实的稳定发行版。
- 审计起点为 `firefly-migration` 的 `aad5fdabf6aff7d216614b021bd9a781466f55e8`；此前 baseline `573b4044a4b5b4394d426f516d39804c7b5be19c`、规划 `1a848c62143837787c62a9be7dd8873fbd31308d` 已独立提交，不重复创建。
- Firefly-first cleanup F1–F4 已依次完成：原生架构与导航 `de9173273d1f02e6053583696fb0790b542b7dfe`、内容展示 `b23416595e25f3f582427bf8be16ca1fcab19048`、内容交互 `9c085a347a751eef3f5d41dd51f657f41adae75d`、Footer 与发布栈 `bb5539e75570c9769052f7f4bd85585d4687bde0`。最终残留清理也已完成：Archive/Categories 接回原生组件链，旧重复组件、Demo 媒体、过期测试与无调用依赖已删除；check/build/Pagefind、用户契约测试及 375/1440px 浏览器回归通过。原 Phase 2 仍未启动。

## Preservation contract

1. **Firefly 是主题本体和默认行为来源。** Layout、组件、配置、CSS、Markdown、Search、TOC、灯箱、Swup、Wallpaper/Hero、waves、动效和主题设置优先直接采用上游原生实现。目录同名、移动文件、升级依赖不等于采用原生实现。
2. 保留上游功能开关、布局、字体、效果和原生配置默认值。不因旧站没有功能而关闭；撤销旧单左栏/仅三导航/强制单列移动布局、每页八篇与单页强制分页、禁止 Zen 字体、只抽取 Hero 字效、额外页面全部关闭等约束。实际已存在的 URL 继续兼容；功能默认值与示例身份数据分别处理。
3. 不导入 Demo 文章、头像、昵称、介绍、社交账号、分类、示例相册/友链/作者服务账号等内容数据。保留原生模块及配置接口；用本站已知值或空数据替换示例值，不杜撰身份、账号或内容。缺少真实媒体/服务配置时使用原生空数据状态，必要时记录最小空值适配，不能靠关功能或保留 Demo 填空。
4. 保留站名“安锐的小站”、站点描述、`zh_CN`、`hue=250`、头像、昵称“安锐”、签名“念念不忘，必有回响”、头像到 `/about/`、favicon。文章和 About 原文、全部 Frontmatter、日期、标签、分类、描述、图片及图床 URL 不改写；Schema 不静默剥离用户字段。
5. 保留单一预声明分类源及固定顺序“拍摄技巧、后期制作、创作记录”，文章只提供 count；零篇仍可见、可访问，标签仍动态。把扩展接入 Firefly 数据链，不保留另一套旧分类组件。
6. `showCoverInPost` 默认 true；false 只限制详情可见封面，包括普通/叠加/文章 Banner，不限制卡片、正文图或 SEO 分享图。用上游封面处理链扩展，不维护平行封面系统。
7. 保留本站备案/Footer 个性化及三张 Lightroom 截图专属尺寸样式。功能手势、内部 DOM、插件顺序、旧 CSS 和历史补丁不作为保留目标；原 Markdown 的内容含义及中文 directive 必须可读，优先由原生 pipeline 实现。
8. 保留 `https://www.anruix.com`、尾斜杠、已公开 URL、本站 SEO 身份与分享图语义、RSS/robots/sitemap 入口及静态部署行为。以原生 SEO/RSS 实现承载，必要时最小兼容；不把“仅四页”作为限制原生功能的标准。
9. 可访问性、搜索结果正确性、导航后清理等是验收结果，不指定旧 searchSequence、TOC capture、PhotoSwipe 或 page-lifecycle 的代码。先验证上游；仅针对复现的问题做最小修复。

## Firefly mapping / cleanup 前定向架构审计（历史）

对照路径均相对于固定上游根目录；“沿用旧实现”不表示文件完全未修改。Firefly 自身共享的 Fuwari 历史代码不需要人为重写，判定标准是与锁定上游的差异及其理由。

| 范围 / 当前路径 | 当前归属与证据 | 原生替换落点 / 处理 |
| --- | --- | --- |
| package / Astro / Content Layer | 已采用与上游一致的 Astro 7.2.10、Tailwind 4.3.3、Svelte 5 工具链；`content.config.ts` 的 glob、render 和 unified 是原生 API。仍保留旧集合字段和旧构建脚本；不能称完整 Firefly 技术架构。 | 对照上游 package、astro.config、content.config、构建脚本补齐真实依赖；用户字段作为扩展。 |
| `src/config.ts`、`types/config.ts` | 仍是 Fuwari 集中配置；没有上游分拆配置能力。 | `config/index.ts` 与 site/sidebar/backgroundWallpaper/font/displaySettings 等配置及 types；默认值逐项对照。 |
| `layouts/Layout.astro`、`MainGridLayout.astro` | 旧页面骨架、脚本、固定左栏和独立 TOC；HeaderTopRow 等职责拆分是局部对齐，不是原生整体替换。 | 同名上游 layouts、SidebarColumn、WallpaperSection、FloatingControls、原生工具函数及生命周期。 |
| `layout/Navbar`、`NavMenuPanel`、`SideBar`、`widget/Profile` | 移动目录/统一菜单解析后仍保留旧 markup、控制逻辑；SideBar 只硬挂 Profile/Categories。 | 上游 Navbar/Profile 及按 sidebarLayoutConfig 组件映射渲染的 SideBar；恢复原生配置能力。 |
| `layout/PostCard`、`PostPage`、`common/Pagination`、文章详情 | entry 数据接口已适配，主体仍旧卡片/详情和分页；原生 CoverImage/PostMeta/PostStats 与可配置布局未完整接入。 | 原生同名组件和 posts 路由，删除旧强制布局/分页显示约束；保留 URL 与用户封面字段。 |
| `controls/Search.svelte`、Navbar 加载器 | 旧 Search 移目录，加 searchSequence/ready/error/timeout 和 onPageView；不是上游 Search。 | 上游 Search、navigation-utils、floating-panel-utils 及对应加载链；保留生产 Pagefind 与真实索引验收。 |
| `widget/TOC.astro` | 仍旧 custom element、section 层级和监听代码。 | 上游 SidebarTOC 及其配套 TOC 工具/布局；不额外保留旧 TOC。 |
| `features/PhotoSwipeManager.astro`、`utils/page-lifecycle.ts` | 从旧 Layout 抽出的 PhotoSwipe + 新自建生命周期包装，与旧 Layout hooks 共存，是明显混合层。 | 原生 FancyboxManager 与 Layout 生命周期；替换后删除 PhotoSwipe 管理器、专用 CSS/依赖及无调用的包装。 |
| `astro.config.mjs`、Markdown/remark/rehype、Expressive Code | unified 是新 API，但实际插件链和自定义渲染仍旧；曾为旧 DOM 避开上游 figure/callout 默认处理。 | 原生 pipeline、`common/Markdown.astro`、callout/figure/代码配置；不全局禁用 figure 或强制旧代码主题/换行。 |
| `styles/global.css`、`tailwind.config.cjs`、Stylus/旧 CSS | Tailwind 4 入口仍以 @config 桥接旧配置，并载入旧布局/PhotoSwipe 样式；是升级兼容层。 | 原生 CSS/变量/字体/响应式入口；待原生调用链接通后删除不再使用的旧桥接，不能仅按文件扩展名删上游仍使用的样式。 |
| 分类、cover、Footer | `config/categories.ts`、count/空状态、post-cover-utils 和备案是真实用户需求，但当前挂在旧组件。 | 迁入原生分类/封面/Footer 扩展点，仅保留数据与最小必要逻辑。 |
| Layout head、RSS/robots、SEO 测试 | 主要仍旧实现，最近补了字段/类型/资源兼容。 | 上游 SEO/RSS + 本站 URL/身份适配；保留用户语义测试，移除锁死旧 DOM、旧脚本或仅四页的断言。 |

**当时结论：** cleanup 开始前仅工具链/API 和部分组件职责、目录、数据接口完成对齐，主要业务组件仍是混合实现。该表用于解释 F1–F4 的替换起点，不代表当前源码状态。

## Compatibility gaps / 必须留下的最小扩展

- **分类：** 沿用唯一 `src/config/categories.ts` 用户定义，接到上游 getCategoryList，按声明顺序输出 `{name,count,url}`。Sidebar、CategoryBar、分类索引、Archive 共用；count 使用原生正式文章筛选。`/archive/?category=…` 保持可达，空类显示分类名及“暂无文章”；真实计数 0/1/0。不要保留旧 Archive 只为复用组件。
- **封面：** 上游 Schema/PostData 增加字段，原生 processedImage/enableInPost 判断再与 `showCoverInPost !== false` 合并，覆盖 overlay/Banner。原生全局开关默认值不被强制改写；分享图始终独立取 image。测试有无 image × 缺省/true/false。
- **Footer：** 在原生 Footer/配置中恢复动态年份、“安锐的小站”、Astro & Firefly；ICP `苏ICP备2026009777号-1`、`/icp.png`、`https://beian.miit.gov.cn/#/Integrated/index`；公安 `苏公网安备 32059002007595号`、`/gongan.png`、`https://beian.mps.gov.cn/#/query/webSearch?code=32059002007595`。两链接 target=_blank、rel=noopener noreferrer；14px 图标，≤640px 纵排约10px间距，每视口仅一份可见。不保留旧双挂载策略作为要求。
- **内容/Markdown：** posts/spec 原文与指纹保留；上游 callout 先验证 :::note[中文标题]、锚点、列表、硬换行、引用与 Math。若原生 figure 改 DOM，仅适配三张精确 URL 的样式（405px/32rem/292px），不全局恢复旧 Markdown；图注/代码块/灯箱默认行为随原生，正文及 URL 不改。
- **URL/SEO：** 文章 ID 统一由原生 `removeFileExtension` / `getPostUrlBySlug` 处理，重复 `getPostSlug` 桥接已移除。核 `/posts/lrc-raw-camera-color-match/`、`/about/`、`/archive/`、`/`、`/{n}/` 规则及 RSS/robots/sitemap；核 canonical、本站作者、日期/语言、原图分享、JSON-LD 转义、RSS XML 清理。新增原生功能路径可保留，不能有 Demo 内容/身份进入索引。托管后台未核实，不导入上游部署 job 改变现有静态发布。
- **默认值与数据：** 本次确认上游含移动 grid 默认、Wallpaper banner、显示设置 enable=false、Zen Banner 字体。这些不再按旧站规则覆盖。媒体/社交/外部服务中的示例数据须移除；允许功能所需的原生请求，不能使用作者示例账号。若原生组件不能处理空数据，记录并最小修复空状态，不暗改开关。

## Firefly-first cleanup：执行顺序与阶段验收

目标：仓库是固定 Firefly 的定制实例；每项上游差异均可归因于用户内容/配置、必要兼容或已复现缺陷。旧 Phase 2 不自动恢复。以下均为下一轮以后另行授权的源码工作，本轮不执行。

| 步骤 | 执行范围 | 独立出口 |
| --- | --- | --- |
| F0：本轮架构校正 | 更新两份规则文档、差异清单；标记旧执行记录为历史。 | 仅两文档变化，分支/源码不变；不提交。 |
| F1：原生架构与配置（已完成） | 已替换 config/types、Layout/MainGridLayout、原生 CSS/字体、Navbar/Sidebar/Profile 及强耦合基础依赖；保留配置能力/默认值并映射本站身份和头像。 | 提交 `de9173273d1f02e6053583696fb0790b542b7dfe`；原生调用链、无 Demo 身份、check/build/Pagefind、375/1440px 页面及导航验收通过。 |
| F2：内容展示组件（已完成） | 已采用原生 PostCard/PostPage/Pagination/详情承载层，并接入真实内容、URL 与 `showCoverInPost`。 | 提交 `b23416595e25f3f582427bf8be16ca1fcab19048`；文章/About 可读、原路由与原生响应式通过。 |
| F3：原生交互系统（已完成） | 已采用原生 Markdown、License、Search、SidebarTOC、Fancybox 与 Layout 生命周期，移除旧 PhotoSwipe/事件包装。 | 提交 `9c085a347a751eef3f5d41dd51f657f41adae75d`；Pagefind、中文 note、TOC、灯箱及连续导航通过。 |
| F4：用户扩展与发布契约收口（已完成） | 已采用原生 Footer 与 SEO/RSS/robots/sitemap 发布栈，并接入备案、本站身份、三分类和封面扩展。 | 提交 `bb5539e75570c9769052f7f4bd85585d4687bde0`；备案布局、公开 URL、分享元数据与索引产物通过。 |
| F5：原生效果验证与视觉微调 | 架构稳定后验证已采用的原生 Hero/Wallpaper/waves/动效；只在另行授权下增加用户媒体/文案或视觉调整。 | 默认效果与原生配置一致，无 Demo 媒体/身份，减少动态偏好和移动端可用；不另造旧 Phase 2 平行 Hero。 |

F1–F3 是依赖顺序，不是允许临时丢用户数据：每一步为保证现站可运行所必需的用户字段、URL、身份映射必须随原生替换一起接入；F4 做全量收口。强耦合组件按可构建单元替换，不留两个系统同时接管同一功能。若单步无法可运行，先调整该步边界并说明，不能借此整仓覆盖。

### 迁移提交策略

- 每轮开始查分支/status/diff，保留无关修改；不 reset/stash/整仓覆盖。已有 baseline 保留作内容证据，不恢复其整套实现。
- F1–F4 与最终残留清理均已完成；无调用旧文件、旧依赖和临时桥接已删除，锁定旧实现细节的测试已改为用户可见结果测试。依赖与 lockfile 同步，提交继续精确暂存并检查 cached diff，不用 git add .。
- F2/F3 删除旧组件与迁移调用者同提交；删除依赖前查剩余引用。F4 的分类/封面/Footer扩展可拆独立提交。仅为旧实现服务的测试删除或重写，不以删用户契约断言使验证通过。
- AGENTS.md 保持既有忽略策略，不强制提交；文档与源码范围区分。未经用户明确授权不得提交、推送或修改 main。

## 最终回归清单

- [x] 上游 SHA 可追溯；核心组件/配置/生命周期与原生一致，每项差异有明确理由，目录迁移不冒充原生采用。
- [x] 功能/开关/字体/效果默认值对照原生，除明确用户覆盖外无擅自开关；无 Demo 身份、文章、账号、媒体或示例数据进入产物/索引。
- [x] 用户文章/About/Frontmatter/图片/头像/favicon/备案资源保持；站名、描述、语言、hue250正确。
- [x] 三分类唯一源、固定顺序、0/1/0与空态可达；标签动态；普通/overlay/Banner封面矩阵与SEO独立通过。
- [x] 两备案文本/图标/URL/属性及移动约10px间距正确，各视口无重复Footer；截图样式只作用于三张真实图片。
- [x] 原生Markdown可读现内容；生产Search/TOC/Fancybox/主题/Swup正确，无重复监听或旧系统并行；可访问性通过行为验证。
- [x] 原公开URL、canonical、RSS/robots/sitemap和本站SEO语义正确；新原生页面无Demo数据，静态部署契约不变。
- [x] ASTRO_TELEMETRY_DISABLED=1；适用格式检查、check/build/Pagefind及375/1440px、连续导航验证通过；跨工具链改动验冻结安装。
- [x] 所有剩余旧兼容桥接均有必要性证据；授权/提交范围清楚，main和远端未改。

## 历史证据（以下不是当前执行规则）

以下保留原始审计与阶段验收记录供追溯；其中“必须保留旧实现”“禁用额外功能”“禁用字体”“仅三导航”等旧要求均已由本轮 Firefly-first 契约替代。历史通过的检查不证明原生替换已完成。

## 范围与证据

- 审计日期：2026-09-05。本阶段只修改两份文档，不迁移、不安装依赖、不提交、不推送、不修改 main。
- 分支 `firefly-migration`；HEAD `c871e1c66c757358e903fbd87784f9b4710b57ca`。**现状基线是 HEAD 加已有 23 个未提交文件改动**，不能用 HEAD 覆盖工作区。
- 原有改动：两个 CI workflow、astro/biome 配置、site 配置/类型；Search、ButtonLink、Pagination、ImageWrapper、Markdown、DisplaySettings、Profile、TOC；两个 layouts；首页/About/Archive/Post/robots/RSS；main.css。本次记录其 SHA-256，结束时逐文件核对。
- `AGENTS.md` 已存在，被 `.gitignore:33` 忽略，最近提交明确将规则保留本地；本次精简它，不改变忽略策略。本文保存可版本管理的迁移契约。
- 官方 [Releases API](https://api.github.com/repos/CuteLeaf/Firefly/releases) 与 [Tags API](https://api.github.com/repos/CuteLeaf/Firefly/tags) 本次均返回 `[]`，latest release 返回 404。**无法核实“最新稳定发行版”**；package 的 `6.16.7` 仅是源码版本标记。
- 研究快照：[CuteLeaf/Firefly@db331cff041a1b264026fcee36930fab4d2485db][ff-root]，当时最新 master，提交时间 `2026-09-04T14:19:56Z`。实施前重新核实发行状态；若仍无稳定发行，明确采用经过验证的固定快照，不能称其为稳定发行版。
- 本文现状来自工作区源码、差异来自固定上游源码；上游仅下载至仓库外临时目录阅读，未执行其脚本。未重新构建现站、未运行 Firefly、未验证生产浏览器或托管后台；已有 dist 不代表新构建验证通过。

## Current state inventory

| 范围 | 当前路径与结论 |
| --- | --- |
| 技术/结构 | `package.json`：Astro 5.13.10、Svelte ^5.39.8、Tailwind ^3.4.19、pnpm 9.14.4。`src/config.ts` / `src/types/config.ts` 集中配置；`src/content/config.ts` 定义 posts/spec；静态输出 dist。 |
| 品牌/主题 | `src/config.ts`：安锐的小站、subtitle 空、zh_CN、hue 250、fixed=false、Banner 关闭、TOC 开启且 depth=2。站点描述“围绕摄影、摄像与后期制作的个人记录站，分享拍摄技巧、后期方法与创作经验。” |
| 字体/尺寸 | `Layout.astro` 导入 Roboto 400/500/700；`tailwind.config.cjs` 保持 Roboto + 现 sans/system 回退；`misc/Markdown.astro` 使用 JetBrains Mono Variable 及斜体。页面宽 75rem，根字号移动端 14px、md 起 16px。 |
| 页面/布局 | `pages/[...page].astro`、`posts/[...slug].astro`、`about.astro`、`archive.astro`、RSS/robots；无独立分类/标签/搜索内容页。`MainGridLayout.astro` 组织 Navbar、Sidebar、主体、Footer、BackToTop、TOC；桌面左栏，移动端主体后显示 Sidebar/Footer。 |
| Navbar/Profile | `Navbar.astro` 仅首页/归档/关于，含搜索、调色、明暗菜单、移动导航。`widget/Profile.astro` 使用 `assets/images/avatar.png`、安锐、念念不忘，必有回响、空社交列表；头像点击 `/about/`，有 hover 遮罩/address-card 图标和按压反馈。 |
| 分类/标签 | `widget/Categories.astro` 局部固定数组补零，当前计数 0/1/0；`utils/content-utils.ts:getCategoryList()` 本身仍动态建类。`Tags.astro` 存在但未挂 Sidebar；标签仍用于元数据/归档。没有 CategoryBar。 |
| 列表/分页 | `PostPage.astro` → `PostCard.astro`，published 倒序、生产过滤 draft；卡片封面/标题可点，description 优先否则首段，显示字数/分钟。`constants.ts` 每页 8 篇；第一页 `/`，后续 `/{n}/`，只有一页也显示分页。 |
| 归档 | `ArchivePanel.svelte` 由 client:only 读取 query；同一维度多 tag/category 为 OR，维度间为交集，支持 uncategorized；按年分组。零文章分类可达，当前为空卡片，没有明确空状态文字。 |
| 详情/About | 详情显示日期/更新日期/标签/分类/阅读统计/许可 CC BY-NC-SA 4.0/前后篇；封面开关兼管无图分隔线。About 从 `src/content/spec/about.md` 经 getEntry/render/Markdown 输出，保留 note、列表换行、引用签名；当前 About 未传 headings，不另有 TOC。 |
| 交互 | `Layout.astro`：Swup 替换 main/#toc、更新 head；滚动条/公式横向滚动、返回顶部、导航滚动隐藏、面板外部点击关闭；localStorage 保存 theme/hue，默认 theme=auto。TOC 基于最浅标题起算两级，依赖 section 包装，宽屏右侧高亮/锚点跳转。 |
| 灯箱 | PhotoSwipe 匹配 `.custom-md img, #post-cover img`；滚轮缩放，点击/单击关闭，双击缩放，无前后箭头，Swup 导航清理/重建。 |
| 搜索 | Navbar 初始化生产 Pagefind、ready/error 事件；Search 有超时兜底、searchSequence 防旧结果覆盖新输入。桌面/移动均保留；dev 假结果不作为搜索验收。Markdown 的 data-pagefind-body 也使 About 参与索引。 |
| Footer/图标 | `Footer.astro` 独立备案排版；`public/icp.png`、`gongan.png`；favicon.png 与 manifest 缓存参数 `20260718-v1`（`constants/icon.ts`）。layout 有桌面/移动两个 Footer 挂载点，每个视口只显示一份。 |

### 内容基线

正式文章 **1 篇**：`src/content/posts/lrc-raw-camera-color-match.md` → `/posts/lrc-raw-camera-color-match/`。

Frontmatter：title `LrC：RAW 自动匹配相机色彩`，published `2026-07-27`，description `将 RAW 默认值设为“相机设置”，让新导入的照片自动匹配相机色彩配置。`，image `https://img.anruix.com/posts/lightroom-raw-color-match-cover.png`，showCoverInPost=false，tags `[Lightroom, RAW, 色彩配置]`，category=后期制作，draft=false，lang=zh_CN；未写 updated。正文含三张 COS 截图、四个 H2、三个 H3 与自定义 note。

审计时文件字节 SHA-256（换行转换也会改变指纹，须另核内容，不能直接认定等价）：

| 文件 | SHA-256 |
| --- | --- |
| `src/content/posts/lrc-raw-camera-color-match.md` | `CCE6D2CC01ED35E8FAE77417D080EB0220A55024976C4F0B6F32D6318D3539FC` |
| `src/content/spec/about.md` | `B132178BC9548C44A71CAFC86C828006327A6FB612A91ADCEAE4188517C7CC9C` |
| `src/assets/images/avatar.png` | `217578FFFB92E0881484866395B0657AC6DB7CEB549FE6EF54CE301B9791AC5E` |
| `public/favicon.png` | `1FF615DF89A6220690F5C5C22961CDBF874554C5CF991853F0EEEFD7F3635CA4` |
| `public/icp.png` | `96188ED413CADA0F4007FDA618837DD4CDA6AB2F313F242E4559CC80AC3012DB` |
| `public/gongan.png` | `3EF5D17967F592BD2494A3E97E457E579C6AC043CB03D219A41A17550A82D9A0` |

### Schema / Markdown pipeline

- 现 Schema：title/published 必填；updated 可选；draft 默认 false；description/image/lang 默认空；tags 默认 []；category 可选、nullable、默认空；showCoverInPost 默认 true；prev/next 的 title/slug 为内部空串字段；spec 为空 Schema。迁移不能静默剥离字段。
- `astro.config.mjs` remark 顺序：Math → ReadingTime → Excerpt → GithubAdmonitionsToDirectives → Directive → Sectionize → 自定义 parseDirectiveNode；rehype：KaTeX → Slug → 自定义 github/note/tip/important/caution/warning → 标题尾部 # 锚点。
- Expressive Code：github-dark、自动换行、行号（shellsession 除外）、折叠段、语言徽标、自定义复制/反馈。`remark-reading-time.mjs` 分钟四舍五入且最少 1；`remark-excerpt.js` 取首段。
- `src/styles/markdown.css` 精确匹配三张 Lightroom 图片 URL：`https://img.anruix.com/posts/01-lightroom-classic-open-preferences.png` 最大 405px，`02-lightroom-classic-raw-default-settings.png` 最大 32rem，`03-lightroom-classic-select-camera-settings.png` 最大 292px（后两者同 URL 前缀）；居中/自适应、0.75rem 圆角、细边/轻阴影，所在 `p:has(> img)` 段间距 1.5rem。不能改为全部撑满或扩散至其他图片。
- RSS 当前另用 MarkdownIt + sanitize（允许 img）并清洗非法 XML 字符，不是站内同一 pipeline；note 的 RSS 呈现不能推定等同网页。

### SEO / URL / 构建部署

- `astro.config.mjs`：site=`https://www.anruix.com`、base=`/`、trailingSlash=always，无 server adapter。不能因仓库简称 anruix.com 改 canonical 的 www。
- 路径契约：`/`、有内容的 `/{n}/`（n≥2）、`/posts/{既有slug}/`、`/about/`、`/archive/`、`/rss.xml`、`/robots.txt`、`/sitemap-index.xml` 及子 sitemap；不恢复已移除文章别名、不新增无依据重定向。
- 分类地址 `/archive/?category=${encodeURIComponent(name)}`，标签 `?tag=`，未分类 `?uncategorized=true`；均为归档筛选，canonical 去查询串为 `/archive/`，不是独立分类静态路由。
- `Layout.astro` 维护 title/description/author/canonical、OG/Twitter、RSS alternate、语言、favicon/manifest。首页仅站名；分页 `第 N 页 - 安锐的小站`；文章描述 Frontmatter → 首段 → 站点描述，无专用分享图时用现头像生成 PNG。
- 详情有 BlogPosting JSON-LD、published/modified 时间、语言/标签/作者，并将 `<` 转义为 `\u003c`；远程/public 封面作为 SEO 分享图，与详情显隐独立。
- robots 当前 `Allow: /`；RSS 使用站点 description 和 language；sitemap 来自 Astro integration。`pagefind.yml` 排除公式/锚点/搜索面板。
- build=`astro build && pagefind --site dist`；check=Astro check；format 会写整个 src。`.github/workflows/build.yml` 针对 main push/PR、Node 22/24、冻结 lockfile、check 与完整 build；Biome CI 2.2.5，Action 锁 SHA。
- `vercel.json` 为空，仓库无部署 job；README 仍写 Node 20+/pnpm 9+，与 CI 表述不完全一致。用户说明 GitHub 更新后托管流程自动发布；供应商后台、生产分支、Node/环境覆盖/重定向不能据这些文件确认，实施前只读核实并沿用，不导入上游 Pages workflow。


[ff-root]: https://github.com/CuteLeaf/Firefly/tree/db331cff041a1b264026fcee36930fab4d2485db
[ff-package]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/package.json
[ff-config]: https://github.com/CuteLeaf/Firefly/tree/db331cff041a1b264026fcee36930fab4d2485db/src/config
[ff-schema]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/src/content.config.ts
[ff-astro]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/astro.config.mjs
[ff-content]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/src/utils/content-utils.ts
[ff-post]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/src/pages/posts/%5B...slug%5D.astro
[ff-footer]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/src/components/layout/Footer.astro
[ff-deploy]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/.github/workflows/deploy.yml

## Phase 1A 执行记录（2026-09-07）

- 前置确认：`firefly-migration`，开始时工作区干净；baseline=`573b4044a4b5b4394d426f516d39804c7b5be19c`，规划=`1a848c62143837787c62a9be7dd8873fbd31308d`。上游沿用本文固定快照 `db331cff041a1b264026fcee36930fab4d2485db`，未重新全量审计或导入 Demo。
- 技术底座：Astro 7.2.10 / `@astrojs/svelte` 9.0.1 / Svelte 5.57.0 / Tailwind 4.3.3（Vite 插件）/ TypeScript 6.0.3 / pnpm 11.22.0。实测 Node 24.14.1，声明最低 Node 22.23.0；lockfile 固化解析结果，pnpm workspace 仅批准 watcher/esbuild/sharp 的构建脚本。移除旧 Tailwind Astro/PostCSS 集成；`global.css` + 旧配置桥接保留 class 暗色模式、字体及部分 v3 默认值。
- Firefly 原生架构采用 Content Layer 的 `src/content.config.ts` + glob，以及 Astro 7 的 `markdown.processor: unified(...)`；保留本地 posts/spec Schema 和原 Markdown 插件顺序。没有搬入上游业务配置、素材、页面、Cloudflare adapter 或部署 workflow。
- 必要提前适配：`content-utils.ts` 提供旧 `slug`/`render()` 接口，PostCard/PostPage 仅调整类型，供 1B 后续收敛；文章路由只改 TS6 不再支持的 baseUrl 导入；Markdown 字体改显式 CSS 导入（同一字体包/文件），最终 Markdown 兼容仍属 1D；Layout 只接 Tailwind 入口和 `@reference`，最终 UI 属 1C。`compressHTML:false` 保留编译器升级后行内空白，防 Footer 署名连字，未改 Footer 源码；空 `src/icons` 目录避免新 astro-icon 本地目录告警。
- 保留现 Roboto 5.2.9、JetBrains Mono Variable 5.2.8 及原 fallback 字体栈。`main.css`、其他自定义 CSS/Stylus 在旧构建中没有入口，旧首页已存在菜单重叠、色彩变量缺失；本阶段未启用这些休眠样式或修复其视觉问题，1C 接入前需明确对照。不把旧页面冒烟视为最终视觉/交互验收。
- 验证通过：`pnpm install --frozen-lockfile`；定点 Biome format（package 保留两空格）及新内容配置/适配工具 check；`pnpm check` 56 文件、0 errors/warnings/hints；`pnpm build` 静态 4 页；Pagefind 1.5.2 索引 zh-cn 的 2 页，277 词（旧 1.4.0 为 257），生产搜索 RAW 命中原文章 URL。
- 冒烟：首页模块/三分类计数 0/1/0 存在；About 与文章的规范化正文、标题锚点及非头像图片 URL 对比一致；真实文章详情无封面，三张正文图保留。内容、About、头像、favicon、备案资源和原站配置与 HEAD 无差异。原 4 条 HTML 路由、robots/RSS/sitemap 文件保留，后三者字节一致；head 差异仅 Astro generator 和头像生成文件哈希，文章分享图不变。桌面首页与移动 About 已检查，备案链接仍在。
- 外部资源冒烟：旧/新首页均只观察到原图床和原 Iconify API；未加入 Firefly Demo、Zen Maru Gothic 或新外部抓取逻辑。CI 保留 Node 22/24、原触发分支/Actions/静态命令，仅补禁用遥测；远端 CI 未运行，托管后台仍未核实且未调整。构建仅余既有头像静态/动态导入告警，无 1A 构建阻塞。
- 本地证据位于临时目录 `%TEMP%/anruix-phase1a/`：旧 dist、页面/head/正文比对 JSON、桌面首页与移动 About 截图；不进入站点或版本库。后续从 1B 继续，1C/1D/1E/Phase 2 的最终验收均未提前完成。

## Phase 1A.1 兼容修复（2026-09-07）

- 根因是 Phase 1A 的 Tailwind 4 全局入口未接回现有 `main.css`、主题变量、Markdown、过渡、滚动条和 PhotoSwipe 样式，同时旧文件中的自定义 utility 与 `@apply ... !important` 写法不兼容 Tailwind 4。现已恢复原样式入口、显式扫描 `src`，并只做对应语法适配；未改 Navbar/Profile/Sidebar/PostCard 结构或视觉设计。
- 桌面首页恢复卡片、主题背景、导航浮层关闭态、分页和响应式网格；移动 About 无横向溢出，正文、头像、分类与备案 Footer 保留。`hue=250`、Roboto 字体体系、既有页面和内容不变。
- 头像同时被 SEO 静态导入与 `ImageWrapper` 动态 glob 命中的 Vite 告警在 Phase 1A 前已存在，且不影响输出；其消除需要调整资源接口或 SEO 路径，留待对应后续阶段处理，本次不扩大范围。

## Phase 1B.1 内容 Schema 与路由兼容（2026-09-07）

- posts/spec 继续使用 `src/content.config.ts` 的 Astro 7 glob Content Layer；现有字段与默认值（含 `showCoverInPost=true`、draft、描述、图片、标签、分类、语言和前后篇字段）保持。文章与 About 源文件哈希均与 Phase 0 一致。
- 移除 Phase 1A 伪造 `entry.slug`/`entry.render()` 的桥接，集合、分页与组件传递原生 `CollectionEntry`，统一使用 `render(entry)`。新增唯一的 `entry.id` 规范化入口，兼容斜杠及 `.md`/`.mdx` 后缀，再由同一 URL helper 生成 `/posts/{slug}/`。
- 构建仍仅生成 `/`、`/about/`、`/archive/`、`/posts/lrc-raw-camera-color-match/` 四个 HTML 页面；单页情况下不生成 `/1/` 或 `/2/`。Archive 序列化数据保留全部文章字段，首页、RSS 与 sitemap 均引用原文章 URL。RSS 仅为原生 entry 类型做必要的一行 URL helper 适配，最终 RSS 验收仍属 1E。

## Phase 1B.2 About 与 Markdown 渲染兼容（2026-09-08）

- 按本轮授权完成原计划中的 About/Markdown 渲染部分。About 继续使用原生 `getEntry` / `render`，保留页面结构、站点描述和原文；显式固定现有 GFM / smartypants 设置，保留原插件顺序。
- directive 标题改为合法的内联 HAST，不再把段落改成 div 嵌入 span 或修改输入树；保留中文、行内格式、原 admonition 类名和正文。新增两项 Node 回归测试（`node --test tests/admonition.test.mjs`），并移除 directive 插件未使用的文件参数。
- 临时独立 Markdown 页面实测：五种 directive、中文格式化标题、重复 heading ID/锚点、sectionize、列表/硬换行/引用、行内与块级 KaTeX；代码换行、行号、折叠、语言徽标及复制完整内容/成功反馈通过。沿用既有 GitHub alert 类型映射，不新增 rehypeFigure 或 Fancybox；临时页面及夹具已移除。
- 三张 Lightroom 图片保持原 URL 和 `p > img` 结构、405px/32rem/292px 最大宽度及原间距/圆角，无图注；正式文章与 About SHA-256 与基线一致。PhotoSwipe 与其他交互实现不变，反复导航、事件清理及最终灯箱/Search/TOC 验收仍留 1E。
- 定点 Biome 检查及两项测试通过；`pnpm check` 56 文件、0 errors/warnings/hints；移除测试页面后 `pnpm build` 生成原四页，Pagefind 索引两页、277 词。无本轮阻塞；仍有既有头像静态/动态导入告警，未扩大资源/SEO 改动范围。

## Phase 1C.1 首页骨架、Navbar、Profile 与 Sidebar（2026-09-08）

- 按固定 Firefly 快照的布局职责拆分，将 HeaderTopRow、Navbar、NavMenuPanel、SideBar 收敛到 `components/layout`；Navbar 与移动导航统一经 `resolveNavMenuLinks` 读取现有配置。仅保留主页、归档、关于，以及搜索、调色和亮/暗/跟随系统入口，未引入上游音乐、社交、壁纸、双侧栏、CategoryBar 或 Demo widget。
- MainGrid 改为显式的移动单列和桌面 `17.5rem + 主内容` 两列：移动端顺序仍为主内容、Profile/分类 Sidebar、Footer，桌面维持单左栏。NavMenuPanel 移到布局根层，避免依赖 Navbar 内部定位；PostCard、Pagination 和 Footer 本体未改。
- Profile 继续读取原配置和头像，保留“安锐”“念念不忘，必有回响”、`/about/`、hover 遮罩与按压反馈，并补充组件透传和头像可访问文本。分类组件原样保留，统一预声明源及最终计数仍属 1D。
- 1440px 与 375px 生产页面冒烟无横向溢出；桌面左栏/主内容为 280px/872px，移动端顺序及三个导航正确，四个正式页面均有 Navbar/Sidebar/Profile 且无 Demo 文案。`pnpm check` 58 文件通过；`pnpm build` 生成原四页，Pagefind 索引两页、277 词。既有头像导入告警和最终导航交互清理留后续对应阶段。

## Phase 1C.2 PostCard、文章列表与 Pagination（2026-09-08）

- 按固定 Firefly 快照的职责分层，将 PostCard/PostPage 收敛到 `components/layout`，Pagination 收敛到 `components/common`。PostCard 直接从原生 Content Layer entry 派生标题、日期、分类、标签、description/摘要回退、阅读统计、封面及统一文章 URL，列表层不再重复传递字段。
- 首页保持单列列表，不引入上游随机封面、网格/瀑布流切换、自动折叠、置顶/加密或 Demo 数据。卡片改用语义化 article，保留原布局、所有信息、标题/封面链接、封面 URL 和移动端既有标签显示规则；`showCoverInPost` 数据未改，详情逻辑仍留 1D。
- Pagination 保持 `PAGE_SIZE=8`、第一页 `/`、后续 `/{n}/`、单页始终显示，并保留当前页及前后按钮的禁用/不可聚焦语义；补充有效前后页的 `rel`。未采用上游仅多页渲染或额外 PageJump。
- 生产首页实测真实卡片含标题、2026-07-27、后期制作、三标签、原 description、670 字/3 分钟和原封面，标题/封面均指向 `/posts/lrc-raw-camera-color-match/`。1440px/375px 单列无溢出；单页页码 1 可见且两侧禁用。`pnpm check` 58 文件通过；`pnpm build` 生成原四页，Pagefind 索引两页、277 词。既有头像导入告警不属本轮阻塞。

## Phase 1D.1 预声明分类与 showCoverInPost（2026-09-08）

- `config/categories.ts` 是唯一预声明分类源，冻结固定顺序“拍摄技巧、后期制作、创作记录”。`getCategoryList` 只按正式文章累加这三个声明项的计数并保持顺序；Sidebar 移除局部数组，Archive 从同一源接收允许的分类。标签统计保持原动态逻辑。
- 分类仍统一指向 `/archive/?category=...`。Archive 对 query 选中的声明分类执行原 OR 筛选；无结果时显示分类名、“暂无文章”和返回全部归档入口，不跳转或新增路由。生产实测 Sidebar 为 0/1/0，拍摄技巧和创作记录显示空状态，后期制作命中真实文章。
- `shouldShowPostCover` 作为详情封面的唯一判断：有 image 且 `showCoverInPost !== false` 才显示普通详情封面并传递文章 banner 候选；分隔线使用同一判断。PostCard、正文图片及 socialImage/JSON-LD 继续独立读取原 image，Schema 的默认 true 未改。
- 真实文章验证：首页卡片保留原封面与文章链接；详情无 `#post-cover` 或其他可见原封面，三张正文图完整；OG、Twitter 和 JSON-LD 仍含原封面 URL。1440px/375px 无溢出或 Demo 内容。定点 Biome 和四项 Node 测试通过；`pnpm check` 60 文件通过，`pnpm build` 原四页、Pagefind 两页/277 词；仅余既有头像导入告警，Footer 留 1D 下一部分。

## Phase 1D.2 Footer 与备案信息（2026-09-08）

- Footer 组件迁至 Firefly 的 `components/layout` 职责层，保留动态年份、“安锐的小站”和原响应式结构；技术署名更新为 Astro & Firefly。桌面/移动挂载点继续按断点互斥，以保持桌面 Footer 紧随主内容及移动端“主体、Sidebar、Footer”顺序，单一组件是备案结构与样式的唯一实现。
- ICP/公安备案文字、`/icp.png`、`/gongan.png`、完整目标链接、`target="_blank"` 与 `rel="noopener noreferrer"` 均保留。1440px 下备案横排，375px 下版权与备案纵排、间距 10px；四个正式页面均只有一份可见 Footer，图标实测 14px，无横向溢出或 Demo Footer 内容。
- `pnpm check` 60 文件、0 errors/warnings/hints；`pnpm build` 生成原四页，Pagefind 1.5.2 索引两页、277 词。仅余既有头像静态/动态导入告警，不属 Footer 阻塞；未触碰内容、分类、详情封面、URL 或 Phase 1E 功能。

## Phase 1E.1 Search、TOC、PhotoSwipe 与 Swup（2026-09-08）

- 沿固定快照的职责拆分，Search 移至 `components/controls`，PhotoSwipe 独立为 `features/PhotoSwipeManager.astro`。保留生产 Pagefind、原查询结果和双端入口；加载器改为只执行一次的 Astro 模块。ready/error/2 秒兜底监听与计时器可清理，延迟就绪只重试最近查询；关闭面板、清空、导航或卸载使旧请求失效。未增加搜索页、Demo 索引或 Fancybox。
- `utils/page-lifecycle.ts` 统一页面功能的挂载与清理：Swup 替换前销毁，page:view 重建；重复 page:view 先清理旧实例，订阅可注销。PhotoSwipe 保留原选择器、滚轮缩放、点击/单击关闭、双击缩放和图标；公式滚动条实例及观察器随页面释放。持久 Navbar 仍只初始化一次，移除抢占 Svelte 明暗按钮的旧 onclick；导航时关闭浮层并更新导航 aria-current，取消过期过渡计时器。
- TOC 保留最浅标题起算两级、原锚点/高亮/宽屏位置；初始化不再依赖可能错过的 animationend，改为容器替换后的帧回调。实例防重复初始化，断开时取消帧、断开观察器、对称移除 capture 点击监听并清空引用。
- 生产浏览器：1440px/375px 搜索命中真实文章和 About，快速输入与清空正常、无横向溢出；三轮文章/About/Archive 客户端往返后 TOC 单实例、7 项及高亮恢复，搜索输入未重复，控制台无错误。1680px TOC 锚点及高亮通过；PhotoSwipe 打开、滚轮缩放、图片点击/按钮/Escape 关闭通过，未出现双灯箱。触屏双击采用原配置保留，未将桌面鼠标测试视作真实触屏手势全验。
- 四项 `tests/navigation-interactions.test.mjs` 测试覆盖慢旧结果、清空、关闭/导航取消、超时后延迟就绪、load-error 恢复、搜索异常与五轮实例清理。定点 Biome 通过（Layout 保留既有格式，仅做 lint）；`pnpm check` 62 文件、0 errors/warnings/hints；`pnpm build` 原四页，Pagefind 两页/277 词，无本轮构建阻塞。内容、About、分类、Footer、封面规则及 URL 源文件无修改；SEO/RSS/robots/sitemap 整体验收与既有头像导入告警留下一部分。

## Phase 1E.2 SEO、RSS、robots 与 sitemap（2026-09-08）

- 保持 `site=https://www.anruix.com`、`trailingSlash=always` 及首页、About、Archive、文章页的既有 title/description/canonical、OG/Twitter 行为。无文章图时仍由当前头像生成本地分享图；真实文章的原远程封面继续作为大图分享图，`showCoverInPost=false` 只使正文无 `#post-cover`。ImageWrapper 对同一头像改用静态导入分支，Profile 与 SEO 继续复用原文件，同时消除 Vite 静态/动态重复导入告警。
- BlogPosting 保留正确文章 URL、mainEntityOfPage、原封面、tags、作者“安锐”、published、可选 modified、`zh-CN` 及 `<` 转义，并将现有分类映射为标准 `articleSection=后期制作`。没有引入 Demo 身份或元数据。
- RSS 保持 `/rss.xml`、站点 description、`zh-CN`、统一文章 URL、非法 XML 字符清理及 MarkdownIt/sanitize-html 管线；原正文和三张远程图片均在 feed。既有 directive 在 RSS 中仍以 `:::note` 标记呈现，这是迁移前管线行为，未在本阶段改写正文或切换渲染器。
- robots 仍仅为 `User-agent: *`、`Allow: /` 和 www 域 sitemap；sitemap-index 仍指向 `sitemap-0.xml`，子 sitemap 仅含 `/`、`/about/`、`/archive/`、原文章 URL，无 Demo/搜索/分类等额外页面。分页大小仍为 8；当前单页不生成 `/1/` 或 `/2/`，后续页继续由 catch-all paginate 生成 `/{n}/`。
- 三项生成产物测试覆盖四页 head、回退/文章分享图、JSON-LD、RSS、robots、sitemap、核心文件及分页边界。定点 Biome、`pnpm check` 62 文件与 `pnpm build` 通过；Pagefind 仍索引正式文章和 About 两页、277 词。生成四个 HTML 页面及原 RSS/robots/sitemap，无构建阻塞或新增公开 URL；内容、About、Footer、分类、备案和图片 URL 未修改。
