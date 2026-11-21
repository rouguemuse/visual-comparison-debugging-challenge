# Verification Report: The Misaligned Comparison

**Date:** 2026-11-20  
**Project Root:** `misaligned-comparison-challenge/`  
**Source Attribution:** Derived from `rouguemuse/contextmuse` commits `289316d577f4b73383ff36529cc0f69622eeb4ac` and `7906e56ad4efd58987d182a83bf7e89029e328d5`

---

## 1. Execution Environment

| Component | Version / Configuration |
| :--- | :--- |
| **Operating System** | Windows x64 (PowerShell) |
| **Node.js** | `v24.14.1` |
| **npm** | `11.11.0` |
| **Vite** | `v6.4.6` |
| **React / React DOM** | `19.2.5` |
| **TypeScript** | `5.9.3` |
| **ESLint** | `9.39.5` |
| **Playwright (`@playwright/test`)** | `1.65.1` (Chromium Headless Shell `159.0.8154.6` / build `v1255`, `1440×900` @ `2x DPR`) |

---

## 2. Install, Typecheck, Lint & Production Build Verification

### 2.1 Dependency & Browser Installation

**Commands Executed:**
```bash
npm install
npx playwright install chromium
```

**Result:**
- `added 182 packages, and audited 185 packages in 27s` (`0 vulnerabilities`).
- Downloaded Chromium `159.0.8154.6` (`chromium-1255` and `chromium_headless_shell-1255`).

### 2.2 TypeScript Typechecking (`npm run typecheck`)

**Command Executed:**
```bash
npm run typecheck
```

**Output:**
```text
> misaligned-comparison-challenge@1.0.0 typecheck
> tsc --noEmit -p tsconfig.json
```
*(Exit code `0` — zero type errors across `starter/src`, `reference-solution/src`, `tests/`, `vite.config.ts`, and `playwright.config.ts`.)*

### 2.3 ESLint Verification (`npm run lint`)

**Command Executed:**
```bash
npm run lint
```

**Output:**
```text
> misaligned-comparison-challenge@1.0.0 lint
> eslint starter/src reference-solution/src tests
```
*(Exit code `0` — zero warnings or errors.)*

### 2.4 Production Bundle Builds (`npm run build`)

**Command Executed:**
```bash
npm run build
```

**Output:**
```text
> misaligned-comparison-challenge@1.0.0 build
> npm run typecheck && npm run build:starter && npm run build:reference

> misaligned-comparison-challenge@1.0.0 typecheck
> tsc --noEmit -p tsconfig.json

> misaligned-comparison-challenge@1.0.0 build:starter
> cross-env CHALLENGE_TARGET=starter vite build --outDir dist/starter

vite v6.4.6 building for production...
transforming...
✓ 1594 modules transformed.
rendering chunks...
computing gzip size...
dist/starter/index.html                   0.46 kB │ gzip:  0.32 kB
dist/starter/assets/index-TrQT51kk.css    8.58 kB │ gzip:  2.06 kB
dist/starter/assets/index-Bsz0ZQX4.js   256.27 kB │ gzip: 78.88 kB
✓ built in 2.38s

> misaligned-comparison-challenge@1.0.0 build:reference
> cross-env CHALLENGE_TARGET=reference vite build --outDir dist/reference-solution

vite v6.4.6 building for production...
transforming...
✓ 1594 modules transformed.
rendering chunks...
computing gzip size...
dist/reference-solution/index.html                   0.47 kB │ gzip:  0.32 kB
dist/reference-solution/assets/index-TrQT51kk.css    8.58 kB │ gzip:  2.06 kB
dist/reference-solution/assets/index-BkXFLq0g.js   257.46 kB │ gzip: 79.27 kB
✓ built in 2.27s
```
*(Exit code `0` — both `starter/` and `reference-solution/` compile and bundle cleanly without PostCSS or asset warnings.)*

---

## 3. Automated Playwright Verification Results: Starter vs. Reference Solution

### Summary Matrix

