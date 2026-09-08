import { navBarConfig } from "../config";
import { LinkPresets } from "../constants/link-presets";
import type { LinkPreset, NavBarLink } from "../types/config";

export function resolveNavMenuLinks(): NavBarLink[] {
	return navBarConfig.links.map((item) =>
		typeof item === "number" ? LinkPresets[item as LinkPreset] : item,
	);
}
