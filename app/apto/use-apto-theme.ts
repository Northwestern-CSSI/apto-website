"use client";

import { useEffect, useState } from "react";

import {
  APTO_LEGACY_THEME_SESSION_KEY,
  APTO_THEME_STORAGE_KEY,
  applyAptoTheme,
  isAptoTheme,
  legacyAptoTheme,
  preferredAptoTheme,
  storedAptoTheme,
  type AptoTheme,
} from "./theme";

export function useAptoTheme(initialTheme: AptoTheme = "light") {
  const [theme, setTheme] = useState<AptoTheme>(initialTheme);

  useEffect(() => {
    let active = true;
    const rootTheme = document.documentElement.dataset.aptoTheme;
    const resolvedTheme = isAptoTheme(rootTheme)
      ? rootTheme
      : storedAptoTheme() ?? legacyAptoTheme() ?? preferredAptoTheme();
    applyAptoTheme(resolvedTheme);
    queueMicrotask(() => {
      if (active) setTheme(resolvedTheme);
    });

    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (storedAptoTheme() || legacyAptoTheme()) return;
      const nextTheme = event.matches ? "dark" : "light";
      applyAptoTheme(nextTheme);
      setTheme(nextTheme);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APTO_THEME_STORAGE_KEY) return;
      const nextTheme = isAptoTheme(event.newValue)
        ? event.newValue
        : legacyAptoTheme() ?? preferredAptoTheme();
      applyAptoTheme(nextTheme);
      setTheme(nextTheme);
    };
    preference.addEventListener("change", handlePreferenceChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      preference.removeEventListener("change", handlePreferenceChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    const rootTheme = document.documentElement.dataset.aptoTheme;
    const currentTheme = isAptoTheme(rootTheme) ? rootTheme : theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(APTO_THEME_STORAGE_KEY, nextTheme);
    } catch {}
    try {
      window.sessionStorage.removeItem(APTO_LEGACY_THEME_SESSION_KEY);
    } catch {}
    applyAptoTheme(nextTheme);
    setTheme(nextTheme);

    const url = new URL(window.location.href);
    if (url.searchParams.has("concept")) {
      url.searchParams.delete("concept");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  return { theme, toggleTheme };
}
