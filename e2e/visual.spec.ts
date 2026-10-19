import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page, test } from '@playwright/test';

const FIXED_TIME = '2026-10-18T12:00:00';

const ROUTES = [
  { id: 'Dashboard', hash: '#dashboard' },
  { id: 'Projects', hash: '#projects' },
  { id: 'Tasks', hash: '#tasks' },
  { id: 'Calendar', hash: '#calendar' },
  { id: 'Analytics', hash: '#analytics' },
  { id: 'Team', hash: '#team' },
  { id: 'Settings', hash: '#settings' },
  { id: 'Help', hash: '#help' },
] as const;

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1180, height: 820 },
] as const;

async function prepareDeterministicPage(
  page: Page,
  routeHash: string,
  viewport = { width: 1440, height: 900 }
) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });

  // Fix the clock before navigating so all seed generation and UI dates use 2026-10-18T12:00:00
  await page.clock.setFixedTime(FIXED_TIME);

  // Clear localStorage before app bootstrap so the benchmark seed loads fresh and focus timer stays stopped
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto(`/${routeHash}`, { waitUntil: 'networkidle' });
  await page.locator('main h1').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-testid="mini-focus-timer-pill"]')).toHaveCount(0);
}

for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`visual baseline: ${route.id} at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await prepareDeterministicPage(page, route.hash, viewport);

      await expect(page).toHaveScreenshot(
        `${route.id.toLowerCase()}-${viewport.width}x${viewport.height}.png`,
        {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.0005,
        }
      );
    });
  }

  test(`text snapshot: ${route.id}`, async ({ page }) => {
    await prepareDeterministicPage(page, route.hash, { width: 1440, height: 900 });

    const capturedText = await page.evaluate(() => {
      const normalize = (selector: string) => {
        const el = document.querySelector(selector);
        const raw = el instanceof HTMLElement ? el.innerText : (el?.textContent ?? '');
        return raw.replace(/\s+/g, ' ').trim();
      };
      return `[TOP BAR] ${normalize('header')}\n[SIDEBAR] ${normalize('aside')}\n[MAIN] ${normalize('main')}\n`;
    });

    const baselineFileName = `${route.id.toLowerCase()}-text.txt`;
    const baselinePath = path.join(process.cwd(), 'e2e', '__screenshots__', baselineFileName);
    const approvedBaseline = fs.readFileSync(baselinePath, 'utf8');

    expect(capturedText).toBe(approvedBaseline);
    expect(capturedText).toMatchSnapshot(baselineFileName);
  });
}

test('numbers at fixed clock: Dashboard cards and Analytics 30D metrics', async ({ page }) => {
  await prepareDeterministicPage(page, '#dashboard', { width: 1440, height: 900 });

  const normalizeCardText = async (ariaLabel: string) => {
    const raw = await page.locator(`main button[aria-label="${ariaLabel}"]`).innerText();
    return raw.replace(/\s+/g, ' ').trim();
  };

  expect(await normalizeCardText('View 6 projects')).toContain('Total 6');
  expect(await normalizeCardText('View 1 ended project')).toContain('Ended 1');
  expect(await normalizeCardText('View 4 running projects')).toContain('Running 4');
  expect(await normalizeCardText('View 1 pending project')).toContain('Pending 1');

  await page.goto('/#analytics', { waitUntil: 'networkidle' });
  await page.locator('main h1').waitFor({ state: 'visible' });

  await expect(page.getByRole('button', { name: '30D', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.getByTestId('kpi-tasks-completed')).toHaveText('14');
  await expect(page.getByTestId('kpi-hours-tracked')).toHaveText('123.6h');
  await expect(page.getByTestId('kpi-ontime-delivery')).toHaveText('93%');
});
