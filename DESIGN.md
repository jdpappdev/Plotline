# Plotline — Design System & Token Specification

**Plotline** is an original project-cartography and delivery management workspace. Its visual language draws from bathymetric and topographic survey charts—combining a clean warm-neutral surface (`#f6f6f5`), crisp card containers (`#fcfcf9`), procedural closed Catmull-Rom contour glyphs (`contourGlyph(seed, size)`), and a four-accent palette system with **Tide** as the default theme.

---

## 1. Surface & Ink Palette

Plotline uses a clean neutral page background with no page-wide texture, paired with elevated card surfaces and 1px hairline boundaries.

| Token                            | CSS Variable                   | Hex / Value | Usage                                                          |
| :------------------------------- | :----------------------------- | :---------- | :------------------------------------------------------------- |
| **Page Background (Canvas)**     | `--surface-canvas`             | `#f6f6f5`   | Primary application viewport background (no page-wide texture) |
| **Card Surface (Elevated)**      | `--surface-elevated`           | `#fcfcf9`   | Cards, top bar, navigation rail, and modals                    |
| **Muted Well Surface (Sunken)**  | `--surface-sunken`             | `#eeeeeb`   | Input wells, segmented tracks, subtle badges                   |
| **Primary Ink**                  | `--ink-primary`                | `#161615`   | Primary headings, active navigation, body prose                |
| **Secondary Ink**                | `--ink-secondary`              | `#4E4D4A`   | Supporting descriptions, captions, secondary labels            |
| **Muted Ink**                    | `--ink-muted`                  | `#7A7873`   | Metadata separators, timestamps, axis labels                   |
| **Hairline Border / Ring Track** | `--border-hairline` / `--line` | `#e4e3de`   | 1px structural dividers and concentric ring tracks             |
| **Strong Border**                | `--border-strong`              | `#cbc9c2`   | Outlined arrow badges, hover boundaries, active inputs         |

---

## 2. Accent Token System & Derived Surfaces (Persisted to `localStorage`, Default: `Tide`)

The active accent is stored in `localStorage` (`plotline-accent-v2`) and applied to `:root`. Every dark or filled surface and multi-series tint derives from `--accent` so the entire interface re-tints cohesively over `250ms` when switching themes:

- `--accent-deep: color-mix(in oklab, var(--accent) 68%, black)`
- `--surface-accent: linear-gradient(155deg, var(--accent) 0%, var(--accent-deep) 100%)`
- `--accent-tint-1` .. `--accent-tint-5`: Oklab-mixed tints of `var(--accent)` used across Weekly Output segments and Project Rings.

| Theme Name           | Key      | `--accent` | `--accent-mid` | `--accent-light` | `--accent-deep` _(Derived)_                     | White Contrast | Character                             |
| :------------------- | :------- | :--------- | :------------- | :--------------- | :---------------------------------------------- | :------------- | :------------------------------------ |
| **Tide** _(Default)_ | `tide`   | `#204282`  | `#2c52a3`      | `#789ce2`        | `color-mix(in oklab, var(--accent) 68%, black)` | `9.7:1`        | Deep marine chart blue                |
| **Moss**             | `moss`   | `#2E6B47`  | `#3b8559`      | `#84c29d`        | `color-mix(in oklab, var(--accent) 68%, black)` | `6.3:1`        | Alpine forestry & botanical index     |
| **Iris**             | `iris`   | `#5B43B8`  | `#6f56d1`      | `#a594eb`        | `color-mix(in oklab, var(--accent) 68%, black)` | `7.1:1`        | High-altitude twilight contour violet |
| **Signal**           | `signal` | `#BE3A15`  | `#d94b24`      | `#f59d84`        | `color-mix(in oklab, var(--accent) 68%, black)` | `5.5:1`        | Signal-orange survey marker           |

---

## 3. Procedural Contour Glyphs, Weekly Output & Project Rings

- **Procedural Contour Glyphs (`contourGlyph(seed, size)`)**:
  - Pure deterministic generator returning 4–6 closed concentric SVG paths per glyph.
  - Radii perturbed within `±18%` via `mulberry32` seeded from a 32-bit FNV-1a hash of the entity `id`, smoothed with a closed Catmull-Rom spline, rendered at `1.25px` stroke width in `var(--accent)` with opacity ramping outward.
  - Used for `36px` project icon tiles, the `Focus` card background texture (white at `8–10%` opacity seeded from the active task id), and empty states.
- **Segmented Weekly Output**:
  - Seven slim columns (`28px` wide, `8px` radius), segmented by project with `2px` gaps in accent tints.
  - Today's column displays an accent outline and floating total-hours label; hovering any column shows a per-project breakdown tooltip.
- **Concentric Project Rings**:
  - Up to 4 concentric circular rings for the projects due soonest (`stroke="var(--line)"` track, round caps, accent-tint arcs animated from `0` over `700ms` on mount), with overall `%` centered in the serif numeral face and a compact `name + %` legend.

---

## 4. Typography & Motion

- **Grotesk UI Sans (`--font-ui`)**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- **Serif Display Numerals (`--font-display-num`)**: `'Fraunces', Georgia, serif`
- **Shared Easing Token**: `--ease-plotline: cubic-bezier(0.16, 1, 0.3, 1)`
- **Route Change Motion**: A `2px` accent line (`.plotline-route-sweep`) sweeps across the top of the content over `400ms` while cards fade in with a `40ms` stagger (`prefers-reduced-motion` respected).
