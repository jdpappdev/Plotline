# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features.spec.ts >> Plotline Messages, Notifications, Focus Prompts & Weekly Reporting >> Notification bell positioned right of search displays unread count, filters by category, marks read, and persists across reload
- Location: e2e/features.spec.ts:91:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('notification-unread-badge')
Expected: "8"
Received: "2"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" getByTestId('notification-unread-badge') with timeout 5000ms
  - waiting for getByTestId('notification-unread-badge')
    14 × locator resolved to <span data-testid="notification-unread-badge" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold font-ui-tabular text-white flex items-center justify-center leading-none shadow-2xs">2</span>
       - unexpected value "2"

```

```yaml
- text: "2"
```

# Test source

```ts
  12  |     const messageBtn = page
  13  |       .getByRole('button', { name: /send message to soren lindqvist/i })
  14  |       .first();
  15  |     await messageBtn.click();
  16  | 
  17  |     const dialog = page.getByRole('dialog');
  18  |     await expect(dialog).toBeVisible();
  19  | 
  20  |     // To is read-only and populated with real email
  21  |     const toInput = dialog.getByLabel('To');
  22  |     await expect(toInput).toHaveValue('soren@plotline.studio');
  23  |     await expect(toInput).toHaveAttribute('readonly', '');
  24  | 
  25  |     // Subject and Body are editable
  26  |     const subjectInput = dialog.getByLabel('Subject');
  27  |     const bodyInput = dialog.getByLabel('Body');
  28  |     await subjectInput.fill('Field Calibration Follow-up & Q2');
  29  |     await bodyInput.fill('Hello Soren,\nPlease confirm the RTK baseline.');
  30  | 
  31  |     // Verify mailto link encoding
  32  |     const mailtoLink = dialog.getByTestId('message-mailto-link');
  33  |     const href = await mailtoLink.getAttribute('href');
  34  |     expect(href).toBe(
  35  |       'mailto:soren@plotline.studio?subject=Field%20Calibration%20Follow-up%20%26%20Q2&body=Hello%20Soren%2C%0APlease%20confirm%20the%20RTK%20baseline.'
  36  |     );
  37  | 
  38  |     // Clicking "Open in email app" must not show a success toast or imply email was sent
  39  |     await page.evaluate(() => {
  40  |       const anchor = document.querySelector('[data-testid="message-mailto-link"]');
  41  |       if (anchor) {
  42  |         anchor.addEventListener('click', (e) => e.preventDefault(), { once: true });
  43  |       }
  44  |     });
  45  |     await dialog.getByRole('button', { name: /open in email app/i }).click();
  46  |     await expect(page.getByText(/email copied to clipboard/i)).toHaveCount(0);
  47  | 
  48  |     // Mock successful clipboard write and verify toast appears after copying succeeds
  49  |     await page.evaluate(() => {
  50  |       let copiedText = '';
  51  |       Object.defineProperty(navigator, 'clipboard', {
  52  |         configurable: true,
  53  |         value: {
  54  |           writeText: async (text: string) => {
  55  |             copiedText = text;
  56  |             (window as unknown as Record<string, string>).__lastCopiedEmail = copiedText;
  57  |           },
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
> 112 |     await expect(badge).toHaveText('8');
      |                         ^ Error: expect(locator).toHaveText(expected) failed
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
  158 |     await page.getByRole('button', { name: 'Notifications' }).click();
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