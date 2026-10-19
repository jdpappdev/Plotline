# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> visual baseline: Dashboard at 1280x800
- Location: e2e/visual.spec.ts:48:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  670 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: dashboard-1280x800.png

Call log:
  - Expect "toHaveScreenshot(dashboard-1280x800.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 670 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 670 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary "Primary Navigation" [ref=e4]:
    - button "Plotline" [ref=e6] [cursor=pointer]
    - navigation "Workspace Views" [ref=e12]:
      - button "Dashboard" [ref=e13] [cursor=pointer]
      - button "Projects" [ref=e22] [cursor=pointer]
      - button "Tasks" [ref=e28] [cursor=pointer]
      - button "Calendar" [ref=e35] [cursor=pointer]
      - button "Analytics" [ref=e41] [cursor=pointer]
      - button "Team" [ref=e47] [cursor=pointer]
      - button "Settings" [ref=e56] [cursor=pointer]
      - button "Help" [ref=e63] [cursor=pointer]
    - generic [ref=e70]:
      - button "Log out" [ref=e71] [cursor=pointer]
      - button "Collapse navigation rail" [ref=e76] [cursor=pointer]:
        - generic [ref=e77]: Collapse rail
  - generic [ref=e80]:
    - banner [ref=e81]:
      - generic [ref=e84]:
        - searchbox "Search workspace" [ref=e88]
        - button "Open command palette (Command+K)" [ref=e89] [cursor=pointer]: ⌘K
      - button "Account menu for Soren Lindqvist" [ref=e92] [cursor=pointer]:
        - generic [ref=e93]: SL
        - generic [ref=e94]:
          - generic [ref=e95]: Soren Lindqvist
          - generic [ref=e96]: soren@plotline.studio
    - main [ref=e97]:
      - generic [ref=e98]:
        - generic [ref=e99]:
          - generic [ref=e100]:
            - heading "Dashboard" [level=1] [ref=e101]
            - paragraph [ref=e102]: Plan, prioritize, and coordinate field engineering streams with clarity.
          - generic [ref=e103]:
            - button "New project" [ref=e104] [cursor=pointer]
            - button "Import" [ref=e107] [cursor=pointer]
        - generic [ref=e112]:
          - button "View 6 projects" [ref=e113] [cursor=pointer]:
            - generic [ref=e114]: Total
            - generic [ref=e120]: "6"
            - paragraph [ref=e122]: 6 projects · 12 open tasks
          - button "View 1 ended project" [ref=e123] [cursor=pointer]:
            - generic [ref=e124]: Ended
            - generic [ref=e130]: "1"
            - paragraph [ref=e132]: 1 project · 12 open tasks
          - button "View 4 running projects" [ref=e133] [cursor=pointer]:
            - generic [ref=e134]: Running
            - generic [ref=e140]: "4"
            - paragraph [ref=e142]: 4 projects · 12 open tasks
          - button "View 1 pending project" [ref=e143] [cursor=pointer]:
            - generic [ref=e144]: Pending
            - generic [ref=e150]: "1"
            - paragraph [ref=e152]: 1 project · 12 open tasks
          - region [ref=e153]:
            - heading "Next up" [level=2] [ref=e154]
            - generic [ref=e155] [cursor=pointer]:
              - heading "Harbor design critique" [level=3] [ref=e156]
              - paragraph [ref=e157]: "Time : 15:00 - 16:00"
              - paragraph [ref=e158]: Design Studio B
            - button "Start meeting" [ref=e159] [cursor=pointer]
          - region [ref=e164]:
            - heading "Focus" [level=2] [ref=e166]
            - generic [ref=e167]:
              - generic [ref=e168]: 00:00:00
              - generic [ref=e169]:
                - button "Start timer" [ref=e170] [cursor=pointer]
                - button "Stop and log focus session" [ref=e173] [cursor=pointer]
            - 'button "Focusing on: Implement account overview in React Native" [ref=e177] [cursor=pointer]'
          - region [ref=e181]:
            - generic [ref=e182]:
              - heading "In motion" [level=2] [ref=e183]
              - button "Add task" [ref=e184] [cursor=pointer]
            - generic [ref=e187]:
              - generic [ref=e188] [cursor=pointer]:
                - generic [ref=e189]:
                  - generic [ref=e190]: SL
                  - generic [ref=e191]:
                    - paragraph [ref=e192]: Soren Lindqvist
                    - paragraph [ref=e193]:
                      - text: Working on Review route optimisation results with client
                      - generic [ref=e194]: (+3.3h)
                - generic [ref=e195]: In Review
              - generic [ref=e197] [cursor=pointer]:
                - generic [ref=e198]:
                  - generic [ref=e199]: MV
                  - generic [ref=e200]:
                    - paragraph [ref=e201]: Mireia Vance
                    - paragraph [ref=e202]:
                      - text: Working on Audit current app and competitor flows
                      - generic [ref=e203]: (+6.2h)
                - generic [ref=e204]: Completed
              - generic [ref=e206] [cursor=pointer]:
                - generic [ref=e207]:
                  - generic [ref=e208]: TA
                  - generic [ref=e209]:
                    - paragraph [ref=e210]: Tarek Al-Mansoor
                    - paragraph [ref=e211]:
                      - text: Working on Implement account overview in React Native
                      - generic [ref=e212]: (+6.0h)
                - generic [ref=e213]: In Progress
              - generic [ref=e215] [cursor=pointer]:
                - generic [ref=e216]:
                  - generic [ref=e217]: KO
                  - generic [ref=e218]:
                    - paragraph [ref=e219]: Kaelen Okafor
                    - paragraph [ref=e220]:
                      - text: Working on Requirements workshop with ops team
                      - generic [ref=e221]: (+3.6h)
                - generic [ref=e222]: Completed
          - region [ref=e224]:
            - generic [ref=e225]:
              - heading "Weekly Output" [level=2] [ref=e226]
              - generic [ref=e227]: Mon–Sun · 31.8h total
            - generic [ref=e228]:
              - 'button "Monday: 6.0h across 3 projects" [ref=e229] [cursor=pointer]':
                - generic [ref=e235]: M
              - 'button "Tuesday: 6.5h across 3 projects" [ref=e236] [cursor=pointer]':
                - generic [ref=e242]: T
              - 'button "Wednesday: 6.5h across 3 projects" [ref=e243] [cursor=pointer]':
                - generic [ref=e249]: W
              - 'button "Thursday: 6.8h across 3 projects" [ref=e250] [cursor=pointer]':
                - generic [ref=e256]: T
              - 'button "Friday: 6.0h across 3 projects" [ref=e257] [cursor=pointer]':
                - generic [ref=e263]: F
              - 'button "Saturday: 0m across 0 projects" [ref=e264] [cursor=pointer]':
                - generic [ref=e268]: S
              - 'button "Sunday: 0m across 0 projects" [ref=e269] [cursor=pointer]':
                - generic [ref=e270]: 0m
                - generic [ref=e274]: S
          - region [ref=e275]:
            - generic [ref=e276]:
              - heading "Projects" [level=2] [ref=e277]
              - button "New" [ref=e278] [cursor=pointer]
            - list [ref=e281]:
              - listitem [ref=e282] [cursor=pointer]:
                - generic [ref=e283]:
                  - generic "Contour glyph for Harbor Mobile Banking Redesign" [ref=e284]
                  - generic [ref=e291]:
                    - paragraph [ref=e292]: Harbor Mobile Banking Redesign
                    - paragraph [ref=e293]: "Due date: Nov 8, 2026"
                - button "Delete Harbor Mobile Banking Redesign" [ref=e294]
              - listitem [ref=e295] [cursor=pointer]:
                - generic [ref=e296]:
                  - generic "Contour glyph for Fernlight Wellness App" [ref=e297]
                  - generic [ref=e304]:
                    - paragraph [ref=e305]: Fernlight Wellness App
                    - paragraph [ref=e306]: "Due date: Nov 22, 2026"
                - button "Delete Fernlight Wellness App" [ref=e307]
              - listitem [ref=e308] [cursor=pointer]:
                - generic [ref=e309]:
                  - generic "Contour glyph for Orchard Logistics Dashboard" [ref=e310]
                  - generic [ref=e317]:
                    - paragraph [ref=e318]: Orchard Logistics Dashboard
                    - paragraph [ref=e319]: "Due date: Oct 30, 2026"
                - button "Delete Orchard Logistics Dashboard" [ref=e320]
              - listitem [ref=e321] [cursor=pointer]:
                - generic [ref=e322]:
                  - generic "Contour glyph for Atlas Travel Booking Flow" [ref=e323]
                  - generic [ref=e330]:
                    - paragraph [ref=e331]: Atlas Travel Booking Flow
                    - paragraph [ref=e332]: "Due date: Oct 27, 2026"
                - button "Delete Atlas Travel Booking Flow" [ref=e333]
              - listitem [ref=e334] [cursor=pointer]:
                - generic [ref=e335]:
                  - generic "Contour glyph for Lumen Museum Website" [ref=e336]
                  - generic [ref=e343]:
                    - paragraph [ref=e344]: Lumen Museum Website
                    - paragraph [ref=e345]: "Due date: Oct 11, 2026"
                - button "Delete Lumen Museum Website" [ref=e346]
          - region [ref=e347]:
            - generic [ref=e348]:
              - heading "Project Rings" [level=2] [ref=e349]
              - generic [ref=e350]: Due soonest
            - generic [ref=e351]:
              - generic [ref=e352]:
                - img "Overall project completion 68%" [ref=e353]
                - generic:
                  - generic: 68%
                  - generic: Overall
              - generic [ref=e366]:
                - button "Lumen Museum Website 100%" [ref=e367] [cursor=pointer]:
                  - generic [ref=e368]: Lumen Museum Website
                  - generic [ref=e371]: 100%
                - button "Atlas Travel Booking Flow 75%" [ref=e372] [cursor=pointer]:
                  - generic [ref=e373]: Atlas Travel Booking Flow
                  - generic [ref=e376]: 75%
                - button "Orchard Logistics Dashboard 40%" [ref=e377] [cursor=pointer]:
                  - generic [ref=e378]: Orchard Logistics Dashboard
                  - generic [ref=e381]: 40%
                - button "Harbor Mobile Banking Redesign 57%" [ref=e382] [cursor=pointer]:
                  - generic [ref=e383]: Harbor Mobile Banking Redesign
                  - generic [ref=e386]: 57%
