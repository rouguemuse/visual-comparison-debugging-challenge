import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const REF_DIR = path.join(ROOT, 'references');
const PLATES_DIR = path.join(REF_DIR, 'visual-plates');
const ARTIFACT_DIR = process.env.ARTIFACT_SCREENSHOT_DIR || '';

function toDataUri(filename) {
  const filePath = path.join(REF_DIR, filename);
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const SHARED_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1440px;
    height: 860px;
    background: #141617;
    color: #EDE9E0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 28px 34px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }
  .top-header {
    border-bottom: 2px solid #23282A;
    padding-bottom: 14px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .eyebrow {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #D9A62E;
    font-weight: 700;
  }
  .title {
    font-size: 25px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #EDE9E0;
    margin-top: 4px;
  }
  .subtitle {
    font-size: 13px;
    color: rgba(223, 218, 206, 0.78);
    margin-top: 3px;
  }
  .badge-pill {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 11px;
    padding: 5px 10px;
    background: #23282A;
    border: 1px solid rgba(217, 166, 46, 0.45);
    color: #D9A62E;
    font-weight: 700;
  }
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    flex: 1;
    margin: 18px 0;
    min-height: 0;
  }
  .panel {
    background: #1B1F21;
    border: 1px solid rgba(223, 218, 206, 0.18);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
    position: relative;
  }
  .panel-fail {
    border-top: 4px solid #F43F5E;
  }
  .panel-pass {
    border-top: 4px solid #10B981;
  }
  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .panel-tag {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 11px;
    font-weight: 800;
    padding: 3px 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .tag-fail {
    background: rgba(244, 63, 94, 0.18);
    color: #FDA4AF;
    border: 1px solid rgba(244, 63, 94, 0.45);
  }
  .tag-pass {
    background: rgba(16, 185, 129, 0.18);
    color: #6EE7B7;
    border: 1px solid rgba(16, 185, 129, 0.45);
  }
  .panel-metric {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 12px;
    font-weight: 700;
  }
  .img-frame {
    position: relative;
    width: 100%;
    border: 1px solid rgba(223, 218, 206, 0.22);
    background: #08090A;
    overflow: hidden;
  }
  .img-frame img {
    display: block;
    width: 100%;
    height: auto;
  }
  .code-box {
    margin-top: 10px;
    background: #141617;
    border: 1px solid rgba(223, 218, 206, 0.15);
    padding: 10px 12px;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 11.5px;
    line-height: 1.45;
    color: #DFDACE;
  }
  .footer-bar {
    border-top: 1px solid rgba(223, 218, 206, 0.15);
    padding-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 11px;
    color: rgba(223, 218, 206, 0.65);
  }
  .callout-pill {
    position: absolute;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 10.5px;
    font-weight: 700;
    padding: 3px 7px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.65);
    pointer-events: none;
  }
`;

async function main() {
  fs.mkdirSync(PLATES_DIR, { recursive: true });

  const imgFailSplit = toDataUri('failing-starter-split-misaligned-desktop.png');
  const imgPassSplit = toDataUri('expected-split-50-desktop.png');
  const imgFail0 = toDataUri('failing-starter-handle-clipped-0-percent.png');
  const imgFail100 = toDataUri('failing-starter-handle-clipped-100-percent.png');
  const imgPass0 = toDataUri('expected-transformed-0-unclipped.png');
  const imgPass100 = toDataUri('expected-original-100-unclipped.png');
  const imgFailResize = toDataUri('failing-starter-resize-desync-768.png');
  const imgPassResize = toDataUri('expected-resize-768-split.png');

  const plates = [
    {
      filename: 'plate-01-plumb-line-alignment.png',
      html: `<!DOCTYPE html><html><head><style>${SHARED_CSS}</style></head><body>
        <div class="top-header">
          <div>
            <div class="eyebrow">VISUAL PLATE 01 / 04 · AUTHENTIC COMMIT 289316d5 → 7906e56a GEOMETRY FIX</div>
            <div class="title">Cross-Layer Plumb-Line Misalignment vs. Shared 40px Specimen Inset</div>
            <div class="subtitle">Holding outer horizontal padding constant across Neutral (Before) and Token-Applied (After) specimen layers eliminates split-seam text duplication.</div>
          </div>
          <div class="badge-pill">PLAYWRIGHT TEST 02 · TOLERANCE &lt;= 1.0px</div>
        </div>

        <div class="two-col">
          <div class="panel panel-fail">
            <div>
              <div class="panel-head">
                <span class="panel-tag tag-fail">STARTER (DEFECTIVE · 289316d5)</span>
                <span class="panel-metric" style="color:#FDA4AF;">Measured Drift: 22.0px (Linear) / 24.0px (Stripe)</span>
              </div>
              <div class="img-frame">
                <img src="${imgFailSplit}" />
                <div class="callout-pill" style="top:145px; left:210px; background:#881337; color:#FFE4E6; border:1px solid #F43F5E;">
                  Repeated syllable: "distrib | ributed" &amp; "ro | uting"
                </div>
              </div>
            </div>
            <div class="code-box">
              <div style="color:#FDA4AF; font-weight:700; margin-bottom:3px;">// Defect in starter/src/components/DesignSystemSpecimen.tsx:</div>
              <div>Neutral (Before): padding: "22px <strong>24px</strong>" &nbsp;|&nbsp; Linear (After): padding: "22px <strong>46px</strong>"</div>
              <div style="color:rgba(223,218,206,0.7);">→ 22px horizontal step shifts the right layer inward, misaligning headings, cards &amp; copy across the 50% split.</div>
            </div>
          </div>

          <div class="panel panel-pass">
            <div>
              <div class="panel-head">
                <span class="panel-tag tag-pass">REFERENCE SOLUTION (FIXED · 7906e56a)</span>
                <span class="panel-metric" style="color:#6EE7B7;">Measured Drift: 0.00px Across All 4 Anchors ✓</span>
              </div>
              <div class="img-frame">
                <img src="${imgPassSplit}" />
                <div class="callout-pill" style="top:145px; left:225px; background:#064E3B; color:#D1FAE5; border:1px solid #10B981;">
                  Shared 40px Plumb Inset · Seamless Split Alignment ✓
                </div>
              </div>
            </div>
            <div class="code-box">
              <div style="color:#6EE7B7; font-weight:700; margin-bottom:3px;">// Fix in reference-solution/src/components/DesignSystemSpecimen.tsx:</div>
              <div>const FRAME_INSET_X = isMobile ? 20 : 40;</div>
              <div>const FRAME_PADDING_BODY = \`\${isMobile ? 16 : 22}px \${FRAME_INSET_X}px\`;</div>
            </div>
          </div>
        </div>

        <div class="footer-bar">
          <span>THE MISALIGNED COMPARISON · VISUAL BENCHMARK SUITE</span>
          <span>85 / 85 IDENTICAL DOM NODES · SYNTHETIC SPECIMEN TELEMETRY</span>
        </div>
      </body></html>`,
    },
    {
      filename: 'plate-02-edge-handle-clipping.png',
      html: `<!DOCTYPE html><html><head><style>${SHARED_CSS}
        .split-stack { display: grid; grid-template-rows: 1fr 1fr; gap: 10px; }
        .crop-box { height: 225px; overflow: hidden; position: relative; border: 1px solid rgba(223,218,206,0.22); }
        .crop-box img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
      </style></head><body>
        <div class="top-header">
          <div>
            <div class="eyebrow">VISUAL PLATE 02 / 04 · AUTHENTIC COMMIT 289316d5 → 7906e56a HANDLE GEOMETRY FIX</div>
            <div class="title">Edge Slider Handle Clipping at 0% &amp; 100% vs. Proportional Translation</div>
            <div class="subtitle">Replacing static -50% horizontal centering with translate(-sliderPos%, -50%) keeps the 44×44px knob 100% inside the overflow:hidden stage.</div>
          </div>
          <div class="badge-pill">PLAYWRIGHT TEST 03 · 0% / 50% / 100% BOUNDS</div>
        </div>

        <div class="two-col">
          <div class="panel panel-fail">
            <div class="panel-head">
              <span class="panel-tag tag-fail">STARTER (CLIPPED AT 0% &amp; 100%)</span>
              <span class="panel-metric" style="color:#FDA4AF;">22px (50% of 44px Handle) Clipped Outside Stage</span>
            </div>
            <div class="split-stack">
              <div class="crop-box">
                <img src="${imgFail0}" />
                <div class="callout-pill" style="top:96px; left:36px; background:#881337; color:#FFE4E6; border:1px solid #F43F5E;">
                  ← Transformed (0%): handleRect.left = stageRect.left - 22px (Left Half Cut Off!)
                </div>
              </div>
              <div class="crop-box">
                <img src="${imgFail100}" />
                <div class="callout-pill" style="top:96px; right:36px; background:#881337; color:#FFE4E6; border:1px solid #F43F5E;">
                  Original (100%): handleRect.right = stageRect.right + 22px (Right Half Cut Off!) →
                </div>
              </div>
            </div>
            <div class="code-box">
              <div style="color:#FDA4AF; font-weight:700;">// Defect: Static -50% X translation inside overflow: hidden</div>
              <div>style={{ transform: "translate(-50%, -50%)" }} &nbsp;/* overflows stage by 22px at 0% and 100% */</div>
            </div>
          </div>

          <div class="panel panel-pass">
            <div class="panel-head">
              <span class="panel-tag tag-pass">REFERENCE SOLUTION (UNCLIPPED AT 0% &amp; 100%)</span>
              <span class="panel-metric" style="color:#6EE7B7;">Full 44×44px Handle Flush Inside Stage Bounds ✓</span>
            </div>
            <div class="split-stack">
              <div class="crop-box">
                <img src="${imgPass0}" />
                <div class="callout-pill" style="top:96px; left:58px; background:#064E3B; color:#D1FAE5; border:1px solid #10B981;">
                  ← Transformed (0%): translate(0%, -50%) · Flush With Left Inner Border ✓
                </div>
              </div>
              <div class="crop-box">
                <img src="${imgPass100}" />
                <div class="callout-pill" style="top:96px; right:58px; background:#064E3B; color:#D1FAE5; border:1px solid #10B981;">
                  Original (100%): translate(-100%, -50%) · Flush With Right Inner Border ✓ →
                </div>
              </div>
            </div>
            <div class="code-box">
              <div style="color:#6EE7B7; font-weight:700;">// Fix: Continuous percentage translation across [0%, 100%]</div>
              <div>style={{ transform: \`translate(\${-sliderPos}%, -50%)\` }} &nbsp;/* 0% → 0%, 50% → -50%, 100% → -100% */</div>
            </div>
          </div>
        </div>

        <div class="footer-bar">
          <span>THE MISALIGNED COMPARISON · VISUAL BENCHMARK SUITE</span>
          <span>EDGE-SAFE SLIDER HANDLE GEOMETRY · WAI-ARIA ROLE="SLIDER"</span>
        </div>
      </body></html>`,
    },
    {
      filename: 'plate-03-resize-desynchronization.png',
      html: `<!DOCTYPE html><html><head><style>${SHARED_CSS}</style></head><body>
        <div class="top-header">
          <div>
            <div class="eyebrow">VISUAL PLATE 03 / 04 · VIEWPORT RESIZE INVARIANCE (1440×900 → 768×1024)</div>
            <div class="title">Pixel-Cached Resize Desynchronization vs. Percentage + ResizeObserver Lock</div>
            <div class="subtitle">Storing pixel offsets against an initial mount width causes the divider bar, clipPath boundary, and specimen scale to tear apart on resize.</div>
          </div>
          <div class="badge-pill">PLAYWRIGHT TEST 04 · RESIZE TOLERANCE &lt;= 2.0px</div>
        </div>

        <div class="two-col">
          <div class="panel panel-fail">
            <div>
              <div class="panel-head">
                <span class="panel-tag tag-fail">STARTER AFTER RESIZE TO 768×1024</span>
                <span class="panel-metric" style="color:#FDA4AF;">Divider Drift: +174px · Clip Seam Desync: 348px</span>
              </div>
              <div class="img-frame">
                <img src="${imgFailResize}" />
                <div class="callout-pill" style="top:70px; left:24px; background:#881337; color:#FFE4E6; border:1px solid #F43F5E;">
                  Clip Seam at x=172px (692 - 520)
                </div>
                <div class="callout-pill" style="top:70px; right:40px; background:#881337; color:#FFE4E6; border:1px solid #F43F5E;">
                  Divider Stuck at left: 520px →
                </div>
              </div>
            </div>
            <div class="code-box">
              <div style="color:#FDA4AF; font-weight:700; margin-bottom:3px;">// Three Compounded Resize Failures in Starter:</div>
              <div>1. Divider stays at mount pixel coordinate (left: 520px on a 692px stage = 75.1% instead of 50%).</div>
              <div>2. clipPath uses cachedMountWidth (1040 - 520 = 520px right inset → seam sits at 172px).</div>
              <div>3. DesignSystemSpecimen lacks ResizeObserver, leaving the 1040px canvas unscaled and cut off.</div>
            </div>
          </div>

          <div class="panel panel-pass">
            <div>
              <div class="panel-head">
                <span class="panel-tag tag-pass">REFERENCE SOLUTION AFTER RESIZE TO 768×1024</span>
                <span class="panel-metric" style="color:#6EE7B7;">Divider, Clip Seam &amp; Scale Synchronized (0px Drift) ✓</span>
              </div>
              <div class="img-frame">
                <img src="${imgPassResize}" />
                <div class="callout-pill" style="top:70px; left:195px; background:#064E3B; color:#D1FAE5; border:1px solid #10B981;">
                  left: 50% == clipPath: inset(0 50% 0 0) · Scaled via ResizeObserver ✓
                </div>
              </div>
            </div>
            <div class="code-box">
              <div style="color:#6EE7B7; font-weight:700; margin-bottom:3px;">// Resize-Safe Architecture in Reference Solution:</div>
              <div>1. Controlled percentage state (sliderPos = 50) drives both left: "50%" and inset(0 50% 0 0).</div>
              <div>2. ResizeObserver on specimen wrapper continuously updates scale = rect.width / canonicalWidth.</div>
            </div>
          </div>
        </div>

        <div class="footer-bar">
          <span>THE MISALIGNED COMPARISON · VISUAL BENCHMARK SUITE</span>
          <span>CANONICAL COORDINATE SCALING (1040×650 DESKTOP / 390×844 MOBILE)</span>
        </div>
      </body></html>`,
    },
    {
      filename: 'plate-04-pointer-capture-and-scorecard.png',
      html: `<!DOCTYPE html><html><head><style>${SHARED_CSS}
        .score-table { width: 100%; border-collapse: collapse; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; margin-top: 8px; }
        .score-table th, .score-table td { border: 1px solid rgba(223,218,206,0.18); padding: 9px 12px; text-align: left; }
        .score-table th { background: #23282A; color: #D9A62E; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; }
        .score-table tr:nth-child(even) { background: rgba(255,255,255,0.02); }
        .pill-pass { background: rgba(16,185,129,0.18); color: #6EE7B7; border: 1px solid rgba(16,185,129,0.45); padding: 2px 8px; font-weight: 700; display: inline-block; }
        .pill-fail { background: rgba(244,63,94,0.18); color: #FDA4AF; border: 1px solid rgba(244,63,94,0.45); padding: 2px 8px; font-weight: 700; display: inline-block; }
        .arch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 14px; }
        .arch-card { background: #1B1F21; border: 1px solid rgba(223,218,206,0.18); padding: 14px; }
        .arch-title { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11.5px; font-weight: 800; color: #D9A62E; text-transform: uppercase; margin-bottom: 6px; }
        .arch-body { font-size: 12.5px; color: rgba(223,218,206,0.85); line-height: 1.45; }
      </style></head><body>
        <div class="top-header">
          <div>
            <div class="eyebrow">VISUAL PLATE 04 / 04 · INTERACTION ARCHITECTURE &amp; AUTOMATED GRADING MATRIX</div>
            <div class="title">Pointer Capture, WAI-ARIA Keyboard Contract &amp; Playwright Verification Scorecard</div>
            <div class="subtitle">Deterministic browser verification distinguishing the intentionally defective starter (1/7 passing) from the reference solution (7/7 passing).</div>
          </div>
          <div class="badge-pill">7 DETERMINISTIC PLAYWRIGHT TESTS · CHROMIUM 2x DPR</div>
        </div>

        <div class="arch-grid">
          <div class="arch-card" style="border-top: 3px solid #D9A62E;">
            <div class="arch-title">01 · Pointer Capture &amp; Outside Drag</div>
            <div class="arch-body">
              Calls <code>setPointerCapture(e.pointerId)</code> on <code>pointerdown</code> plus window-level <code>pointermove</code> / <code>pointerup</code> listeners. When the pointer leaves the stage container vertically (<code>y - 80px</code>) or horizontally (<code>x ± 100px</code>), dragging continues smoothly and clamps to <code>[0%, 100%]</code>.
            </div>
          </div>
          <div class="arch-card" style="border-top: 3px solid #10B981;">
            <div class="arch-title">02 · PointerCancel &amp; Release Cleanup</div>
            <div class="arch-body">
              Handles both <code>onPointerUp</code> and <code>onPointerCancel</code>, resetting <code>data-dragging="false"</code>, releasing pointer capture via <code>releasePointerCapture(pointerId)</code>, and preventing any subsequent unpressed <code>pointermove</code> from mutating slider state.
            </div>
          </div>
          <div class="arch-card" style="border-top: 3px solid #5E6AD2;">
            <div class="arch-title">03 · WAI-ARIA 1.2 Slider &amp; Mode Sync</div>
            <div class="arch-body">
              Supports <code>ArrowLeft/Down</code> (<code>-2%</code>), <code>ArrowRight/Up</code> (<code>+2%</code>), <code>Shift+Arrow</code> (<code>±10%</code>), <code>PageUp/PageDown</code> (<code>±10%</code>), <code>Home</code> (<code>0%</code>), and <code>End</code> (<code>100%</code>), synchronizing <code>aria-pressed</code> across <code>Original</code>, <code>Split</code>, and <code>Transformed</code> buttons.
            </div>
          </div>
        </div>

        <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
          <table class="score-table">
            <thead>
              <tr>
                <th style="width: 52px;">Test</th>
                <th>Playwright Behavioral / Geometric Assertion (tests/comparison.spec.ts)</th>
                <th style="width: 110px;">Rubric Pts</th>
                <th style="width: 240px;">Starter (npm run test:starter)</th>
                <th style="width: 240px;">Reference (npm run test:reference)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>#1</strong></td>
                <td>85-Node Shared Specimen DOM &amp; 100% Text Content Parity (3 Studies × 2 Viewports)</td>
                <td>10 pts</td>
                <td><span class="pill-pass">PASS</span> 85/85 nodes intact</td>
                <td><span class="pill-pass">PASS</span> 85/85 nodes · 0 errors</td>
              </tr>
              <tr>
                <td><strong>#2</strong></td>
                <td>Cross-Layer Left Plumb-Line Alignment (<code>header-brand</code>, <code>hero-heading</code>, <code>card-grid</code>, <code>ledger</code> &lt;= 1px)</td>
                <td>20 pts</td>
                <td><span class="pill-fail">FAIL</span> 15.97px – 24.00px drift</td>
                <td><span class="pill-pass">PASS</span> 0.00px drift across all</td>
              </tr>
              <tr>
                <td><strong>#3</strong></td>
                <td>Edge-Safe Unclipped 44×44px Slider Handle Bounds at <code>0%</code> (Transformed), <code>50%</code> (Split), and <code>100%</code> (Original)</td>
                <td>15 pts</td>
                <td><span class="pill-fail">FAIL</span> Clipped by 22px at 0%/100%</td>
                <td><span class="pill-pass">PASS</span> 100% inside stage bounds</td>
              </tr>
              <tr>
                <td><strong>#4</strong></td>
                <td>Viewport Resize Invariance (<code>1440×900 → 768×1024 → 600×900</code> Divider, ClipPath &amp; Specimen Scale Sync)</td>
                <td>20 pts</td>
                <td><span class="pill-fail">FAIL</span> +174px divider drift</td>
                <td><span class="pill-pass">PASS</span> &lt;= 0.5px sync across resizes</td>
              </tr>
              <tr>
                <td><strong>#5</strong></td>
                <td>Pointer Capture &amp; Outside-Container Drag Continuation (<code>y - 80px</code>, clamping at <code>x - 100px</code> &amp; <code>x + 100px</code>)</td>
                <td>15 pts</td>
                <td><span class="pill-fail">FAIL</span> Drops drag on mouseleave</td>
                <td><span class="pill-pass">PASS</span> Tracks &amp; clamps [0%, 100%]</td>
              </tr>
              <tr>
                <td><strong>#6</strong></td>
                <td>Pointer Cancellation Cleanup (<code>pointercancel</code> resets <code>data-dragging="false"</code> &amp; ignores post-cancel moves)</td>
                <td>10 pts</td>
                <td><span class="pill-fail">FAIL</span> PointerEvent unhandled</td>
                <td><span class="pill-pass">PASS</span> Clean state &amp; capture release</td>
              </tr>
              <tr>
                <td><strong>#7</strong></td>
                <td>WAI-ARIA Slider Keyboard Navigation (<code>Arrow</code>, <code>Shift+Arrow</code>, <code>PageUp/Down</code>, <code>Home/End</code>) &amp; Mode Sync</td>
                <td>10 pts</td>
                <td><span class="pill-fail">FAIL</span> Missing Up/Down/Home/End</td>
                <td><span class="pill-pass">PASS</span> All keys &amp; mode buttons sync</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer-bar">
          <span>THE MISALIGNED COMPARISON · VISUAL BENCHMARK SUITE</span>
          <span>TOTAL SCORE: STARTER 10 / 100 (1/7 PASSED) &nbsp;→&nbsp; REFERENCE SOLUTION 100 / 100 (7/7 PASSED)</span>
        </div>
      </body></html>`,
    },
  ];

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 860 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    for (const plate of plates) {
      await page.setContent(plate.html, { waitUntil: 'load' });
      await page.waitForTimeout(100);
      const outPath = path.join(PLATES_DIR, plate.filename);
      await page.screenshot({ path: outPath, fullPage: false });
      if (fs.existsSync(ARTIFACT_DIR)) {
        fs.copyFileSync(outPath, path.join(ARTIFACT_DIR, plate.filename));
      }
      console.log(`Generated ${plate.filename}`);
    }

    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
