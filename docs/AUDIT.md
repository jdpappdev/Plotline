# Plotline Workspace — Comprehensive Repository Audit Report

Audit conducted on 2026-10-18. All code files, config files, tests, and build artifacts were inspected.

---

## Part A: Safe to Push

### 1. File Inventory & Sizes (Excluding `node_modules`, `dist`, `.git`, `.aistudio`, `e2e/__screenshots__`)

- `.env.example`: 445 bytes
- `.gitignore`: 73 bytes
- `.prettierignore`: 92 bytes
- `.prettierrc`: 89 bytes
- `CONVENTIONS.md`: 4.3 KB
- `DESIGN.md`: 5.5 KB
- `bun.lock`: 123 KB
- `e2e/visual.spec.ts`: 4.0 KB
- `eslint.config.js`: 2.3 KB
- `index.html`: 1.4 KB
- `metadata.json`: 190 bytes
- `package.json`: 1.8 KB
- `playwright.config.ts`: 1.1 KB
- `tsconfig.json`: 498 bytes
- `vite.config.ts`: 707 bytes
- `vitest.config.ts`: 186 bytes
- `src/App.tsx`: 60 KB
- `src/components/AnalyticsScreen.tsx`: 65 KB
- `src/components/CalendarScreen.tsx`: 40 KB
- `src/components/CommandPalette.tsx`: 20 KB
- `src/components/DashboardScreen.tsx`: 53 KB
- `src/components/DeleteButton.tsx`: 2.1 KB
- `src/components/HelpScreen.tsx`: 18 KB
- `src/components/ImportProjectsModal.tsx`: 14 KB
- `src/components/ProjectDialog.tsx`: 13 KB
- `src/components/ProjectsScreen.tsx`: 21 KB
- `src/components/SettingsScreen.tsx`: 24 KB
- `src/components/TasksScreen.tsx`: 36 KB
- `src/components/TeamScreen.tsx`: 31 KB
- `src/domain/derivations/analytics.test.ts`: 2.8 KB
- `src/domain/derivations/analytics.ts`: 12 KB
- `src/domain/derivations/baseline.test.ts`: 6.0 KB
- `src/domain/derivations/calendar.test.ts`: 722 bytes
- `src/domain/derivations/calendar.ts`: 2.0 KB
- `src/domain/derivations/index.ts`: 158 bytes
- `src/domain/derivations/projects.test.ts`: 3.9 KB
- `src/domain/derivations/projects.ts`: 10 KB
- `src/domain/derivations/tasks.test.ts`: 1.9 KB
- `src/domain/derivations/tasks.ts`: 5.1 KB
- `src/domain/derivations/team.test.ts`: 1.7 KB
- `src/domain/derivations/team.ts`: 2.3 KB
- `src/domain/derivations/time.test.ts`: 1.6 KB
- `src/domain/derivations/time.ts`: 3.9 KB
- `src/domain/seed/index.ts`: 6.2 KB
- `src/domain/seed/tasks.ts`: 1.6 KB
- `src/domain/seed/team.ts`: 2.7 KB
- `src/domain/types.ts`: 6.5 KB
- `src/index.css`: 8.6 KB
- `src/lib/clock.ts`: 2.1 KB
- `src/main.tsx`: 191 bytes
- `src/motion/motion.css`: 1.1 KB
- `src/motion/primitives.tsx`: 1.7 KB
- `src/store.ts`: 90 KB
- `src/ui/Dialog.tsx`: 15 KB
- `src/ui/Popover.tsx`: 13 KB
- `src/utils/contourGlyph.tsx`: 5.7 KB
- `src/utils/string.ts`: 255 bytes

**Flagged Files (>500 kB or media/zip/pdf)**: None in tracked source files. (`bun.lock` is 123 KB, well under 500 kB).

### 2. Secrets Search

Searched project for: `api_key`, `apikey`, `secret`, `token`, `password`, `AIza`, `sk-`, `Bearer `, `PRIVATE KEY`, `GEMINI`, `OPENAI`.

