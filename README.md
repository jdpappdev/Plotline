# Plotline — Operations Atlas

Plotline is a studio operations, deliverable tracking, and velocity analytics workspace built with React 19, TypeScript, Tailwind CSS v4, and Zustand.

## Setup & Scripts

Install dependencies:

```bash
npm install
```

Available scripts:

- `npm run dev` — Start the Vite development server on port 3000
- `npm run build` — Run TypeScript typechecking (`tsc --noEmit`) and bundle for production (`vite build`)
- `npm run typecheck` — Run strict TypeScript verification (`tsc --noEmit`)
- `npm run lint` — Run ESLint across `src/**/*.{ts,tsx}`
- `npm run test` — Run the Vitest unit test suite (`vitest run`)
- `npm run format` — Format source files with Prettier

## Directory Structure

```text
src/
├── domain/                  # Pure domain types, derivations, workspace validation, and seed generators
│   ├── seed/                # Benchmark dataset generators & named constants
│   ├── derivations.ts       # Pure functions for project status/progress, workloads, and KPIs
│   ├── derivations.test.ts  # Unit tests for all domain derivations and baseline metrics
│   ├── types.ts             # Canonical TypeScript interfaces and union types
│   ├── validation.ts        # 13-point relational and metric workspace validation engine
│   └── validation.test.ts   # Unit tests for workspace validation rules
├── features/                # Feature modules (barrel index.ts at each feature root only)
│   ├── analytics/           # 7D/30D/90D KPIs, focus trend, project donut, status bar, contributors
│   ├── calendar/            # Month grid, agenda panel, event editor dialog
│   ├── dashboard/           # Bento KPI grid, weekly output, next-up agenda, completion rings, timer
│   ├── help/                # FAQ, keyboard shortcut guide, command palette, onboarding tour
│   ├── projects/            # Portfolio table, project view/edit dialog, CSV batch import modal
│   ├── settings/            # Profile editor, accent themes, notifications, data integrity verifier
│   ├── tasks/               # 4-stage Kanban board, task card, new task modal
│   └── team/                # Specialist directory, workload bars, invite & profile modals
├── lib/                     # Infrastructure utilities
│   ├── contourGlyph.ts      # Deterministic topographic SVG avatar generator
│   ├── dates.ts             # ISO date offsets, UTC day deltas, due-date labels
│   ├── format.ts            # Duration, timer, date badge, and string formatting helpers
│   ├── storage.ts           # Versioned localStorage persistence envelope with auto-reseed
│   └── theme.ts             # Accent palette definitions and semantic badge class mappers
├── store/                   # Zustand state slices per entity
│   ├── eventsSlice.ts
│   ├── preferencesSlice.ts
│   ├── projectsSlice.ts
│   ├── tasksSlice.ts
│   ├── teamSlice.ts
│   ├── timerSlice.ts
│   ├── types.ts
│   ├── uiSlice.ts
│   └── useWorkspaceStore.ts
└── ui/                      # Shared UI primitives & charts
    ├── charts/              # Reusable SVG chart components
    ├── DeleteButton.tsx
    ├── Dialog.tsx
    ├── Motion.tsx
    ├── ProgressBar.tsx
    ├── SidebarRail.tsx
    ├── SignedOutScreen.tsx
    ├── StatusChips.tsx
    ├── Toast.tsx
    └── TopBar.tsx
```

## Data Model

- **Project (`Project`)**: Represents a client or internal studio workstream with `startDate`, `targetDate`, `leadId`, optional `statusOverride`, and derived `progress`.
- **Task (`TaskItem`)**: Represents a deliverable linked via `projectId` and `assigneeId` (plus optional `coAssigneeId`), with a lifecycle `status` (`Backlog` | `In Progress` | `In Review` | `Done`), `priority`, `estimateHours`, `loggedSeconds`, `startDate`, `dueDate`, and `completedDate`.
- **Focus Session (`FocusSession`)**: Represents a weekday time-tracking entry linked to `taskId`, `projectId`, and `memberId`, storing `seconds`, `hours`, `date`, and `weekdayIndex`.
- **Team Member (`TeamMember`)**: Represents a studio specialist with `department`, `presence`, and `capacityHours` (60h sprint capacity window).
- **Calendar Event (`CalendarEvent`)**: Represents a scheduled critique, milestone deadline, or team sync with `date`, `startTime`, `endTime`, `category`, and `attendeeIds`.

## How Derivations Work

All counting, aggregation, filtering, and KPI math lives in `src/domain/derivations.ts`:

1. **Project Progress (`getProjectProgress`)**: Computed as `Math.round((doneTasks / totalProjectTasks) * 100)`. Returns `0` when a project has no tasks.
2. **Project Status (`getProjectStatus`)**: Respects `project.statusOverride` if set. Otherwise returns `'Ended'` when all project tasks are `'Done'`, `'Pending'` when no task has started (`'Backlog'` only or zero tasks), and `'Running'` when at least one task is `'In Progress'`, `'In Review'`, or `'Done'`.
3. **Member Workload (`getMemberWorkload`)**: Sums `estimateHours` across all open (`status !== 'Done'`) tasks where the specialist is `assigneeId` or `coAssigneeId`, divided by `DEFAULT_MEMBER_CAPACITY_HOURS` (60h).
4. **Weekly Output & Analytics KPIs (`computeWeeklyOutputData`, `computeAnalyticsData`)**: Aggregate `focusSessions` and completed `tasks` over the selected rolling window (`7D`, `30D`, `90D`) and compare against the immediately preceding window of equal length.
