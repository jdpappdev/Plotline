# Plotline — Developer & Agent Handoff Guide

## 1. Quickstart: Installation & Development

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x (or Bun runtime)

### Setup & Run

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run full production build
npm run build

# Preview production build locally
npm run preview
```

> **Note on Lockfiles**: The repository currently contains a `bun.lock` file without a `package-lock.json`. Running `npm audit` directly requires a `package-lock.json`. For npm-based workflows, generate the lockfile via `npm i --package-lock-only`.

---

## 2. Complete NPM Script Reference

| Script         | Command                                        | Purpose                                                                                                        |
| :------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `dev`          | `vite --port=3000 --host=0.0.0.0`              | Starts the Vite dev server on port 3000. HMR is toggled via `DISABLE_HMR` env var.                             |
| `build`        | `vite build`                                   | Compiles production assets into `dist/`. Dynamic code-splitting generates `xlsx` and vendor chunks.            |
| `preview`      | `vite preview`                                 | Serves the production build locally.                                                                           |
| `clean`        | `rm -rf dist server.js`                        | Removes build output and artifacts.                                                                            |
| `lint`         | `eslint .`                                     | Runs ESLint across all TypeScript and React source files.                                                      |
| `format:check` | `prettier --check .`                           | Checks code formatting against `.prettierrc`.                                                                  |
| `typecheck`    | `tsc --noEmit`                                 | Runs the TypeScript compiler for strict type validation.                                                       |
| `test`         | `vitest run`                                   | Runs in-memory Vitest unit and domain derivation suites.                                                       |
| `test:visual`  | `playwright test`                              | Runs Playwright visual and text snapshot regression suites against baselines.                                  |
| `check:cycles` | `madge --circular --extensions ts,tsx src`     | Validates that no circular import cycles exist in `src/`.                                                      |
| `check:clock`  | Shell pipeline grep checking banned date calls | Enforces the clock contract (no direct `Date.now()` or parameterless `new Date()` outside `src/lib/clock.ts`). |
| `check:all`    | Chained quality gate                           | Executes typecheck, lint, format check, unit tests, cycle checks, and clock checks sequentially.               |

---

## 3. Repository Architecture & Directory Map

```
├── .github/
│   └── workflows/
│       └── visual.yml              # GitHub Actions CI workflow (currently runs Playwright visual suite)
├── docs/
│   ├── AUDIT.md                    # Comprehensive repository audit and quality gate report
│   └── HANDOFF.md                  # This onboarding and architecture document
├── e2e/
│   ├── __screenshots__/            # Approved visual (.png) and text (.txt) snapshot baselines
│   └── visual.spec.ts              # Playwright visual regression and text snapshot test spec
├── src/
│   ├── components/                 # Main screen views and modal dialogs
│   │   ├── AnalyticsScreen.tsx     # KPI metrics, velocity charts, largest remainder distribution, CSV/XLSX export
│   │   ├── CalendarScreen.tsx      # Month grid, agenda, event creation/editing modal, attendee tags
│   │   ├── CommandPalette.tsx      # Cmd+K fuzzy search modal for routes, projects, tasks, and people
│   │   ├── DashboardScreen.tsx     # Overview cards, active focus timer card, rings, recent milestones
│   │   ├── DeleteButton.tsx        # Single-click delete button with anchored hover tooltip
│   │   ├── HelpScreen.tsx          # Keyboard shortcuts table, architecture FAQ, 4-step guided tour
│   │   ├── ImportProjectsModal.tsx # CSV/JSON drag-and-drop project import with template download
│   │   ├── ProjectDialog.tsx       # Project detail dialog (health, tasks, budget, lead, delete)
│   │   ├── ProjectsScreen.tsx      # Project cards, status filter tabs, name/due/progress sorting
│   │   ├── SettingsScreen.tsx      # Profile form, notification switches, accent color theme picker, reset demo
│   │   ├── TasksScreen.tsx         # Kanban board (Backlog, In Progress, In Review, Done) with dnd-kit
│   │   └── TeamScreen.tsx          # Team directory, workload capacity bars, profile drawer, invite modal
│   ├── domain/
│   │   ├── derivations/            # Pure business calculation modules (zero I/O, zero side effects)
│   │   │   ├── analytics.ts        # KPI calculations, 30D/7D/90D ranges, contributor breakdowns
│   │   │   ├── calendar.ts         # Next-up event resolution, calendar filters, date-grouped indexing
│   │   │   ├── projects.ts         # Progress rings, health evaluation, status counting, filter/sort
│   │   │   ├── tasks.ts            # Board status grouping, factor bands, cycle days, on-time flag
│   │   │   ├── team.ts             # Member workload %, task counts, presence metrics, department filters
│   │   │   ├── time.ts             # ISO date diffing, elapsed time formatting, weekly output sums
│   │   │   ├── index.ts            # Derivation barrel export
│   │   │   └── *.test.ts           # Vitest unit test suites for each derivation module
│   │   ├── seed/                   # Seed data files
│   │   │   ├── index.ts            # Seed team and projects generator
│   │   │   ├── tasks.ts            # Seed tasks generator stub
│   │   │   └── team.ts             # Team member constants
│   │   └── types.ts                # TypeScript interfaces and domain domain types
│   ├── lib/
│   │   └── clock.ts                # Deterministic central clock module (single source of time truth)
│   ├── motion/
│   │   ├── motion.css              # Custom animation and transition keyframes
│   │   └── primitives.tsx          # Framer Motion wrapper components
│   ├── ui/
│   │   ├── Dialog.tsx              # Accessible modal dialog and mobile bottom sheet container
│   │   └── Popover.tsx             # Anchored popover (via createPortal) and tooltip component
│   ├── utils/
│   │   ├── contourGlyph.tsx        # Deterministic FNV-1a Catmull-Rom spline contour generator
│   │   └── string.ts               # String utility functions
│   ├── App.tsx                     # Root shell, top bar, sidebar navigation, mobile tab bar, modal state
│   ├── index.css                   # Global Tailwind CSS directives and Plotline design tokens
│   ├── main.tsx                    # React DOM client entry point
│   └── store.ts                    # Zustand workspace store, state persistence, actions, and validation
├── CONVENTIONS.md                  # Formal architectural rules, clock contracts, and quality guidelines
├── DESIGN.md                       # Design system token specifications, typography, and color palettes
├── eslint.config.js                # Flat ESLint configuration
├── index.html                      # HTML5 entry template with Fraunces & JetBrains Mono font links
├── package.json                    # Project metadata, scripts, and dependencies
├── playwright.config.ts            # Playwright E2E and visual test configuration
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite build configuration with Tailwind v4 plugin
└── vitest.config.ts                # Vitest test configuration
```

---

## 4. Data Model & Derivation Rules

### Core Entities (`src/domain/types.ts`)

- **`Project`**: `id`, `code` (e.g. `PLT-101`), `name`, `client`, `sector`, `status` (`On Track`, `At Risk`, `Planning`, `Completed`, `Pending`, `Running`, `Ended`), `leadId`, `startDate`, `targetDate`, `progress` (0–100), `budgetAllocated`, `budgetSpent`, `summary`.
- **`TaskItem`**: `id` (e.g. `tsk-h-1`), `code` (`PLT-101-A`), `title`, `category`, `projectId`, `assigneeId`, `status` (`Backlog`, `In Progress`, `In Review`, `Done`), `priority` (`High`, `Medium`, `Low`), `startDate`, `dueDate`, `estimateHours`, `loggedSeconds`, `progress`, `subtasksDone`, `subtasksTotal`, `completedDate`.
- **`TeamMember`**: `id` (e.g. `usr-soren`), `name`, `role`, `discipline`, `department` (`Engineering`, `Design`, `Marketing`, `Management`), `presence` (`online`, `away`, `offline`), `statusLabel`, `location`, `timezone`, `initials`, `capacityHours`, `allocatedHours`, `email`.
- **`FocusSession`**: `id`, `taskId`, `projectId`, `seconds`, `hours`, `date` (`YYYY-MM-DD`), `createdAt`.
- **`CalendarEvent`**: `id`, `title`, `date`, `startTime`, `endTime`, `category` (`Meeting`, `Team`, `Review`, `Deadline`, `Social`), `attendeeIds`, `location`.

### Derivation Rules (`src/domain/derivations/`)

1. **Projects (`projects.ts`)**:
   - Status categorization: Projects with `progress === 100` are `Ended`. Projects with `startDate > today` are `Pending`. Other projects are `Running`.
   - Completion rings: Top 4 unfinished projects ordered by `targetDate` ascending.
2. **Tasks (`tasks.ts`)**:
   - Board grouping: Partitioned into four columns: `Backlog`, `In Progress`, `In Review`, and `Done`.
   - On-time delivery flag: `task.completedDate <= task.dueDate`.
   - Task factor bands: Computed ratio of actual/estimated time mapped into calibrated variance buckets.
3. **Team Workloads (`team.ts`)**:
   - Workload percentage: `Math.round((allocatedHours / capacityHours) * 100)`.
   - Overallocated warning threshold: Workload exceeding `100%`.
4. **Analytics & Distributions (`analytics.ts`)**:
   - Largest Remainder Method: Budget and contributor percentage distributions are rounded to integers while guaranteeing an exact sum of `100%`.
   - Time Windows: Dynamic filtering across `7D`, `30D`, and `90D` windows relative to the central clock.
5. **Calendar (`calendar.ts`)**:
   - `getNextUpEvent`: Selects upcoming event matching today or future dates ordered by date and start time.

---

## 5. Central Clock & Deterministic Time Contract

To guarantee reproducible tests, visual regression snapshots, and deterministic seed generation:

1. **Single Source of Truth (`src/lib/clock.ts`)**:
   - `getNow()`: Current Date object.
   - `getNowTimestamp()` (or `getNowMs()`): Epoch milliseconds.
   - `getTodayIsoDate()`: `YYYY-MM-DD`.
   - `getIsoDateOffset(days)`: `YYYY-MM-DD` offset from today.
2. **Strict Rule**: Direct calls to `Date.now()` and argument-less `new Date()` are prohibited in application code.
3. **Test Baseline Anchor**: Playwright and tests fix time to `2026-10-18T12:00:00`.
4. **Time Travel in Dev**: Append `?now=YYYY-MM-DDTHH:mm:ss` to the browser URL to test any point in time.

---

## 6. Known Bugs & Issues Identified During Audit

1. **TypeScript Compilation Error TS2554 (`src/components/CalendarScreen.tsx:286`)**:
   - `updateEvent` is invoked with 1 argument (`CalendarEvent`), but the store interface defines `updateEvent: (eventId: string, input: NewEventInput) => void`. Editing calendar events causes TypeScript compilation failure and unexpected argument mapping at runtime.
2. **Incomplete Seed Module Stubs & Broken Test Imports (`src/domain/seed/`)**:
   - `src/domain/seed/index.ts` and `tasks.ts` only contain stub implementations with 1 task and no focus sessions or events.
   - Missing exports (`createSeedEvents`, `createSeedFocusSessions`, `validateWorkspace`) cause 5 TypeScript errors and cause all 7 Vitest test files to fail. The full seed implementation currently resides inside `src/store.ts`.
3. **Circular Import Dependency**:
   - `madge` detects a circular reference: `src/domain/types.ts` imports from `./seed` while `src/domain/seed/index.ts` imports from `../types`.
4. **42 ESLint Errors**:
   - Multiple unused imports across `AnalyticsScreen`, `CalendarScreen`, `DashboardScreen`, `ProjectDialog`, `ProjectsScreen`, `TeamScreen`, and `src/domain/seed/tasks.ts`.
5. **9 Prettier Formatting Violations**:
   - Code style issues flagged in 9 files by `npm run format:check`.
6. **Visual Regression Snapshot Mismatches (`e2e/visual.spec.ts`)**:
   - 12 failures during Playwright visual regression testing: pixel diffs across Dashboard, Projects, Analytics, and Help at 1440x900, 1280x800, 1180x820, and a text diff on Help screen (presence of `"Sample"` text in FAQ).
7. **Monolithic Store**:
   - `src/store.ts` spans 2,938 lines, combining state, persistence, seed definitions, validation logic, and action handlers in a single file.
8. **Missing Lockfile for NPM Audit**:
   - Repository has `bun.lock` but no `package-lock.json`, preventing `npm audit` from running.
9. **Placeholder Package Metadata**:
   - `package.json` retains default `"name": "react-example"` instead of `"plotline"`.

---

## 7. Prioritized Unfinished Work Roadmap

### Priority 0: Blocks Push & Core Integrity

1. **Fix CalendarScreen TS2554**: Update `CalendarScreen.tsx` to pass `editingEventId` and input payload to `updateEvent` matching the store signature.
2. **Consolidate & Export Full Seed Data in `src/domain/seed/`**:
   - Move full seed generators (`createSeedTasks`, `createSeedEvents`, `createSeedFocusSessions`, `validateWorkspace`) out of `src/store.ts` into `src/domain/seed/`.
   - Export all generators from `src/domain/seed/index.ts`.
   - Remove re-exports of `./seed` from `src/domain/types.ts` to eliminate the circular dependency.
3. **Fix Vitest Unit Test Suite**: Ensure all 7 test files pass (`projects.test.ts`, `tasks.test.ts`, `team.test.ts`, `time.test.ts`, `analytics.test.ts`, `calendar.test.ts`, `baseline.test.ts`).
4. **Resolve ESLint & Prettier Errors**: Run `npx prettier --write .` and clean up unused imports to achieve 0 lint and formatting errors.
5. **Investigate Visual Baseline Diffs**: Determine if visual mismatches are due to browser font rendering differences or uncommitted UI modifications, and reconcile the Help screen text mismatch.

### Priority 1: High Priority (Architecture & Usability)

1. **Decompose `src/store.ts` into Modular Slices**:
   - Split into `slices/projectsSlice.ts`, `slices/tasksSlice.ts`, `slices/teamSlice.ts`, `slices/calendarSlice.ts`, `slices/timerSlice.ts`, and `slices/uiSlice.ts`.
2. **Decompose Oversized Components (>250 lines)**:
   - Break down `AnalyticsScreen.tsx` (1,610 lines), `DashboardScreen.tsx` (1,208 lines), `TasksScreen.tsx` (994 lines), and `CalendarScreen.tsx` (972 lines) into focused subcomponents.
3. **Versioned Storage Migration**:
   - Add schema versioning (`PLOTLINE_SCHEMA_VERSION = 1`) and migration handlers for `localStorage` data to prevent corruption when models evolve.
4. **Implement Global Single-Key Shortcuts (`N` and `T`)**:
   - Add listeners for `N` (new project/task modal) and `T` (today / focus timer toggle) with strict input/textarea/contentEditable suppression.

### Priority 2: Nice to Have (Repository Hygiene)

1. **Add Root `README.md`**: Create project documentation with architecture overview, feature screenshots, and quickstart instructions.
2. **Sync Package Name & Manager**: Update `name: "plotline"` in `package.json` and generate `package-lock.json` alongside `bun.lock`.
3. **Expand GitHub Actions CI Workflow**: Update `.github/workflows/visual.yml` to run `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test` prior to visual regression testing.
