import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified, type RehypePlugin } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

export default defineConfig({
  site: config.site.url,
  integrations: [mdx(), sitemap()],
  i18n: {
    locales: ["zh-CN"],
    defaultLocale: "zh-CN",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeCallouts as RehypePlugin,
          {
            callouts: {
              note: { title: "备注" },
              abstract: { title: "摘要" },
              summary: { title: "总结" },
              tldr: { title: "概览" },
              info: { title: "信息" },
              todo: { title: "待办" },
              tip: { title: "提示" },
              hint: { title: "提示" },
              important: { title: "重要" },
              success: { title: "成功" },
              check: { title: "检查" },
              done: { title: "完成" },
              question: { title: "问题" },
              help: { title: "帮助" },
              faq: { title: "常见问题" },
              warning: { title: "警告" },
              attention: { title: "注意" },
              caution: { title: "谨慎" },
              failure: { title: "失败" },
              missing: { title: "缺失" },
              fail: { title: "失败" },
              danger: { title: "危险" },
              error: { title: "错误" },
              bug: { title: "问题" },
              example: { title: "示例" },
              quote: { title: "引用" },
              cite: { title: "引用" },
            },
          },
        ],
      ],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.local(),
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/GoogleSansCode[MONO,wght].ttf"],
            weight: 400,
            style: "normal",
            display: "swap",
          },
          {
            src: ["./src/assets/fonts/GoogleSansCode[MONO,wght].ttf"],
            weight: 700,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
