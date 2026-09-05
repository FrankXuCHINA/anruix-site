# Firefly migration audit & plan

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

## Preservation contract

1. 以 Firefly 作技术/UI 底座，现站内容/信息架构为准：首页 Navbar、Profile、分类、列表/卡片、分页、Footer 全保留；不得被 Demo 覆盖。
2. 品牌、头像、安锐、念念不忘，必有回响、About、favicon、默认 hue 250、Roboto/JetBrains 体系不变，Hero 也不使用 Zen Maru Gothic；保留调色器和旧 localStorage 偏好。
3. 单一预声明源固定“拍摄技巧、后期制作、创作记录”的名称/顺序；零篇仍显示可访问；文章只提供计数，所有消费者共享源。
4. 所有文章 URL、Frontmatter、日期、描述、标签、分类、图床地址和 Markdown 保留；新增技术默认字段不回写旧文章。
5. showCoverInPost 默认 true，false 只隐藏详情可见封面及替代展示，不影响卡片、正文图或 SEO 图。
6. 保留 TOC、搜索、明暗/系统模式、归档筛选、许可、阅读统计、前后篇、滚动/灯箱、专属样式与既有交互修复。
7. Footer 的备案文字/图标/链接/移动布局完整保留；Powered by 后续可改 Astro & Firefly。
8. 第一阶段不带入 Demo 文章、头像、分类、文案、社交数据、素材/视频；额外页面、非必要模块默认关闭，不改变导航结构。开源许可/技术署名不属 Demo 污染。
9. Hero 封面、透明/毛玻璃 Navbar、动态标题、副标题打字机、水波纹仅作后续独立增强层，不能替换首页主体；Hero 只借用阴影/fade-in-up/打字机等文字效果，沿用原字体及真实文案。
10. 原 URL、SEO 与静态部署不无故改变；保留未提交改动，未经用户明确授权不得提交、推送或修改 main，完成当前授权阶段即停止。

## Firefly mapping

下列上游路径固定在研究快照，依据包括 [package][ff-package]、[config][ff-config]、[Schema][ff-schema]、[pipeline][ff-astro]、[分类源][ff-content]、[详情封面][ff-post]、[Footer][ff-footer]。

| 现站 → Firefly | 映射与首阶段取舍 |
| --- | --- |
| config.ts → `config/index.ts` + 分拆 Config / `types/*` | 分别恢复 site/profile/navbar/font/sidebar/cover/display 配置；不能只改品牌配置。默认 hue 165 改 250，site_url 恢复 www 域名。 |
| Layout/MainGridLayout → 同名 layouts + `components/layout/*` | 使用新骨架，保持单左栏、原移动顺序；默认双栏/移动网格/额外 widget 关闭，TOC 单独映射。 |
| Navbar/Profile → `layout/Navbar.astro`、`widget/Profile.astro` | 三导航与头像 About 交互保留；禁用 Demo 社交/音乐入口；保留调色能力，不开放无关布局/壁纸设置。 |
| Categories → `widget/Categories.astro`、`layout/CategoryBar.astro`、`pages/categories/index.astro` | 三者均取 getCategoryList，适合统一适配；上游仍动态建类且按数量降序。CategoryBar 与独立分类索引首阶段默认关闭，今后启用仍共享源。 |
| PostCard/PostPage → `layout/PostCard.astro` / `PostPage.astro` | 保持单列列表、摘要/元数据/阅读统计/封面；禁随机图、自动折叠与未授权网格切换。 |
| Pagination → `common/Pagination.astro` + paginate | 上游默认每页 10，total>size 才渲染；须设 8 并保留单页分页和禁用按钮语义。 |
| Schema/详情 → `src/content.config.ts` / `pages/posts/[...slug].astro` | glob Content Layer、render(entry)、id 代替旧 slug/entry.render；增加自定义字段并统一 URL 适配。 |
| About/Markdown → 同名 about + `common/Markdown.astro` | posts/spec 路径可保留；上游 parseDirectiveNode 已将 :::note[标题] 转 callout，仍须验证中文标题/正文/样式。 |
| Footer → `layout/Footer.astro` | 优先移植现完整结构/样式，仅换技术署名；FooterConfig.html 是额外注入区，不能单靠它保证现版权/备案顺序与布局。 |
| Search/TOC/灯箱 → `controls/Search.svelte`、`widget/SidebarTOC.astro` 等、`features/FancyboxManager.astro` | Pagefind 可沿用但需验竞态/索引；Swup 容器和 TOC 初始化改变，Fancybox 不能直接假定 PhotoSwipe 手势等价。 |
| Hero → `layout/BannerHomeTextOverlay.astro`、`features/TypewriterText.astro`、`styles/banner-title.css` / `transition.css` | 后续抽取字效；背景/Navbar 配置在 backgroundWallpaper.ts；common.waves 是波浪装饰，不等于已验证的交互扩散水纹。 |

