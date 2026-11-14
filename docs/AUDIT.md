# Plotline Verified Baseline

**Reviewed:** 2026-11-14
**Scope:** Current `main` checkout, install/build scripts, automated checks, and local browser rendering. This is a point-in-time engineering review, not a security certification or deployment approval.

## Current product boundary

Plotline is a polished client-side demo workspace. State is stored in the visitor's browser; there is no server API, real authentication or authorization, shared team data, or cross-device synchronization. Account and sign-out controls are simulated. That boundary blocks production use for real teams or sensitive work until a backend and security/data lifecycle are designed and implemented.

## Verified results

- `npm ci` succeeds from the committed npm lockfile after the lockfile was synchronized with `package.json`.
- `npm run check:all` passes, including typechecking, lint, formatting, unit tests, cycle checks, and the cross-platform clock rule.
- `npm run build` succeeds without warnings. Feature routes are split into smaller chunks; the entry chunk is about 445 kB before gzip, the largest screen chunk is about 37 kB, and the spreadsheet library is a separate on-demand chunk.
- `npm test` passes: 9 files and 33 tests.
- `npm audit --omit=dev` reports zero production dependency vulnerabilities. The spreadsheet dependency is pinned to the vendor's 0.20.3 CDN tarball because the npm registry's `xlsx` package is stale.
- An XLSX workbook write/read round-trip preserves the exported numeric value.
- `npm run check:cycles` passes.
- The dashboard was opened in Chrome at a local preview. Its key navigation and actions have accessible names.
- Playwright functional cases observed passing include messaging, notification persistence, weekly report export, team workload values, glyph contrast, and fixed-clock metrics.

## Checks that need follow-up

- The approved pixel/text snapshot suite differs in this Windows browser environment. At least one pixel comparison differed by 2%, above its 0.05% threshold. Several functional Playwright cases passed, but the full run did not finish cleanly. Do not update frozen baselines to hide the difference; rerun the full suite in the pinned Linux CI environment and inspect the diff artifacts first.
- The approved pixel/text snapshot suite differs in this Windows browser environment. At least one pixel comparison differed by 2%, above its 0.05% threshold. Do not update frozen baselines to hide the difference; rerun in the pinned Linux CI environment and inspect the diff artifacts first.
- TypeScript excludes build and test artifacts so concurrent builds do not make the type checker read files that are being replaced.
- Profile first-use route loads on representative hardware before adding more code splitting.

## Readiness priorities

1. Decide whether Plotline is a local-only personal tool or a shared hosted product. Keep this choice explicit in product copy.
2. For a hosted team product, define identity, workspace permissions, server persistence, validation, backup/restore, migrations, and failure recovery before connecting real data.
3. Keep the clean-install and cross-platform quality gates green in CI. Compare visual snapshots only in the pinned environment and keep approved baselines unchanged without review.
4. Profile the production bundle and split routes only where measured load performance justifies the extra complexity.
