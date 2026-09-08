import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { onPageView } from "../src/utils/page-lifecycle.ts";

function searchHarness() {
	const source = readFileSync(
		new URL("../src/components/controls/Search.svelte", import.meta.url),
		"utf8",
	)
		.split('<script lang="ts">')[1]
		.split("</script>")[0]
		.replace(/^import .*;$/gm, "")
		.replaceAll("import.meta.env.PROD", "true")
		.replaceAll("import.meta.env.DEV", "false");
	const events = new EventTarget();
	const timers = new Map();
	const classes = new Set(["float-panel-closed"]);
	let mount;
	let navigationCleanup;
	let mutation;
	const panel = {
		classList: {
			add: (name) => classes.add(name),
			remove: (name) => classes.delete(name),
			contains: (name) => classes.has(name),
		},
	};
	const context = vm.createContext({
		window: {},
		console: { log() {}, warn() {}, error() {} },
		url: (value) => value,
		document: {
			getElementById: () => panel,
			addEventListener: events.addEventListener.bind(events),
			removeEventListener: events.removeEventListener.bind(events),
		},
		onMount: (callback) => {
			mount = callback;
		},
		onPageView: (callback) => {
			navigationCleanup = callback();
			return () => navigationCleanup?.();
		},
		MutationObserver: class {
			constructor(callback) {
				mutation = callback;
			}
			observe() {}
			disconnect() {
				mutation = undefined;
			}
		},
		setTimeout: (callback) => {
			const id = Symbol();
			timers.set(id, callback);
			return id;
		},
		clearTimeout: (id) => timers.delete(id),
	});
	vm.runInContext(
		ts.transpile(
			source +
				"\nthis.api = { search, state: () => ({ result, isSearching, initialized }), };",
			{
				target: ts.ScriptTarget.ES2022,
				module: ts.ModuleKind.None,
			},
		),
		context,
	);
	const cleanup = mount();
	return {
		api: context.api,
		timers,
		classes,
		ready(search) {
			context.window.pagefind = { search };
			events.dispatchEvent(new Event("pagefindready"));
		},
		fail() {
			events.dispatchEvent(new Event("pagefindloaderror"));
		},
		close() {
			classes.add("float-panel-closed");
			mutation?.();
		},
		navigate() {
			navigationCleanup();
		},
		cleanup,
	};
}
const response = (title) => ({
	results: [
		{ data: async () => ({ meta: { title }, url: "/", excerpt: title }) },
	],
});

test("Search ignores a slower previous response and clears in-flight results", async () => {
	const h = searchHarness();
	let resolveOld;
	h.ready((query) =>
		query === "old"
			? new Promise((resolve) => {
					resolveOld = resolve;
				})
			: Promise.resolve(response(query)),
	);
	const old = h.api.search("old", true);
	await h.api.search("new", true);
	resolveOld(response("old"));
	await old;
	assert.equal(h.api.state().result[0].meta.title, "new");
	const pending = h.api.search("old", true);
	await h.api.search("", true);
	resolveOld(response("old"));
	await pending;
	assert.equal(h.api.state().result.length, 0);
	assert.equal(h.api.state().isSearching, false);
	h.cleanup();
});

test("Search supports timeout then late readiness, failure, close and navigation cancellation", async () => {
	const h = searchHarness();
	await h.api.search("queued", false);
	for (const callback of [...h.timers.values()]) callback();
	h.ready(async () => response("queued"));
	await new Promise((resolve) => setImmediate(resolve));
	assert.equal(h.api.state().result[0].meta.title, "queued");
	h.ready(async () => {
		throw new Error("network failure");
	});
	await h.api.search("failure", true);
	assert.equal(h.api.state().isSearching, false);
	assert.equal(h.api.state().result.length, 0);
	let resolvePending;
	h.ready(
		() =>
			new Promise((resolve) => {
				resolvePending = resolve;
			}),
	);
	const pending = h.api.search("pending", true);
	h.close();
	resolvePending(response("stale"));
	await pending;
	assert.equal(h.api.state().result.length, 0);
	const navigating = h.api.search("pending", true);
	h.navigate();
	resolvePending(response("stale"));
	await navigating;
	assert.equal(h.api.state().result.length, 0);
	h.cleanup();
	assert.equal(h.timers.size, 0);
	h.ready(async () => response("after unmount"));
	assert.equal(h.api.state().result.length, 0);
});

test("Search load-error fallback stays usable when Pagefind later recovers", async () => {
	const h = searchHarness();
	h.fail();
	await h.api.search("recover", true);
	assert.equal(h.api.state().isSearching, false);
	h.ready(async () => response("recover"));
	await new Promise((resolve) => setImmediate(resolve));
	assert.equal(h.api.state().result[0].meta.title, "recover");
	h.cleanup();
});

test("Page lifecycle destroys old instances and unregisters hooks", () => {
	const handlers = new Map();
	const hooks = {
		before: (name, fn) => handlers.set(name, fn),
		on: (name, fn) => handlers.set(name, fn),
		off: (name, fn) => {
			if (handlers.get(name) === fn) handlers.delete(name);
		},
	};
	globalThis.window = { swup: { hooks } };
	globalThis.document = new EventTarget();
	let alive = 0;
	let mounts = 0;
	try {
		const stop = onPageView(() => {
			alive++;
			mounts++;
			return () => {
				alive--;
			};
		});
		for (let i = 0; i < 5; i++) {
			handlers.get("content:replace")();
			assert.equal(alive, 0);
			handlers.get("page:view")();
			assert.equal(alive, 1);
		}
		handlers.get("page:view")();
		assert.equal(alive, 1);
		assert.equal(mounts, 7);
		stop();
		assert.equal(alive, 0);
		assert.equal(handlers.size, 0);
	} finally {
		delete globalThis.window;
		delete globalThis.document;
	}
});