## Compatibility gaps / 明确方案

### 分类源与空状态

- 规划 `src/config/categories.ts` 导出只读 declaredCategories，仅定义三类名称/顺序；URL 统一经 getCategoryUrl。getCategoryList 遍历声明源填 `{name,count,url}`，无文章填 0；计数和列表共用生产 draft 过滤。
- Sidebar、CategoryBar、分类索引（未来启用时）与归档分类标识/空状态共用此源；不重复数组、不按文章量排序。标签仍动态统计。
- 第一阶段落点仍为 `/archive/?category=…`；空类显示分类名、“暂无文章”和回归档入口，不跳首页/404；没有创建独立分类 URL 的必要。
- 空/未知 category 不自动扩展固定分类，也不改原文/丢文章；报告不一致并保留归档/uncategorized 兼容。当前真实文章无此异常。
- 验收 0/1/0、全空、草稿计数、添加文章、空格/未知类别；直达/刷新/前进后退/Swup 均正确。独立测试夹具不进入正式内容和发布产物。

### showCoverInPost

- 上游 PostData 类型与 Schema 都缺字段；两处增加 boolean / `z.boolean().optional().default(true)`，同步数据传递类型，防止 Schema 剥离字段。
- 当前上游 `showPostCover=Boolean(processedImage && coverImageConfig.enableInPost)`；规划加 `entry.data.showCoverInPost !== false`，兼容期全站 enableInPost=true、overlay 默认关闭。普通/叠加封面与无图分隔线共享此判断，文章 Banner 不得另显被隐藏封面。
- 卡片仍取 image，OG/Twitter/JSON-LD 仍用原封面；首页 Hero 独立于文章封面。**不能断言整个详情 HTML 不含封面 URL**，应断言正文无 #post-cover/可见替代封面，head 中的分享图应存在。
- 验收 image 有/无 × flag 缺省/true/false，分别检查卡片、普通/叠加封面、分隔线、Banner、SEO；真实文章卡片有封面，详情无封面，三张正文图仍在。

### Footer / 备案

- ICP：`苏ICP备2026009777号-1`、`/icp.png`、`https://beian.miit.gov.cn/#/Integrated/index`；公安：`苏公网安备 32059002007595号`、`/gongan.png`、`https://beian.mps.gov.cn/#/query/webSearch?code=32059002007595`。保留 alt、target=_blank、rel=noopener noreferrer。
- 保留 14px 图标与偏移；≤640px 版权/备案纵排、10px 间距、隐藏原换行元素、图标偏移 -1px；桌面备案同行/按需换行。动态年份和“安锐的小站”不变，主题署名后续只换 Fuwari 为 Firefly 及链接。
- 保留一份完整 Footer 实现，避免注入区重复；跨断点/Swup 只有一份可见，备案不被 Hero/sticky/overflow 遮挡。

### About / Markdown / 交互

- spec/about 原文与 getEntry/render 保留，About description 仍用现站描述，不能被上游默认“关于”覆盖。
- 上游实际 processor 是 unified（不能据 satteri 依赖误判）；已有 :::note 转换桥接，验证中文标题、列表硬换行、引用、heading ID/section 与 TOC。无需批量转换 Markdown。
- 上游 rehypeFigure 将有 alt 的 img 包成 center>figure 并加 figcaption，会破坏当前 p:has(>img)；第一阶段优先对现内容关闭转换。若必须适配，只改三张精确 URL 的选择器，保持尺寸/间距且不新增可见图注。
- 上游代码默认 wrap=false、原生复制、双主题；保留现自动换行、github-dark、行号/折叠/徽标和复制反馈。Math/GitHub 卡片等用独立样例验收，避免只测唯一真实文章就宣称 pipeline 全兼容。
- 初期保留 PhotoSwipe，或配置并验收 Fancybox 等价手势后替换，不同时绑定。Swup 各页面须有对应容器，TOC/搜索/灯箱监听器和计时器可清理，连续导航不重复初始化。
- 旧 localStorage theme=auto 对应上游 system：首屏兼容读取旧值，保留 light/dark/hue，避免闪烁/失去系统跟随。上游 displaySettingsConfig.enable=false 与现 fixed=false 不等价，应恢复调色入口/重置，关闭非必要设置项。
- 已有工作区修复纳入基线：searchSequence；ButtonLink 去 a/button 嵌套；禁用分页/空前后篇不可聚焦；关闭面板 invisible；重置禁用态；TOC 移除事件 capture 对称；ImageWrapper 的 Windows 路径、类型与缺图报错修复。

