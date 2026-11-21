import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal, Monitor, Smartphone, Layers, Compass } from 'lucide-react';
import {
  DESIGN_STUDIES,
  STUDY_BY_ID,
  VIEWPORT_MODES,
  type StudyId,
  type ViewportModeId,
  type ComparisonSurface,
} from '../data/studies';
import { DesignSystemSpecimen } from './DesignSystemSpecimen';
import { SyntheticPlateSurface } from './SyntheticPlateSurface';

/**
 * Starter (Intentionally Defective) — Before/After Comparison Slider
 *
 * Known reproducible defects to diagnose and repair:
 * 1. Divider position drifts or desynchronizes during resize (tracks pixel offset
 *    against a cached initial mount width instead of a resize-safe percentage).
 * 2. Pointer tracking loses drag state when the pointer leaves the comparison container
 *    (container-scoped mouse listeners with onMouseLeave cancellation, no pointer capture,
 *    and no pointercancel cleanup).
 * 3. Slider handle becomes clipped near the 0% and 100% edges (uses static
 *    translate(-50%, -50%) inside an overflow:hidden stage).
 * 4. Cross-layer horizontal plumb-line misalignment across the split divider (in
 *    DesignSystemSpecimen.tsx) and incomplete WAI-ARIA keyboard slider controls.
 */
