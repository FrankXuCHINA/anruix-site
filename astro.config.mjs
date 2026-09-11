import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig, fontProviders } from "astro/config";
import { pluginLanguageLogo } from "ec-lang-logo";
import { pluginCollapsible } from "expressive-code-collapsible";
import { pluginLanguageBadge } from "expressive-code-language-badge";
import katex from "katex";
import "katex/dist/contrib/mhchem.mjs";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCallouts from "rehype-callouts";
import rehypeCodeGroup from "rehype-code-group";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkAdmonitionToBlockquoteCallout from "remark-admonition-to-blockquote-callout";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import {
	expressiveCodeConfig,
	fontConfig,
	fontsList,
	mermaidConfig,
	plantumlConfig,
	siteConfig,
} from "./src/config/index.ts";
import { collectUsedFontCssVars } from "./src/utils/fontHelper.ts";
import I18nKey from "./src/i18n/i18nKey.ts";
import { i18n } from "./src/i18n/translation.ts";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { rehypeDiagramPanZoom } from "./src/plugins/rehype-diagram-panzoom.mjs";
import rehypeEmailProtection from "./src/plugins/rehype-email-protection.mjs";
import rehypeExternalLinks from "./src/plugins/rehype-external-links.mjs";
import rehypeFigure from "./src/plugins/rehype-figure.mjs";
import rehypeImageReferrerPolicy from "./src/plugins/rehype-image-referrerpolicy.mjs";
import { rehypeMermaid } from "./src/plugins/rehype-mermaid.mjs";
import { rehypePlantuml } from "./src/plugins/rehype-plantuml.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkImageGrid } from "./src/plugins/remark-image-grid.js";
import { remarkMermaid } from "./src/plugins/remark-mermaid.js";
import { remarkPlantuml } from "./src/plugins/remark-plantuml.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import { remarkWikiLink } from "./src/plugins/remark-wiki-link.js";

