# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features.spec.ts >> Plotline Messages, Notifications, Focus Prompts & Weekly Reporting >> Settings screen displays Weekly digest reports, Requires email setup, and downloads weekly report CSV
- Location: e2e/features.spec.ts:152:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Notifications' }) resolved to 2 elements:
    1) <button type="button" aria-expanded="false" aria-haspopup="dialog" aria-label="Notifications (2 unread)" data-testid="notification-bell-button" class="relative w-11 h-11 sm:w-9 sm:h-9 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] rounded-full flex items-center justify-center bg-transparent sm:bg-[var(--surface-sunken)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] sm:hover:bg-[var(--border-hairline)] transition-colors cursor-pointer focus-visi…>…</button> aka getByTestId('notification-bell-button')
    2) <button type="button" class="w-full min-h-[44px] flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] text-xs sm:text-sm font-medium transition-colors cursor-pointer min-w-0 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]">…</button> aka getByRole('button', { name: 'Notifications', exact: true })

Call log:
  - waiting for getByRole('button', { name: 'Notifications' })

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
      - generic [ref=e82]:
        - generic [ref=e84]:
          - searchbox "Search workspace" [ref=e88]
          - button "Open command palette (Command+K)" [ref=e89] [cursor=pointer]: ⌘K
        - button "Notifications (2 unread)" [ref=e91] [cursor=pointer]:
          - generic [ref=e95]: "2"
      - button "Account menu for Soren Lindqvist" [ref=e98] [cursor=pointer]:
        - generic [ref=e99]: SL
        - generic [ref=e100]:
          - generic [ref=e101]: Soren Lindqvist
          - generic [ref=e102]: soren@plotline.studio
    - main [ref=e103]:
      - generic [ref=e104]:
        - generic [ref=e105]:
          - heading "Settings" [level=1] [ref=e106]
          - paragraph [ref=e107]: Manage your specialist profile, notification preferences, studio appearance, and dataset integrity.
        - generic [ref=e108]:
          - navigation "Settings sections" [ref=e109]:
            - button "Profile" [ref=e110] [cursor=pointer]
            - button "Notifications" [ref=e115] [cursor=pointer]
            - button "Appearance" [ref=e120] [cursor=pointer]
            - button "Data & Integrity" [ref=e128] [cursor=pointer]
          - region [ref=e135]:
            - generic [ref=e136]:
              - generic [ref=e137]:
                - heading "Profile" [level=2] [ref=e138]
                - paragraph [ref=e139]: Update your identity across the top bar, team roster, and task assignments.
              - generic [ref=e140]: SL
            - generic [ref=e142]:
              - generic [ref=e143]:
                - generic [ref=e144]:
                  - generic [ref=e145]: Full name
                  - textbox "Full name" [ref=e146]: Soren Lindqvist
                - generic [ref=e147]:
                  - generic [ref=e148]: Role
                  - textbox "Role" [ref=e149]: Technical Director
              - generic [ref=e150]:
                - generic [ref=e151]: Email address
                - textbox "Email address" [ref=e152]: soren@plotline.studio
              - button "Save" [ref=e154] [cursor=pointer]
