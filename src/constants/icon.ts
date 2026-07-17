import type { Favicon } from "@/types/config.ts";

export const faviconVersion = "20260717-v3";
export const webManifest = `/site.webmanifest?v=${faviconVersion}`;

export const defaultFavicons: Favicon[] = [
	{
		src: `/favicon-avatar.png?v=${faviconVersion}`,
		type: "image/png",
	},
];
