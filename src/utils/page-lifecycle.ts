/** One owner per page feature; dispose before Swup detaches its DOM. */
export function onPageView(mount: () => undefined | (() => void)) {
	let cleanup: undefined | (() => void);
	const dispose = () => {
		cleanup?.();
		cleanup = undefined;
	};
	const refresh = () => {
		dispose();
		cleanup = mount();
	};
	let attached = false;
	const setup = () => {
		if (attached) return;
		attached = true;
		window.swup.hooks.before("content:replace", dispose);
		window.swup.hooks.on("page:view", refresh);
	};
	refresh();
	if (window.swup?.hooks) setup();
	else document.addEventListener("swup:enable", setup, { once: true });
	return () => {
		dispose();
		document.removeEventListener("swup:enable", setup);
		if (attached) {
			window.swup.hooks.off("content:replace", dispose);
			window.swup.hooks.off("page:view", refresh);
		}
	};
}
