# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> visual baseline: Projects at 1440x900
- Location: e2e/visual.spec.ts:48:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  1184 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: projects-1440x900.png

Call log:
  - Expect "toHaveScreenshot(projects-1440x900.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 1184 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 1184 pixels (ratio 0.01 of all image pixels) are different.

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
            - generic [ref=e101]:
              - heading "Projects" [level=1] [ref=e102]
              - generic [ref=e103]: 6 projects
            - paragraph [ref=e104]: Manage, filter, and track project streams across active sectors
          - generic [ref=e105]:
            - button "Import" [ref=e106] [cursor=pointer]
            - button "New project" [ref=e111] [cursor=pointer]
        - generic [ref=e114]:
          - group "Status filters" [ref=e115]:
            - button "All (6)" [ref=e116] [cursor=pointer]
            - button "Running (4)" [ref=e117] [cursor=pointer]
            - button "Pending (1)" [ref=e118] [cursor=pointer]
            - button "Ended (1)" [ref=e119] [cursor=pointer]
          - generic [ref=e120]:
            - textbox "Search projects..." [ref=e125]
            - generic [ref=e126]:
              - combobox "Sort projects by" [ref=e127] [cursor=pointer]:
                - 'option "Sort: Due date" [selected]'
                - 'option "Sort: Progress"'
                - 'option "Sort: Name"'
              - button "Sort ascending" [ref=e128] [cursor=pointer]
        - generic [ref=e132]:
          - generic [ref=e133] [cursor=pointer]:
            - generic [ref=e142]:
              - generic [ref=e143]:
                - generic [ref=e144]: PLT-105
                - heading "Lumen Museum Website" [level=2] [ref=e145]
              - generic [ref=e146]:
                - generic [ref=e147]: Lumen Museum of Design
                - generic [ref=e148]: ·
                - generic [ref=e149]: Arts & Culture
            - generic [ref=e150]:
              - generic [ref=e152]:
                - generic [ref=e153]: Progress
                - generic [ref=e154]: 100%
              - generic [ref=e157]:
                - generic [ref=e158]:
                  - generic [ref=e159]: Due Date
                  - generic [ref=e160]: Oct 11, 2026
                - generic [ref=e161]: Ended
                - generic [ref=e162]:
                  - generic [ref=e163]: 4 tasks
                  - button "Delete project Lumen Museum Website" [ref=e164]
          - generic [ref=e168] [cursor=pointer]:
            - generic [ref=e177]:
              - generic [ref=e178]:
                - generic [ref=e179]: PLT-104
                - heading "Atlas Travel Booking Flow" [level=2] [ref=e180]
              - generic [ref=e181]:
                - generic [ref=e182]: Atlas Journeys
                - generic [ref=e183]: ·
                - generic [ref=e184]: Travel & Transportation
            - generic [ref=e185]:
              - generic [ref=e187]:
                - generic [ref=e188]: Progress
                - generic [ref=e189]: 75%
              - generic [ref=e192]:
                - generic [ref=e193]:
                  - generic [ref=e194]: Due Date
                  - generic [ref=e195]: Oct 27, 2026
                - generic [ref=e196]: Running
                - generic [ref=e197]:
                  - generic [ref=e198]: 4 tasks
                  - button "Delete project Atlas Travel Booking Flow" [ref=e199]
          - generic [ref=e203] [cursor=pointer]:
            - generic [ref=e212]:
              - generic [ref=e213]:
                - generic [ref=e214]: PLT-103
                - heading "Orchard Logistics Dashboard" [level=2] [ref=e215]
              - generic [ref=e216]:
                - generic [ref=e217]: Orchard Freight
                - generic [ref=e218]: ·
                - generic [ref=e219]: Supply Chain & Freight
            - generic [ref=e220]:
              - generic [ref=e222]:
                - generic [ref=e223]: Progress
                - generic [ref=e224]: 40%
              - generic [ref=e227]:
                - generic [ref=e228]:
                  - generic [ref=e229]: Due Date
                  - generic [ref=e230]: Oct 30, 2026
                - generic [ref=e231]: Running
                - generic [ref=e232]:
                  - generic [ref=e233]: 5 tasks
                  - button "Delete project Orchard Logistics Dashboard" [ref=e234]
          - generic [ref=e238] [cursor=pointer]:
            - generic [ref=e247]:
              - generic [ref=e248]:
                - generic [ref=e249]: PLT-101
                - heading "Harbor Mobile Banking Redesign" [level=2] [ref=e250]
              - generic [ref=e251]:
                - generic [ref=e252]: Harbor & Vale Credit Union
                - generic [ref=e253]: ·
                - generic [ref=e254]: Financial Technology
            - generic [ref=e255]:
              - generic [ref=e257]:
                - generic [ref=e258]: Progress
                - generic [ref=e259]: 57%
              - generic [ref=e262]:
                - generic [ref=e263]:
                  - generic [ref=e264]: Due Date
                  - generic [ref=e265]: Nov 8, 2026
                - generic [ref=e266]: Running
                - generic [ref=e267]:
                  - generic [ref=e268]: 7 tasks
                  - button "Delete project Harbor Mobile Banking Redesign" [ref=e269]
          - generic [ref=e273] [cursor=pointer]:
            - generic [ref=e282]:
              - generic [ref=e283]:
                - generic [ref=e284]: PLT-102
                - heading "Fernlight Wellness App" [level=2] [ref=e285]
              - generic [ref=e286]:
                - generic [ref=e287]: Fernlight Health
                - generic [ref=e288]: ·
                - generic [ref=e289]: Healthcare & Wellness
            - generic [ref=e290]:
              - generic [ref=e292]:
                - generic [ref=e293]: Progress
                - generic [ref=e294]: 40%
              - generic [ref=e297]:
                - generic [ref=e298]:
                  - generic [ref=e299]: Due Date
                  - generic [ref=e300]: Nov 22, 2026
                - generic [ref=e301]: Running
                - generic [ref=e302]:
                  - generic [ref=e303]: 5 tasks
                  - button "Delete project Fernlight Wellness App" [ref=e304]
          - generic [ref=e308] [cursor=pointer]:
            - generic [ref=e317]:
              - generic [ref=e318]:
                - generic [ref=e319]: PLT-106
                - heading "Northwind Brand Refresh" [level=2] [ref=e320]
              - generic [ref=e321]:
                - generic [ref=e322]: Northwind Coffee Roasters
                - generic [ref=e323]: ·
                - generic [ref=e324]: Consumer Goods & Retail
            - generic [ref=e325]:
              - generic [ref=e327]:
                - generic [ref=e328]: Progress
                - generic [ref=e329]: 0%
              - generic [ref=e331]:
                - generic [ref=e332]:
                  - generic [ref=e333]: Due Date
                  - generic [ref=e334]: Dec 17, 2026
                - generic [ref=e335]: Pending
                - generic [ref=e336]:
                  - generic [ref=e337]: 2 tasks
                  - button "Delete project Northwind Brand Refresh" [ref=e338]
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