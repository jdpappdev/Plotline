# Plotline Engineering Conventions

## 1. Architectural Boundaries

- **`src/domain/`**: Pure TypeScript types, deterministic seed generators, workspace validation rules, and domain derivations. Must not import React or UI components.
- **`src/lib/`**: Stateless utilities for ISO date math, duration/text formatting, theme token mapping, and versioned `localStorage` persistence (`WORKSPACE_SCHEMA_VERSION`).
- **`src/store/`**: Zustand store split into entity slices (`projectsSlice`, `tasksSlice`, `teamSlice`, `eventsSlice`, `timerSlice`, `preferencesSlice`, `uiSlice`) composed in `useWorkspaceStore.ts`.
- **`src/ui/`**: Reusable, domain-aware primitives (`Dialog`, `ToastViewport`, `DeleteButton`, `ProgressBar`, `StatusChips`) and SVG chart components (`src/ui/charts/`).
- **`src/features/`**: Feature modules (`dashboard`, `projects`, `tasks`, `calendar`, `analytics`, `team`, `settings`, `help`). Barrel `index.ts` files are permitted **only** at feature roots (`src/features/<feature>/index.ts`).

## 2. Component & Styling Rules

- **Zero Counting Logic in Components**: Components must not compute domain counts, filter rules, or KPI aggregations inline; call functions from `src/domain/derivations.ts` via `useMemo`.
- **Component Size Limit**: Keep every component file focused and under 250 lines (target <200 lines). Split complex screens into sub-components within the feature folder.
- **Design Tokens Over Inline Styles**: Use CSS custom properties and semantic utility classes defined in `src/index.css` (`--accent`, `--radius-card`, `.badge-status-*`, `.badge-priority-*`, `.swatch-*`) and `<ProgressBar />` instead of inline `style={{ ... }}` objects.

## 3. TypeScript & Code Quality

- **Strict Typing**: `strict: true` is enforced in `tsconfig.json`. Explicit or implicit `any` is forbidden (`@typescript-eslint/no-explicit-any: error`).
- **No Console Noise**: `no-console: error` is enforced across `src/`.
- **Named Constants**: Avoid magic numbers in seed generators, timers, and derivations; define descriptive constants at module scope or in `src/domain/seed/constants.ts`.
- **Comments**: Never leave changelog comments, prompt references, or redundant restatements of code. Keep only comments that explain non-obvious rationale.
