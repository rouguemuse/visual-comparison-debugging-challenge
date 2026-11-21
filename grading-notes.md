# Grading Notes: Evaluator Guide, False Positives & Test Limitations

This document helps hiring evaluators interpret automated test results for **The Misaligned Comparison**, distinguish objective functional requirements from subjective visual styling preferences, and recognize potential false positives or edge-case ambiguities.

---

## 1. Objectively Testable Requirements vs. Subjective Visual Preferences

### Objectively Testable Requirements (Graded by `tests/comparison.spec.ts`)

1. **85-Node Structural & Textual Parity (`Test 1`):**
   - Every `[data-specimen-variant]` (`neutral`, `plaidis`, `linear`, `stripe`) in both `desktop` and `mobile` viewports must contain exactly `85` descendant DOM elements in the exact same tag sequence and with identical normalized `textContent`.
   - *Why this is objective:* Prevents candidates from "fixing" alignment by deleting or restructuring DOM elements in one variant.
2. **Cross-Layer Left Plumb-Line Alignment (`Test 2`):**
   - The `getBoundingClientRect().left` coordinates of `[data-specimen-anchor="header-brand" | "hero-heading" | "card-grid" | "ledger"]` in `[data-layer="before"]` and `[data-layer="after"]` must match within `<= 1px` across all studies (`plaidis`, `linear`, `stripe`) and both viewports (`desktop`, `mobile`).
   - *Why this is objective:* Directly verifies that all four variants share a single horizontal inset (`40px` desktop, `20px` mobile in canonical coordinates) rather than per-source outer padding (`24px` vs. `40px`/`46px`/`48px`).
3. **Unclipped Handle Bounding Box at `0%`, `50%`, and `100%` (`Test 3`):**
   - At `0%` (`Transformed`), `50%` (`Split`), and `100%` (`Original`), the `[role="slider"]` handle's bounding box `[handleRect.left, handleRect.right]` must lie within `[stageRect.left - 1, stageRect.right + 1]`, and at `50%` its horizontal center must lie within `<= 1.5px` of `stageRect.left + stageRect.width * 0.5`.
   - *Why this is objective:* Regardless of whether the candidate implements the edge-safe offset via CSS `transform: translate(${-sliderPos}%, -50%)`, individual CSS `translate: ${-sliderPos}% -50%`, or clamped pixel `left` math, any correct formula places the `44×44px` box inside the stage at `0%` and `100%` and centers it at `50%`.
4. **Resize Invariance Across Viewport Dimensions (`Test 4`):**
   - When the viewport resizes from `1440×900` to `768×1024` and `600×900` while in a `50%` split, (a) the divider line center X must remain at `stageRect.left + stageRect.width * 0.5` (`<= 2px`), (b) the `clipPath` right-inset boundary on `[data-layer="before"]` must match `stageRect.width * 0.5` (`<= 2px`), and (c) the scaled `[data-specimen-canvas="true"]` bounding width must match `stageRect.width` (`<= 2px`).
5. **Pointer Continuation Outside Stage & Clamping (`Test 5`):**
   - Pressing down inside `[data-slider-stage="true"]` and moving the pointer outside the top (`stageRect.top - 80`), left (`stageRect.left - 100`), and right (`stageRect.right + 100`) edges of the stage while holding the primary button must keep `data-dragging="true"`, update `aria-valuenow` continuously (`75%`, `0%`, `100%`), and reset `data-dragging="false"` upon pointer release outside the container.
6. **Pointer Cancellation Cleanup (`Test 6`):**
   - Dispatching a `pointercancel` event during an active drag must immediately reset `data-dragging="false"` and prevent subsequent `pointermove` events from mutating `aria-valuenow`.
7. **WAI-ARIA Slider Keyboard & Mode Button Synchronization (`Test 7`):**
   - `ArrowLeft`/`ArrowDown` (`-2%`), `ArrowRight`/`ArrowUp` (`+2%`), `Shift+Arrow` (`±10%`), `PageDown`/`PageUp` (`±10%`), `Home` (`0%`), and `End` (`100%`) must update `aria-valuenow` and synchronize `aria-pressed` on `[data-comparison-view="original" | "split" | "transformed"]`.

### Subjective or Acceptable Implementation Variations (Not Penalized)

