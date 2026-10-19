# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> visual baseline: Analytics at 1280x800
- Location: e2e/visual.spec.ts:48:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  690 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: analytics-1280x800.png

Call log:
  - Expect "toHaveScreenshot(analytics-1280x800.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 690 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 690 pixels (ratio 0.01 of all image pixels) are different.

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
            - heading "Analytics" [level=1] [ref=e101]
            - paragraph [ref=e102]: Delivery pace, focus time by project, and cycle time.
          - generic [ref=e103]:
            - group "Analytics time range" [ref=e104]:
              - button "7D" [ref=e105] [cursor=pointer]
              - button "30D" [pressed] [ref=e106] [cursor=pointer]
              - button "90D" [ref=e107] [cursor=pointer]
            - button "Export" [ref=e108] [cursor=pointer]
        - generic [ref=e115]:
          - generic [ref=e116]:
            - generic [ref=e117]:
              - generic [ref=e118]: Tasks completed
              - generic [ref=e119]: New
            - generic [ref=e121]:
              - generic [ref=e122]: "14"
              - generic [ref=e123]: vs. previous 30D
          - generic [ref=e127]:
            - generic [ref=e128]:
              - generic [ref=e129]: Focus hours
              - generic [ref=e130]: New
            - generic [ref=e132]:
              - generic [ref=e133]: 123.6h
              - generic [ref=e134]: vs. previous 30D
          - generic [ref=e138]:
            - generic [ref=e139]:
              - generic [ref=e140]: On-time delivery
              - generic [ref=e141]: New
            - generic [ref=e143]:
              - generic [ref=e144]: 93%
              - generic [ref=e145]: vs. previous 30D
          - generic [ref=e149]:
            - generic [ref=e150]:
              - generic [ref=e151]: Avg cycle time
              - generic [ref=e152]: New
            - generic [ref=e154]:
              - generic [ref=e155]: 6.1d
              - generic [ref=e156]: vs. previous 30D
        - generic [ref=e160]:
          - region [ref=e161]:
            - generic [ref=e162]:
              - generic [ref=e163]:
                - heading "Throughput (30D)" [level=2] [ref=e164]
                - paragraph [ref=e165]: Daily focus hours vs. previous 30D and 7-day moving average
              - generic [ref=e166]:
                - generic [ref=e167]: Current
                - generic [ref=e170]: Previous
                - generic [ref=e173]: 7d Avg
            - img [ref=e177]:
              - generic [ref=e178]: 9h
              - generic [ref=e180]: 5h
              - generic [ref=e182]: 0h
              - generic [ref=e218]: Sep 19
              - generic [ref=e219]: Oct 4
              - generic [ref=e220]: Oct 18
          - region [ref=e221]:
            - generic [ref=e222]:
              - heading "Time by project" [level=2] [ref=e223]
              - generic [ref=e224]: 123.6h total
            - generic [ref=e225]:
              - generic [ref=e226]:
                - img [ref=e227]:
                  - generic [ref=e228] [cursor=pointer]
                  - generic [ref=e229] [cursor=pointer]
                  - generic [ref=e230] [cursor=pointer]
                  - generic [ref=e231] [cursor=pointer]
                  - generic [ref=e232] [cursor=pointer]
                - generic:
                  - generic: 123.6h
                  - generic: 30D logged
              - generic [ref=e233]:
                - button "Harbor Mobile Banking Redesign 38.8h (32%)" [ref=e234] [cursor=pointer]:
                  - generic [ref=e235]: Harbor Mobile Banking Redesign
                  - generic [ref=e245]: 38.8h (32%)
                - button "Atlas Travel Booking Flow 27.5h (22%)" [ref=e246] [cursor=pointer]:
                  - generic [ref=e247]: Atlas Travel Booking Flow
                  - generic [ref=e257]: 27.5h (22%)
                - button "Fernlight Wellness App 23.2h (19%)" [ref=e258] [cursor=pointer]:
                  - generic [ref=e259]: Fernlight Wellness App
                  - generic [ref=e269]: 23.2h (19%)
                - button "Orchard Logistics Dashboard 21.4h (17%)" [ref=e270] [cursor=pointer]:
                  - generic [ref=e271]: Orchard Logistics Dashboard
                  - generic [ref=e281]: 21.4h (17%)
                - button "Lumen Museum Website 12.7h (10%)" [ref=e282] [cursor=pointer]:
                  - generic [ref=e283]: Lumen Museum Website
                  - generic [ref=e293]: 12.7h (10%)
        - generic [ref=e294]:
          - region [ref=e295]:
            - generic [ref=e296]:
              - generic [ref=e297]:
                - heading "Activity Heatmap" [level=2] [ref=e298]
                - paragraph [ref=e299]: Daily studio intensity across the 30D window (Mon–Sun by week)
              - generic [ref=e300]: 30 days
            - generic [ref=e301]:
              - generic [ref=e303]:
                - generic [ref=e304]: Sep 19
                - generic [ref=e305]: Sep 21
                - generic [ref=e306]: Sep 28
                - generic [ref=e307]: Oct 5
                - generic [ref=e308]: Oct 12
              - grid "Activity heatmap calendar (7 rows Mon to Sun by week)" [ref=e309]:
                - 'row "Mon Sep 21 (Mon): 6.4h, 0 tasks Sep 28 (Mon): 4.6h, 0 tasks Oct 5 (Mon): 6.0h, 1 tasks Oct 12 (Mon): 6.0h, 1 tasks" [ref=e310]':
                  - generic [ref=e311]: Mon
                  - generic [ref=e312]:
                    - 'gridcell "Sep 21 (Mon): 6.4h, 0 tasks" [ref=e314] [cursor=pointer]'
                    - 'gridcell "Sep 28 (Mon): 4.6h, 0 tasks" [ref=e315] [cursor=pointer]'
                    - 'gridcell "Oct 5 (Mon): 6.0h, 1 tasks" [ref=e316] [cursor=pointer]'
                    - 'gridcell "Oct 12 (Mon): 6.0h, 1 tasks" [ref=e317] [cursor=pointer]'
                - 'row "Tue Sep 22 (Tue): 6.3h, 0 tasks Sep 29 (Tue): 6.3h, 1 tasks Oct 6 (Tue): 5.9h, 0 tasks Oct 13 (Tue): 6.5h, 0 tasks" [ref=e318]':
                  - generic [ref=e319]: Tue
                  - generic [ref=e320]:
                    - 'gridcell "Sep 22 (Tue): 6.3h, 0 tasks" [ref=e322] [cursor=pointer]'
                    - 'gridcell "Sep 29 (Tue): 6.3h, 1 tasks" [ref=e323] [cursor=pointer]'
                    - 'gridcell "Oct 6 (Tue): 5.9h, 0 tasks" [ref=e324] [cursor=pointer]'
                    - 'gridcell "Oct 13 (Tue): 6.5h, 0 tasks" [ref=e325] [cursor=pointer]'
                - 'row "Wed Sep 23 (Wed): 7.7h, 0 tasks Sep 30 (Wed): 6.7h, 0 tasks Oct 7 (Wed): 6.5h, 2 tasks Oct 14 (Wed): 6.5h, 0 tasks" [ref=e326]':
                  - generic [ref=e327]: Wed
                  - generic [ref=e328]:
                    - 'gridcell "Sep 23 (Wed): 7.7h, 0 tasks" [ref=e330] [cursor=pointer]'
                    - 'gridcell "Sep 30 (Wed): 6.7h, 0 tasks" [ref=e331] [cursor=pointer]'
                    - 'gridcell "Oct 7 (Wed): 6.5h, 2 tasks" [ref=e332] [cursor=pointer]'
                    - 'gridcell "Oct 14 (Wed): 6.5h, 0 tasks" [ref=e333] [cursor=pointer]'
                - 'row "Thu Sep 24 (Thu): 6.0h, 0 tasks Oct 1 (Thu): 6.1h, 1 tasks Oct 8 (Thu): 6.3h, 0 tasks Oct 15 (Thu): 6.8h, 0 tasks" [ref=e334]':
                  - generic [ref=e335]: Thu
                  - generic [ref=e336]:
                    - 'gridcell "Sep 24 (Thu): 6.0h, 0 tasks" [ref=e338] [cursor=pointer]'
                    - 'gridcell "Oct 1 (Thu): 6.1h, 1 tasks" [ref=e339] [cursor=pointer]'
                    - 'gridcell "Oct 8 (Thu): 6.3h, 0 tasks" [ref=e340] [cursor=pointer]'
                    - 'gridcell "Oct 15 (Thu): 6.8h, 0 tasks" [ref=e341] [cursor=pointer]'
                - 'row "Fri Sep 25 (Fri): 5.7h, 1 tasks Oct 2 (Fri): 4.4h, 0 tasks Oct 9 (Fri): 6.9h, 1 tasks Oct 16 (Fri): 6.0h, 0 tasks" [ref=e342]':
                  - generic [ref=e343]: Fri
                  - generic [ref=e344]:
                    - 'gridcell "Sep 25 (Fri): 5.7h, 1 tasks" [ref=e346] [cursor=pointer]'
                    - 'gridcell "Oct 2 (Fri): 4.4h, 0 tasks" [ref=e347] [cursor=pointer]'
                    - 'gridcell "Oct 9 (Fri): 6.9h, 1 tasks" [ref=e348] [cursor=pointer]'
                    - 'gridcell "Oct 16 (Fri): 6.0h, 0 tasks" [ref=e349] [cursor=pointer]'
                - 'row "Sat Sep 19 (Sat): 0m, 0 tasks Sep 26 (Sat): 0m, 0 tasks Oct 3 (Sat): 0m, 1 tasks Oct 10 (Sat): 0m, 2 tasks Oct 17 (Sat): 0m, 0 tasks" [ref=e350]':
                  - generic [ref=e351]: Sat
                  - generic [ref=e352]:
                    - 'gridcell "Sep 19 (Sat): 0m, 0 tasks" [ref=e353] [cursor=pointer]'
                    - 'gridcell "Sep 26 (Sat): 0m, 0 tasks" [ref=e354] [cursor=pointer]'
                    - 'gridcell "Oct 3 (Sat): 0m, 1 tasks" [ref=e355] [cursor=pointer]'
                    - 'gridcell "Oct 10 (Sat): 0m, 2 tasks" [ref=e356] [cursor=pointer]'
                    - 'gridcell "Oct 17 (Sat): 0m, 0 tasks" [ref=e357] [cursor=pointer]'
                - 'row "Sun Sep 20 (Sun): 0m, 0 tasks Sep 27 (Sun): 0m, 3 tasks Oct 4 (Sun): 0m, 0 tasks Oct 11 (Sun): 0m, 0 tasks Oct 18 (Sun): 0m, 0 tasks" [ref=e358]':
                  - generic [ref=e359]: Sun
                  - generic [ref=e360]:
                    - 'gridcell "Sep 20 (Sun): 0m, 0 tasks" [ref=e361] [cursor=pointer]'
                    - 'gridcell "Sep 27 (Sun): 0m, 3 tasks" [ref=e362] [cursor=pointer]'
                    - 'gridcell "Oct 4 (Sun): 0m, 0 tasks" [ref=e363] [cursor=pointer]'
                    - 'gridcell "Oct 11 (Sun): 0m, 0 tasks" [ref=e364] [cursor=pointer]'
                    - 'gridcell "Oct 18 (Sun): 0m, 0 tasks" [ref=e365] [cursor=pointer]'
            - generic [ref=e366]:
              - generic [ref=e367]: Lower cadence
              - generic [ref=e368]:
                - generic "0h" [ref=e369]
                - generic "Level 1" [ref=e370]
                - generic "Level 2" [ref=e371]
                - generic "Level 3" [ref=e372]
                - generic "Level 4" [ref=e373]
              - generic [ref=e374]: Peak cadence
          - region [ref=e375]:
            - generic [ref=e377]:
              - heading "Top Contributors" [level=2] [ref=e378]
              - paragraph [ref=e379]: Specialists ranked by completed deliverables and focus hours (30D)
            - generic [ref=e380]:
              - generic [ref=e382]:
                - generic [ref=e383]:
                  - generic [ref=e384]: NK
                  - generic [ref=e385]: Nadia Kovalenko
                  - generic [ref=e386]: · Product Designer
                - generic [ref=e387]: 43.1h · 4 tasks
              - generic [ref=e391]:
                - generic [ref=e392]:
                  - generic [ref=e393]: JP
                  - generic [ref=e394]: Jade Polo
                  - generic [ref=e395]: · Backend Engineer
                - generic [ref=e396]: 23.7h · 3 tasks
              - generic [ref=e400]:
                - generic [ref=e401]:
                  - generic [ref=e402]: TA
                  - generic [ref=e403]: Tarek Al-Mansoor
                  - generic [ref=e404]: · Senior Frontend Engineer
                - generic [ref=e405]: 31.0h · 2 tasks
              - generic [ref=e409]:
                - generic [ref=e410]:
                  - generic [ref=e411]: MV
                  - generic [ref=e412]: Mireia Vance
                  - generic [ref=e413]: · Design Director
                - generic [ref=e414]: 9.8h · 2 tasks
              - generic [ref=e418]:
                - generic [ref=e419]:
                  - generic [ref=e420]: KO
                  - generic [ref=e421]: Kaelen Okafor
                  - generic [ref=e422]: · Delivery Producer
                - generic [ref=e423]: 5.4h · 2 tasks
              - generic [ref=e427]:
                - generic [ref=e428]:
                  - generic [ref=e429]: JT
                  - generic [ref=e430]: Juno Takahashi
                  - generic [ref=e431]: · Brand & Marketing Lead
                - generic [ref=e432]: 5.0h · 1 tasks
              - generic [ref=e436]:
                - generic [ref=e437]:
                  - generic [ref=e438]: SL
                  - generic [ref=e439]: Soren Lindqvist
                  - generic [ref=e440]: · Technical Director
                - generic [ref=e441]: 5.6h · 0 tasks
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