# Visual Walkthrough: The Misaligned Comparison

This visual dossier presents the four annotated comparison plates and architectural diagrams for **The Misaligned Comparison: Repair an Interactive Before/After Slider**.

---

## 1. Four Annotated Visual Comparison Plates (Starter vs. Reference Solution)

### Plate 01 — Cross-Layer Plumb-Line Misalignment vs. Shared 40px Specimen Inset (`289316d5` → `7906e56a`)

![Plate 01: Cross-Layer Plumb-Line Misalignment vs. Shared 40px Specimen Inset](./visual-plates/plate-01-plumb-line-alignment.png)

### Plate 02 — Edge Slider Handle Clipping at `0%` & `100%` vs. Proportional Translation (`289316d5` → `7906e56a`)

![Plate 02: Edge Slider Handle Clipping at 0% & 100% vs. Proportional Translation](./visual-plates/plate-02-edge-handle-clipping.png)

### Plate 03 — Pixel-Cached Resize Desynchronization (`1440×900` → `768×1024`) vs. Percentage + `ResizeObserver` Lock

![Plate 03: Pixel-Cached Resize Desynchronization vs. Percentage + ResizeObserver Lock](./visual-plates/plate-03-resize-desynchronization.png)

### Plate 04 — Pointer Capture, WAI-ARIA Keyboard Contract & Playwright Verification Scorecard

![Plate 04: Pointer Capture, WAI-ARIA Keyboard Contract & Playwright Verification Scorecard](./visual-plates/plate-04-pointer-capture-and-scorecard.png)

---

## 2. Dual-Layer Coordinate & Resize Pipeline

```mermaid
flowchart LR
  subgraph Input["1. User Input & Mode Controls"]
    Ptr["Pointer Event (clientX)"]
    Kbd["WAI-ARIA Keys (Arrow / Shift / Page / Home / End)"]
    ModeBtn["Mode Buttons (Original 100% / Split 50% / Transformed 0%)"]
  end

  subgraph State["2. Normalized Percentage State"]
    Rect["stageEl.getBoundingClientRect()"]
    SliderPos["sliderPos ∈ [0, 100]"]
  end

  subgraph Render["3. Synchronized Dual-Layer Stage (overflow: hidden)"]
    AfterLayer["Base Layer (After): Token-Applied 85-Node Specimen\nFRAME_INSET_X = 40px Desktop / 20px Mobile"]
    BeforeLayer["Overlay Layer (Before): Neutral 85-Node Specimen\nclipPath: inset(0 (100 - sliderPos)% 0 0)\nFRAME_INSET_X = 40px Desktop / 20px Mobile"]
    Divider["Divider Bar: left: sliderPos%"]
    Handle["44×44px Handle: translate(-sliderPos%, -50%)"]
    RO["ResizeObserver: scale = rect.width / canonicalWidth"]
  end

  Ptr --> Rect --> SliderPos
  Kbd --> SliderPos
  ModeBtn --> SliderPos
  SliderPos --> BeforeLayer
  SliderPos --> Divider --> Handle
  RO --> AfterLayer
  RO --> BeforeLayer
```

---

## 3. Pointer Capture & Cancellation State Machine

```mermaid
stateDiagram-v2
  [*] --> Idle: data-dragging="false"

  Idle --> Dragging: pointerdown (button === 0)\nsetPointerCapture(pointerId)\nupdatePosFromClientX(clientX)

  Dragging --> Dragging: pointermove (inside or outside stage bounds)\nrawPct = ((clientX - rect.left) / rect.width) * 100\nsliderPos = clamp(rawPct, 0, 100)

  Dragging --> Idle: pointerup (inside or outside stage)\nreleasePointerCapture(pointerId)\ndata-dragging="false"

  Dragging --> Idle: pointercancel\nreleasePointerCapture(pointerId)\ndata-dragging="false"
```

---

## 4. Interactive HTML Simulator

Open [`comparison_defect_explorer.html`](./comparison_defect_explorer.html) in any browser to interactively toggle between the defective **Starter** and the fixed **Reference Solution**, test `Original (100%)` / `Split (50%)` / `Transformed (0%)` handle bounds, and simulate live container resizing (`100%` down to `60%`).