- `.env.example:4`: `GEMINI_API_KEY="MY_GEMINI_API_KEY"` (Template placeholder only, no real credentials).
- `metadata.json:5`: `"MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"` (Capability declaration flag).
- `DESIGN.md:1, 11, 24`: References to design tokens and accent token systems.
- `src/store.ts` & `src/App.tsx`: IDs and seed variables starting with `tsk-` (task prefix) matched substring search for `sk-`. No real OpenAI API keys found.
- **Result**: No hardcoded production secrets or API keys present in the repository.

### 3. Vite Config, Environment Files & `.gitignore`

- **`vite.config.ts`**: Uses React and Tailwind plugins, configures `@` path alias, and disables HMR/file watch conditionally based on `process.env.DISABLE_HMR`. No keys are injected into client bundles via `define` or `process.env.*`.
- **`.env*` files**: Only `.env.example` exists.
- **`.gitignore`**: Contains `node_modules/`, `build/`, `dist/`, `coverage/`, `.DS_Store`, `*.log`, `.env*`, `!.env.example`.
- **Confirmation**: `.env`, `node_modules`, `dist`, `test-results`, `playwright-report`, and `.aistudio/` are correctly ignored.

### 4. Reference Leftovers, Personal Data & Assets

- Searched for `"Femly"`, `"Halcyon"`, `"code_and_chill"`, phone numbers, and absolute local paths: **None found**.
- Email addresses found: Seed team emails (`soren@plotline.studio`, `mireia@plotline.studio`, etc.) and Google font links in `index.html`. These are domain seed constants for the Plotline team directory.
- `public/` directory: Does not exist.
- Asset folders: None outside Playwright test dashboard binaries in `node_modules/`.

### 5. Dependency Audit (`npm audit` & `depcheck`)