| Test # | Test Name | `starter/` Result | `reference-solution/` Result | Defect / Requirement Verified |
| :---: | :--- | :---: | :---: | :--- |
| **1** | `[Parity & Setup] renders the 85-node shared specimen with 100% DOM and text parity across all studies` | **PASS** (`678ms`) | **PASS** (`626ms`) | Baseline app mount, 85-node DOM contract, 100% text parity, zero runtime console/page errors. |
| **2** | `[Alignment Tolerance] aligns Before (Neutral) and After (Study) specimen left plumb edges within <= 1px across all studies and viewports` | **FAIL** (`15.97px` drift on Plaidis; `22px–24px` on Linear/Stripe) | **PASS** (`0.00px` drift, `1.0s`) | Authentic `289316d5` → `7906e56a` shared horizontal plumb inset (`40px` desktop, `20px` mobile). |
| **3** | `[Min/Max Positions & Handle Unclipped] keeps the 44x44 slider handle 100% inside the stage bounds at 0% (Transformed), 50% (Split), and 100% (Original)` | **FAIL** (`handleRect.x = 178px` vs `stageRect.x = 200px` at `0%` — `22px` clipped) | **PASS** (`517ms`) | Authentic `289316d5` → `7906e56a` dynamic handle translation (`translate(${-sliderPos}%, -50%)`). |
| **4** | `[Resizing & Scale Sync] preserves divider percentage, clip-path synchronization, and specimen scale factor across viewport resizes` | **FAIL** (`expected x=384.0`, `got x=558.0` — `174px` drift at `768px` width) | **PASS** (`647ms`) | Controlled percentage state (`sliderPos` vs. cached pixel width) and `ResizeObserver` specimen scale sync. |
| **5** | `[Pointer Capture & Outside-Container Drag] maintains drag tracking when pointer leaves the comparison container and clamps to [0%, 100%]` | **FAIL** (`data-dragging` dropped to `"false"` upon leaving stage) | **PASS** (`732ms`) | Pointer capture + window pointer tracking outside container bounds, clamping to `[0, 100]`, outside release cleanup. |
| **6** | `[Pointer Cancellation Cleanup] cleans up drag state and releases pointer capture on pointercancel` | **FAIL** (`PointerEvent` not handled by mouse-only starter) | **PASS** (`362ms`) | `onPointerDown` / `onPointerCancel` state cleanup and `releasePointerCapture`. |
| **7** | `[Keyboard Accessibility & Mode Sync] supports WAI-ARIA slider keys (Arrow, Shift+Arrow, PageUp/PageDown, Home/End) and syncs Original/Split/Transformed mode buttons` | **FAIL** (`ArrowUp` left value at `"50"` instead of `"52"`) | **PASS** (`678ms`) | Complete WAI-ARIA 1.2 slider keyboard contract and `Original` / `Split` / `Transformed` button sync. |

---

### 3.1 Verbatim Test Run Against `starter/` (`npm run test:starter`)

**Command Executed:**
```bash
npm run test:starter
```

**Recorded Output:**
```text
> misaligned-comparison-challenge@1.0.0 test:starter
> cross-env CHALLENGE_TARGET=starter playwright test

Running 7 tests using 1 worker

  ok 1 [chromium] › tests\comparison.spec.ts:4:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 1. [Parity & Setup] renders the 85-node shared specimen with 100% DOM and text parity across all studies (678ms)
  x  2 [chromium] › tests\comparison.spec.ts:64:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 2. [Alignment Tolerance] aligns Before (Neutral) and After (Study) specimen left plumb edges within <= 1px across all studies and viewports (498ms)
  x  3 [chromium] › tests\comparison.spec.ts:104:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 3. [Min/Max Positions & Handle Unclipped] keeps the 44x44 slider handle 100% inside the stage bounds at 0% (Transformed), 50% (Split), and 100% (Original) (629ms)
  x  4 [chromium] › tests\comparison.spec.ts:162:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 4. [Resizing & Scale Sync] preserves divider percentage, clip-path synchronization, and specimen scale factor across viewport resizes (623ms)
  x  5 [chromium] › tests\comparison.spec.ts:243:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 5. [Pointer Capture & Outside-Container Drag] maintains drag tracking when pointer leaves the comparison container and clamps to [0%, 100%] (5.6s)
  x  6 [chromium] › tests\comparison.spec.ts:290:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 6. [Pointer Cancellation Cleanup] cleans up drag state and releases pointer capture on pointercancel (5.4s)
  x  7 [chromium] › tests\comparison.spec.ts:359:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 7. [Keyboard Accessibility & Mode Sync] supports WAI-ARIA slider keys (Arrow, Shift+Arrow, PageUp/PageDown, Home/End) and syncs Original/Split/Transformed mode buttons (5.5s)

  6 failed
  1 passed (25.4s)
```

**Key Failure Diagnostics from `starter/`:**
- **Test 2 (Alignment Tolerance):** `Error: Expected plaidis (desktop) anchor "header-brand" left plumb edge to match neutral baseline within <= 1px, got 15.97px drift` (because `neutral` has `24px` padding while `plaidis` has `40px` padding).
- **Test 3 (Min/Max Positions & Handle Unclipped):** `Error: Handle left edge (178px) is clipped outside stage left edge (200px) at 0%` (because `translate(-50%, -50%)` shifts the `44px` knob `22px` outside the left stage boundary).
- **Test 4 (Resizing & Scale Sync):** `Error: Divider drifted during resize to 768px: expected x=384.0, got x=558.0` (`174px` drift because `dividerPx` remained at `520px` from the initial `1040px` desktop mount).
- **Test 5 (Pointer Capture & Outside-Container Drag):** `Expected: "true", Received: "false"` on `locator('[data-slider-stage="true"]')` `data-dragging` attribute after moving the pointer `80px` above the top edge of the stage (dropped by `onMouseLeave`).
- **Test 6 (Pointer Cancellation Cleanup):** `Expected: "true", Received: "false"` on `PointerEvent('pointerdown')` because `starter/` only binds mouse listeners and lacks Pointer Events / `onPointerCancel`.
- **Test 7 (Keyboard Accessibility & Mode Sync):** `Expected: "52", Received: "50"` on `ArrowUp` (and lacks `Home`, `End`, `PageUp`, `PageDown`, `Shift+Arrow`).

