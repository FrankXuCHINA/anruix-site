import type { Favicon } from "@/types/config.ts";

export const faviconVersion = "20260718-v1";
export const webManifest: string = `/site.webmanifest?v=${faviconVersion}`;

export const defaultFavicons: Favicon[] = [
	{
		src: `/favicon.png?v=${faviconVersion}`,
		type: "image/png",
	},
];
