import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import "./theme.css";

const THEME_STORAGE_KEY = "appTheme";
const DEFAULT_THEME = "system";
const SUPPORTED_THEMES = ["light", "dark", "system"];

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return SUPPORTED_THEMES.includes(savedTheme) ? savedTheme : DEFAULT_THEME;
}

function getSystemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) {
      return undefined;
    }

    const handleChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = theme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, theme]);

  const setTheme = useCallback((nextTheme) => {
    if (!SUPPORTED_THEMES.includes(nextTheme)) {
      return;
    }

    setThemeState(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
