# Visual & Interaction Reference Notes

This directory contains visual evidence and technical interaction notes for **The Misaligned Comparison: Repair an Interactive Before/After Slider**.

---

## 1. Distinction Between Authentic Source Evidence and Newly Constructed Challenge Fixtures

To ensure complete transparency and scientific accuracy, all visual evidence in `references/` is divided into two explicitly labeled categories:

### A. Authentic Source Evidence (`references/authentic-source-evidence/`)

These three files are verbatim historical screenshots committed in [`rouguemuse/contextmuse`](https://github.com/rouguemuse/contextmuse) at commit `289316d577f4b73383ff36529cc0f69622eeb4ac` (2026-11-09), **prior** to the alignment and handle-clipping fix in commit `7906e56ad4efd58987d182a83bf7e89029e328d5` (2026-11-11). All three depict the **synthetic 85-node interface specimen** (`CM // SPECIMEN-04`, containing only synthetic mock telemetry `1,420 req/s`, `18.4 ms`, `100.0%`, `RT-4091..4093` and zero user data or proprietary third-party imagery):

1. `authentic-source-evidence/contextmuse_289316d_study_linear_specimen_split_1440.png`
   - **What it shows:** The `50%` split comparison between the `Neutral` specimen (left) and the `Linear` token-applied specimen (right) at commit `289316d5`.
   - **Observed authentic defect:** Because `Neutral` used `24px` outer horizontal padding (`12px 24px` header, `22px 24px` body) while `Linear` used `46px` outer horizontal padding (`12px 46px` header, `22px 46px` body), the right half is shifted `22px` further inward than the left half. Across the vertical gold divider line at `50%`, the lead paragraph duplicates syllables (`"...across distrib|ributed product environments..."`) and Card 02 duplicates words (`"Sub-millisecond priority r|outing with zero unverified"` / `"unverified state transition:"`).
2. `authentic-source-evidence/contextmuse_289316d_study_linear_specimen_before_neutral_1440.png`
   - **What it shows:** `Original` mode (`sliderPos = 100%`) at commit `289316d5`.
   - **Observed authentic defect:** The `44×44px` gold slider handle (`role="slider"`) at the right border (`left: 100%`) used `-translate-x-1/2 -translate-y-1/2` (`translate(-50%, -50%)`). Because the stage container has `overflow: hidden`, the right half (`22px`) of the `44×44px` handle is clipped off by the right container border, leaving only a `22×44px` half-knob showing `<-` instead of `<->`.
3. `authentic-source-evidence/contextmuse_289316d_study_linear_specimen_after_tokens_1440.png`
   - **What it shows:** `Transformed` mode (`sliderPos = 0%`) at commit `289316d5`.
   - **Observed authentic defect:** At the left border (`left: 0%`), `translate(-50%, -50%)` pushes the left half (`22px`) of the `44×44px` handle outside the left edge of the `overflow: hidden` stage, leaving only the right half showing `->`.

### B. Newly Constructed Challenge Fixtures (`references/expected-*.png` & `references/failing-starter-*.png`)

These eight screenshots are deterministically generated from this standalone React + TypeScript + Vite challenge project (`scripts/capture-references.mjs` via Playwright Chromium at `1440×900` and `768×1024`, `deviceScaleFactor: 2`):

#### Expected Behavior (Captured from `reference-solution/`)

| File | Viewport / Mode | Verified Behavior |
| :--- | :--- | :--- |
| `expected-split-50-desktop.png` | `1440×900` · Study 02 (`Linear`) · `Split (50%)` | Both `[data-layer="before"]` (`neutral`) and `[data-layer="after"]` (`linear`) share `FRAME_INSET_X = 40px` (`20px` on mobile). Header brand mark, hero heading, 3-card grid, and telemetry ledger share an exact `0px`-drift vertical plumb line; `44×44px` handle is centered on the `50%` divider. |
| `expected-original-100-unclipped.png` | `1440×900` · Study 02 (`Linear`) · `Original (100%)` | Slider sits at `100%`. Dynamic translation `transform: translate(-100%, -50%)` keeps the entire `44×44px` gold knob inside the right edge of the stage without clipping. |
| `expected-transformed-0-unclipped.png` | `1440×900` · Study 02 (`Linear`) · `Transformed (0%)` | Slider sits at `0%`. Dynamic translation `transform: translate(0%, -50%)` keeps the entire `44×44px` gold knob inside the left edge of the stage without clipping. |
| `expected-resize-768-split.png` | Resized `1440×900 → 768×1024` · `Split (50%)` | After viewport resize, percentage state (`50%`) keeps the divider line and `clipPath: inset(0 50% 0 0)` locked to the center of the stage, while `ResizeObserver` scales the canonical `1040×650` specimen canvas proportionally to fit the resized stage. |

#### Reproducible Failing Behavior (Captured from `starter/`)

| File | Viewport / Mode | Reproducible Defect Demonstrated |
| :--- | :--- | :--- |
| `failing-starter-split-misaligned-desktop.png` | `1440×900` · Study 02 (`Linear`) · `Split (50%)` | Reproduces the authentic `289316d5` horizontal padding mismatch (`24px` Neutral vs. `46px` Linear), causing cross-divider horizontal jump and word duplication (`"distrib|ributed"`). |
| `failing-starter-handle-clipped-100-percent.png` | `1440×900` · Study 02 (`Linear`) · `Original (100%)` | Reproduces the authentic `289316d5` static `translate(-50%, -50%)` handle clipping at `100%`: right half (`22px`) of the `44×44px` handle is clipped off by `overflow: hidden`. |
| `failing-starter-handle-clipped-0-percent.png` | `1440×900` · Study 02 (`Linear`) · `Transformed (0%)` | Reproduces the authentic `289316d5` static `translate(-50%, -50%)` handle clipping at `0%`: left half (`22px`) of the `44×44px` handle is clipped off by `overflow: hidden`. |
| `failing-starter-resize-desync-768.png` | Resized `1440×900 → 768×1024` · `Split (50%)` | Demonstrates the constructed benchmark resize defect: stale `dividerPx = 520px` and `cachedMountWidth = 1040px` cause the gold divider bar (`left: 520px`) to separate from the `clipPath` boundary (`stageWidth - 520px`), while the unscaled specimen canvas overflows the narrowed container. |

---

## 2. Detailed Interaction & Coordinate Mechanics

### Coordinate Mapping Equation

When a pointer event occurs at viewport coordinate `clientX`, the normalized percentage `sliderPos` $\in [0, 100]$ relative to the active comparison stage container `stageEl` is:

$$\text{rawPct} = \frac{\text{clientX} - \text{rect.left}}{\text{rect.width}} \times 100$$

$$\text{sliderPos} = \max\left(0, \min\left(100, \text{rawPct}\right)\right)$$

where `rect = stageEl.getBoundingClientRect()` is queried dynamically on each pointer input so that scrolling, layout shifts, or viewport resizes never introduce stale container offsets.

### Edge-Safe Handle Translation Formula (Commit `7906e56ad4efd58987d182a83bf7e89029e328d5`)

The vertical divider bar (`[data-slider-divider="true"]`) is positioned at `left: ${sliderPos}%`.
Inside the divider bar, the `44×44px` handle (`[role="slider"]`) is translated via:

```css
transform: translate(calc(-1% * var(--slider-pos)), -50%);
/* or inline: style={{ transform: `translate(${-sliderPos}%, -50%)` }} */
```

- At `sliderPos = 0`: `translate(0%, -50%)` → handle's left edge aligns with `0%` (`stageRect.left`).
- At `sliderPos = 50`: `translate(-50%, -50%)` → handle's center aligns with `50%` (`stageRect.left + stageRect.width * 0.5`).
- At `sliderPos = 100`: `translate(-100%, -50%)` → handle's right edge aligns with `100%` (`stageRect.right`).

Because the horizontal translation scales linearly from `0%` to `-100%` of the handle's own `44px` width across `sliderPos` $\in [0, 100]$, the handle never crosses `[stageRect.left, stageRect.right]` at any percentage.
