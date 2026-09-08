export const CATEGORY_DEFINITIONS = Object.freeze([
	{ name: "拍摄技巧" },
	{ name: "后期制作" },
	{ name: "创作记录" },
] as const);

export const CATEGORY_NAMES = Object.freeze(
	CATEGORY_DEFINITIONS.map(({ name }) => name),
);

export type CategoryName = (typeof CATEGORY_DEFINITIONS)[number]["name"];