---

### 3.2 Verbatim Test Run Against `reference-solution/` (`npm run test:reference`)

**Command Executed:**
```bash
npm run test:reference
```

**Recorded Output:**
```text
> misaligned-comparison-challenge@1.0.0 test:reference
> cross-env CHALLENGE_TARGET=reference playwright test

Running 7 tests using 1 worker

  ok 1 [chromium] › tests\comparison.spec.ts:4:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 1. [Parity & Setup] renders the 85-node shared specimen with 100% DOM and text parity across all studies (626ms)
  ok 2 [chromium] › tests\comparison.spec.ts:64:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 2. [Alignment Tolerance] aligns Before (Neutral) and After (Study) specimen left plumb edges within <= 1px across all studies and viewports (1.0s)
  ok 3 [chromium] › tests\comparison.spec.ts:104:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 3. [Min/Max Positions & Handle Unclipped] keeps the 44x44 slider handle 100% inside the stage bounds at 0% (Transformed), 50% (Split), and 100% (Original) (517ms)
  ok 4 [chromium] › tests\comparison.spec.ts:162:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 4. [Resizing & Scale Sync] preserves divider percentage, clip-path synchronization, and specimen scale factor across viewport resizes (647ms)
  ok 5 [chromium] › tests\comparison.spec.ts:243:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 5. [Pointer Capture & Outside-Container Drag] maintains drag tracking when pointer leaves the comparison container and clamps to [0%, 100%] (732ms)
  ok 6 [chromium] › tests\comparison.spec.ts:290:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 6. [Pointer Cancellation Cleanup] cleans up drag state and releases pointer capture on pointercancel (362ms)
  ok 7 [chromium] › tests\comparison.spec.ts:359:3 › The Misaligned Comparison — Interactive Before/After Slider Suite › 7. [Keyboard Accessibility & Mode Sync] supports WAI-ARIA slider keys (Arrow, Shift+Arrow, PageUp/PageDown, Home/End) and syncs Original/Split/Transformed mode buttons (678ms)

  7 passed (8.1s)
```

---

## 4. Visual Reference Capture Verification (`npm run capture:references`)

**Command Executed:**
```bash
npm run capture:references
```

**Generated & Verified Reference Files in `references/`:**
- `references/expected-split-50-desktop.png` (`reference-solution` at 50% split, 1440×900)
- `references/expected-original-100-unclipped.png` (`reference-solution` at 100% Original, unclipped handle)
- `references/expected-transformed-0-unclipped.png` (`reference-solution` at 0% Transformed, unclipped handle)
- `references/expected-resize-768-split.png` (`reference-solution` after resizing 1440×900 → 768×1024)
- `references/failing-starter-split-misaligned-desktop.png` (`starter` at 50% split showing `24px` vs `46px` padding jump)
- `references/failing-starter-handle-clipped-100-percent.png` (`starter` at 100% Original showing right half of handle clipped)
- `references/failing-starter-handle-clipped-0-percent.png` (`starter` at 0% Transformed showing left half of handle clipped)
- `references/failing-starter-resize-desync-768.png` (`starter` after resizing 1440×900 → 768×1024 showing divider/clip/scale desynchronization)
- `references/authentic-source-evidence/contextmuse_289316d_study_linear_specimen_split_1440.png`
- `references/authentic-source-evidence/contextmuse_289316d_study_linear_specimen_before_neutral_1440.png`
- `references/authentic-source-evidence/contextmuse_289316d_study_linear_specimen_after_tokens_1440.png`

---

## 5. Known Limitations & Isolation Guarantees

1. **No Production Side Effects:** Neither the source `rouguemuse/contextmuse` repository nor any live production deployment was modified.
2. **Zero Proprietary or Personal Data:** All rendered interface specimens and vector calibration plates use synthetic demonstration telemetry (`1,420 req/s`, `18.4 ms`, `100.0%`, `RT-4091..4093`) and system/open font fallbacks.
3. **Font Rendering Variance Across OS Platforms:** Because commercial webfont binaries (`LocomotiveNew`, `Berkeley Mono`, `Söhne Variable`) are not bundled, the specimen falls back to local system fonts (`Segoe UI` / `SF Pro Display` / `ui-monospace`). Horizontal glyph widths vary slightly by OS, which is why `tests/comparison.spec.ts` asserts structural plumb-line coordinates (`getBoundingClientRect().left` of container anchors) rather than pixel-diffing rendered text bitmaps.