```

# Test source

```ts
  1   | import fs from 'node:fs';
  2   | import path from 'node:path';
  3   | import { expect, type Page, test } from '@playwright/test';
  4   | 
  5   | const FIXED_TIME = '2026-10-18T12:00:00';
  6   | 
  7   | const ROUTES = [
  8   |   { id: 'Dashboard', hash: '#dashboard' },
  9   |   { id: 'Projects', hash: '#projects' },
  10  |   { id: 'Tasks', hash: '#tasks' },
  11  |   { id: 'Calendar', hash: '#calendar' },
  12  |   { id: 'Analytics', hash: '#analytics' },
  13  |   { id: 'Team', hash: '#team' },
  14  |   { id: 'Settings', hash: '#settings' },
  15  |   { id: 'Help', hash: '#help' },
  16  | ] as const;
  17  | 
  18  | const VIEWPORTS = [
  19  |   { width: 1440, height: 900 },
  20  |   { width: 1280, height: 800 },
  21  |   { width: 1180, height: 820 },
  22  | ] as const;
  23  | 
  24  | async function prepareDeterministicPage(
  25  |   page: Page,
  26  |   routeHash: string,
  27  |   viewport = { width: 1440, height: 900 }
  28  | ) {
  29  |   await page.setViewportSize(viewport);
  30  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  31  | 
  32  |   // Fix the clock before navigating so all seed generation and UI dates use 2026-10-18T12:00:00
  33  |   await page.clock.setFixedTime(FIXED_TIME);
  34  | 
  35  |   // Clear localStorage before app bootstrap so the benchmark seed loads fresh and focus timer stays stopped
  36  |   await page.addInitScript(() => {
  37  |     window.localStorage.clear();
  38  |   });
  39  | 
  40  |   await page.goto(`/${routeHash}`, { waitUntil: 'networkidle' });
  41  |   await page.locator('main h1').waitFor({ state: 'visible' });
  42  |   await page.evaluate(() => document.fonts.ready);
  43  |   await expect(page.locator('[data-testid="mini-focus-timer-pill"]')).toHaveCount(0);
  44  | }
  45  | 
  46  | for (const route of ROUTES) {
  47  |   for (const viewport of VIEWPORTS) {
  48  |     test(`visual baseline: ${route.id} at ${viewport.width}x${viewport.height}`, async ({
  49  |       page,
  50  |     }) => {
  51  |       await prepareDeterministicPage(page, route.hash, viewport);
  52  | 
> 53  |       await expect(page).toHaveScreenshot(
      |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
  54  |         `${route.id.toLowerCase()}-${viewport.width}x${viewport.height}.png`,
  55  |         {
  56  |           fullPage: true,
  57  |           animations: 'disabled',
  58  |           maxDiffPixelRatio: 0.0005,
  59  |         }
  60  |       );
  61  |     });
  62  |   }
  63  | 
  64  |   test(`text snapshot: ${route.id}`, async ({ page }) => {
  65  |     await prepareDeterministicPage(page, route.hash, { width: 1440, height: 900 });
  66  | 
  67  |     const capturedText = await page.evaluate(() => {
  68  |       const normalize = (selector: string) => {
  69  |         const el = document.querySelector(selector);
  70  |         const raw = el instanceof HTMLElement ? el.innerText : (el?.textContent ?? '');
  71  |         return raw.replace(/\s+/g, ' ').trim();
  72  |       };
  73  |       return `[TOP BAR] ${normalize('header')}\n[SIDEBAR] ${normalize('aside')}\n[MAIN] ${normalize('main')}\n`;
  74  |     });
  75  | 
  76  |     const baselineFileName = `${route.id.toLowerCase()}-text.txt`;
  77  |     const baselinePath = path.join(process.cwd(), 'e2e', '__screenshots__', baselineFileName);
  78  |     const approvedBaseline = fs.readFileSync(baselinePath, 'utf8');
  79  | 
  80  |     expect(capturedText).toBe(approvedBaseline);
  81  |     expect(capturedText).toMatchSnapshot(baselineFileName);
  82  |   });
  83  | }
  84  | 
  85  | test('numbers at fixed clock: Dashboard cards and Analytics 30D metrics', async ({ page }) => {
  86  |   await prepareDeterministicPage(page, '#dashboard', { width: 1440, height: 900 });
  87  | 
  88  |   const normalizeCardText = async (ariaLabel: string) => {
  89  |     const raw = await page.locator(`main button[aria-label="${ariaLabel}"]`).innerText();
  90  |     return raw.replace(/\s+/g, ' ').trim();
  91  |   };
  92  | 
  93  |   expect(await normalizeCardText('View 6 projects')).toContain('Total 6');
  94  |   expect(await normalizeCardText('View 1 ended project')).toContain('Ended 1');
  95  |   expect(await normalizeCardText('View 4 running projects')).toContain('Running 4');
  96  |   expect(await normalizeCardText('View 1 pending project')).toContain('Pending 1');
  97  | 
  98  |   await page.goto('/#analytics', { waitUntil: 'networkidle' });
  99  |   await page.locator('main h1').waitFor({ state: 'visible' });
  100 | 
  101 |   await expect(page.getByRole('button', { name: '30D', exact: true })).toHaveAttribute(
  102 |     'aria-pressed',
  103 |     'true'
  104 |   );
  105 |   await expect(page.getByTestId('kpi-tasks-completed')).toHaveText('14');
  106 |   await expect(page.getByTestId('kpi-hours-tracked')).toHaveText('123.6h');
  107 |   await expect(page.getByTestId('kpi-ontime-delivery')).toHaveText('93%');
  108 | });
  109 | 
```