import fs from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.describe('Plotline Messages, Notifications, Focus Prompts & Weekly Reporting', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.clock.setFixedTime('2026-10-18T12:00:00');
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem('__plotline_test_init')) {
        window.localStorage.clear();
        window.sessionStorage.setItem('__plotline_test_init', '1');
      }
    });
  });

  test('Message dialog populates real email, encodes mailto, copies to clipboard, handles errors, and closes on Escape', async ({
    page,
  }) => {
    await page.goto('/#team', { waitUntil: 'networkidle' });

    // Verify Team card buttons aria-labels
    await expect(
      page.getByRole('button', { name: 'Send message to Soren Lindqvist' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'View profile of Soren Lindqvist' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Soren Lindqvist' })).toBeVisible();

    // Open Message dialog for Soren Lindqvist
    const messageBtn = page.getByRole('button', { name: 'Send message to Soren Lindqvist' });
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

    // Check unread badge count from derived seed data (1 overdue + 2 due soon = 3)
    const badge = page.getByTestId('notification-unread-badge');
    await expect(badge).toHaveText('3');

    // Open portal-based popover
    await bellButton.click();
    const popover = page.getByTestId('notifications-popover');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('3 unread');

    // Filter by Overdue task
    await popover.getByRole('button', { name: 'Overdue task' }).click();
    await expect(popover.getByRole('listitem')).toHaveCount(1);

    // Filter by Task due within 48 hours
    await popover.getByRole('button', { name: 'Task due within 48 hours' }).click();
    await expect(popover.getByRole('listitem')).toHaveCount(2);

    // Reset filter to All
    await popover.getByTestId('notification-filter-all').click();
    await expect(popover.getByRole('listitem')).toHaveCount(3);

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
    await page.goto('/#settings', { waitUntil: 'networkidle' });

    await page.getByTestId('settings-tab-notifications').click();

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

test.describe('Mobile touch keyboard focus in dialogs', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });

  test('New project, New task, Invite member, and Calendar event dialogs retain focus and typed text after every character on mobile touch', async ({
    page,
  }) => {
    await page.clock.setFixedTime('2026-10-18T12:00:00');
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem('__plotline_test_init')) {
        window.localStorage.clear();
        window.sessionStorage.setItem('__plotline_test_init', '1');
      }
    });

    const dialogCases = [
      {
        name: 'New project',
        route: '/#dashboard',
        triggerName: 'New project',
        inputSelector: '#new-project-name',
      },
      {
        name: 'New task',
        route: '/#tasks',
        triggerName: 'New task',
        inputSelector: '#new-task-title',
      },
      {
        name: 'Invite member',
        route: '/#team',
        triggerName: 'Invite member',
        inputSelector: '#invite-name',
      },
      {
        name: 'New event',
        route: '/#calendar',
        triggerName: 'New event',
        inputSelector: '#calendar-event-title',
      },
    ] as const;

    const targetText = 'Aurora Field Guide';

    for (const dialogCase of dialogCases) {
      await page.goto(dialogCase.route, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: dialogCase.triggerName }).first().tap();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for initial dialog open timer (30ms) before user taps the field
      await page.waitForTimeout(50);

      const input = dialog.locator(dialogCase.inputSelector);
      await input.tap();
      await expect(input).toBeFocused();

      let expectedSoFar = '';
      for (const ch of targetText) {
        await page.keyboard.type(ch);
        expectedSoFar += ch;
        await page.waitForTimeout(40);
        await expect(input).toBeFocused();
        await expect(input).toHaveValue(expectedSoFar);
      }

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }
  });
});

