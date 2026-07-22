export type AptoTheme = "light" | "dark";

export const APTO_THEME_STORAGE_KEY = "apto-theme";
export const APTO_LEGACY_THEME_SESSION_KEY = "apto-legacy-theme";
export const APTO_THEME_ATTRIBUTE = "data-apto-theme";
export const APTO_LIGHT_CLASS = "nsf-apto-home";
export const APTO_DARK_CLASS = "nsf-apto-network";

export function isAptoTheme(value: unknown): value is AptoTheme {
  return value === "light" || value === "dark";
}

export function applyAptoTheme(theme: AptoTheme) {
  const root = document.documentElement;
  root.classList.toggle(APTO_LIGHT_CLASS, theme === "light");
  root.classList.toggle(APTO_DARK_CLASS, theme === "dark");
  root.dataset.aptoTheme = theme;
  root.style.colorScheme = theme;
}

export function storedAptoTheme(): AptoTheme | null {
  try {
    const value = window.localStorage.getItem(APTO_THEME_STORAGE_KEY);
    return isAptoTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function preferredAptoTheme(): AptoTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function legacyAptoTheme(): AptoTheme | null {
  try {
    const value = window.sessionStorage.getItem(APTO_LEGACY_THEME_SESSION_KEY);
    return isAptoTheme(value) ? value : null;
  } catch {
    return null;
  }
}

// This runs before the routed APTO page is parsed, preventing the default light
// palette from flashing while React starts. Published concept URLs remain valid
// as appearance hints for the current tab unless a saved user override exists.
export const aptoThemeBootstrap = String.raw`(() => {
  const root = document.documentElement;
  const lightClass = "${APTO_LIGHT_CLASS}";
  const darkClass = "${APTO_DARK_CLASS}";
  const storageKey = "${APTO_THEME_STORAGE_KEY}";
  const sessionKey = "${APTO_LEGACY_THEME_SESSION_KEY}";
  const concept = new URLSearchParams(window.location.search).get("concept") || "";
  const queryTheme = /^nsfnetwork(?:widgets)?$/.test(concept)
    ? "dark"
    : /^(?:nsfhome|nsfledger)(?:widgets)?$/.test(concept)
      ? "light"
      : null;
  let storedTheme = null;
  let sessionTheme = null;
  try {
    const candidate = window.localStorage.getItem(storageKey);
    storedTheme = candidate === "light" || candidate === "dark" ? candidate : null;
  } catch {}
  try {
    const candidate = window.sessionStorage.getItem(sessionKey);
    sessionTheme = candidate === "light" || candidate === "dark" ? candidate : null;
    if (!storedTheme && queryTheme) {
      window.sessionStorage.setItem(sessionKey, queryTheme);
      sessionTheme = queryTheme;
    }
  } catch {}
  const theme = storedTheme || queryTheme || sessionTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.classList.toggle(lightClass, theme === "light");
  root.classList.toggle(darkClass, theme === "dark");
  root.setAttribute("${APTO_THEME_ATTRIBUTE}", theme);
  root.style.colorScheme = theme;
})();`;
