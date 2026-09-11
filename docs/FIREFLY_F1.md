# Firefly-first F1 implementation

Upstream: CuteLeaf/Firefly `db331cff041a1b264026fcee36930fab4d2485db` (source version 6.16.7, not a verified stable release).

- Native config/index and split config/types are the active source; src/config.ts and the old Tailwind config are removed.
- Layout/MainGridLayout, Navbar/HeaderTopRow/NavMenuPanel, SidebarColumn/SideBar/Profile, global styles/fonts and their layout utilities come from the fixed snapshot. Theme, wallpaper, waves, music and widget configuration defaults remain intact.
- User overrides: site identity, description, zh_CN, hue 250, avatar/favicon and Home/Archive/About navigation. Example identities, social accounts, media, playlists, service IDs, donations, gallery/friend/bookmark data and start date are empty. No invented site start date; statistics show an em dash until configured.
- Native widget dependencies require the calendar metadata endpoint and an empty dynamic feed. No content or demo pages were imported. CategoryBar reads the existing category data and its more-link points to the existing Archive pending later category routing work.
- Local extensions: mobile drawer closes on link selection; empty announcement has readable placeholder and no empty link; empty music ID prevents a request for a sample playlist. Empty dynamic feed has no link to an unimplemented page.

## Deliberately deferred

- PostCard/PostPage/Pagination, article/About content and route files, Footer, Search, PhotoSwipe and the Markdown processor are retained. No final migrations of these features in F1.
- SiteHead is the extracted existing SEO output, used as a leaf of the native Layout until the SEO phase. Native metadata is not rendered alongside it.
- Native Navbar invokes its Pagefind loader eagerly while the retained Search has no native lazy-loader call. Search source is unchanged.
- Native Sidebar registers the existing TOC; a persistent #toc fragment is replaced on navigation until the native client TOC is adopted; its old depth 2 is retained locally because the old siteConfig.toc no longer exists. Native floating/immersive TOC components are deferred, without changing their config defaults. Native Swup containers are wired for the currently mounted layout; no second Layout lifecycle exists.
- Old content styles only reference native main.css for Tailwind utilities; global.css is now a reference-only entry for deferred scoped styles. No old Tailwind configuration or old main.css is loaded.
- MainGridLayout maps existing socialImage props and infers postSlug for existing callers. The current showCoverInPost implementation and content files are untouched.
- Original screenshot CSS, Footer filing layout, original SEO/RSS semantics and user resources remain protected. Font API setup and new icon/runtime dependencies are required by the native layout.

## Acceptance (2026-09-10)

- Node 24.14.1 / pnpm 11.22.0; frozen-lockfile installation passed.
- pnpm check: 181 files, 0 errors/warnings/hints. pnpm build passed; all four core HTML routes generated. Pagefind indexed the real article and About (2 pages, 289 words).
- Browser: 375px and 1440px basic layouts passed without horizontal overflow; mobile navigation closes after choosing a link. About -> Home -> article restores all 7 TOC links through client navigation; profile links to About. Native light/dark/system choices are present; checked navigation produced no console errors.
- 122 current boolean config fields were compared with the pinned upstream; no changed default flags. Unconfigured sample model paths/messages were cleared without changing feature switches.
- Article/About sources and user assets have no diff. Existing migration-plan edits are excluded from this commit.
- Non-blocking build notices remain for mixed static/dynamic avatar and icon-loader imports, large chunks, and Pagefind's lack of Chinese stemming. Deferred leaf components above are not claimed as native migrations.