### URL / SEO / 工具链 / 部署

- 上游 entry.id 去扩展名，现用 entry.slug；实施前保存“源文件→生成 URL”，route/卡片/前后篇/归档/RSS/canonical/搜索共用适配。核对嵌套 index、自定义 slug、大小写/中文编码；当前真实 slug 必须逐字不变，不假定 id 天然等价。
- 保留 www、尾斜杠、8 篇分页和分页 title。上游 RSS 直接拼 post.id，须统一函数；description 恢复站点 description，保留 language/XML 清洗。上游 AstroContainer 渲染 RSS 与旧 MarkdownIt 不同，单独核正文含义/图片/条目和构建成本。
- 保留现 canonical、分享图回退、BlogPosting 语义与 JSON-LD `<` 转义；关闭自动 OG 生成，避免 `/og/*` 和图片变化；无专用图 Twitter 仍 summary，有专用封面才 summary_large_image。
- 上游 robots 屏蔽 /_astro/ 与归档筛选，不能照搬；保持 Allow:/ 和 sitemap。query canonical 继续指向原归档。
- 关闭 siteConfig.pages 的额外页面，核对 PUBLIC_PAGES_* 环境覆盖；隐藏导航不等于关闭路由，部分上游页面只是 redirect /404/。第一阶段不导入额外路由或从生成阶段排除；不完全受这些开关控制的 categories/tags/series/search/rss 展示页也默认不挂载。必要内部端点单独说明依赖，不进导航/sitemap。
- 公告/音乐/标签云/动态/统计/日历/广告、评论/赞助/分享海报/推荐随机文章/沉浸阅读/过期提示/自动 OG、看板娘/樱花/分析脚本首阶段关闭；保留现更新日期。Hero/视频/轮播首阶段关闭，随机图 API 不调用。Demo 内容、作者社交和素材不导入。
- 上游为 Astro 7.2.10、Tailwind 4.3.3、Svelte ^5.57.0、pnpm 11.22.0、Node≥22.23.0：跨主版本迁移，需验证 Content Layer、Tailwind 变量语法/config/CSS layer、字体 API、fa6→fa7 图标兼容，不能只换组件。
- 上游 build 新增 GitHub 数据/LQIP/VNDB 封面/Pio 清理/字体子集/inline minify/Pagefind 脚本；逐项核实际依赖、网络与写入范围，避免 Demo 抓取/无关产物。禁 Zen 还须检查 Hero 字体覆盖和加载列表；优先沿用本地 Roboto/JetBrains 包。
- 上游 astro.config 根据 CF_WORKERS 选 Cloudflare adapter，另有 [GitHub Pages workflow][ff-deploy]；不得整份导入而改变静态托管、部署分支、冻结 lockfile 或 Action 权限。实际托管后台为待核实项，未核实不调整部署。

## 分阶段迁移计划与验收标准

以下仅为计划；**本次修订完成后停止，不迁移源码、不提交、不推送**。Phase 1 按 1A → 1B → 1C → 1D → 1E 顺序执行，视觉增强仍为 Phase 2。正式开始 1A 前必须完成下述两个本地提交及干净工作区检查，相关提交须另获用户明确授权。

### 正式迁移前置关口（不在本次执行）

1. 核对审计记录的 23 个既有修改及其差异，仅将这些修改精确暂存，单独建立本地 **baseline commit**；不得混入迁移文档、迁移代码或其他新改动。记录 commit SHA，作为迁移前源码回退点。若与审计记录不一致，先查明归属，不能为凑齐 23 个文件覆盖现状。
2. baseline 完成后，再单独提交 `docs/FIREFLY_MIGRATION.md`，形成 **迁移文档 commit**，记录 SHA。`AGENTS.md` 继续按既有策略本地忽略；未经额外授权不强制暂存、不改 `.gitignore`。
3. 确认当前仍为 `firefly-migration`，两个提交顺序/范围正确，`git status --porcelain` 输出为空，`git diff` 和 `git diff --cached` 均为空，才允许开始 Phase 1。被既有规则忽略的 AGENTS/依赖/构建产物不算待提交项。
4. 若存在其他已跟踪或未跟踪改动，先明确处理归属，不自动删除、重置、stash 或混入以上提交。**本地提交授权不等于推送或修改 main 的授权。**

