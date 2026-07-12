type SearchScope = "title" | "description" | "content" | "path";

type PagefindResult = {
  data: () => Promise<{ url: string }>;
};

type PagefindModule = {
  search: (term: string) => Promise<{ results: PagefindResult[] } | null>;
};

let cleanupPostSearch: (() => void) | undefined;
let pagefindPromise: Promise<PagefindModule> | undefined;

const normalizeText = (value: string) =>
  value.toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();

const normalizePath = (value: string) => {
  try {
    return new URL(value, window.location.origin).pathname.replace(/\/$/, "");
  } catch {
    return value.replace(/\/$/, "");
  }
};

const loadPagefind = (bundlePath: string) => {
  pagefindPromise ??= import(
    /* @vite-ignore */ `${bundlePath}pagefind.js`
  ).catch(error => {
    pagefindPromise = undefined;
    throw error;
  }) as Promise<PagefindModule>;
  return pagefindPromise;
};

export function setupPostSearch() {
  cleanupPostSearch?.();
  cleanupPostSearch = undefined;

  const root = document.querySelector<HTMLElement>("[data-post-search]");
  if (!root) return;

  const form = root.querySelector<HTMLFormElement>("form");
  const input = root.querySelector<HTMLInputElement>("input[type='search']");
  const scopes = Array.from(
    root.querySelectorAll<HTMLInputElement>("input[name='scope']")
  );
  const results = root.querySelector<HTMLElement>("[data-search-results]");
  const status = root.querySelector<HTMLElement>("[data-search-status]");
  const idle = root.querySelector<HTMLElement>("[data-search-idle]");
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("[data-post-card]")
  );
  const homeDefault = document.querySelector<HTMLElement>(
    "[data-home-default]"
  );

  if (!form || !input || !results || !status || !idle) return;

  const bundlePath = root.dataset.bundlePath ?? "/pagefind/";
  const mode = root.dataset.searchMode ?? "home";
  let debounceTimer = 0;
  let requestId = 0;

  const setDefaultVisibility = (searching: boolean) => {
    if (homeDefault) homeDefault.hidden = searching;
    results.hidden = !searching;
    idle.hidden = mode === "home" || searching;
  };

  const selectedScopes = () =>
    new Set(
      scopes
        .filter(scope => scope.checked)
        .map(scope => scope.value as SearchScope)
    );

  const matchesSelectedFields = (
    card: HTMLElement,
    selected: Set<SearchScope>,
    terms: string[]
  ) =>
    [...selected].some(scope => {
      const key = `search${scope.charAt(0).toUpperCase()}${scope.slice(1)}`;
      const value = normalizeText(card.dataset[key] ?? "");
      return terms.every(term => value.includes(term));
    });

  const runSearch = async () => {
    const query = input.value.trim();
    const currentRequest = ++requestId;

    if (!query) {
      cards.forEach(card => (card.hidden = true));
      status.textContent = "";
      setDefaultVisibility(false);
      if (mode === "page") {
        history.replaceState(history.state, "", window.location.pathname);
      }
      return;
    }

    const selected = selectedScopes();
    setDefaultVisibility(true);
    cards.forEach(card => (card.hidden = true));

    if (selected.size === 0) {
      status.textContent = "请至少选择一个搜索范围";
      return;
    }

    status.textContent = root.dataset.labelLoading ?? "正在加载";
    const normalizedQuery = normalizeText(query);
    const terms = normalizedQuery.split(" ").filter(Boolean);
    const localMatches = cards.filter(card =>
      matchesSelectedFields(card, selected, terms)
    );

    let rankedPaths: string[] = [];
    try {
      const pagefind = await loadPagefind(bundlePath);
      const response = await pagefind.search(query);
      const resultData = await Promise.all(
        (response?.results ?? []).map(result => result.data())
      );
      rankedPaths = resultData.map(result => normalizePath(result.url));
    } catch {
      rankedPaths = [];
    }

    if (currentRequest !== requestId) return;

    const ranking = new Map(rankedPaths.map((path, index) => [path, index]));
    localMatches.sort((a, b) => {
      const aRank = ranking.get(normalizePath(a.dataset.searchUrl ?? ""));
      const bRank = ranking.get(normalizePath(b.dataset.searchUrl ?? ""));
      return (aRank ?? Number.MAX_SAFE_INTEGER) -
        (bRank ?? Number.MAX_SAFE_INTEGER);
    });

    const list = root.querySelector<HTMLElement>("[data-search-list]");
    localMatches.forEach(card => {
      card.hidden = false;
      list?.append(card);
    });

    status.textContent = localMatches.length
      ? `找到 ${localMatches.length} 篇文章`
      : (root.dataset.labelEmpty ?? "未找到相关文章");

    if (mode === "page") {
      const params = new URLSearchParams(window.location.search);
      params.set("q", query);
      history.replaceState(history.state, "", `?${params.toString()}`);
    }
  };

  const scheduleSearch = () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(runSearch, 180);
  };

  const preventSubmit = (event: SubmitEvent) => event.preventDefault();
  form.addEventListener("submit", preventSubmit);
  input.addEventListener("input", scheduleSearch);
  scopes.forEach(scope => scope.addEventListener("change", scheduleSearch));

  if (mode === "page") {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) {
      input.value = query;
      void runSearch();
    }
  }

  cleanupPostSearch = () => {
    form.removeEventListener("submit", preventSubmit);
    input.removeEventListener("input", scheduleSearch);
    scopes.forEach(scope =>
      scope.removeEventListener("change", scheduleSearch)
    );
    window.clearTimeout(debounceTimer);
    requestId += 1;
  };
}