// https://astro.build/config
export default defineConfig({
	fonts: (() => {
		// 禁用字体功能时直接返回空数组，跳过 Astro Font API 集成
		if (!fontConfig.enable) return [];

		const used = collectUsedFontCssVars(fontConfig);
		return fontsList
			.filter((f) => used.has(f.cssVariable))
			.map((f) => {
				let provider;
				switch (f.provider) {
					case "google":
						provider = fontProviders.google();
						break;
					case "fontsource":
						provider = fontProviders.fontsource();
						break;
					case "local":
						provider = fontProviders.local();
						break;
					case "bunny":
						provider = fontProviders.bunny();
						break;
					case "fontshare":
						provider = fontProviders.fontshare();
						break;
					case "npm":
						provider = fontProviders.npm();
						break;
					default:
						provider = f.provider;
				}
				return { ...f, provider };
			});
	})(),

	site: "https://www.anruix.com",
	base: "/",
	trailingSlash: "always",
	output: "static",
	image: {
		layout: "none",
	},
	// Preserve whitespace around inline content across the compiler upgrade.
	compressHTML: false,
	integrations: [
		swup({
			theme: false,
			animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
			// the default value `transition-` cause transition delay
			// when the Tailwind class `transition-all` is used
			containers: ["#banner-overlay-container", "#banner-dim-container", "#swup-container", "#left-sidebar-dynamic", "#right-sidebar-dynamic", "#floating-toc-wrapper"],
			smoothScrolling: false,
			cache: true,
			preload: {
				hover: true,
				visible: true,
			},
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
			resolveUrl: (url) => url,
			animateHistoryBrowsing: false,
			skipPopStateHandling: (event) => event.state?.url?.includes("#"),
		}),
		icon({
			include: {
				"material-symbols": ["*"],
				"fa6-brands": ["*"],
				"fa6-regular": ["*"],
				"fa6-solid": ["*"],
				"fa7-brands": ["*"],
				"fa7-regular": ["*"],
				"fa7-solid": ["*"],
				"simple-icons": ["*"],
				mdi: ["*"],
				mingcute: ["*"],
			},
		}),
		expressiveCode({
			themes: [expressiveCodeConfig.darkTheme, expressiveCodeConfig.lightTheme],
			useDarkModeMediaQuery: false,
			themeCssSelector: (theme) => `[data-theme='${theme.name}']`,
			plugins: [
				...(expressiveCodeConfig.pluginLanguageBadge?.enable === true
					? [pluginLanguageBadge()]
					: []),
				...(expressiveCodeConfig.pluginLanguageLogo?.enable === true
					? [pluginLanguageLogo({
						color: expressiveCodeConfig.pluginLanguageLogo.color ?? "mono",
						excludedLangs: expressiveCodeConfig.pluginLanguageLogo.excludedLangs ?? [],
					})]
					: []),
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				...(expressiveCodeConfig.pluginCollapsible?.enable === true
					? [pluginCollapsible({
						lineThreshold: expressiveCodeConfig.pluginCollapsible.lineThreshold || 15,
						previewLines: expressiveCodeConfig.pluginCollapsible.previewLines || 8,
						defaultCollapsed: expressiveCodeConfig.pluginCollapsible.defaultCollapsed ?? true,
						expandButtonText: i18n(I18nKey.codeCollapsibleShowMore),
						collapseButtonText: i18n(I18nKey.codeCollapsibleShowLess),
						expandedAnnouncement: i18n(I18nKey.codeCollapsibleExpanded),
						collapsedAnnouncement: i18n(I18nKey.codeCollapsibleCollapsed),
					})]
					: []),
			],
			defaultProps: {
				wrap: false,
				overridesByLang: {
					shellsession: {
						showLineNumbers: false,
					},
				},
			},
			styleOverrides: {
				borderRadius: "0.75rem",
				codeFontSize: "0.875rem",
				codeFontFamily:
					"var(--font-code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)",
				codeLineHeight: "1.5rem",
				frames: {},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250,
				},
				languageBadge: {
					fontSize: "0.75rem",
					fontWeight: "bold",
					borderRadius: "0.25rem",
					opacity: "1",
					borderWidth: "0px",
					borderColor: "transparent",
				},
			},
			frames: {
				showCopyToClipboardButton: true,
			},
		}),
		svelte(),
		sitemap(),
		mdx(),
	],
	// Firefly native Markdown and MDX pipeline.
	markdown: {
		processor: unified({
			remarkPlugins: [
				...(siteConfig.post.rehypeCallouts.enablePythonMarkdownAdmonitions !== false
					? [remarkAdmonitionToBlockquoteCallout]
					: []),
				remarkMath,
				remarkReadingTime,
				remarkWikiLink,
				remarkImageGrid,
				remarkExcerpt,
				remarkDirective,
				remarkSectionize,
				parseDirectiveNode,
				remarkMermaid,
				[remarkPlantuml, plantumlConfig],
			],
			rehypePlugins: [
				[rehypeKatex, { katex }],
				[rehypeCallouts, { theme: siteConfig.post.rehypeCallouts.theme }],
				rehypeSlug,
				rehypeCodeGroup,
				[rehypeMermaid, mermaidConfig],
				rehypePlantuml,
				rehypeDiagramPanZoom,
				rehypeFigure,
				[rehypeImageReferrerPolicy, { domains: siteConfig.imageOptimization?.noReferrerDomains || [] }],
				[rehypeExternalLinks, { siteUrl: siteConfig.site_url }],
				[rehypeEmailProtection, { method: "base64" }],
				[
					rehypeComponents,
					{
						components: {
							github: GithubCardComponent,
						},
					},
				],
				[
					rehypeAutolinkHeadings,
					{
						behavior: "append",
						properties: {
							className: ["anchor"],
						},
						content: {
							type: "element",
							tagName: "span",
							properties: {
								className: ["anchor-icon"],
								"data-pagefind-ignore": true,
							},
							children: [
								{
									type: "text",
									value: "#",
								},
							],
						},
					},
				],
			],
		}),
	},
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@rehype-callouts-theme": `rehype-callouts/theme/${siteConfig.post.rehypeCallouts.theme}`,
			},
		},
	},
});