- **CSS Translation Syntax:** Candidates may use `style={{ transform: `translate(${-sliderPos}%, -50%)` }}` or `style={{ translate: `${-sliderPos}% -50%` }}` (as used in commit `7906e56ad4efd58987d182a83bf7e89029e328d5`) or `calc(...)`. Both produce identical bounding boxes in Chromium/Firefox/WebKit and pass Test 3.
- **Line-Length & Typography Differences Across the Split Seam:** As documented in commit `7906e56ad4efd58987d182a83bf7e89029e328d5` (`docs/design-intelligence-final-pass-corrected-summary.md`), even after the left plumb edge is unified to `40px` desktop / `20px` mobile, different font families, weights (`600` Neutral vs. `800` uppercase Plaidis vs. `510` Linear vs. `300` Stripe), and letter-spacing intentionally produce different glyph widths along a line of text. Evaluators must **not** expect glyph-for-glyph horizontal text matching in the middle of a sentence — only the left structural plumb line (`header-brand`, `hero-heading`, `card-grid`, `ledger`) is held invariant.
- **Pointer Capture vs. Window Listener Fallback:** Candidates may combine `e.currentTarget.setPointerCapture(e.pointerId)` with `onPointerMove`/`onPointerUp`/`onPointerCancel` on the stage element and/or attach `window` `pointermove`/`pointerup`/`pointercancel` listeners during an active drag. Note that Playwright's `page.mouse.move` dispatches synthetic mouse/pointer events that may not automatically route to a pointer-captured element unless `window` listeners are also attached or pointer capture is active on the target; therefore, combining `setPointerCapture` with `window` `pointermove`/`pointerup`/`pointercancel` listeners is recommended and demonstrated in `reference-solution/`.

---

## 2. Potential False Positives & How the Suite Prevents Them

| Potential Shortcut / False Positive | How `tests/comparison.spec.ts` Detects or Prevents It |
| :--- | :--- |
| **Removing `overflow: hidden` from `[data-slider-stage="true"]` instead of shifting the handle at `0%` and `100%`** | `Test 3` checks `handleBox.x >= stageBox.x - 1` and `handleBox.x + handleBox.width <= stageBox.x + stageBox.width + 1` directly via `getBoundingClientRect()`. Even if `overflow: hidden` were removed, a static `translate(-50%, -50%)` handle would still have `handleBox.x = stageBox.x - 22` at `0%` and fail `Test 3`. |
| **Hardcoding `40px` padding on Desktop but forgetting `20px` on Mobile** | `Test 2` iterates across both `desktop` and `mobile` viewport modes (`[data-mode-btn="desktop" | "mobile"]`) and all three studies (`plaidis`, `linear`, `stripe`). |
| **Using `width: ${sliderPos}%` on `[data-layer="before"]` without keeping the inner specimen full-width** | If `[data-layer="before"]` shrinks its layout box width instead of using `clipPath: inset(0 ${100 - sliderPos}% 0 0)`, `DesignSystemSpecimen`'s `ResizeObserver` would shrink the `Before` specimen proportionally to `50%` size while the `After` specimen stays `100%` size! `Test 2` catches this immediately because the scaled `Before` anchors would no longer align with the `After` anchors. |
| **Updating `aria-valuenow` on resize without updating the visual `clipPath` or specimen `scale`** | `Test 4` inspects three independent geometric properties after resizing (`dividerBox.x`, parsed `beforeLayer.style.clipPath` pixel boundary, and `canvasEl.getBoundingClientRect().width`). All three must match `stageRect.width` within `<= 2px`. |
| **Clearing `isDragging` on `pointerup` but forgetting `pointercancel`** | `Test 6` explicitly dispatches a `PointerEvent('pointercancel', { pointerId: 42 })` mid-drag, checks `data-dragging="false"`, and then dispatches a follow-up `pointermove` to confirm the slider position does not mutate after cancellation. |

---

## 3. Test Limitations & What Would Make This Task Ambiguous

1. **Direction Convention (`100%` = Original Before vs. `0%` = Transformed After):**
   - In some generic before/after sliders, `0%` means "Original" and `100%` means "After". In the authentic ContextMuse implementation (`289316d5` and `7906e56a`), `sliderPos` represents the **percentage of the `Before` (`Original Neutral Specimen`) overlay visible from the left** (`clipPath: inset(0 ${100 - sliderPos}% 0 0)`), so `Original = 100%`, `Split = 50%`, and `Transformed = 0%`.
   - *Mitigation:* This convention is already wired into the `Original` (`100`), `Split` (`50`), and `Transformed` (`0`) buttons in `starter/` and explicitly stated in `task-spec.md` so candidates never have to guess the polarity.
2. **Keyboard Step Size (`2%` Normal / `10%` Shift & PageUp/PageDown):**
   - Without an explicit specification, a candidate might choose `1%` or `5%` for arrow keys.
   - *Mitigation:* `task-spec.md` states the exact step sizes (`±2%` for `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown`, `±10%` for `Shift+Arrow` and `PageUp`/`PageDown`, `0%` for `Home`, `100%` for `End`), matching the authentic `handleSliderKeyDown` implementation in `rouguemuse/contextmuse`.
3. **Subpixel Rounding at Fractional Viewport Scales:**
   - When the canonical `1040×650` specimen is scaled via CSS `transform: scale(...)` to fit a `600px`-wide viewport (`scale ≈ 0.5452`), `getBoundingClientRect()` returns floating-point values that can differ by `0.2px–0.8px` due to subpixel layout rounding.
   - *Mitigation:* Alignment tests use a `1px–2px` tolerance (`toBeLessThanOrEqual(1)` for identical-layer plumb lines, `toBeLessThanOrEqual(1.5)` for handle centering, and `toBeLessThanOrEqual(2)` for resized viewport synchronization), preventing flaky subpixel false failures while still catching any real `16px–24px` padding or `22px` handle-clipping defect with a >10× margin.
