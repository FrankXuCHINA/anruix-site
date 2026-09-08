import assert from "node:assert/strict";
import test from "node:test";
import { CATEGORY_NAMES } from "../src/config/categories.ts";
import { shouldShowPostCover } from "../src/utils/post-cover-utils.ts";

test("categories remain predeclared in a stable order", () => {
	assert.deepEqual(CATEGORY_NAMES, ["拍摄技巧", "后期制作", "创作记录"]);
});

test("post cover visibility follows image and showCoverInPost", () => {
	assert.equal(shouldShowPostCover({}), false);
	assert.equal(shouldShowPostCover({ image: "cover.png" }), true);
	assert.equal(
		shouldShowPostCover({ image: "cover.png", showCoverInPost: true }),
		true,
	);
	assert.equal(
		shouldShowPostCover({ image: "cover.png", showCoverInPost: false }),
		false,
	);
});
