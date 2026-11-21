# Task Specification: The Misaligned Comparison — Repair an Interactive Before/After Slider

## 1. Candidate Prompt

You are working on an interactive **Design Intelligence Before/After Specimen Comparator** built with **React 19, TypeScript, and Vite**.

The comparator renders two stacked layers inside an `overflow: hidden` stage (`[data-slider-stage="true"]`):
- **Base Layer (`[data-layer="after"]`):** An 85-node interface specimen styled with one of three extracted design-system token profiles (`plaidis`, `linear`, or `stripe`), or a synthetic SVG calibration plate.
- **Clipped Overlay Layer (`[data-layer="before"]`):** The identical 85-node interface specimen styled with a `neutral` baseline theme, clipped horizontally via `clipPath: inset(0 <right> 0 0)`.
- **Split Divider & Handle (`[data-slider-divider="true"]` / `[role="slider"]`):** A vertical divider bar and `44×44px` interactive handle supporting pointer dragging, preset mode buttons (`Original`, `Split`, `Transformed`), and WAI-ARIA keyboard navigation.

### Reported Defects

Four issues have been reported in the current `starter/` implementation:

1. **Cross-Layer Horizontal Plumb-Line Misalignment (`starter/src/components/DesignSystemSpecimen.tsx`):**
   - In `Split` mode (`50%`), the `Before` (`neutral`) specimen layer and the `After` (`plaidis`, `linear`, `stripe`) specimen layer do not share a common horizontal outer padding inset.
   - `neutral` uses `24px` desktop (`12px` header / `16px` body mobile) horizontal padding, whereas `plaidis`, `linear`, and `stripe` use `40px`, `46px`, and `48px` on desktop (`12px` header and `20px`/`24px`/`16px` body on mobile).
   - As a result, the left edge of the header brand mark, hero headline, 3-card metric grid, and telemetry ledger jumps horizontally across the split divider, causing words to repeat across the split seam.
   - **Required Fix:** Hold the outer horizontal padding strictly constant across all four specimen variants (`40px` on desktop, `20px` on mobile for both header and body containers) so every variant shares a single vertical plumb line (`<= 1px` drift).

2. **Clipped Slider Handle Near Edges (`starter/src/components/BeforeAfterComparison.tsx`):**
   - The `44×44px` slider handle (`[role="slider"]`) uses a static `transform: translate(-50%, -50%)` inside the `overflow: hidden` stage.
   - When the split position is at `0%` (`Transformed`) or `100%` (`Original`) — or within `22px` of either container edge — half of the handle extends outside the stage bounding box and is clipped off.
   - **Required Fix:** Dynamically translate the handle horizontally in proportion to the split percentage (`translate(${-sliderPos}%, -50%)`) so that at `0%` its left edge sits flush with the left stage border (`translate(0%, -50%)`), at `50%` it is centered on the divider (`translate(-50%, -50%)`), and at `100%` its right edge sits flush with the right stage border (`translate(-100%, -50%)`).

3. **Divider & Specimen Scale Desynchronization During Resize (`BeforeAfterComparison.tsx` & `DesignSystemSpecimen.tsx`):**
   - `BeforeAfterComparison.tsx` stores the split position as a pixel offset (`dividerPx`) against an initial container width cached only once on mount (`cachedMountWidth`). When the browser viewport or stage container resizes, the divider line, the `clipPath` right-inset boundary, and the percentage readout drift out of sync.
   - `DesignSystemSpecimen.tsx` computes its canonical frame scale factor (`rect.width / canonicalWidth`) only once on mount without observing container resize events.
   - **Required Fix:** Drive both the divider position (`left: ${sliderPos}%`) and overlay clip path (`clipPath: inset(0 ${100 - sliderPos}% 0 0)`) from a controlled percentage state `sliderPos` in `[0, 100]`, and attach a `ResizeObserver` (with a window `resize` fallback) in `DesignSystemSpecimen.tsx` so the inner canonical canvas (`1040×650` desktop, `390×844` mobile) scales continuously with the container width.

4. **Lost Pointer Tracking Outside Container, Pointer Cancel Cleanup & WAI-ARIA Keyboard Completeness (`BeforeAfterComparison.tsx`):**
   - Dragging relies on container-scoped mouse handlers (`onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave`) that drop the drag state as soon as the pointer leaves the stage bounding box.
   - `pointercancel` does not clean up drag state or release pointer capture.
   - Keyboard navigation on `[role="slider"]` only supports `ArrowLeft` and `ArrowRight` in raw pixel steps and lacks `ArrowUp`, `ArrowDown`, `Shift+Arrow`, `PageUp`, `PageDown`, `Home`, and `End` percentage steps.
   - **Required Fix:**
     - Implement pointer-event tracking (`onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`) using `setPointerCapture` / `releasePointerCapture` and window-level pointer fallback listeners while dragging so pointer movement outside the stage bounds continues tracking smoothly and clamps to `[0, 100]`.
     - Ensure `pointerup` (including outside the container) and `pointercancel` immediately reset `data-dragging="false"` and release pointer capture.
     - Implement full WAI-ARIA slider keyboard navigation on `[role="slider"]`:
       - `ArrowRight` / `ArrowUp`: `+2%` (`+10%` when `Shift` is held)
       - `ArrowLeft` / `ArrowDown`: `-2%` (`-10%` when `Shift` is held)
       - `PageUp`: `+10%`
       - `PageDown`: `-10%`
       - `Home`: `0%`
       - `End`: `100%`
     - Synchronize the `Original` (`Math.round(sliderPos) === 100`), `Split` (`0 < Math.round(sliderPos) < 100`), and `Transformed` (`Math.round(sliderPos) === 0`) mode buttons (`aria-pressed`) with `sliderPos`.

