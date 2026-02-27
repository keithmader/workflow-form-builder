# Theme System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a multi-theme system (Light, Dark, Solarized Light, Solarized Dark, System) with toolbar dropdown and settings persistence.

**Architecture:** All colors are already defined as semantic CSS custom properties in `@theme` block in `src/index.css`. Theme switching works by adding scoped CSS overrides on `[data-theme="..."]` selectors and toggling a `data-theme` attribute on `<html>`. A Zustand store manages theme state, localStorage persistence, and OS preference detection.

**Tech Stack:** TailwindCSS 4 `@theme` + CSS custom properties, Zustand, Radix DropdownMenu, Monaco editor theme API, `matchMedia` for system preference.

---

### Task 1: Create theme store

**Files:**
- Create: `src/stores/themeStore.ts`

**Step 1: Create the Zustand store**

```typescript
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
```

**Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/stores/themeStore.ts`
Expected: No errors (or use `npm run build` later)

**Step 3: Commit**

```bash
git add src/stores/themeStore.ts
git commit -m "feat: add theme store with 5 themes + system detection"
```

---

### Task 2: Add CSS theme overrides

**Files:**
- Modify: `src/index.css` (after the existing `@theme` block and `body`/`#root` rules)

**Step 1: Add dark theme override**

Append after the `#root` rule block in `src/index.css`:

```css
/* ── Theme overrides ─────────────────────────────────── */

[data-theme="dark"] {
  --color-background: oklch(0.145 0.005 286);
  --color-foreground: oklch(0.93 0.003 286);
  --color-card: oklch(0.19 0.005 286);
  --color-card-foreground: oklch(0.93 0.003 286);
  --color-popover: oklch(0.19 0.005 286);
  --color-popover-foreground: oklch(0.93 0.003 286);
  --color-primary: oklch(0.55 0.243 264);
  --color-primary-foreground: oklch(0.984 0.003 248);
  --color-secondary: oklch(0.22 0.006 286);
  --color-secondary-foreground: oklch(0.93 0.003 286);
  --color-muted: oklch(0.22 0.006 286);
  --color-muted-foreground: oklch(0.6 0.013 286);
  --color-accent: oklch(0.25 0.006 286);
  --color-accent-foreground: oklch(0.93 0.003 286);
  --color-destructive: oklch(0.6 0.245 27);
  --color-destructive-foreground: oklch(0.984 0.003 248);
  --color-border: oklch(0.3 0.005 286);
  --color-input: oklch(0.3 0.005 286);
  --color-ring: oklch(0.55 0.243 264);
}

[data-theme="solarized-light"] {
  --color-background: oklch(0.973 0.015 95);
  --color-foreground: oklch(0.5 0.02 230);
  --color-card: oklch(0.96 0.013 95);
  --color-card-foreground: oklch(0.5 0.02 230);
  --color-popover: oklch(0.96 0.013 95);
  --color-popover-foreground: oklch(0.5 0.02 230);
  --color-primary: oklch(0.55 0.15 240);
  --color-primary-foreground: oklch(0.973 0.015 95);
  --color-secondary: oklch(0.94 0.012 95);
  --color-secondary-foreground: oklch(0.42 0.02 230);
  --color-muted: oklch(0.94 0.012 95);
  --color-muted-foreground: oklch(0.58 0.02 190);
  --color-accent: oklch(0.92 0.01 95);
  --color-accent-foreground: oklch(0.42 0.02 230);
  --color-destructive: oklch(0.55 0.2 25);
  --color-destructive-foreground: oklch(0.973 0.015 95);
  --color-border: oklch(0.87 0.02 95);
  --color-input: oklch(0.87 0.02 95);
  --color-ring: oklch(0.55 0.15 240);
}

[data-theme="solarized-dark"] {
  --color-background: oklch(0.24 0.025 230);
  --color-foreground: oklch(0.65 0.02 195);
  --color-card: oklch(0.27 0.02 230);
  --color-card-foreground: oklch(0.65 0.02 195);
  --color-popover: oklch(0.27 0.02 230);
  --color-popover-foreground: oklch(0.65 0.02 195);
  --color-primary: oklch(0.55 0.15 240);
  --color-primary-foreground: oklch(0.973 0.015 95);
  --color-secondary: oklch(0.28 0.02 230);
  --color-secondary-foreground: oklch(0.65 0.02 195);
  --color-muted: oklch(0.28 0.02 230);
  --color-muted-foreground: oklch(0.55 0.015 195);
  --color-accent: oklch(0.3 0.02 230);
  --color-accent-foreground: oklch(0.65 0.02 195);
  --color-destructive: oklch(0.55 0.2 25);
  --color-destructive-foreground: oklch(0.973 0.015 95);
  --color-border: oklch(0.32 0.02 230);
  --color-input: oklch(0.32 0.02 230);
  --color-ring: oklch(0.55 0.15 240);
}
```

