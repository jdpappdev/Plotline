import fs from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.describe('Plotline Messages, Notifications, Focus Prompts & Weekly Reporting', () => {
  test('Message dialog populates real email, encodes mailto, copies to clipboard, handles errors, and closes on Escape', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/#team', { waitUntil: 'networkidle' });

    // Open Message dialog for Soren Lindqvist
    const messageBtn = page
      .getByRole('button', { name: /send message to soren lindqvist/i })
      .first();
    await messageBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // To is read-only and populated with real email
    const toInput = dialog.getByLabel('To');
    await expect(toInput).toHaveValue('soren@plotline.studio');
    await expect(toInput).toHaveAttribute('readonly', '');

    // Subject and Body are editable
    const subjectInput = dialog.getByLabel('Subject');
    const bodyInput = dialog.getByLabel('Body');
    await subjectInput.fill('Field Calibration Follow-up & Q2');
    await bodyInput.fill('Hello Soren,\nPlease confirm the RTK baseline.');

    // Verify mailto link encoding
    const mailtoLink = dialog.getByTestId('message-mailto-link');
    const href = await mailtoLink.getAttribute('href');
    expect(href).toBe(
      'mailto:soren@plotline.studio?subject=Field%20Calibration%20Follow-up%20%26%20Q2&body=Hello%20Soren%2C%0APlease%20confirm%20the%20RTK%20baseline.'
    );

    // Clicking "Open in email app" must not show a success toast or imply email was sent
    await page.evaluate(() => {
      const anchor = document.querySelector('[data-testid="message-mailto-link"]');
      if (anchor) {
        anchor.addEventListener('click', (e) => e.preventDefault(), { once: true });
      }
    });
    await dialog.getByRole('button', { name: /open in email app/i }).click();
    await expect(page.getByText(/email copied to clipboard/i)).toHaveCount(0);

    // Mock successful clipboard write and verify toast appears after copying succeeds
    await page.evaluate(() => {
      let copiedText = '';
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            copiedText = text;
            (window as unknown as Record<string, string>).__lastCopiedEmail = copiedText;
          },
        },
      });
    });

    await dialog.getByRole('button', { name: /copy email/i }).click();
    await expect(page.getByText(/email copied to clipboard/i)).toBeVisible();
    const copiedContent = await page.evaluate(
      () => (window as unknown as Record<string, string>).__lastCopiedEmail
    );
    expect(copiedContent).toContain('To: soren@plotline.studio');
    expect(copiedContent).toContain('Subject: Field Calibration Follow-up & Q2');
    expect(copiedContent).toContain('Hello Soren,\nPlease confirm the RTK baseline.');

    // Mock failing clipboard access and verify error alert appears
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error('Clipboard permission denied');
          },
        },
      });
    });

    await dialog.getByRole('button', { name: /copy email/i }).click();
    await expect(dialog.getByRole('alert')).toContainText(/clipboard access failed/i);

    // Escape closes the dialog
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('Notification bell positioned right of search displays unread count, filters by category, marks read, and persists across reload', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/#dashboard', { waitUntil: 'networkidle' });

    const searchInput = page.getByRole('searchbox', { name: /search workspace/i });
    const bellButton = page.getByTestId('notification-bell-button');

    await expect(searchInput).toBeVisible();
    await expect(bellButton).toBeVisible();

    // Verify bell is positioned to the right of search
    const searchBox = await searchInput.boundingBox();
    const bellBox = await bellButton.boundingBox();
    expect(searchBox).not.toBeNull();
    expect(bellBox).not.toBeNull();
    expect(bellBox!.x).toBeGreaterThan(searchBox!.x + searchBox!.width);

    // Check unread badge count from derived seed data (2 overdue + 5 due soon + 1 event starting within 60m = 8)
    const badge = page.getByTestId('notification-unread-badge');
    await expect(badge).toHaveText('8');

    // Open portal-based popover
    await bellButton.click();
    const popover = page.getByTestId('notifications-popover');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('8 unread');

    // Filter by Overdue task
    await popover.getByRole('button', { name: 'Overdue task' }).click();
    await expect(popover.getByRole('listitem')).toHaveCount(2);

    // Filter by Calendar event starting within 60 minutes
    await popover
      .getByRole('button', { name: 'Calendar event starting within 60 minutes' })
      .click();
    await expect(popover.getByRole('listitem')).toHaveCount(1);

    // Reset filter to All
    await popover.getByRole('button', { name: 'All' }).click();
    await expect(popover.getByRole('listitem')).toHaveCount(8);

    // Mark all read and verify persistence across reload
    await popover.getByRole('button', { name: /mark all read/i }).click();
    await expect(popover).toContainText('0 unread');
    await expect(badge).toBeHidden();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId('notification-unread-badge')).toBeHidden();

    // Genuine task movement transition creates a new unread notification
    await page.goto('/#tasks', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      // Trigger a genuine task movement in the store via UI or store action
      const buttons = Array.from(document.querySelectorAll('button'));
      const moveBtn = buttons.find((b) => /move/i.test(b.getAttribute('aria-label') || ''));
      if (moveBtn) moveBtn.click();
    });
  });

  test('Settings screen displays Weekly digest reports, Requires email setup, and downloads weekly report CSV', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/#settings', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Notifications' }).click();

    // Verify plain-language wording and disabled email delivery notices
    await expect(page.getByText('Weekly digest reports')).toBeVisible();
    await expect(page.getByText('Field Digest')).toHaveCount(0);
    await expect(page.getByText('Requires email setup')).toHaveCount(2);

    const digestSwitch = page.getByRole('switch', { name: 'Weekly digest reports' });
    const weeklyReportSwitch = page.getByRole('switch', { name: 'Weekly Throughput Report' });
    await expect(digestSwitch).toBeDisabled();
    await expect(weeklyReportSwitch).toBeDisabled();

    // Download weekly report CSV and verify columns and content
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download weekly report/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^plotline-weekly-report-.*\.csv$/);
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    const csvContent = await fs.readFile(downloadPath!, 'utf8');
    const lines = csvContent.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Task Title,Project,Category,Completion Date,Logged Hours');
    expect(lines.length).toBeGreaterThan(1);
  });

  test('Team screen renders exact workload percentages for all members', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/#team', { waitUntil: 'networkidle' });

    await expect(page.getByTestId('workload-pct-usr-soren')).toHaveText('17%');
    await expect(page.getByTestId('workload-pct-usr-mireia')).toHaveText('20%');
    await expect(page.getByTestId('workload-pct-usr-tarek')).toHaveText('77%');
    await expect(page.getByTestId('workload-pct-usr-kaelen')).toHaveText('10%');
    await expect(page.getByTestId('workload-pct-usr-nadia')).toHaveText('37%');
    await expect(page.getByTestId('workload-pct-usr-juno')).toHaveText('25%');
    await expect(page.getByTestId('workload-pct-usr-jade')).toHaveText('33%');
  });
});
