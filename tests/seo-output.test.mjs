import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const SITE = "https://www.anruix.com";
const SITE_DESCRIPTION =
	"围绕摄影、摄像与后期制作的个人记录站，分享拍摄技巧、后期方法与创作经验。";
const POST_PATH = "/posts/lrc-raw-camera-color-match/";
const POST_COVER =
	"https://img.anruix.com/posts/lightroom-raw-color-match-cover.png";

const read = (path) =>
	readFileSync(new URL(`../dist/${path}`, import.meta.url), "utf8");
const attr = (html, selector, value, attribute = "content") => {
	const pattern = new RegExp(
		`<[^>]+${selector}=["']${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+${attribute}=["']([^"']+)["']|<[^>]+${attribute}=["']([^"']+)["'][^>]+${selector}=["']${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
	);
	const match = html.match(pattern);
	return match?.[1] || match?.[2];
};

test("core pages retain titles, descriptions, canonical URLs and social metadata", () => {
	const cases = [
		["index.html", "安锐的小站", SITE_DESCRIPTION, "/"],
		["about/index.html", "关于我 - 安锐的小站", SITE_DESCRIPTION, "/about/"],
		[
			"archive/index.html",
			"归档 - 安锐的小站",
			"安锐的小站的文章归档，按时间浏览拍摄技巧、后期制作与创作记录。",
			"/archive/",
		],
		[
			"posts/lrc-raw-camera-color-match/index.html",
			"LrC：RAW 自动匹配相机色彩 - 安锐的小站",
			"将 RAW 默认值设为“相机设置”，让新导入的照片自动匹配相机色彩配置。",
			POST_PATH,
		],
	];
	for (const [file, title, description, path] of cases) {
		const html = read(file);
		const canonical = `${SITE}${path}`;
		assert.match(html, new RegExp(`<title>${title}</title>`));
		assert.equal(attr(html, "name", "description"), description);
		assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`));
		for (const property of ["og:url", "twitter:url"]) {
			assert.equal(
				attr(html, property.startsWith("og:") ? "property" : "name", property),
				canonical,
			);
		}
		assert.equal(attr(html, "property", "og:title"), title);
		assert.equal(attr(html, "property", "og:description"), description);
		assert.equal(attr(html, "name", "twitter:card"), "summary_large_image");
		assert.equal(attr(html, "name", "twitter:title"), title);
		assert.equal(attr(html, "name", "twitter:description"), description);
	}
	const home = read("index.html");
	assert.equal(attr(home, "property", "og:image"), `${SITE}/favicon.png`);
	assert.equal(
		attr(home, "name", "twitter:image"),
		attr(home, "property", "og:image"),
	);
	const post = read("posts/lrc-raw-camera-color-match/index.html");
	assert.equal(
		attr(post, "property", "og:image"),
		`${SITE}/og/lrc-raw-camera-color-match.png`,
	);
	assert.equal(
		attr(post, "name", "twitter:image"),
		`${SITE}/og/lrc-raw-camera-color-match.png`,
	);
	assert.equal(
		existsSync(
			new URL("../dist/og/lrc-raw-camera-color-match.png", import.meta.url),
		),
		true,
	);
	assert.doesNotMatch(post, /id="post-cover"/);
});

test("BlogPosting JSON-LD retains identity, dates, language, taxonomy and cover", () => {
	const html = read("posts/lrc-raw-camera-color-match/index.html");
	const encoded = html.match(
		/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
	)?.[1];
	assert.ok(encoded);
	const data = JSON.parse(encoded);
	const article = data["@graph"].find(
		(item) => item["@type"] === "BlogPosting",
	);
	const author = data["@graph"].find((item) => item["@type"] === "Person");
	const publisher = data["@graph"].find(
		(item) => item["@type"] === "Organization",
	);
	assert.equal(article.url, `${SITE}${POST_PATH}`);
	assert.equal(article.mainEntityOfPage["@id"], `${SITE}${POST_PATH}`);
	assert.equal(article.image.url, POST_COVER);
	assert.equal(article.keywords, "Lightroom, RAW, 色彩配置");
	assert.equal(article.articleSection, "后期制作");
	assert.deepEqual(article.author, { "@id": `${SITE}/#person` });
	assert.equal(article.datePublished, "2026-07-27T00:00:00.000Z");
	assert.equal(article.inLanguage, "zh-CN");
	assert.equal(article.dateModified, undefined);
	assert.equal(author.name, "安锐");
	assert.equal(author.url, `${SITE}/about/`);
	assert.equal(publisher.name, "安锐的小站");
	assert.equal(publisher.logo.url, `${SITE}/favicon.png`);
});

test("RSS, robots, sitemap and public routes keep their contracts", () => {
	assert.equal(
		existsSync(new URL("../dist/1/index.html", import.meta.url)),
		false,
	);
	assert.equal(
		existsSync(new URL("../dist/2/index.html", import.meta.url)),
		false,
	);
	for (const path of [
		"index.html",
		"about/index.html",
		"archive/index.html",
		"posts/lrc-raw-camera-color-match/index.html",
		"rss/index.html",
		"rss.xml",
		"robots.txt",
		"sitemap-index.xml",
		"sitemap-0.xml",
	])
		assert.equal(
			existsSync(new URL(`../dist/${path}`, import.meta.url)),
			true,
			path,
		);

	const rss = read("rss.xml");
	assert.match(
		rss,
		new RegExp(`<description>${SITE_DESCRIPTION}</description>`),
	);
	assert.match(rss, /<language>zh-CN<\/language>/);
	assert.match(rss, new RegExp(`<link>${SITE}${POST_PATH}</link>`));
	for (const image of [
		"01-lightroom-classic-open-preferences.png",
		"02-lightroom-classic-raw-default-settings.png",
		"03-lightroom-classic-select-camera-settings.png",
	]) {
		assert.match(rss, new RegExp(`https://img\\.anruix\\.com/posts/${image}`));
	}
	assert.equal(
		read("robots.txt"),
		`User-agent: *\nDisallow: /_astro/\nDisallow: /archive/?tag=\nDisallow: /archive/?category=\nDisallow: /archive/?uncategorized=\n\nSitemap: ${SITE}/sitemap-index.xml`,
	);
	assert.match(
		read("sitemap-index.xml"),
		new RegExp(`${SITE}/sitemap-0\\.xml`),
	);
	const sitemap = read("sitemap-0.xml");
	const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
		(match) => match[1],
	);
	assert.deepEqual(locations, [
		`${SITE}/`,
		`${SITE}/about/`,
		`${SITE}/archive/`,
		`${SITE}${POST_PATH}`,
		`${SITE}/rss/`,
	]);
	assert.doesNotMatch(sitemap, /demo|friends|gallery|categories|tags|search/i);
});
