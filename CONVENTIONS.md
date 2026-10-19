# Plotline Architectural Conventions — APEX Section 12

This document formalizes the engineering conventions, domain isolation architecture, clock contracts, and quality gates for the **Plotline** workspace codebase.

---

## 1. Pure Domain Derivations & Separation of Concerns

1. **Location**: All business calculations, metric aggregations, chart transforms, and domain projections must reside in `src/domain/derivations/`:
   - `projects.ts`: Project progress, health, status counts, completion rings, filter/sort, import parsing.
   - `tasks.ts`: Board status grouping, task factor bands, cycle day computations, on-time delivery flags, board filters.
   - `team.ts`: Member workloads, task counts, team presence metrics, department filters.
   - `time.ts`: ISO date diffing, elapsed duration formatting, weekly output aggregations.
   - `analytics.ts`: KPI calculations, largest remainder percentage distributions, 30D/7D/90D ranges, contributor breakdowns.
   - `calendar.ts`: Next-up event resolution, calendar filters, date-grouped event indexing.
   - `index.ts`: Unified barrel re-export for all derivation modules.

2. **Purity**: Derivation functions must be pure, deterministic functions of their inputs. They must not perform I/O, mutate state, or read from global singletons.

3. **No Derivation Re-exports in Store**:
   - `src/store.ts` manages state slices and store actions only.
   - Re-exporting derivation functions from `src/store.ts` is prohibited.
   - Consumers and React components must import derivation functions directly from `src/domain/derivations/*`.

---

## 2. Central Clock & Deterministic Time

1. **Single Source of Truth**: All time reading must pass through `src/lib/clock.ts`:
   - `getNow()`: Returns the active `Date` instance.
   - `getNowTimestamp()` (or `getNowMs()`): Returns the current epoch millisecond timestamp.
   - `getTodayIsoDate()`: Returns the current date formatted as `YYYY-MM-DD`.
   - `getIsoDateOffset(daysOffset)`: Returns offset dates formatted as `YYYY-MM-DD`.

2. **Banned Calls Outside `clock.ts`**:
   - Direct calls to `Date.now()` are banned across the entire codebase.
   - Calling `new Date()` without arguments is banned across the entire codebase.
   - Parsing specific dates (e.g., `new Date(isoString)` or `new Date(year, month, day)`) is permitted.
   - This rule is enforced automatically via ESLint `no-restricted-syntax`.

3. **Runtime & Testing Overrides**:
   - Query parameter `?now=YYYY-MM-DDTHH:mm:ss` overrides the active time at runtime in the browser.
   - `setFixedClock(isoOrDate)` / `setClockOverride(isoOrDate)` allows tests to fix the clock to any timestamp. Passing `null` restores normal time.

---

## 3. Dual Testing Architecture & Verification Gates

1. **Vitest Unit & Domain Suite (`npm test`)**:
   - Fast, in-memory domain tests co-located beside each derivation module:
     - `src/domain/derivations/projects.test.ts`
     - `src/domain/derivations/tasks.test.ts`
     - `src/domain/derivations/team.test.ts`
     - `src/domain/derivations/time.test.ts`
     - `src/domain/derivations/analytics.test.ts`
     - `src/domain/derivations/calendar.test.ts`
     - `src/domain/derivations/baseline.test.ts`
   - Covers all domain logic, largest remainder distributions, exact baseline metrics, and full workspace data validation across date boundaries.

2. **Playwright Visual & Text Snapshot Gate (`npm run test:visual`)**:
   - Tests visual appearance across 8 routes and 3 viewport sizes (1440×900, 1280×800, 1180×820) at a fixed clock (`2026-10-18T12:00:00`).
   - Normalizes and tests visible text (`header`, `aside`, `main`) per route against approved baselines in `e2e/__screenshots__/`.
   - Pixel diff tolerance is locked at `maxDiffPixelRatio: 0.0005` (0.05%).
   - **Strict Golden Rule**: Baselines are frozen gates. Never run `--update-snapshots` or alter baseline files without explicit approval.

---

## 4. Code Quality & Tooling Scripts

1. **Typecheck (`npm run typecheck`)**: Validates TypeScript compilation (`tsc --noEmit`).
2. **Lint (`npm run lint`)**: Runs ESLint with `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, and `eslint-plugin-react-hooks`.
3. **Format Check (`npm run format:check`)**: Verifies Prettier code formatting consistency across the repository.
