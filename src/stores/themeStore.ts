import { create } from 'zustand';

export type ThemeId = 'light' | 'dark' | 'solarized-light' | 'solarized-dark' | 'system';

const STORAGE_KEY = 'workflow-form-builder-theme';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: ThemeId): 'light' | 'dark' | 'solarized-light' | 'solarized-dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(theme: ThemeId) {
  const resolved = resolveTheme(theme);
  if (resolved === 'light') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = resolved;
  }
}

function loadTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['light', 'dark', 'solarized-light', 'solarized-dark', 'system'].includes(stored)) {
    return stored as ThemeId;
  }
  return 'system';
}

interface ThemeStore {
  theme: ThemeId;
  resolvedTheme: 'light' | 'dark' | 'solarized-light' | 'solarized-dark';
  setTheme: (theme: ThemeId) => void;
  initTheme: () => () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: loadTheme(),
  resolvedTheme: resolveTheme(loadTheme()),
  setTheme: (theme: ThemeId) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme, resolvedTheme: resolveTheme(theme) });
  },
  initTheme: () => {
    const { theme } = get();
    applyTheme(theme);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const current = get().theme;
      if (current === 'system') {
        applyTheme('system');
        set({ resolvedTheme: resolveTheme('system') });
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  },
}));