export const BeforeAfterComparison: React.FC = () => {
  const [activeStudyId, setActiveStudyId] = useState<StudyId>('linear');
  const [viewportModeId, setViewportModeId] = useState<ViewportModeId>('desktop');
  const [comparisonSurface, setComparisonSurface] = useState<ComparisonSurface>('specimen');

  // DEFECT 1: Stores divider position in pixels and caches the initial container width
  // only once on mount. When the viewport or container resizes, dividerPx stays at its
  // old pixel coordinate while the container width changes, desynchronizing the divider
  // line, the clipPath inset, and the percentage readout.
  const [dividerPx, setDividerPx] = useState<number>(520);
  const [cachedMountWidth, setCachedMountWidth] = useState<number>(1040);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const activeStageRef = useRef<HTMLDivElement | null>(null);
  const sliderHandleRef = useRef<HTMLDivElement | null>(null);

  const activeStudy = STUDY_BY_ID[activeStudyId];
  const activeMode =
    VIEWPORT_MODES.find((m) => m.id === viewportModeId) ?? VIEWPORT_MODES[0];
  const isSyntheticPlateMode =
    activeStudyId === 'plaidis' && comparisonSurface === 'synthetic-plate';

  // Captures container width only on mount (does not update on resize)
  useEffect(() => {
    const el = activeStageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) {
      setCachedMountWidth(rect.width);
      setDividerPx(rect.width / 2);
    }
  }, []);

  const handleSelectStudy = useCallback((nextStudyId: StudyId) => {
    setActiveStudyId(nextStudyId);
    if (nextStudyId !== 'plaidis') {
      setComparisonSurface('specimen');
    }
  }, []);

  // DEFECT 2: Container-only mouse tracking without pointer capture or window listeners.
  // Leaving the stage bounding box triggers handleMouseLeave and drops drag state.
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    const el = activeStageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nextPx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setDividerPx(nextPx);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const el = activeStageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nextPx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setDividerPx(nextPx);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    // Drops drag state as soon as the pointer exits the stage container
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // DEFECT: Incomplete keyboard support (only ArrowLeft/ArrowRight in raw pixel jumps;
  // missing Home, End, PageUp, PageDown, ArrowUp, ArrowDown, and Shift+Arrow percentage steps)
  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setDividerPx((prev) => Math.max(0, prev - 20));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setDividerPx((prev) => Math.min(cachedMountWidth, prev + 20));
    }
  };

  const derivedPercent =
    cachedMountWidth > 0
      ? Math.round(Math.max(0, Math.min(100, (dividerPx / cachedMountWidth) * 100)))
      : 50;

  // DEFECT 1 continued: clipPath uses cachedMountWidth in pixels instead of percentage,
  // and divider uses dividerPx in pixels.
  const rightClipPx = Math.max(0, cachedMountWidth - dividerPx);

  return (
    <section
      id="interactive-comparison"
      aria-label="Design Intelligence Interactive Before/After Comparison"
      className="comparison-shell"
    >
      <div className="comparison-container">
        {/* Header & Provenance Banner */}
        <header className="comparison-header">
          <div className="comparison-eyebrow">
            <span className="comparison-badge">BENCHMARK STARTER (DEFECTIVE)</span>
            <span className="comparison-meta">
              3 Comparative Studies · Shared 85-Node Specimen · Repair Alignment, Resize &amp; Pointer Capture
            </span>
          </div>
          <h1 className="comparison-title">
            How do verified design-system tokens transform the same interface?
          </h1>
          <p className="comparison-lead">
            Select any reference study below to compare the{' '}
            <strong>Original Neutral Specimen</strong> against the{' '}
            <strong>Token-Applied Specimen</strong>. Both layers share the exact same 85 DOM
            elements and text strings.
          </p>
        </header>

        {/* 1. Three-Study Selector Bar */}
        <div
          role="group"
          aria-label="Design system study selector"
          className="study-selector-grid"
        >
          {DESIGN_STUDIES.map((study) => {
            const isSelected = study.id === activeStudyId;
            return (
              <button
                key={study.id}
                type="button"
                data-study-btn={study.id}
                onClick={() => handleSelectStudy(study.id)}
                aria-pressed={isSelected}
                className={`study-card-btn ${isSelected ? 'study-card-btn-active' : ''}`}
              >
                <div className="study-card-top">
                  <span className="study-card-sub">{study.selectorSub}</span>
                  <span className="study-card-num">STUDY {study.num}</span>
                </div>
                <div className="study-card-title-row">
                  <span className="study-card-title">{study.selectorLabel}</span>
                  <span
                    className="study-card-swatch"
                    style={{ backgroundColor: study.accentHex }}
                    aria-hidden="true"
                  />
                </div>
                <p className="study-card-desc">{study.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* 2. Primary Stage Control Bar: Viewport + Original/Split/Transformed + Surface */}
        <div className="control-bar">
          <div className="control-bar-left">
            {/* Viewport Mode Selector (Desktop / Mobile) */}
            <div
              role="group"
              aria-label="Viewport comparison mode"
              className="segmented-group"
            >
              {VIEWPORT_MODES.map((m) => {
                const Icon = m.id === 'desktop' ? Monitor : Smartphone;
                const active = m.id === viewportModeId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-mode-btn={m.id}
                    onClick={() => setViewportModeId(m.id)}
                    aria-pressed={active}
                    className={`segmented-btn ${active ? 'segmented-btn-active' : ''}`}
                  >
                    <Icon className="control-icon" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Original / Split / Transformed Comparison Mode Buttons */}
            <div
              role="group"
              aria-label="Comparison view mode"
              className="segmented-group"
            >
              {[
                {
                  id: 'original' as const,
                  label: 'Original',
                  targetPx: cachedMountWidth,
                  isCurrent: derivedPercent === 100,
                },
                {
                  id: 'split' as const,
                  label: 'Split',
                  targetPx: cachedMountWidth / 2,
                  isCurrent: derivedPercent > 0 && derivedPercent < 100,
                },
                {
                  id: 'transformed' as const,
                  label: 'Transformed',
                  targetPx: 0,
                  isCurrent: derivedPercent === 0,
                },
              ].map((modeOpt) => (
                <button
                  key={modeOpt.id}
                  type="button"
                  data-comparison-view={modeOpt.id}
                  onClick={() => setDividerPx(modeOpt.targetPx)}
                  aria-pressed={modeOpt.isCurrent}
                  className={`segmented-btn ${modeOpt.isCurrent ? 'segmented-btn-active' : ''}`}
                >
                  {modeOpt.label}
                </button>
              ))}
            </div>

            {/* Study 01 Surface Toggle */}
            {activeStudyId === 'plaidis' && (
              <div
                role="group"
                aria-label="Study 01 comparison target"
                className="segmented-group"
              >
                <button
                  type="button"
                  data-surface-btn="specimen"
                  onClick={() => setComparisonSurface('specimen')}
                  aria-pressed={comparisonSurface === 'specimen'}
                  className={`segmented-btn ${
                    comparisonSurface === 'specimen' ? 'segmented-btn-teal' : ''
                  }`}
                >
                  <Layers className="control-icon" />
                  <span>Shared Neutral Specimen</span>
                </button>
                <button
                  type="button"
                  data-surface-btn="synthetic-plate"
                  onClick={() => setComparisonSurface('synthetic-plate')}
                  aria-pressed={comparisonSurface === 'synthetic-plate'}
                  className={`segmented-btn ${
                    comparisonSurface === 'synthetic-plate' ? 'segmented-btn-teal' : ''
                  }`}
                >
                  <Compass className="control-icon" />
                  <span>Synthetic Calibration Plate</span>
                </button>
              </div>
            )}
          </div>

          <div className="control-bar-right">
            <span className="keyboard-hint">
              Drag handle or use <kbd>←</kbd> <kbd>→</kbd> keys
            </span>
            <span data-testid="split-readout" className="split-readout">
              {derivedPercent}% / {100 - derivedPercent}%
            </span>
          </div>
        </div>

        {/* 3. Interactive Comparison Stage Frame */}
        <div className="stage-outer-frame">
          <div className="stage-header-strip">
            <div className="stage-side-label">
              <span className="stage-dot stage-dot-before" />
              <span>
                {isSyntheticPlateMode
                  ? 'BEFORE · Stepped Baseline Plate'
                  : 'BEFORE · Original Neutral Specimen'}
              </span>
            </div>
            <div className="stage-center-meta">
              {activeStudy.selectorLabel} · {activeMode.label} · {derivedPercent}% Before /{' '}
              {100 - derivedPercent}% After
            </div>
            <div className="stage-side-label stage-side-label-after">
              <span>
                {isSyntheticPlateMode
                  ? 'AFTER · Calibrated 0px-Drift Plate'
                  : `AFTER · ${activeStudy.selectorLabel} Tokens Applied`}
              </span>
              <span className="stage-dot stage-dot-after" />
            </div>
          </div>

          <div className="stage-well">
            {VIEWPORT_MODES.map((mode) => {
              const isActive = mode.id === viewportModeId;
              return (
                <div
                  key={mode.id}
                  ref={isActive ? activeStageRef : null}
                  data-slider-stage={isActive ? 'true' : undefined}
                  data-stage-mode={mode.id}
                  data-stage-study={activeStudyId}
                  data-dragging={isActive ? String(isDragging) : undefined}
                  onMouseDown={isActive ? handleMouseDown : undefined}
                  onMouseMove={isActive ? handleMouseMove : undefined}
                  onMouseUp={isActive ? handleMouseUp : undefined}
                  onMouseLeave={isActive ? handleMouseLeave : undefined}
                  style={{
                    aspectRatio: `${mode.canonicalWidth} / ${mode.canonicalHeight}`,
                    maxWidth: `${mode.canonicalWidth}px`,
                  }}
                  className={`stage-viewport ${
                    isActive ? 'stage-viewport-active' : 'stage-viewport-hidden'
                  }`}
                >
                  {isSyntheticPlateMode ? (
                    <>
                      {/* LAYER 1 (BASE): AFTER PLATE */}
                      <div data-layer="after" className="stage-layer">
                        <SyntheticPlateSurface phase="after" viewport={mode.id} />
                      </div>
                      {/* LAYER 2 (CLIPPED OVERLAY): BEFORE PLATE */}
                      <div
                        data-layer="before"
                        aria-hidden="true"
                        style={{
                          clipPath: `inset(0 ${rightClipPx}px 0 0)`,
                        }}
                        className="stage-layer"
                      >
                        <SyntheticPlateSurface phase="before" viewport={mode.id} />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* LAYER 1 (BASE): AFTER — TOKEN-APPLIED SHARED SPECIMEN */}
                      <div data-layer="after" className="stage-layer">
                        <DesignSystemSpecimen variant={activeStudyId} viewport={mode.id} />
                      </div>

                      {/* LAYER 2 (CLIPPED OVERLAY): BEFORE — ORIGINAL NEUTRAL SPECIMEN */}
                      <div
                        data-layer="before"
                        aria-hidden="true"
                        style={{
                          clipPath: `inset(0 ${rightClipPx}px 0 0)`,
                        }}
                        className="stage-layer"
                      >
                        <DesignSystemSpecimen variant="neutral" viewport={mode.id} />
                      </div>
                    </>
                  )}

                  {/* DEFECT 1 & 3: Pixel-positioned divider + static -50% handle centering that clips at 0% and 100% */}
                  {isActive && (
                    <div
                      data-slider-divider="true"
                      style={{ left: `${dividerPx}px` }}
                      className="slider-divider"
                    >
                      <div
                        ref={sliderHandleRef}
                        data-slider-handle="true"
                        role="slider"
                        tabIndex={0}
                        aria-orientation="horizontal"
                        aria-label={`Before and after comparison slider (${activeStudy.selectorLabel} — ${mode.fullLabel})`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={derivedPercent}
                        aria-valuetext={`${derivedPercent}% Before (Neutral Specimen), ${
                          100 - derivedPercent
                        }% After (${activeStudy.selectorLabel} Tokens Applied)`}
                        onKeyDown={handleSliderKeyDown}
                        style={{
                          transform: 'translate(-50%, -50%)',
                        }}
                        className="slider-handle"
                      >
                        <MoveHorizontal className="slider-handle-icon" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explicit Synthetic Demonstration Data & Structural Parity Footer */}
          <div className="stage-footer-strip">
            <span>
              <strong className="text-gold">Synthetic Demonstration Specimen:</strong> Metrics (
              <code>1,420 req/s</code>, <code>18.4 ms</code>, <code>100.0%</code>,{' '}
              <code>RT-4091..4093</code>) are illustrative fixture data held constant across all
              studies—not live operational telemetry.
            </span>
            <span className="parity-badge">
              DOM Parity: 85 / 85 identical nodes · 100% text parity
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterComparison;
