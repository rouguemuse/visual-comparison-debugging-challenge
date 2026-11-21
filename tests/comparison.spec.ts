import { test, expect } from '@playwright/test';

test.describe('The Misaligned Comparison — Interactive Before/After Slider Suite', () => {
  test('1. [Parity & Setup] renders the 85-node shared specimen with 100% DOM and text parity across all studies', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');

    for (const studyId of ['plaidis', 'linear', 'stripe'] as const) {
      await page.click(`[data-study-btn="${studyId}"]`);

      const parity = await page.evaluate((id) => {
        const checkViewport = (vp: 'desktop' | 'mobile') => {
          const neutralEl = document.querySelector(
            `[data-specimen-variant="neutral"][data-specimen-viewport="${vp}"]`
          );
          const studyEl = document.querySelector(
            `[data-specimen-variant="${id}"][data-specimen-viewport="${vp}"]`
          );
          if (!neutralEl || !studyEl) return null;
          const neutralNodes = Array.from(neutralEl.querySelectorAll('*'));
          const studyNodes = Array.from(studyEl.querySelectorAll('*'));
          const neutralTags = neutralNodes.map((n) => n.tagName).join(',');
          const studyTags = studyNodes.map((n) => n.tagName).join(',');
          const neutralText = (neutralEl.textContent || '').replace(/\s+/g, ' ').trim();
          const studyText = (studyEl.textContent || '').replace(/\s+/g, ' ').trim();
          return {
            count: neutralNodes.length,
            studyCount: studyNodes.length,
            identicalTags: neutralTags === studyTags,
            identicalText: neutralText === studyText,
          };
        };
        return {
          desktop: checkViewport('desktop'),
          mobile: checkViewport('mobile'),
        };
      }, studyId);

      expect(parity.desktop).not.toBeNull();
      expect(parity.desktop?.count).toBe(85);
      expect(parity.desktop?.studyCount).toBe(85);
      expect(parity.desktop?.identicalTags).toBe(true);
      expect(parity.desktop?.identicalText).toBe(true);

      expect(parity.mobile).not.toBeNull();
      expect(parity.mobile?.count).toBe(85);
      expect(parity.mobile?.studyCount).toBe(85);
      expect(parity.mobile?.identicalTags).toBe(true);
      expect(parity.mobile?.identicalText).toBe(true);
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('2. [Alignment Tolerance] aligns Before (Neutral) and After (Study) specimen left plumb edges within <= 1px across all studies and viewports', async ({
    page,
  }) => {
    await page.goto('/');

    const anchors = ['header-brand', 'hero-heading', 'card-grid', 'ledger'] as const;

    for (const modeId of ['desktop', 'mobile'] as const) {
      await page.click(`[data-mode-btn="${modeId}"]`);

      for (const studyId of ['plaidis', 'linear', 'stripe'] as const) {
        await page.click(`[data-study-btn="${studyId}"]`);

        for (const anchor of anchors) {
          const delta = await page.evaluate((anchorKey) => {
            const stage = document.querySelector('[data-slider-stage="true"]');
            if (!stage) throw new Error('Active slider stage not found');
            const beforeAnchor = stage.querySelector(
              `[data-layer="before"] [data-specimen-anchor="${anchorKey}"]`
            );
            const afterAnchor = stage.querySelector(
              `[data-layer="after"] [data-specimen-anchor="${anchorKey}"]`
            );
            if (!beforeAnchor || !afterAnchor) {
              throw new Error(`Missing specimen anchor: ${anchorKey}`);
            }
            const beforeRect = beforeAnchor.getBoundingClientRect();
            const afterRect = afterAnchor.getBoundingClientRect();
            return Math.abs(beforeRect.left - afterRect.left);
          }, anchor);

          expect(
            delta,
            `Expected ${studyId} (${modeId}) anchor "${anchor}" left plumb edge to match neutral baseline within <= 1px, got ${delta.toFixed(2)}px drift`
          ).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('3. [Min/Max Positions & Handle Unclipped] keeps the 44x44 slider handle 100% inside the stage bounds at 0% (Transformed), 50% (Split), and 100% (Original)', async ({
    page,
  }) => {
    await page.goto('/');

    const stage = page.locator('[data-slider-stage="true"]');
    const handle = page.locator('[data-slider-stage="true"] [role="slider"]');

    // 1. Test Split (50%): handle center should align with stage center, and handle must be inside stage
    await page.click('[data-comparison-view="split"]');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');
    const splitBox = await stage.boundingBox();
    const splitHandleBox = await handle.boundingBox();
    expect(splitBox).not.toBeNull();
    expect(splitHandleBox).not.toBeNull();
    if (splitBox && splitHandleBox) {
      const handleCenterX = splitHandleBox.x + splitHandleBox.width / 2;
      const expectedCenterX = splitBox.x + splitBox.width * 0.5;
      expect(Math.abs(handleCenterX - expectedCenterX)).toBeLessThanOrEqual(1.5);
      expect(splitHandleBox.x).toBeGreaterThanOrEqual(splitBox.x - 1);
      expect(splitHandleBox.x + splitHandleBox.width).toBeLessThanOrEqual(
        splitBox.x + splitBox.width + 1
      );
    }

    // 2. Test Transformed (0%): handle left edge must NOT protrude past stage left edge (no clipping)
    await page.click('[data-comparison-view="transformed"]');
    await expect(handle).toHaveAttribute('aria-valuenow', '0');
    const minStageBox = await stage.boundingBox();
    const minHandleBox = await handle.boundingBox();
    expect(minStageBox).not.toBeNull();
    expect(minHandleBox).not.toBeNull();
    if (minStageBox && minHandleBox) {
      expect(
        minHandleBox.x,
        `Handle left edge (${minHandleBox.x}px) is clipped outside stage left edge (${minStageBox.x}px) at 0%`
      ).toBeGreaterThanOrEqual(minStageBox.x - 1);
      expect(minHandleBox.x + minHandleBox.width).toBeLessThanOrEqual(
        minStageBox.x + minStageBox.width + 1
      );
    }

    // 3. Test Original (100%): handle right edge must NOT protrude past stage right edge (no clipping)
    await page.click('[data-comparison-view="original"]');
    await expect(handle).toHaveAttribute('aria-valuenow', '100');
    const maxStageBox = await stage.boundingBox();
    const maxHandleBox = await handle.boundingBox();
    expect(maxStageBox).not.toBeNull();
    expect(maxHandleBox).not.toBeNull();
    if (maxStageBox && maxHandleBox) {
      expect(
        maxHandleBox.x + maxHandleBox.width,
        `Handle right edge (${maxHandleBox.x + maxHandleBox.width}px) is clipped outside stage right edge (${maxStageBox.x + maxStageBox.width}px) at 100%`
      ).toBeLessThanOrEqual(maxStageBox.x + maxStageBox.width + 1);
      expect(maxHandleBox.x).toBeGreaterThanOrEqual(maxStageBox.x - 1);
    }
  });

  test('4. [Resizing & Scale Sync] preserves divider percentage, clip-path synchronization, and specimen scale factor across viewport resizes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const stage = page.locator('[data-slider-stage="true"]');
    const divider = page.locator('[data-slider-stage="true"] [data-slider-divider="true"]');

    // Set slider to 50% split at 1440x900
    await page.click('[data-comparison-view="split"]');

    // Resize viewport down to 768x1024 and then 600x900
    for (const vp of [
      { width: 768, height: 1024 },
      { width: 600, height: 900 },
    ]) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(100);

      const stageBox = await stage.boundingBox();
      const dividerBox = await divider.boundingBox();
      expect(stageBox).not.toBeNull();
      expect(dividerBox).not.toBeNull();

      if (stageBox && dividerBox) {
        const dividerCenterX = dividerBox.x + dividerBox.width / 2;
        const expectedDividerX = stageBox.x + stageBox.width * 0.5;
        expect(
          Math.abs(dividerCenterX - expectedDividerX),
          `Divider drifted during resize to ${vp.width}px: expected x=${expectedDividerX.toFixed(1)}, got x=${dividerCenterX.toFixed(1)}`
        ).toBeLessThanOrEqual(2);
      }

      // Verify clip-path boundary and specimen canvas scaled width match the resized stage
      const syncMetrics = await page.evaluate(() => {
        const stageEl = document.querySelector('[data-slider-stage="true"]');
        const beforeLayer = stageEl?.querySelector('[data-layer="before"]') as HTMLElement | null;
        const canvasEl = stageEl?.querySelector(
          '[data-layer="after"] [data-specimen-canvas="true"]'
        ) as HTMLElement | null;
        if (!stageEl || !beforeLayer || !canvasEl) return null;

        const stageRect = stageEl.getBoundingClientRect();
        const canvasRect = canvasEl.getBoundingClientRect();
        const inlineClip = beforeLayer.style.clipPath || '';

        // Parse inset(0 <right> 0 0) where <right> can be % or px
        const matchPct = inlineClip.match(/inset\(\s*0(?:px|%)?\s+([\d.]+)%/);
        const matchPx = inlineClip.match(/inset\(\s*0(?:px|%)?\s+([\d.]+)px/);
        let clipBoundaryOffsetPx = -1;
        if (matchPct) {
          const rightPct = parseFloat(matchPct[1]);
          clipBoundaryOffsetPx = stageRect.width * (1 - rightPct / 100);
        } else if (matchPx) {
          const rightPx = parseFloat(matchPx[1]);
          clipBoundaryOffsetPx = stageRect.width - rightPx;
        }

        return {
          stageWidth: stageRect.width,
          canvasWidth: canvasRect.width,
          clipBoundaryOffsetPx,
          expectedHalfWidth: stageRect.width * 0.5,
        };
      });

      expect(syncMetrics).not.toBeNull();
      if (syncMetrics) {
        expect(
          Math.abs(syncMetrics.clipBoundaryOffsetPx - syncMetrics.expectedHalfWidth),
          `Clip-path boundary desynchronized from 50% split after resize to ${vp.width}px`
        ).toBeLessThanOrEqual(2);
        expect(
          Math.abs(syncMetrics.canvasWidth - syncMetrics.stageWidth),
          `Specimen canvas scaled width (${syncMetrics.canvasWidth.toFixed(1)}px) desynchronized from stage width (${syncMetrics.stageWidth.toFixed(1)}px)`
        ).toBeLessThanOrEqual(2);
      }
    }
  });

  test('5. [Pointer Capture & Outside-Container Drag] maintains drag tracking when pointer leaves the comparison container and clamps to [0%, 100%]', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const stage = page.locator('[data-slider-stage="true"]');
    const handle = page.locator('[data-slider-stage="true"] [role="slider"]');
    const stageBox = await stage.boundingBox();
    expect(stageBox).not.toBeNull();
    if (!stageBox) return;

    const startX = stageBox.x + stageBox.width * 0.5;
    const startY = stageBox.y + stageBox.height * 0.5;

    // Press pointer down at center of stage
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await expect(stage).toHaveAttribute('data-dragging', 'true');

    // Move pointer OUTSIDE the stage vertically (80px above top edge) and to 75% horizontally
    const outsideTopY = Math.max(5, stageBox.y - 80);
    const target75X = stageBox.x + stageBox.width * 0.75;
    await page.mouse.move(target75X, outsideTopY, { steps: 5 });

    // Must still be dragging and must have updated slider to ~75%
    await expect(stage).toHaveAttribute('data-dragging', 'true');
    const valAt75 = Number(await handle.getAttribute('aria-valuenow'));
    expect(Math.abs(valAt75 - 75)).toBeLessThanOrEqual(1);

    // Drag far outside the LEFT edge of the container (-100px past stageBox.x) while outside vertically
    await page.mouse.move(Math.max(2, stageBox.x - 100), outsideTopY, { steps: 5 });
    await expect(handle).toHaveAttribute('aria-valuenow', '0');

    // Drag far outside the RIGHT edge of the container (+100px past stageBox.x + stageBox.width)
    await page.mouse.move(stageBox.x + stageBox.width + 100, outsideTopY, { steps: 5 });
    await expect(handle).toHaveAttribute('aria-valuenow', '100');

    // Release pointer outside the container and verify drag state cleans up
    await page.mouse.up();
    await expect(stage).toHaveAttribute('data-dragging', 'false');

    // Moving the mouse after release must NOT change the slider value
    await page.mouse.move(stageBox.x + stageBox.width * 0.25, startY);
    await expect(handle).toHaveAttribute('aria-valuenow', '100');
  });

  test('6. [Pointer Cancellation Cleanup] cleans up drag state and releases pointer capture on pointercancel', async ({
    page,
  }) => {
    await page.goto('/');

    const stage = page.locator('[data-slider-stage="true"]');
    const handle = page.locator('[data-slider-stage="true"] [role="slider"]');

    // Step 1: Dispatch pointerdown at 50% and pointermove to 30%
    await page.evaluate(() => {
      const stageEl = document.querySelector('[data-slider-stage="true"]') as HTMLElement | null;
      if (!stageEl) return;
      const rect = stageEl.getBoundingClientRect();

      stageEl.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          pointerId: 42,
          button: 0,
          clientX: rect.left + rect.width * 0.5,
          clientY: rect.top + rect.height * 0.5,
        })
      );

      stageEl.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          cancelable: true,
          pointerId: 42,
          clientX: rect.left + rect.width * 0.3,
          clientY: rect.top + rect.height * 0.5,
        })
      );
    });

    await expect(stage).toHaveAttribute('data-dragging', 'true');
    await expect(handle).toHaveAttribute('aria-valuenow', '30');

    // Step 2: Dispatch pointercancel and verify drag state terminates and subsequent moves are ignored
    await page.evaluate(() => {
      const stageEl = document.querySelector('[data-slider-stage="true"]') as HTMLElement | null;
      if (!stageEl) return;
      const rect = stageEl.getBoundingClientRect();

      stageEl.dispatchEvent(
        new PointerEvent('pointercancel', {
          bubbles: true,
          cancelable: true,
          pointerId: 42,
        })
      );

      // Attempt another pointermove after pointercancel; it must be ignored
      stageEl.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          cancelable: true,
          pointerId: 42,
          clientX: rect.left + rect.width * 0.8,
          clientY: rect.top + rect.height * 0.5,
        })
      );
    });

    await expect(stage).toHaveAttribute('data-dragging', 'false');
    await expect(handle).toHaveAttribute('aria-valuenow', '30');
  });

  test('7. [Keyboard Accessibility & Mode Sync] supports WAI-ARIA slider keys (Arrow, Shift+Arrow, PageUp/PageDown, Home/End) and syncs Original/Split/Transformed mode buttons', async ({
    page,
  }) => {
    await page.goto('/');

    const handle = page.locator('[data-slider-stage="true"] [role="slider"]');
    const btnOriginal = page.locator('[data-comparison-view="original"]');
    const btnSplit = page.locator('[data-comparison-view="split"]');
    const btnTransformed = page.locator('[data-comparison-view="transformed"]');

    await page.click('[data-comparison-view="split"]');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');
    await expect(btnSplit).toHaveAttribute('aria-pressed', 'true');

    await handle.focus();

    // Standard 2% arrow steps
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '52');
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');
    await page.keyboard.press('ArrowUp');
    await expect(handle).toHaveAttribute('aria-valuenow', '52');
    await page.keyboard.press('ArrowDown');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');

    // Shift + Arrow 10% steps
    await page.keyboard.press('Shift+ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '60');
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');

    // PageUp / PageDown 10% steps
    await page.keyboard.press('PageUp');
    await expect(handle).toHaveAttribute('aria-valuenow', '60');
    await page.keyboard.press('PageDown');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');

    // Home -> 0% (Transformed mode button active)
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuenow', '0');
    await expect(btnTransformed).toHaveAttribute('aria-pressed', 'true');
    await expect(btnSplit).toHaveAttribute('aria-pressed', 'false');

    // End -> 100% (Original mode button active)
    await page.keyboard.press('End');
    await expect(handle).toHaveAttribute('aria-valuenow', '100');
    await expect(btnOriginal).toHaveAttribute('aria-pressed', 'true');
    await expect(btnTransformed).toHaveAttribute('aria-pressed', 'false');

    // Stepping back from 100% returns mode button to Split
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '98');
    await expect(btnSplit).toHaveAttribute('aria-pressed', 'true');
    await expect(btnOriginal).toHaveAttribute('aria-pressed', 'false');
  });
});
