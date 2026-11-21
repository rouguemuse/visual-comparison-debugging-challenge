import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const REF_DIR = path.join(ROOT, 'references');

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // retry
      }
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Server at ${url} did not start within ${timeoutMs}ms`));
      }
      setTimeout(check, 250);
    };
    check();
  });
}

async function withViteServer(target, port, fn) {
  const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(
    process.execPath,
    [viteBin, '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    {
      cwd: ROOT,
      env: { ...process.env, CHALLENGE_TARGET: target },
      stdio: 'ignore',
    }
  );
  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(url);
    await fn(url);
  } finally {
    child.kill();
  }
}

async function main() {
  fs.mkdirSync(REF_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Capture Expected Behavior from Reference Solution
    await withViteServer('reference', 4184, async (url) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });

      const stage = page.locator('[data-slider-stage="true"]');

      // Expected 50% Split (Linear)
      await page.click('[data-study-btn="linear"]');
      await page.click('[data-comparison-view="split"]');
      await page.waitForTimeout(100);
      await stage.screenshot({
        path: path.join(REF_DIR, 'expected-split-50-desktop.png'),
      });

      // Expected 100% Original (handle unclipped at right edge)
      await page.click('[data-comparison-view="original"]');
      await page.waitForTimeout(100);
      await stage.screenshot({
        path: path.join(REF_DIR, 'expected-original-100-unclipped.png'),
      });

      // Expected 0% Transformed (handle unclipped at left edge)
      await page.click('[data-comparison-view="transformed"]');
      await page.waitForTimeout(100);
      await stage.screenshot({
        path: path.join(REF_DIR, 'expected-transformed-0-unclipped.png'),
      });

      // Expected 50% Split after resizing viewport to 768x1024
      await page.click('[data-comparison-view="split"]');
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(150);
      await stage.screenshot({
        path: path.join(REF_DIR, 'expected-resize-768-split.png'),
      });

      await context.close();
    });

    // 2. Capture Reproducible Failing Behavior from Starter
    await withViteServer('starter', 4183, async (url) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });

      const stage = page.locator('[data-slider-stage="true"]');

      // Failing 50% Split (Linear: 24px vs 46px horizontal padding misalignment)
      await page.click('[data-study-btn="linear"]');
      await page.click('[data-comparison-view="split"]');
      await page.waitForTimeout(100);
      await stage.screenshot({
        path: path.join(REF_DIR, 'failing-starter-split-misaligned-desktop.png'),
      });

      // Failing 100% Original (handle right half clipped at 100%)
      await page.click('[data-comparison-view="original"]');
      await page.waitForTimeout(100);
      await stage.screenshot({
        path: path.join(REF_DIR, 'failing-starter-handle-clipped-100-percent.png'),
      });

      // Failing 0% Transformed (handle left half clipped at 0%)
      await page.click('[data-comparison-view="transformed"]');
      await page.waitForTimeout(100);
      await stage.screenshot({
        path: path.join(REF_DIR, 'failing-starter-handle-clipped-0-percent.png'),
      });

      // Failing 50% Split after resizing viewport to 768x1024 (divider/clip/scale desynchronization)
      await page.click('[data-comparison-view="split"]');
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(150);
      await stage.screenshot({
        path: path.join(REF_DIR, 'failing-starter-resize-desync-768.png'),
      });

      await context.close();
    });
  } finally {
    await browser.close();
  }

  console.log('Captured reference and failing screenshots in references/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
