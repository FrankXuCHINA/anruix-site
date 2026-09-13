import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readBuiltPage(path) {
	return readFile(new URL(path, import.meta.url), "utf8");
}

test("native Firefly callouts render existing Chinese directives", async () => {
	const [about, post] = await Promise.all([
		readBuiltPage("../dist/about/index.html"),
		readBuiltPage("../dist/posts/lrc-raw-camera-color-match/index.html"),
	]);

	for (const html of [about, post]) {
		assert.match(html, /data-callout="note"/);
		assert.doesNotMatch(html, /:::note/);
	}
	assert.match(about, /关于本站/);
	assert.match(post, /关于“相机设置”/);
});
