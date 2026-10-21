# Plotline Workspace

Plotline is a professional workspace engineering and design tracking platform designed for cross-functional technical teams.

## Setup

1. Ensure Node.js (v18+) and npm / bun are installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server on port 3000:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Start Vite development server on port 3000.
- `npm run build`: Build production bundle (`dist/`).
- `npm run preview`: Preview production build locally.
- `npm run clean`: Remove build artifacts (`dist/`).
- `npm run lint`: Run ESLint across codebase.
- `npm run format:check`: Verify Prettier formatting consistency.
- `npm run typecheck`: Run TypeScript compilation check (`tsc --noEmit`).
- `npm run test`: Run Vitest unit and domain test suite.
- `npm run test:visual`: Run Playwright visual regression tests and text baseline checks.
- `npm run check:cycles`: Detect circular dependencies via ESLint.
- `npm run check:clock`: Enforce central clock contract (`src/lib/clock.ts`).
- `npm run check:all`: Run complete quality gate sequence (`typecheck`, `lint`, `format:check`, `test`, `check:cycles`, `check:clock`).

## Project Structure

- `src/components/`: Modular React components and feature screens (Dashboard, Projects, Tasks, Calendar, Analytics, Team, Settings, Help).
- `src/domain/derivations/`: Pure domain functions, metric aggregations, chart transforms, and test suites.
- `src/store/`: Zustand state store, slices, and localStorage persistence layer.
- `src/lib/clock.ts`: Central deterministic time contract.
- `e2e/`: Playwright visual and feature test specifications and baselines.

## Data Model

- **Projects**: Tracked with codes (e.g. PLT-101), client metadata, budgets, status, start/target dates, and progress rings.
- **Tasks**: Four-stage Kanban board items (To do, In progress, In review, Done) with estimate hours, logged seconds, assignees, and priority bands.
- **Team**: Specialists with roles, presence status, capacity hours, and workload derivations.
- **Calendar Events**: Milestone schedules, client reviews, and calendar day grid indices.
- **Focus Sessions**: Timed deep work sessions feeding weekly output charts and analytics.

## How Time Works

All time reads pass through `src/lib/clock.ts`:

- `getNow()` returns the active `Date` instance.
- Supports runtime time travel via the query parameter `?now=YYYY-MM-DDTHH:mm:ss`.
- Supports test clock freezing via `setFixedClock()` / `setClockOverride()`.
- Direct calls to `Date.now()` or `new Date()` without arguments outside `clock.ts` are prohibited and enforced by static analysis.