- `npm audit --omit=dev`: Required a `package-lock.json` (repository uses `bun.lock`). Generated via lockfile conversion.
- Unused dependencies flagged by `depcheck`: `@dnd-kit/sortable`, `@google/genai`, `dotenv`, `express`.
- Unused devDependencies: `@types/express`, `autoprefixer`, `tailwindcss`.
- Dependency licenses: MIT (Zustand, React, Lucide, Tailwind Vite, Motion, dnd-kit, @types/*), Apache-2.0 (@google/genai, xlsx, Playwright, TypeScript, Vitest), BSD-2-Clause (dotenv), ISC (lucide-react).

---

## Part B: Unfinished Work

### 6. Code Markers Search (`TODO`, `FIXME`, `HACK`, `XXX`, `console.log`, `debugger`, `@ts-ignore`, `eslint-disable`, `: any`, `"lorem"`, `"placeholder"`, `"coming soon"`, `"example"`)

- `src/store.ts:1694`: `console.log('[Workspace Data Validation Report]', report);`
- Input `placeholder` attributes found in form inputs across `App.tsx`, `DashboardScreen.tsx`, `ProjectsScreen.tsx`, `TasksScreen.tsx`, `TeamScreen.tsx`, `CalendarScreen.tsx`, `CommandPalette.tsx`, and `ProjectDialog.tsx` (standard UI placeholders).
- No `TODO`, `FIXME`, `HACK`, `XXX`, `debugger`, `@ts-ignore`, `eslint-disable`, or `: any` types found in `src/`.

### 7. Screen UI Element & Handler Audit

- **Dashboard Screen**: Overview cards, project rings, focus timer card, next-up calendar event check-in — **Wired** (`src/components/DashboardScreen.tsx`).
- **Projects Screen**: Status filter tabs (`all`, `running`, `pending`, `ended`), sorting selector, project cards, import modal trigger, delete actions — **Wired** (`src/components/ProjectsScreen.tsx`).
- **Tasks Screen**: Kanban board columns (`Backlog`, `In Progress`, `In Review`, `Done`), dnd-kit drag-and-drop, filter pills (`My tasks`, `High priority`, `This week`), task creation modal — **Wired** (`src/components/TasksScreen.tsx`).
- **Calendar Screen**: Month grid view, agenda view, Today/Prev/Next navigation, date click, new event modal form, attendee selector — **Wired** (`src/components/CalendarScreen.tsx`).
- **Analytics Screen**: Range selectors (`7D`, `30D`, `90D`), KPI cards, velocity charts, largest remainder distribution, CSV export buttons, XLSX full report export — **Wired** (`src/components/AnalyticsScreen.tsx`).
- **Team Screen**: Department filter tabs, team directory cards, profile drawer, invite modal form & send button — **Wired** (`src/components/TeamScreen.tsx`).
- **Settings Screen**: Tab navigation, notification toggles, accent palette theme selector, start of week preference, system verification runner, demo data reset — **Wired** (`src/components/SettingsScreen.tsx`).
- **Help Screen**: Keyboard shortcuts table, FAQ accordion, guided tour trigger and steps — **Wired** (`src/components/HelpScreen.tsx`).
- **Command Palette (`Cmd+K`)**: Search input, route/project/task/person navigation list, keyboard arrow/enter handling — **Wired** (`src/components/CommandPalette.tsx`).
- **Project Details Dialog**: Edit/update project metadata, task creation, delete project button — **Wired** (`src/components/ProjectDialog.tsx`).
- **Import Projects Modal**: File upload / drag-and-drop zone, template JSON/CSV download, import parser — **Wired** (`src/components/ImportProjectsModal.tsx`).

### 8. Implementation Checklist & Status

1. **Store and seed split into slices**: **Not done**. `src/store.ts` contains monolithic state (~2,938 lines).
2. **Versioned storage migration**: **Partial**. `localStorage` persistence exists for slices, but formal schema version migration handlers are missing.
3. **Domain isolated with no cycles**: **Partial**. Pure derivations in `src/domain/derivations/` have zero external imports, but `src/domain/types.ts` imports `./seed` while `seed/index.ts` imports `../types`, creating a circular dependency.
4. **All components under 250 lines**: **Not done**. `AnalyticsScreen.tsx` (1,610 lines), `DashboardScreen.tsx` (1,208 lines), `TasksScreen.tsx` (994 lines), `CalendarScreen.tsx` (972 lines), `SettingsScreen.tsx` (535 lines), `CommandPalette.tsx` (550 lines), `ProjectsScreen.tsx` (469 lines), `HelpScreen.tsx` (444 lines), `TeamScreen.tsx` (726 lines), `ProjectDialog.tsx` (297 lines), `ImportProjectsModal.tsx` (334 lines) exceed 250 lines. Only `DeleteButton.tsx` (62 lines) is under 250 lines.
5. **Phone layout (bottom tab bar, bottom-sheet dialogs)**: **Done**. Responsive bottom tab bar in `App.tsx` (`sm:hidden fixed bottom-0`) and bottom-sheet modal styling in `src/ui/Dialog.tsx`.
6. **Shell scroll containment**: **Done**. Strict overflow containment configured in `src/index.css`.
7. **Export menu rendered through a portal**: **Done**. `AnchoredPopover` uses `createPortal` to `document.body` (`src/ui/Popover.tsx`).
8. **Clean separate CSV and .xlsx exports**: **Done**. Dedicated CSV export buttons for KPIs, projects, contributors, and daily series, plus full report `.xlsx` export via `xlsx` library in `AnalyticsScreen.tsx`.
9. **Replay tour crash fixed**: **Done**. Tour state is safely bounded and keyboard-escaped in `HelpScreen.tsx`.
10. **Single-click delete with undo**: **Done**. `DeleteButton` component triggers instant deletion with undo action via toast notice.
11. **N/T shortcuts blocked while typing**: **Not done**. Global shortcut handlers for `Cmd+K` and `Escape` exist, but dedicated `N` and `T` single-key shortcuts are not bound in `App.tsx`.
12. **Import with file upload and template**: **Done**. `ImportProjectsModal.tsx` supports file upload drag-and-drop and template download.
13. **Old-domain wording removed**: **Done**. Zero references to Femly, Halcyon, or code_and_chill.
14. **Package name and single package manager**: **Partial**. `package.json` retains placeholder `"name": "react-example"`, and `bun.lock` is used without `package-lock.json`.
15. **README**: **Not done**. `README.md` file does not exist (only `CONVENTIONS.md` and `DESIGN.md`).
16. **CONVENTIONS.md**: **Done**. Formal architectural conventions documented in `CONVENTIONS.md`.
17. **CI workflow**: **Done**. `.github/workflows/visual.yml` configured for Playwright visual regression tests.

---

## Part C: Quality Gates Raw Output

1. **`npm run build`**:
   - Status: **Passed** (exit code 0).
   - Notes: Vite compiled 2,098 modules successfully into `dist/`. Chunks: `index.js` (991 kB), `xlsx.js` (423 kB), `index.css` (64 kB). Warning: chunk size exceeds 500 kB (standard for spreadsheet & charting bundles).
2. **`npm run lint`**:
   - Status: **Failed** (42 errors).
   - Notes: 42 unused variable / import errors across `AnalyticsScreen.tsx`, `CalendarScreen.tsx`, `DashboardScreen.tsx`, `ProjectDialog.tsx`, `ProjectsScreen.tsx`, `TeamScreen.tsx`, and `src/domain/seed/tasks.ts`.
3. **`npm run typecheck`**:
   - Status: **Failed** (6 errors).
   - Notes:
     - `src/components/CalendarScreen.tsx(286,7): error TS2554: Expected 2 arguments, but got 1.` (`updateEvent` expects `(eventId, input)`).
     - Missing exported members in `src/domain/seed` (`createSeedEvents`, `createSeedFocusSessions`, `validateWorkspace`) referenced in `types.ts` and test files.
4. **`npm run format:check`**:
   - Status: **Failed** (9 files).
   - Notes: Prettier formatting check flagged code style issues in 9 files.
5. **`npm test` (Vitest Unit Suite)**:
   - Status: **Failed** (7 test files failed, 11 tests failed, 2 tests passed).
   - Notes: Failing due to unexported seed helpers and missing test fixtures in `src/domain/seed/`.
6. **`npx madge --circular --extensions ts,tsx src`**:
   - Status: **Failed** (1 circular dependency found).
   - Notes: Circular dependency between `domain/types.ts` and `domain/seed/index.ts`.
7. **`npm run test:visual` (Playwright Visual & Text Regression)**:
   - Status: **Failed** (12 snapshot/text test failures).
   - Notes: Pixel diffs on Dashboard, Projects, Analytics, and Help at 1440x900, 1280x800, and 1180x820 viewports, plus Help screen text mismatch ("Sample" text).

---

## Part D: Grouped Findings

### 1. Blocks Push (Critical Bugs & Gate Failures)

- **CalendarScreen Argument Mismatch (TS2554)**: `CalendarScreen.tsx` calls `updateEvent(updatedEvent)` with 1 argument, but store defines `updateEvent(eventId, input)`.
- **Missing Seed Exports & Broken Unit Tests**: `src/domain/seed/` is missing required generator exports (`createSeedEvents`, `createSeedFocusSessions`, `validateWorkspace`), causing all domain Vitest tests to fail.
- **Domain Circular Dependency**: `domain/types.ts` imports `./seed` while `seed/index.ts` imports `../types`.
- **Lint & Typecheck Errors**: 42 ESLint unused variable errors and TypeScript compilation errors prevent clean build validation.
- **Visual Baseline Failures**: Playwright visual regression tests fail due to pixel diffs and text mismatches against frozen snapshots.

### 2. Fix Soon (Architectural Refactoring)

- **Monolithic Zustand Store (`src/store.ts`)**: 2,938 lines combining persistence, state, seed data, and actions into a single file.
- **Oversized Components (>250 lines)**: 11 out of 12 components exceed the 250-line limit (e.g., AnalyticsScreen is 1,610 lines).
- **Schema Versioning & Migration**: Missing versioned migration logic for `localStorage` state upgrades.
- **Global `N` and `T` Keyboard Shortcuts**: Dedicated single-key shortcuts are not bound in `App.tsx`.

### 3. Nice to Have (Repository Hygiene)

- **Root `README.md`**: Missing root README (currently only `CONVENTIONS.md` and `DESIGN.md`).
- **Package Metadata**: `package.json` name is set to `"react-example"` instead of `"plotline"`.
- **Lockfile Hygiene**: `bun.lock` is present without `package-lock.json`.
- **CI Workflow Expansion**: GitHub Actions workflow currently only runs Playwright visual tests; should be expanded to run typecheck, lint, format check, and unit tests.