```

# Test source

```ts
  58  |         },
  59  |       });
  60  |     });
  61  | 
  62  |     await dialog.getByRole('button', { name: /copy email/i }).click();
  63  |     await expect(page.getByText(/email copied to clipboard/i)).toBeVisible();
  64  |     const copiedContent = await page.evaluate(
  65  |       () => (window as unknown as Record<string, string>).__lastCopiedEmail
  66  |     );
  67  |     expect(copiedContent).toContain('To: soren@plotline.studio');
  68  |     expect(copiedContent).toContain('Subject: Field Calibration Follow-up & Q2');
  69  |     expect(copiedContent).toContain('Hello Soren,\nPlease confirm the RTK baseline.');
  70  | 
  71  |     // Mock failing clipboard access and verify error alert appears
  72  |     await page.evaluate(() => {
  73  |       Object.defineProperty(navigator, 'clipboard', {
  74  |         configurable: true,
  75  |         value: {
  76  |           writeText: async () => {
  77  |             throw new Error('Clipboard permission denied');
  78  |           },
  79  |         },
  80  |       });
  81  |     });
  82  | 
  83  |     await dialog.getByRole('button', { name: /copy email/i }).click();
  84  |     await expect(dialog.getByRole('alert')).toContainText(/clipboard access failed/i);
  85  | 
  86  |     // Escape closes the dialog
  87  |     await page.keyboard.press('Escape');
  88  |     await expect(dialog).toBeHidden();
  89  |   });
  90  | 
  91  |   test('Notification bell positioned right of search displays unread count, filters by category, marks read, and persists across reload', async ({
  92  |     page,
  93  |   }) => {
  94  |     await page.setViewportSize({ width: 1280, height: 800 });
  95  |     await page.goto('/#dashboard', { waitUntil: 'networkidle' });
  96  | 
  97  |     const searchInput = page.getByRole('searchbox', { name: /search workspace/i });
  98  |     const bellButton = page.getByTestId('notification-bell-button');
  99  | 
  100 |     await expect(searchInput).toBeVisible();
  101 |     await expect(bellButton).toBeVisible();
  102 | 
  103 |     // Verify bell is positioned to the right of search
  104 |     const searchBox = await searchInput.boundingBox();
  105 |     const bellBox = await bellButton.boundingBox();
  106 |     expect(searchBox).not.toBeNull();
  107 |     expect(bellBox).not.toBeNull();
  108 |     expect(bellBox!.x).toBeGreaterThan(searchBox!.x + searchBox!.width);
  109 | 
  110 |     // Check unread badge count from derived seed data (2 overdue + 5 due soon + 1 event starting within 60m = 8)
  111 |     const badge = page.getByTestId('notification-unread-badge');
  112 |     await expect(badge).toHaveText('8');
  113 | 
  114 |     // Open portal-based popover
  115 |     await bellButton.click();
  116 |     const popover = page.getByTestId('notifications-popover');
  117 |     await expect(popover).toBeVisible();
  118 |     await expect(popover).toContainText('8 unread');
  119 | 
  120 |     // Filter by Overdue task
  121 |     await popover.getByRole('button', { name: 'Overdue task' }).click();
  122 |     await expect(popover.getByRole('listitem')).toHaveCount(2);
  123 | 
  124 |     // Filter by Calendar event starting within 60 minutes
  125 |     await popover
  126 |       .getByRole('button', { name: 'Calendar event starting within 60 minutes' })
  127 |       .click();
  128 |     await expect(popover.getByRole('listitem')).toHaveCount(1);
  129 | 
  130 |     // Reset filter to All
  131 |     await popover.getByRole('button', { name: 'All' }).click();
  132 |     await expect(popover.getByRole('listitem')).toHaveCount(8);
  133 | 
  134 |     // Mark all read and verify persistence across reload
  135 |     await popover.getByRole('button', { name: /mark all read/i }).click();
  136 |     await expect(popover).toContainText('0 unread');
  137 |     await expect(badge).toBeHidden();
  138 | 
  139 |     await page.reload({ waitUntil: 'networkidle' });
  140 |     await expect(page.getByTestId('notification-unread-badge')).toBeHidden();
  141 | 
  142 |     // Genuine task movement transition creates a new unread notification
  143 |     await page.goto('/#tasks', { waitUntil: 'networkidle' });
  144 |     await page.evaluate(() => {
  145 |       // Trigger a genuine task movement in the store via UI or store action
  146 |       const buttons = Array.from(document.querySelectorAll('button'));
  147 |       const moveBtn = buttons.find((b) => /move/i.test(b.getAttribute('aria-label') || ''));
  148 |       if (moveBtn) moveBtn.click();
  149 |     });
  150 |   });
  151 | 
  152 |   test('Settings screen displays Weekly digest reports, Requires email setup, and downloads weekly report CSV', async ({
  153 |     page,
  154 |   }) => {
  155 |     await page.setViewportSize({ width: 1280, height: 800 });
  156 |     await page.goto('/#settings', { waitUntil: 'networkidle' });
  157 | 
> 158 |     await page.getByRole('button', { name: 'Notifications' }).click();
      |                                                               ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Notifications' }) resolved to 2 elements:
  159 | 
  160 |     // Verify plain-language wording and disabled email delivery notices
  161 |     await expect(page.getByText('Weekly digest reports')).toBeVisible();
  162 |     await expect(page.getByText('Field Digest')).toHaveCount(0);
  163 |     await expect(page.getByText('Requires email setup')).toHaveCount(2);
  164 | 
  165 |     const digestSwitch = page.getByRole('switch', { name: 'Weekly digest reports' });
  166 |     const weeklyReportSwitch = page.getByRole('switch', { name: 'Weekly Throughput Report' });
  167 |     await expect(digestSwitch).toBeDisabled();
  168 |     await expect(weeklyReportSwitch).toBeDisabled();
  169 | 
  170 |     // Download weekly report CSV and verify columns and content
  171 |     const downloadPromise = page.waitForEvent('download');
  172 |     await page.getByRole('button', { name: /download weekly report/i }).click();
  173 |     const download = await downloadPromise;
  174 | 
  175 |     expect(download.suggestedFilename()).toMatch(/^plotline-weekly-report-.*\.csv$/);
  176 |     const downloadPath = await download.path();
  177 |     expect(downloadPath).not.toBeNull();
  178 |     const csvContent = await fs.readFile(downloadPath!, 'utf8');
  179 |     const lines = csvContent.trim().split(/\r?\n/);
  180 |     expect(lines[0]).toBe('Task Title,Project,Category,Completion Date,Logged Hours');
  181 |     expect(lines.length).toBeGreaterThan(1);
  182 |   });
  183 | });
  184 | 
```