各阶段独立执行适用检查并记录结果，通过出口后才进入下一阶段；中间态沿用旧实现或最小兼容适配，不能用“后续阶段会修复”接受已知回归。

| 阶段 | 工作 | 出口验收 |
| --- | --- | --- |
| 0：本次审计 | 精简 AGENTS、固化本文，不改源码。 | 文档完整；原 23 文件哈希/内容资源/分支/HEAD 不变；无提交推送。不声称运行时验收通过。 |
| 1A：工具链/技术底座 | 先核实版本、锁上游 SHA，记录现构建/路由/head/截图/托管基线；迁移依赖、lockfile、Astro/Svelte/Tailwind 构建配置及必要最小兼容适配，暂沿用现内容/路由/UI。 | 前置两个提交与干净工作区已确认；冻结安装、适用格式检查、check/build/Pagefind 可复现；新工具链本地及 CI 配置相容，无 Demo/新增外部抓取/部署变更；内容和旧页面冒烟通过。既有失败单独登记，不接受新增失败。 |
| 1B：内容与路由 | 迁移 Content Layer/Schema/render API 与统一 URL 适配；保留 posts/spec 原文、全部 Frontmatter（含 showCoverInPost）、文章 slug、归档 query、每页 8 篇和旧路径；保留现 UI。 | 内容/资源指纹与字段逐项一致；正式文章和 About 可渲染；全量 URL/分页/草稿过滤及归档筛选验证通过，RSS/搜索链接无漂移；check/build 通过，无新增公开页面。 |
| 1C：现有 UI 主体 | 切换 Firefly 配置/layout/Navbar/Sidebar/Profile/PostCard/Pagination/Footer 挂载骨架，恢复品牌、hue/字体、三个导航与移动顺序；特殊组件先沿用现实现，额外页面/模块关闭。 | 各断点原首页模块全部存在，头像/身份/About 入口正确；单页分页仍显示、八篇分页不变；无 Demo/Zen/未授权模块；保留组件（含备案 Footer）可见且未退化，check/build 和页面冒烟通过。 |
| 1D：特殊兼容 | 统一预声明分类源，落实零篇空状态、showCoverInPost 所有展示分支、完整备案 Footer、About/Markdown 扩展、三截图专属样式；替换兼容桥接时保持原行为。 | 0/1/0 与空类导航、封面矩阵/SEO 图独立性、备案链接/移动布局、About note/硬换行、独立 Markdown 样例和截图尺寸通过；原文/资源未变，check/build 通过。 |
| 1E：交互与 SEO | 完成 Swup/TOC/搜索/灯箱/明暗及旧存储兼容、事件清理/可访问性；核对标题/描述/canonical/OG/Twitter/JSON-LD/RSS/sitemap/robots 与静态部署兼容。 | 生产 preview 搜索/连续输入/移动端、反复导航/历史记录、主题/焦点/灯箱手势通过；全量 URL/head/RSS/sitemap/robots 比对及 check/build/Pagefind 通过；无额外页面或 Demo 请求。Phase 1 全部保留契约成立后才可进入另行授权的 Phase 2。 |
| 2：首页增强 | 另行授权后做 Hero 素材层、Navbar 透明/毛玻璃、动态标题/副标题字效、水波纹，各自开关/提交；区分背景波浪与点击扩散效果。 | 关闭增强恢复阶段 1；所有首页原模块仍可访问；明暗/手机/桌面可读，导航/搜索/TOC 无遮挡；减少动态效果时静态文字可读，Swup 不叠计时器。 |
| 3：最终本地交付 | 全量回归，记录命令结果/截图/差异，准备精确 diff 和回退方案。 | 下列清单通过，夹具不入正式产物，变化均可解释；main/远端不动。合并发布另需明确授权，不自动执行。 |

### 迁移提交策略

