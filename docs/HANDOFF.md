# Plotline Developer Handoff

## Start here

Requirements: Node.js 20 or newer and npm 10 or newer.

```sh
npm ci
npm run dev
```

The app opens at `http://localhost:3000`. For a production bundle, run `npm run build`; to serve that bundle locally, run `npm run preview`.

## Product boundary

Plotline currently runs as a client-side demo/workspace. Its sample projects, tasks, team, calendar, focus sessions, and preferences live in the current browser's local storage. It has no server API, real authentication, shared workspace, or cross-device sync. The visible account and sign-out controls are demo interactions. Do not present this checkout as a production multi-user service until those capabilities and their data/security policies are implemented.

## Code map

- `src/App.tsx` and `src/components/shell/`: application shell and navigation.
- `src/components/`: feature screens and their focused subcomponents.
- `src/domain/derivations/`: pure business calculations and unit tests.
- `src/domain/seed/`: demo data.
- `src/store.ts`, `src/store/slices/`, and `src/store/persistence.ts`: Zustand state, actions, and browser storage.
- `src/lib/clock.ts`: deterministic clock used by calculations and tests.
- `src/ui/`: shared dialogs and popovers.
- `e2e/`: feature and visual regression suites; `e2e/__screenshots__/` contains frozen approved baselines.

## Quality commands

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run check:cycles
npm run check:clock
npm run build
npm run test:visual
```

`npm run check:all` runs the type, lint, formatting, unit, cycle, and clock checks. Visual snapshots are intentionally frozen. Do not regenerate them to make a failing comparison pass; investigate the rendering difference and get approval before changing approved baselines.

## CI and install

The GitHub Actions workflow uses `npm ci` from the committed `package-lock.json`, then runs quality gates, unit tests, and Playwright suites in its pinned Linux Playwright image. Use `npm ci` for a clean local install as well.

## Known production work

See [`AUDIT.md`](AUDIT.md) for the latest verified baseline and blockers. The highest-impact product work is replacing browser-only demo persistence and simulated account behavior with an agreed backend, authentication, authorization, backup, migration, and recovery model.
