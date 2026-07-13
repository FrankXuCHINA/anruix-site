let cleanupArticleNavigation: (() => void) | undefined;

export function setupArticleNavigation() {
  cleanupArticleNavigation?.();
  cleanupArticleNavigation = undefined;

  const articlePage = document.querySelector<HTMLElement>(
    "[data-article-page]"
  );
  if (!articlePage) return;

  const tocLinks = Array.from(
    articlePage.querySelectorAll<HTMLAnchorElement>("[data-heading-id]")
  );
  const headingIds = Array.from(
    new Set(tocLinks.map(link => link.dataset.headingId).filter(Boolean))
  ) as string[];
  const headings = headingIds
    .map(id => document.getElementById(id))
    .filter((heading): heading is HTMLElement => heading !== null);
  let resizeFrame = 0;
  let observer: IntersectionObserver | undefined;

  const keepActiveLinkVisible = (id: string) => {
    const tocContainers =
      articlePage.querySelectorAll<HTMLElement>("[data-article-toc]");

    for (const toc of tocContainers) {
      if (toc.clientHeight === 0) continue;
      const activeLink = Array.from(
        toc.querySelectorAll<HTMLAnchorElement>("[data-heading-id]")
      ).find(link => link.dataset.headingId === id);
      if (!activeLink) continue;

      const tocRect = toc.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const edgeOffset = 4;

      if (linkRect.top < tocRect.top + edgeOffset) {
        toc.scrollTop += linkRect.top - tocRect.top - edgeOffset;
      } else if (linkRect.bottom > tocRect.bottom - edgeOffset) {
        toc.scrollTop += linkRect.bottom - tocRect.bottom + edgeOffset;
      }
    }
  };

  const setActiveHeading = (id?: string) => {
    for (const link of tocLinks) {
      const isActive = Boolean(id && link.dataset.headingId === id);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    if (id) keepActiveLinkVisible(id);
  };

  const getHeaderOffset = () => {
    const header = document.querySelector<HTMLElement>(".site-header");
    return Math.ceil((header?.getBoundingClientRect().height ?? 52) + 24);
  };

  const updateActiveHeading = () => {
    const readingLine = getHeaderOffset();
    let activeId = headings[0]?.id;

    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= readingLine) {
        activeId = heading.id;
      } else {
        break;
      }
    }

    setActiveHeading(activeId);
  };

  const createHeadingObserver = () => {
    observer?.disconnect();
    if (headings.length === 0) return;

    observer = new IntersectionObserver(updateActiveHeading, {
      rootMargin: `-${getHeaderOffset()}px 0px -68% 0px`,
      threshold: [0, 1],
    });
    headings.forEach(heading => observer?.observe(heading));
    updateActiveHeading();
  };

  const handleResize = () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      createHeadingObserver();
    });
  };

  const handleTocClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      "[data-heading-id]"
    );
    if (!link || !articlePage.contains(link)) return;
    link.closest("details")?.removeAttribute("open");
  };

  const syncFromHash = () => {
    const rawHash = window.location.hash.slice(1);
    let hashId = rawHash;
    try {
      hashId = decodeURIComponent(rawHash);
    } catch {
      // Keep the raw value for malformed external hashes.
    }
    if (hashId && headingIds.includes(hashId)) setActiveHeading(hashId);
    else updateActiveHeading();
  };

  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("hashchange", syncFromHash);
  articlePage.addEventListener("click", handleTocClick);

  createHeadingObserver();
  syncFromHash();

  cleanupArticleNavigation = () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("hashchange", syncFromHash);
    articlePage.removeEventListener("click", handleTocClick);
    observer?.disconnect();
    window.cancelAnimationFrame(resizeFrame);
  };
}
