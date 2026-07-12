const THEME_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";

type Theme = typeof LIGHT | typeof DARK;
type RuntimeWindow = Window &
  typeof globalThis & {
    __theme?: { value: Theme; isManual: boolean };
    __themeControllerInitialized?: boolean;
  };

const runtimeWindow = window as RuntimeWindow;

if (!runtimeWindow.__themeControllerInitialized) {
  runtimeWindow.__themeControllerInitialized = true;

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  const isTheme = (value: string | null): value is Theme =>
    value === LIGHT || value === DARK;

  const getStoredTheme = (): Theme | null => {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return isTheme(value) ? value : null;
    } catch {
      return null;
    }
  };

  const storeTheme = (theme: Theme): void => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The selected theme still applies for this page when storage is blocked.
    }
  };

  const getSystemTheme = (): Theme => (systemTheme.matches ? DARK : LIGHT);

  const storedTheme = getStoredTheme();
  let hasManualPreference =
    storedTheme !== null || runtimeWindow.__theme?.isManual === true;
  let themeValue: Theme =
    storedTheme ?? runtimeWindow.__theme?.value ?? getSystemTheme();

  const updateThemeToggle = (theme: Theme): void => {
    const button = document.querySelector<HTMLButtonElement>("#theme-toggle");
    if (!button) return;

    const label =
      theme === LIGHT
        ? (button.dataset.labelToDark ?? "切换到深色模式")
        : (button.dataset.labelToLight ?? "切换到浅色模式");

    button.dataset.currentTheme = theme;
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  };

  const updateThemeColor = (): void => {
    const background = window.getComputedStyle(document.body).backgroundColor;
    document
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", background);
  };

  const applyTheme = (theme: Theme): void => {
    themeValue = theme;
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === DARK);
    root.style.colorScheme = theme;
    runtimeWindow.__theme = {
      value: theme,
      isManual: hasManualPreference,
    };
    updateThemeToggle(theme);
    updateThemeColor();
  };

  document.addEventListener("click", event => {
    const target = event.target as Element | null;
    if (!target?.closest?.("#theme-toggle")) return;

    hasManualPreference = true;
    const nextTheme = themeValue === LIGHT ? DARK : LIGHT;
    storeTheme(nextTheme);
    applyTheme(nextTheme);
  });

  systemTheme.addEventListener("change", ({ matches }) => {
    if (hasManualPreference) return;
    applyTheme(matches ? DARK : LIGHT);
  });

  window.addEventListener("storage", event => {
    if (event.key !== THEME_KEY) return;

    const syncedTheme = isTheme(event.newValue) ? event.newValue : null;
    hasManualPreference = syncedTheme !== null;
    applyTheme(syncedTheme ?? getSystemTheme());
  });

  applyTheme(themeValue);
}
