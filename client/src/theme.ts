const storageKey = "theme";

export type Theme = "light" | "dark";

function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(storageKey);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function readAppliedTheme(): Theme {
  const applied = document.documentElement.dataset.theme;
  if (isTheme(applied)) {
    return applied;
  }

  return storedTheme() ?? systemTheme();
}

export function persistTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Storage can be blocked. The attribute still updates this visit.
  }
}
