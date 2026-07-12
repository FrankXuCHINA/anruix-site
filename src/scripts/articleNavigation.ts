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
  const backToTopButton = articlePage.querySelector<HTMLButtonElement>(
    "[data-article-back-to-top]"
  );
  const backToTopContainer = backToTopButton?.closest<HTMLElement>(
    ".article-back-to-top"
  );

  let scrollFrame = 0;
  let resizeFrame = 0;
  let observer: IntersectionObserver | undefined;

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
    link.closest("details")?.removeAttribute("open");
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  document.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  articlePage.addEventListener("click", handleTocClick);
  backToTopButton?.addEventListener("click", handleBackToTop);

  updateBackToTopVisibility();
  createHeadingObserver();

  cleanupArticleNavigation = () => {
    document.removeEventListener("scroll", requestScrollUpdate);
    window.removeEventListener("resize", handleResize);
    articlePage.removeEventListener("click", handleTocClick);
    backToTopButton?.removeEventListener("click", handleBackToTop);
    observer?.disconnect();
    window.cancelAnimationFrame(scrollFrame);
    window.cancelAnimationFrame(resizeFrame);
  };
}
