import assert from "node:assert/strict";
import test from "node:test";
import { h } from "hastscript";
import { AdmonitionComponent } from "../src/plugins/rehype-component-admonition.mjs";

test("Chinese directive titles keep inline formatting without mutating HAST", () => {
	const children = [
		h("p", ["中文 ", h("strong", "自定义"), " 标题"]),
		h("p", "提示正文。"),
	];
	const before = structuredClone(children);
	const result = AdmonitionComponent(
		{ "has-directive-label": true },
		children,
		"note",
	);
	assert.deepEqual(children, before);
	assert.equal(result.tagName, "blockquote");
	assert.deepEqual(result.properties.className, ["admonition", "bdm-note"]);
	assert.equal(result.children[0].tagName, "span");
	assert.equal(result.children[0].children[0].tagName, "span");
	assert.deepEqual(result.children[0].children[0].children, before[0].children);
	assert.deepEqual(result.children.slice(1), before.slice(1));
});

test("all existing admonition types preserve default titles and body", () => {
	for (const type of ["note", "tip", "important", "warning", "caution"]) {
		const body = [h("p", "正文"), h("ul", [h("li", "列表")])];
		const result = AdmonitionComponent({}, body, type);
		assert.equal(result.children[0].children[0].value, type.toUpperCase());
		assert.deepEqual(result.children.slice(1), body);
	}
});
