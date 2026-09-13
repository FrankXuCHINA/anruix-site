import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CATEGORY_NAMES } from "../src/config/categories.ts";

const coverUrl =
	"https://img.anruix.com/posts/lightroom-raw-color-match-cover.png";
const bodyImageUrls = [
	"https://img.anruix.com/posts/01-lightroom-classic-open-preferences.png",
	"https://img.anruix.com/posts/02-lightroom-classic-raw-default-settings.png",
	"https://img.anruix.com/posts/03-lightroom-classic-select-camera-settings.png",
];

test("categories remain predeclared in a stable order", () => {
	assert.deepEqual(CATEGORY_NAMES, ["拍摄技巧", "后期制作", "创作记录"]);
});

test("showCoverInPost remains a default-true content field", async () => {
	const [schema, source] = await Promise.all([
		readFile(new URL("../src/content.config.ts", import.meta.url), "utf8"),
		readFile(
			new URL(
				"../src/content/posts/lrc-raw-camera-color-match.md",
				import.meta.url,
			),
			"utf8",
		),
	]);
	assert.match(
		schema,
		/showCoverInPost:\s*z\.boolean\(\)\.optional\(\)\.default\(true\)/,
	);
	assert.match(source, /^showCoverInPost:\s*false$/m);
});

test("opted-out cover stays on cards and metadata but not in the post body", async () => {
	const [home, post] = await Promise.all([
		readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
		readFile(
			new URL(
				"../dist/posts/lrc-raw-camera-color-match/index.html",
				import.meta.url,
			),
			"utf8",
		),
	]);
	assert.ok(home.includes(coverUrl));
	assert.ok(post.includes(coverUrl));
	assert.doesNotMatch(post, /id="post-cover"/);
	for (const url of bodyImageUrls) assert.ok(post.includes(url));
});