---

## 2. Assumptions & Environment

- The app runs in modern evergreen Chromium/Firefox/WebKit browsers supporting Pointer Events, `ResizeObserver`, and CSS `clip-path: inset(...)`.
- Canonical specimen coordinate frames are `1040 × 650` (`desktop`) and `390 × 844` (`mobile`).
- In the percentage model used by this comparator:
  - `100%` means the `Before` (`neutral`) overlay covers `100%` of the stage (`clipPath: inset(0 0% 0 0)` — `Original` mode).
  - `50%` means the `Before` overlay covers the left `50%` (`clipPath: inset(0 50% 0 0)` — `Split` mode).
  - `0%` means the `Before` overlay covers `0%` (`clipPath: inset(0 100% 0 0)` — `Transformed` mode, revealing `100%` of the `After` layer).

---

## 3. Allowed Modifications & Prohibited Shortcuts

### Allowed Modifications

- `starter/src/components/BeforeAfterComparison.tsx`
- `starter/src/components/DesignSystemSpecimen.tsx`
- `starter/src/styles.css` (if needed for handle/stage CSS rules)

### Prohibited Shortcuts

- **Do not** alter the 85-node DOM structure or text content inside `DesignSystemSpecimen.tsx` (`[data-specimen-variant]` must continue to render exactly `85` descendant elements with identical tag order and text across all variants).
- **Do not** remove `overflow: hidden` from `[data-slider-stage="true"]` to work around handle clipping; the handle itself must remain within the stage bounds `[stageRect.left, stageRect.right]`.
- **Do not** remove or rename existing `data-*` attributes (`data-study-btn`, `data-mode-btn`, `data-comparison-view`, `data-surface-btn`, `data-slider-stage`, `data-dragging`, `data-layer`, `data-slider-divider`, `data-slider-handle`, `data-specimen-variant`, `data-specimen-viewport`, `data-specimen-canvas`, `data-specimen-anchor`) or `role="slider"`.
- **Do not** modify `tests/comparison.spec.ts` or `playwright.config.ts`.

---

## 4. Verification & Test Commands

Run the following commands from the challenge root directory:

```bash
# 1. Typecheck and lint
npm run typecheck
npm run lint

# 2. Run the Playwright test suite against starter/
npm run test:starter

# 3. Build for production
npm run build:starter
```

*(Evaluators can run `npm run test:reference` to verify the reference solution against the identical test suite.)*

---

## 5. Grading Rubric (100 Points Total)

| Category | Weight | Verification Method | Passing Criterion |
| :--- | :---: | :--- | :--- |
| **1. Specimen DOM & Content Parity** | 10 pts | Playwright Test 1 + ESLint / TypeScript | `85 / 85` descendant nodes and `100%` text parity preserved across all 4 variants and 2 viewports; zero console/page/type/lint errors. |
| **2. Cross-Layer Plumb-Line Alignment** | 20 pts | Playwright Test 2 | `header-brand`, `hero-heading`, `card-grid`, and `ledger` left edges match between `[data-layer="before"]` and `[data-layer="after"]` within `<= 1px` across all 3 studies and both viewports. |
| **3. Edge-Safe Unclipped Handle Geometry** | 15 pts | Playwright Test 3 | `44×44px` `[role="slider"]` bounding box stays completely inside `[data-slider-stage="true"]` at `0%`, `50%`, and `100%` (`<= 1px` tolerance) and centers on the divider at `50%` (`<= 1.5px`). |
| **4. Resize Invariance & Scale Synchronization** | 20 pts | Playwright Test 4 | Resizing viewport from `1440×900` to `768×1024` and `600×900` keeps divider X, `clipPath` boundary X, and scaled specimen canvas width synchronized within `<= 2px`. |
| **5. Pointer Capture & Outside-Container Drag** | 15 pts | Playwright Test 5 | Dragging outside stage top/left/right boundaries maintains active drag state (`data-dragging="true"`), clamps `aria-valuenow` to `[0, 100]`, and cleans up on outside pointer release. |
| **6. Pointer Cancellation Cleanup** | 10 pts | Playwright Test 6 | `pointercancel` immediately resets `data-dragging="false"`, releases pointer capture, and prevents subsequent `pointermove` mutations. |
| **7. WAI-ARIA Keyboard & Mode Button Sync** | 10 pts | Playwright Test 7 | `Arrow` (`±2%`), `Shift+Arrow` (`±10%`), `PageUp`/`PageDown` (`±10%`), `Home` (`0%`), and `End` (`100%`) update `aria-valuenow` and sync `Original` / `Split` / `Transformed` `aria-pressed` states. |
