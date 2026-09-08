/// <reference types="hast" />
import { h } from "hastscript";

/**
 * Creates an admonition component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} [properties.title] - An optional title.
 * @param {('tip'|'note'|'important'|'caution'|'warning')} type - The admonition type.
 * @param {import('hast').ElementContent[]} children - The children elements of the component.
 * @returns {import('hast').Element} The created admonition component.
 */
export function AdmonitionComponent(properties, children, type) {
	if (!Array.isArray(children) || children.length === 0)
		return h(
			"div",
			{ class: "hidden" },
			'Invalid admonition directive. (Admonition directives must be of block type ":::note{name="name"} <content> :::")',
		);

	const label = properties?.["has-directive-label"] ? children[0] : null;
	// Directive labels are paragraphs. Keep their inline content inside the title
	// span without nesting a block element or mutating the renderer's input tree.
	const title =
		label?.type === "element" ? h("span", label.children) : type.toUpperCase();
	const body = label ? children.slice(1) : children;

	return h("blockquote", { class: `admonition bdm-${type}` }, [
		h("span", { class: "bdm-title" }, title),
		...body,
	]);
}
