import fs from 'node:fs';
import { defineConfig } from '@playwright/test';

const preinstalledHeadlessShell =
  '/ms-playwright/chrome-headless-shell-linux64/chrome-headless-shell';
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (fs.existsSync(preinstalledHeadlessShell) ? preinstalledHeadlessShell : undefined);

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'list',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.0005,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    launchOptions: executablePath ? { executablePath } : undefined,
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
