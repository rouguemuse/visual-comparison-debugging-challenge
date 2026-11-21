import { defineConfig, devices } from '@playwright/test';

const target = process.env.CHALLENGE_TARGET === 'reference' ? 'reference' : 'starter';
const port = target === 'reference' ? 4174 : 4173;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
    },
  ],
  webServer: {
    command: `npx cross-env CHALLENGE_TARGET=${target} vite --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