- 本次不 commit。正式迁移的强制顺序：**23 个既有修改的本地 baseline commit → 独立迁移文档 commit → working tree 干净 → Phase 1A**，不能交换、合并或省略前置提交。
- 后续按 1A 工具链 → 1B 内容/路由 → 1C UI 主体 → 1D 特殊兼容 → 1E 交互/SEO → Phase 2 视觉增强 → 最终验收拆分可回退提交。每个阶段可细分，强耦合变更在该阶段内合成可构建单元；提交均须明确授权，不跨阶段夹带功能。
- 每次提交记录差异与检查结果，精确暂存、完整审查 staged diff；依赖与 lockfile 同提交。禁止 git add .，不提交上游快照、Demo、dist、临时夹具、原始配图、凭据。
- AGENTS 维持本地忽略，本文必须在 baseline 之后的独立文档提交中追踪。回退优先逐提交 revert，不在混合工作区硬重置；Hero 各项另作可独立回退提交。

## 最终回归清单

- [ ] 正式迁移开始前已按顺序建立独立 baseline/迁移文档两个本地提交，记录 SHA 与空的 git status --porcelain；23 个既有修改未混入迁移提交，各阶段出口检查记录齐全。
- [ ] 文章集合/Frontmatter/Markdown/日期/标签/分类/描述/四个图床 URL、About 原文一致；六个关键文件指纹核对。
- [ ] Navbar、Profile、分类、列表/卡片、单页/多页分页、Footer 均在；仅三导航；头像 About hover/点击正常。
- [ ] hue 250、原字体/代码斜体、调色与旧 light/dark/auto/hue 存储正常；无 Zen 字体请求或区域覆盖。
- [ ] 三类固定顺序、0/1/0 计数可见；空类直达/刷新/空状态正常；筛选 OR/交集/uncategorized 兼容，无重复分类源。
- [ ] flag/image 矩阵通过；真实文章卡片有封面、详情无可见封面、SEO 有原图；overlay/Banner 无绕过。
- [ ] 三截图最大宽 405px/32rem/292px，原间距/圆角/边框/阴影；灯箱缩放/关闭/双击与图 URL 保持。
- [ ] About note/列表硬换行/引用、文章 note/锚点/TOC；独立 Math/代码换行复制折叠行号/GitHub 卡片样例通过；无正文改写。
- [ ] 生产 preview 搜索命中真实文章与 About；快速输入/清空/初始化延迟/失败兜底/移动端/Swup 往返正常，无 Demo 索引。
- [ ] 年归档/日期/阅读统计/前后篇/许可/返回顶部/面板关闭/键盘焦点正常，反复导航不累积事件、灯箱、计时器。
- [ ] 原 URL、分页大小 8/标题、description/canonical/OG/Twitter/JSON-LD 日期语言转义、RSS 语言正文链接、sitemap/robots 对比通过；无无故重定向或 www 变化。
- [ ] 两备案文字、图标、完整目标 URL 与链接属性正确；≤640px 纵排/10px 间距，桌面/移动均只一份可见 Footer；可署名 Astro & Firefly。
- [ ] 至少 375/640/768/1024/1440px 与 200% 缩放，亮/暗、刷新/客户端跳转均验；无遮挡/横向溢出/焦点陷阱。
- [ ] 无 Demo 身份/内容/素材/额外页面/索引/外部请求；无随机封面、Demo 音乐视频或新增远程字体。
- [ ] 若已授权 Hero：主体完整，真实文案与原字体不变，可降级/清理计时器，独立关闭不影响文章/导航。
- [ ] 设置 ASTRO_TELEMETRY_DISABLED=1，完成适用只读格式检查、pnpm check、pnpm build、生产 preview/Pagefind；跨工具链阶段验冻结 lockfile/CI Node；如实记录失败，不以 dev 成功替代。
- [ ] 托管平台/生产域名/部署分支触发/输出目录/环境语义不无故变化，无提交污染或未经明确授权的提交、推送、main 修改。

[ff-root]: https://github.com/CuteLeaf/Firefly/tree/db331cff041a1b264026fcee36930fab4d2485db
[ff-package]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/package.json
[ff-config]: https://github.com/CuteLeaf/Firefly/tree/db331cff041a1b264026fcee36930fab4d2485db/src/config
[ff-schema]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/src/content.config.ts
[ff-astro]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/astro.config.mjs
[ff-content]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/src/utils/content-utils.ts
[ff-post]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/src/pages/posts/%5B...slug%5D.astro
[ff-footer]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/src/components/layout/Footer.astro
[ff-deploy]: https://github.com/CuteLeaf/Firefly/blob/db331cff041a1b264026fcee36930fab4d2485db/.github/workflows/deploy.yml
