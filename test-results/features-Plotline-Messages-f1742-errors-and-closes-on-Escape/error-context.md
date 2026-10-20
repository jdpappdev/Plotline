# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features.spec.ts >> Plotline Messages, Notifications, Focus Prompts & Weekly Reporting >> Message dialog populates real email, encodes mailto, copies to clipboard, handles errors, and closes on Escape
- Location: e2e/features.spec.ts:5:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /send message to soren lindqvist/i }).first()

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
          - generic [ref=e106]:
            - generic [ref=e107]:
              - heading "Team" [level=1] [ref=e108]
              - generic [ref=e109]: 5 online now
            - paragraph [ref=e112]: Studio specialists, discipline capacity, and active deliverable assignments.
          - button "Invite member" [ref=e113] [cursor=pointer]
        - group "Filter team by department" [ref=e118]:
          - button "All" [pressed] [ref=e119] [cursor=pointer]
          - button "Engineering" [ref=e120] [cursor=pointer]
          - button "Design" [ref=e121] [cursor=pointer]
          - button "Marketing" [ref=e122] [cursor=pointer]
          - button "Management" [ref=e123] [cursor=pointer]
        - generic [ref=e124]:
          - article [ref=e125]:
            - generic [ref=e126]:
              - generic [ref=e127]:
                - generic [ref=e128]:
                  - generic [ref=e129]: SL
                  - generic "Online" [ref=e130]
                - generic [ref=e131]:
                  - heading "Soren Lindqvist" [level=2] [ref=e132]
                  - paragraph [ref=e133]: Technical Director
              - generic [ref=e134]: Engineering
            - generic [ref=e135]:
              - generic [ref=e136]:
                - generic [ref=e137]:
                  - generic [ref=e138]: Open
                  - generic [ref=e139]: "2"
                - generic [ref=e140]:
                  - generic [ref=e141]: Completed
                  - generic [ref=e142]: "0"
              - generic [ref=e144]:
                - generic [ref=e145]: Workload
                - generic [ref=e146]: 33%
            - generic [ref=e149]:
              - button "Message" [ref=e150] [cursor=pointer]
              - button "Profile" [ref=e154] [cursor=pointer]
              - button "You can't delete your own profile." [disabled] [ref=e159] [cursor=pointer]
          - article [ref=e160]:
            - generic [ref=e161]:
              - generic [ref=e162]:
                - generic [ref=e163]:
                  - generic [ref=e164]: MV
                  - generic "Online" [ref=e165]
                - generic [ref=e166]:
                  - heading "Mireia Vance" [level=2] [ref=e167]
                  - paragraph [ref=e168]: Design Director
              - generic [ref=e169]: Design
            - generic [ref=e170]:
              - generic [ref=e171]:
                - generic [ref=e172]:
                  - generic [ref=e173]: Open
                  - generic [ref=e174]: "1"
                - generic [ref=e175]:
                  - generic [ref=e176]: Completed
                  - generic [ref=e177]: "2"
              - generic [ref=e179]:
                - generic [ref=e180]: Workload
                - generic [ref=e181]: 37%
            - generic [ref=e184]:
              - button "Message" [ref=e185] [cursor=pointer]
              - button "Profile" [ref=e189] [cursor=pointer]
              - button "Delete Mireia Vance" [ref=e194] [cursor=pointer]
          - article [ref=e195]:
            - generic [ref=e196]:
              - generic [ref=e197]:
                - generic [ref=e198]:
                  - generic [ref=e199]: TA
                  - generic "Online" [ref=e200]
                - generic [ref=e201]:
                  - heading "Tarek Al-Mansoor" [level=2] [ref=e202]
                  - paragraph [ref=e203]: Senior Frontend Engineer
              - generic [ref=e204]: Engineering
            - generic [ref=e205]:
              - generic [ref=e206]:
                - generic [ref=e207]:
                  - generic [ref=e208]: Open
                  - generic [ref=e209]: "3"
                - generic [ref=e210]:
                  - generic [ref=e211]: Completed
                  - generic [ref=e212]: "2"
              - generic [ref=e214]:
                - generic [ref=e215]: Workload
                - generic [ref=e216]: 93%
            - generic [ref=e219]:
              - button "Message" [ref=e220] [cursor=pointer]
              - button "Profile" [ref=e224] [cursor=pointer]
              - button "Delete Tarek Al-Mansoor" [ref=e229] [cursor=pointer]
          - article [ref=e230]:
            - generic [ref=e231]:
              - generic [ref=e232]:
                - generic [ref=e233]:
                  - generic [ref=e234]: KO
                  - generic "Online" [ref=e235]
                - generic [ref=e236]:
                  - heading "Kaelen Okafor" [level=2] [ref=e237]
                  - paragraph [ref=e238]: Delivery Producer
              - generic [ref=e239]: Management
            - generic [ref=e240]:
              - generic [ref=e241]:
                - generic [ref=e242]:
                  - generic [ref=e243]: Open
                  - generic [ref=e244]: "1"
                - generic [ref=e245]:
                  - generic [ref=e246]: Completed
                  - generic [ref=e247]: "2"
              - generic [ref=e249]:
                - generic [ref=e250]: Workload
                - generic [ref=e251]: 27%
            - generic [ref=e254]:
              - button "Message" [ref=e255] [cursor=pointer]
              - button "Profile" [ref=e259] [cursor=pointer]
              - button "Delete Kaelen Okafor" [ref=e264] [cursor=pointer]
          - article [ref=e265]:
            - generic [ref=e266]:
              - generic [ref=e267]:
                - generic [ref=e268]:
                  - generic [ref=e269]: NK
                  - generic "Online" [ref=e270]
                - generic [ref=e271]:
                  - heading "Nadia Kovalenko" [level=2] [ref=e272]
                  - paragraph [ref=e273]: Product Designer
              - generic [ref=e274]: Design
            - generic [ref=e275]:
              - generic [ref=e276]:
                - generic [ref=e277]:
                  - generic [ref=e278]: Open
                  - generic [ref=e279]: "2"
                - generic [ref=e280]:
                  - generic [ref=e281]: Completed
                  - generic [ref=e282]: "4"
              - generic [ref=e284]:
                - generic [ref=e285]: Workload
                - generic [ref=e286]: 53%
            - generic [ref=e289]:
              - button "Message" [ref=e290] [cursor=pointer]
              - button "Profile" [ref=e294] [cursor=pointer]
              - button "Delete Nadia Kovalenko" [ref=e299] [cursor=pointer]
          - article [ref=e300]:
            - generic [ref=e301]:
              - generic [ref=e302]:
                - generic [ref=e303]:
                  - generic [ref=e304]: JT
                  - generic "Away" [ref=e305]
                - generic [ref=e306]:
                  - heading "Juno Takahashi" [level=2] [ref=e307]
                  - paragraph [ref=e308]: Brand & Marketing Lead
              - generic [ref=e309]: Marketing
            - generic [ref=e310]:
              - generic [ref=e311]:
                - generic [ref=e312]:
                  - generic [ref=e313]: Open
                  - generic [ref=e314]: "2"
                - generic [ref=e315]:
                  - generic [ref=e316]: Completed
                  - generic [ref=e317]: "2"
              - generic [ref=e319]:
                - generic [ref=e320]: Workload
                - generic [ref=e321]: 42%
            - generic [ref=e324]:
              - button "Message" [ref=e325] [cursor=pointer]
              - button "Profile" [ref=e329] [cursor=pointer]
              - button "Delete Juno Takahashi" [ref=e334] [cursor=pointer]
          - article [ref=e335]:
            - generic [ref=e336]:
              - generic [ref=e337]:
                - generic [ref=e338]:
                  - generic [ref=e339]: JP
                  - generic "Offline" [ref=e340]
                - generic [ref=e341]:
                  - heading "Jade Polo" [level=2] [ref=e342]
                  - paragraph [ref=e343]: Backend Engineer
              - generic [ref=e344]: Engineering
            - generic [ref=e345]:
              - generic [ref=e346]:
                - generic [ref=e347]:
                  - generic [ref=e348]: Open
                  - generic [ref=e349]: "1"
                - generic [ref=e350]:
                  - generic [ref=e351]: Completed
                  - generic [ref=e352]: "3"
              - generic [ref=e354]:
                - generic [ref=e355]: Workload
                - generic [ref=e356]: 50%
            - generic [ref=e359]:
              - button "Message" [ref=e360] [cursor=pointer]
              - button "Profile" [ref=e364] [cursor=pointer]
              - button "Delete Jade Polo" [ref=e369] [cursor=pointer]
```

# Test source

```ts
  1   | import fs from 'node:fs/promises';
  2   | import { expect, test } from '@playwright/test';
  3   | 
  4   | test.describe('Plotline Messages, Notifications, Focus Prompts & Weekly Reporting', () => {
  5   |   test('Message dialog populates real email, encodes mailto, copies to clipboard, handles errors, and closes on Escape', async ({
  6   |     page,
  7   |   }) => {
  8   |     await page.setViewportSize({ width: 1280, height: 800 });
  9   |     await page.goto('/#team', { waitUntil: 'networkidle' });
  10  | 
  11  |     // Open Message dialog for Soren Lindqvist
  12  |     const messageBtn = page
  13  |       .getByRole('button', { name: /send message to soren lindqvist/i })
  14  |       .first();
> 15  |     await messageBtn.click();
      |                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  112 |     await expect(badge).toHaveText('8');
  113 | 
  114 |     // Open portal-based popover
  115 |     await bellButton.click();
```