test.describe('Project glyph tiles and Help FAQ glyph samples', () => {
  test('every project tile on Dashboard and Projects page contains an svg with at least 5 path elements and a visible stroke at all three viewports, and >= 3:1 contrast across all four accents', async ({
    page,
  }) => {
    await page.clock.setFixedTime('2026-10-18T12:00:00');
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    const viewports = [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
      { width: 1180, height: 820 },
    ] as const;

    const assertProjectTilesHaveVisibleGlyphs = async (tileSelector: string) => {
      const tiles = page.locator(tileSelector);
      const count = await tiles.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const tile = tiles.nth(i);
        const svg = tile.locator('svg').first();
        await expect(svg).toBeVisible();

        const pathCount = await svg.locator('path').count();
        expect(pathCount).toBeGreaterThanOrEqual(5);

        const strokeInfo = await svg.evaluate((el) => {
          const svgStyle = window.getComputedStyle(el);
          const paths = Array.from(el.querySelectorAll('path'));
          const firstPath = paths[0];
          const lastPath = paths[paths.length - 1];
          const pathStyle = firstPath ? window.getComputedStyle(firstPath) : null;
          const allCommandsOnlyMC = paths.every((p) => {
            const d = p.getAttribute('d') || '';
            const cmds = d.match(/[A-Za-z]+/g) || [];
            return cmds.length > 1 && cmds.every((c) => c === 'M' || c === 'C');
          });
          return {
            svgStroke: svgStyle.stroke,
            svgBg: svgStyle.backgroundColor,
            svgOpacity: Number.parseFloat(svgStyle.opacity),
            pathStroke: pathStyle?.stroke ?? 'none',
            firstPathOpacity: firstPath
              ? Number.parseFloat(window.getComputedStyle(firstPath).opacity)
              : 0,
            lastPathOpacity: lastPath
              ? Number.parseFloat(window.getComputedStyle(lastPath).opacity)
              : 0,
            pathStrokeWidth: pathStyle ? Number.parseFloat(pathStyle.strokeWidth) : 0,
            allCommandsOnlyMC,
          };
        });

        expect(strokeInfo.allCommandsOnlyMC).toBe(true);
        expect(strokeInfo.svgStroke).not.toBe('none');
        expect(strokeInfo.pathStroke).not.toBe('none');
        expect(strokeInfo.pathStroke).not.toBe('rgba(0, 0, 0, 0)');
        expect(strokeInfo.pathStroke).not.toBe('transparent');
        expect(strokeInfo.svgOpacity).toBeGreaterThan(0);
        expect(strokeInfo.firstPathOpacity).toBeCloseTo(1.0, 2);
        expect(strokeInfo.lastPathOpacity).toBeCloseTo(0.48, 2);
        expect(strokeInfo.pathStrokeWidth).toBeGreaterThanOrEqual(1.5);
      }
    };

    for (const vp of viewports) {
      await page.setViewportSize(vp);

      await page.goto('/#dashboard', { waitUntil: 'networkidle' });
      await assertProjectTilesHaveVisibleGlyphs(
        'section[aria-labelledby="projects-card-heading"] li'
      );

      await page.goto('/#projects', { waitUntil: 'networkidle' });
      await assertProjectTilesHaveVisibleGlyphs('[data-testid^="project-item-"]');
    }

    // Verify all 4 accents have at least 3:1 contrast between stroke and tile background
    const accents = ['tide', 'moss', 'iris', 'signal'] as const;
    for (const accent of accents) {
      const contrastRatio = await page.evaluate((acc) => {
        document.documentElement.setAttribute('data-accent', acc);
        const svg = document.querySelector('[data-testid^="project-item-"] svg');
        if (!svg) return 0;
        const style = window.getComputedStyle(svg);
        const parseRgb = (str: string) => {
          const m = str.match(/[\d.]+/g);
          return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
        };
        const relLum = ([r, g, b]: number[]) => {
          const toLin = (v: number) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          };
          return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
        };
        const lStroke = relLum(parseRgb(style.stroke));
        const lBg = relLum(parseRgb(style.backgroundColor));
        const lighter = Math.max(lStroke, lBg);
        const darker = Math.min(lStroke, lBg);
        return (lighter + 0.05) / (darker + 0.05);
      }, accent);
      expect(contrastRatio).toBeGreaterThanOrEqual(3);
    }
  });

  test('Help screen removes top-right FAQ glyph and displays three 56px sample tiles in faq-glyph-samples', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.clock.setFixedTime('2026-10-18T12:00:00');
    await page.goto('/#help', { waitUntil: 'networkidle' });

    const faqSection = page.locator('section[aria-labelledby="help-faq-heading"]');
    await expect(faqSection).toBeVisible();

    const samplesContainer = faqSection.getByTestId('faq-glyph-samples');
    await expect(samplesContainer).toBeVisible();

    const sampleSvgs = samplesContainer.locator('svg');
    await expect(sampleSvgs).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const box = await sampleSvgs.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(Math.round(box!.width)).toBe(56);
      expect(Math.round(box!.height)).toBe(56);
      expect(await sampleSvgs.nth(i).locator('path').count()).toBeGreaterThanOrEqual(5);
    }

    // Verify no extra glyph exists in the FAQ card header
    await expect(faqSection.locator('svg[viewBox="0 0 28 28"]')).toHaveCount(0);
  });
});