**Step 2: Verify CSS compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add dark, solarized-light, solarized-dark CSS theme overrides"
```

---

### Task 3: Initialize theme on app mount

**Files:**
- Modify: `src/App.tsx:10-12` (inside the existing `useEffect`)

**Step 1: Import and call initTheme**

At top of `src/App.tsx`, add import:
```typescript
import { useThemeStore } from '@/stores/themeStore';
```

Inside the existing `useEffect` at line 10, add at the very beginning (before `useProjectStore.getState().loadFromStorage()`):
```typescript
const cleanupTheme = useThemeStore.getState().initTheme();
```

And in the cleanup return, add `cleanupTheme()`. The effect's return currently is `return () => clearInterval(interval)` — change it to clean up both:
```typescript
return () => {
  clearInterval(interval);
  cleanupTheme();
};
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: initialize theme store on app mount"
```

---

### Task 4: Add theme dropdown to toolbar

**Files:**
- Modify: `src/components/layout/Toolbar.tsx`

**Step 1: Add imports**

Add to the lucide-react import line:
```typescript
Sun, Moon, Monitor, Palette,
```

Add new imports:
```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useThemeStore, type ThemeId } from '@/stores/themeStore';
```

**Step 2: Add theme items config and dropdown**

Inside the `Toolbar` component function body, before the `return`, add:
```typescript
const { theme, setTheme } = useThemeStore();

const themeItems: { id: ThemeId; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'solarized-light', label: 'Solarized Light', icon: Sun },
  { id: 'solarized-dark', label: 'Solarized Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

const currentThemeIcon = theme === 'system' ? Monitor : theme.includes('dark') ? Moon : Sun;
```

**Step 3: Add dropdown JSX**

Insert the dropdown just before the `<div className="flex-1" />` spacer (line 191):

```tsx
<div className="h-5 w-px bg-border" />

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button className={btnClass} title="Theme">
      {(() => { const Icon = currentThemeIcon; return <Icon size={16} />; })()}
      <span className="text-xs">Theme</span>
    </button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1 shadow-md"
      sideOffset={5}
    >
      {themeItems.map(({ id, label, icon: Icon }) => (
        <DropdownMenu.Item
          key={id}
          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer outline-none hover:bg-accent hover:text-accent-foreground ${
            theme === id ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'
          }`}
          onSelect={() => setTheme(id)}
        >
          <Icon size={14} />
          {label}
        </DropdownMenu.Item>
      ))}
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

**Step 4: Install Radix dropdown if needed**

Check if `@radix-ui/react-dropdown-menu` is already installed:
Run: `grep dropdown-menu package.json`
If not found: `npm install @radix-ui/react-dropdown-menu`

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/components/layout/Toolbar.tsx package.json package-lock.json
git commit -m "feat: add theme switcher dropdown to toolbar"
```

---

### Task 5: Sync Monaco editor theme

**Files:**
- Modify: `src/components/json/JsonEditor.tsx:148-152` (the `<Editor>` component)

**Step 1: Import theme store**

Add at top of file:
```typescript
import { useThemeStore } from '@/stores/themeStore';
```

**Step 2: Compute Monaco theme**

Inside the component, add:
```typescript
const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
const monacoTheme = resolvedTheme === 'dark' || resolvedTheme === 'solarized-dark' ? 'vs-dark' : 'vs';
```

**Step 3: Replace hardcoded theme**

Change the `<Editor>` prop from `theme="vs-light"` to `theme={monacoTheme}`.

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/json/JsonEditor.tsx
git commit -m "feat: sync Monaco editor theme with app theme"
```

---

### Task 6: Visual verification and final build

**Step 1: Full build check**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Manual spot check (if dev server available)**

Run: `npm run dev`
Verify:
- Default theme loads (system preference or light)
- Toolbar shows theme dropdown with Sun/Moon/Monitor icon
- Clicking each theme option changes colors immediately
- Monaco editor switches between light and dark
- Theme persists after page reload
- System mode responds to OS dark mode setting

**Step 3: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "feat: complete theme system with 5 viewing modes"
```
