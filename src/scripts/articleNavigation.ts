let cleanupArticleNavigation: (() => void) | undefined;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  const backToTopButton = articlePage.querySelector<HTMLButtonElement>(
    "[data-article-back-to-top]"
  );
  const backToTopContainer = backToTopButton?.closest<HTMLElement>(
    ".article-back-to-top"
  );

  let scrollFrame = 0;
  let resizeFrame = 0;
  let observer: IntersectionObserver | undefined;
  let lockedHeadingId: string | undefined;
  let unlockTimer = 0;

  const setActiveHeading = (id?: string) => {
    for (const link of tocLinks) {
      const isActive = Boolean(id && link.dataset.headingId === id);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  const getHeaderOffset = () => {
    const header = document.querySelector<HTMLElement>(".site-header");
    return Math.ceil((header?.getBoundingClientRect().height ?? 52) + 24);
  };

  const updateActiveHeading = () => {
    if (lockedHeadingId) {
      setActiveHeading(lockedHeadingId);
      return;
    }

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

  const updateBackToTopVisibility = () => {
    scrollFrame = 0;
    backToTopContainer?.classList.toggle("is-visible", window.scrollY >= 300);
  };

  const requestScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateBackToTopVisibility);
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

    const headingId = link.dataset.headingId;
    const heading = headingId ? document.getElementById(headingId) : null;
    if (!heading || !headingId) return;

    event.preventDefault();
    const hash = `#${encodeURIComponent(headingId)}`;
    if (window.location.hash !== hash) history.pushState(null, "", hash);

    lockedHeadingId = headingId;
    setActiveHeading(headingId);
    heading.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });

    link.closest("details")?.removeAttribute("open");
    window.clearTimeout(unlockTimer);
    unlockTimer = window.setTimeout(
      () => {
        lockedHeadingId = undefined;
        updateActiveHeading();
      },
      prefersReducedMotion() ? 0 : 700
    );
  };

  const syncFromHash = () => {
    let id = "";
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      id = window.location.hash.slice(1);
    }
    if (id && headingIds.includes(id)) setActiveHeading(id);
    else updateActiveHeading();
    requestScrollUpdate();
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  document.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("pageshow", requestScrollUpdate);
  window.addEventListener("hashchange", syncFromHash);
  window.addEventListener("popstate", syncFromHash);
  articlePage.addEventListener("click", handleTocClick);
  backToTopButton?.addEventListener("click", handleBackToTop);

  updateBackToTopVisibility();
  createHeadingObserver();
  window.requestAnimationFrame(syncFromHash);

  cleanupArticleNavigation = () => {
    document.removeEventListener("scroll", requestScrollUpdate);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("pageshow", requestScrollUpdate);
    window.removeEventListener("hashchange", syncFromHash);
    window.removeEventListener("popstate", syncFromHash);
    articlePage.removeEventListener("click", handleTocClick);
    backToTopButton?.removeEventListener("click", handleBackToTop);
    observer?.disconnect();
    window.cancelAnimationFrame(scrollFrame);
    window.cancelAnimationFrame(resizeFrame);
    window.clearTimeout(unlockTimer);
  };
}
