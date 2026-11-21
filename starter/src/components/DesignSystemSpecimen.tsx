import React, { useRef, useState, useEffect } from 'react';
import { ArrowUpRight, Activity, Layers, ShieldCheck } from 'lucide-react';
import type { SpecimenVariant, ViewportModeId } from '../data/studies';

interface MetricCardItem {
  id: string;
  code: string;
  title: string;
  value: string;
  delta: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const METRIC_CARDS: MetricCardItem[] = [
  {
    id: '01',
    code: 'INGESTION PIPELINE',
    title: 'Schema Validation',
    value: '1,420 req/s',
    delta: '+12.4% vs baseline',
    desc: 'Deterministic field normalization and payload validation across distributed edge nodes.',
    icon: Layers,
  },
  {
    id: '02',
    code: 'DECISION LATENCY',
    title: 'Rule-Graph Dispatch',
    value: '18.4 ms',
    delta: 'p99 < 24.0ms target',
    desc: 'Sub-millisecond priority routing with zero unverified state transitions.',
    icon: Activity,
  },
  {
    id: '03',
    code: 'VERIFICATION GATES',
    title: 'Telemetry Coverage',
    value: '100.0%',
    delta: '14 / 14 gates active',
    desc: 'Continuous WCAG 2.1 luminance and DOM bounding-box alignment assertions.',
    icon: ShieldCheck,
  },
];

interface QueueRowItem {
  id: string;
  task: string;
  env: string;
  latency: string;
  status: string;
  tone: 'positive' | 'warning' | 'brand';
}

const QUEUE_ROWS: QueueRowItem[] = [
  {
    id: 'RT-4091',
    task: 'Multi-region schema normalization check',
    env: 'us-east · edge-04',
    latency: '11.2 ms',
    status: 'VERIFIED',
    tone: 'positive',
  },
  {
    id: 'RT-4092',
    task: 'Surface luminance & contrast threshold audit',
    env: 'eu-central · ui-02',
    latency: '16.8 ms',
    status: 'ACTIVE',
    tone: 'warning',
  },
  {
    id: 'RT-4093',
    task: 'Viewport plumb-line geometry verification',
    env: 'global · runner-09',
    latency: '9.4 ms',
    status: 'READY',
    tone: 'brand',
  },
];

export interface DesignSystemSpecimenProps {
  variant?: SpecimenVariant;
  viewport?: ViewportModeId;
  simulatingHover?: boolean;
  reducedMotion?: boolean;
}

/**
 * Starter (Intentionally Defective) — Shared 85-Node Specimen
 *
 * Contains two defects relative to the reference implementation:
 * - Defect A (Authentic 289316d5 bug): Each variant applies its own outer horizontal
 *   padding (Neutral 24px, Plaidis 40px, Linear 46px, Stripe 48px on desktop;
 *   12px/16px vs 20px/24px on mobile) instead of a shared horizontal plumb inset,
 *   causing the Before and After specimen layers to misalign across the split divider.
 * - Defect B (Resize desynchronization): Scale factor is computed only once on initial
 *   mount without observing container resize events or viewport changes.
 */
export const DesignSystemSpecimen: React.FC<DesignSystemSpecimenProps> = ({
  variant = 'neutral',
  viewport = 'desktop',
  simulatingHover = false,
  reducedMotion = false,
}) => {
  const isMobile = viewport === 'mobile';
  const canonicalWidth = isMobile ? 390 : 1040;
  const canonicalHeight = isMobile ? 844 : 650;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(1);

  // DEFECT: Computes scale only once on mount and does not attach a ResizeObserver
  // or window resize listener, so the specimen scale drifts when the container resizes.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) {
      setScale(rect.width / canonicalWidth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNeutral = variant === 'neutral';
  const isPlaidis = variant === 'plaidis';
  const isLinear = variant === 'linear';
  const isStripe = variant === 'stripe';

  const canvasStyle: React.CSSProperties = isNeutral
    ? {
        backgroundColor: '#F4F4F5',
        color: '#18181B',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }
    : isPlaidis
    ? {
        backgroundColor: '#EDE9E0',
        color: '#23282A',
        fontFamily: '"Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, sans-serif',
      }
    : isLinear
    ? {
        backgroundColor: '#08090A',
        color: '#F7F8F8',
        fontFamily:
          '"Inter Variable", "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontFeatureSettings: '"cv01", "ss03"',
      }
    : {
        backgroundColor: '#F8FAFD',
        color: '#061B31',
        fontFamily: 'sohne-var, "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontFeatureSettings: '"ss01"',
      };

  // DEFECT (Authentic 289316d5 padding mismatch): Per-variant horizontal padding
  // causes the Before (neutral: 24px desktop / 12px mobile) and After layers
  // (40px / 46px / 48px desktop) to sit on different vertical plumb lines.
  const headerStyle: React.CSSProperties = isNeutral
    ? {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E4E4E7',
        padding: isMobile ? '10px 12px' : '12px 24px',
      }
    : isPlaidis
    ? {
        backgroundColor: '#23282A',
        color: '#EDE9E0',
        borderBottom: '2px solid #23282A',
        padding: isMobile ? '10px 12px' : '12px 40px',
      }
    : isLinear
    ? {
        backgroundImage:
          'linear-gradient(rgba(11, 11, 11, 0.88) 0%, rgba(15, 16, 17, 0.78) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '10px 12px' : '12px 46px',
      }
    : {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5EDF5',
        padding: isMobile ? '10px 12px' : '12px 48px',
      };

  // DEFECT (Authentic 289316d5 body padding mismatch):
  const bodyPaddingStyle: React.CSSProperties = isNeutral
    ? { padding: isMobile ? '16px 16px' : '22px 24px' }
    : isPlaidis
    ? { padding: isMobile ? '16px 20px' : '22px 40px' }
    : isLinear
    ? { padding: isMobile ? '16px 24px' : '22px 46px' }
    : { padding: isMobile ? '16px 16px' : '22px 48px' };

  const headlineStyle: React.CSSProperties = isNeutral
    ? {
        fontSize: isMobile ? '22px' : '28px',
        fontWeight: 600,
        lineHeight: 1.15,
        letterSpacing: '-0.01em',
        color: '#18181B',
        margin: 0,
      }
    : isPlaidis
    ? {
        fontSize: isMobile ? '17.5px' : '22.5px',
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        color: '#23282A',
        textTransform: 'uppercase',
        margin: 0,
      }
    : isLinear
    ? {
        fontSize: isMobile ? '22px' : '29px',
        fontWeight: 510,
        lineHeight: 1.12,
        letterSpacing: '-0.022em',
        color: '#F7F8F8',
        margin: 0,
      }
    : {
        fontSize: isMobile ? '22px' : '29px',
        fontWeight: 300,
        lineHeight: 1.14,
        letterSpacing: '-0.02em',
        color: '#061B31',
        margin: 0,
      };

  const leadStyle: React.CSSProperties = isNeutral
    ? {
        fontSize: isMobile ? '12.5px' : '13.5px',
        fontWeight: 400,
        lineHeight: 1.48,
        color: '#52525B',
        margin: 0,
      }
    : isPlaidis
    ? {
        fontSize: isMobile ? '12.5px' : '13.5px',
        fontWeight: 400,
        lineHeight: 1.45,
        color: '#23282A',
        margin: 0,
      }
    : isLinear
    ? {
        fontSize: isMobile ? '12.5px' : '13.5px',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '-0.011em',
        color: '#8A8F98',
        margin: 0,
      }
    : {
        fontSize: isMobile ? '12.5px' : '13.5px',
        fontWeight: 300,
        lineHeight: 1.48,
        color: '#64748D',
        margin: 0,
      };

  const primaryCtaStyle: React.CSSProperties = isNeutral
    ? {
        backgroundColor: '#27272A',
        color: '#FFFFFF',
        borderRadius: '6px',
        border: '1px solid #27272A',
        padding: isMobile ? '8px 14px' : '8px 16px',
        fontSize: '12px',
        fontWeight: 600,
      }
    : isPlaidis
    ? {
        backgroundColor: simulatingHover ? '#D9A62E' : '#23282A',
        color: simulatingHover ? '#141617' : '#EDE9E0',
        borderRadius: '0px',
        border: '2px solid #23282A',
        padding: isMobile ? '8px 14px' : '8px 18px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        transition: reducedMotion ? 'none' : 'all 450ms cubic-bezier(0.23, 1, 0.32, 1)',
      }
    : isLinear
    ? {
        backgroundColor: simulatingHover ? '#FFFFFF' : '#E5E5E6',
        color: '#08090A',
        borderRadius: '9999px',
        border: '1px solid #E5E5E6',
        padding: isMobile ? '6px 13px' : '6px 14px',
        fontSize: '12px',
        fontWeight: 510,
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.08)',
        transition: reducedMotion ? 'none' : 'all 160ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    : {
        backgroundColor: simulatingHover ? '#4032C8' : '#533AFD',
        color: '#FFFFFF',
        borderRadius: '4px',
        border: '1px solid transparent',
        padding: isMobile ? '8px 16px' : '9px 18px',
        fontSize: '12.5px',
        fontWeight: 400,
        transition: reducedMotion ? 'none' : 'all 300ms cubic-bezier(0.25, 1, 0.5, 1)',
      };

  const secondaryCtaStyle: React.CSSProperties = isNeutral
    ? {
        backgroundColor: '#FFFFFF',
        color: '#27272A',
        borderRadius: '6px',
        border: '1px solid #D4D4D8',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: 500,
      }
    : isPlaidis
    ? {
        backgroundColor: 'transparent',
        color: '#23282A',
        borderRadius: '0px',
        border: '2px solid #23282A',
        padding: isMobile ? '8px 14px' : '8px 16px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        textDecoration: simulatingHover ? 'underline' : 'none',
      }
    : isLinear
    ? {
        backgroundColor: simulatingHover
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 0.04)',
        color: '#D0D6E0',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: 510,
      }
    : {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        color: '#533AFD',
        borderRadius: '4px',
        border: '1px solid #B9B9F9',
        padding: isMobile ? '8px 14px' : '9px 16px',
        fontSize: '12.5px',
        fontWeight: 400,
      };

  const getCardStyle = (idx: number): React.CSSProperties => {
    if (isNeutral) {
      return {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E4E4E7',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        padding: isMobile ? '11px 13px' : '14px 16px',
      };
    }
    if (isPlaidis) {
      return {
        backgroundColor: idx === 1 ? '#DFDACE' : '#EDE9E0',
        borderTop: '2px solid #23282A',
        borderBottom: '1px solid rgba(35, 40, 42, 0.25)',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: '0px',
        boxShadow: 'none',
        padding: isMobile ? '11px 10px' : '14px 12px',
      };
    }
    if (isLinear) {
      return {
        backgroundColor: '#0F1011',
        backgroundImage:
          'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))',
        border:
          simulatingHover && idx === 1
            ? '1px solid rgba(130, 143, 255, 0.45)'
            : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '9px',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 0px 0px 1px',
        padding: isMobile ? '11px 13px' : '13px 15px',
      };
    }
    return {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5EDF5',
      borderRadius: '6px',
      boxShadow:
        simulatingHover && idx === 1
          ? '0px 20px 40px -10px rgba(50, 50, 93, 0.18), 0px 6px 14px rgba(0, 55, 112, 0.08)'
          : '0px 16px 32px 0px rgba(50, 50, 93, 0.10), 0px 2px 6px 0px rgba(0, 59, 137, 0.04)',
      padding: isMobile ? '11px 13px' : '14px 16px',
    };
  };

  const getStatusBadgeStyle = (tone: QueueRowItem['tone']): React.CSSProperties => {
    if (isNeutral) {
      return {
        backgroundColor: '#F4F4F5',
        color: '#3F3F46',
        border: '1px solid #D4D4D8',
        borderRadius: '4px',
      };
    }
    if (isPlaidis) {
      if (tone === 'warning') {
        return {
          backgroundColor: '#D9A62E',
          color: '#141617',
          border: '1px solid #23282A',
          borderRadius: '0px',
        };
      }
      if (tone === 'brand') {
        return {
          backgroundColor: '#312DFB',
          color: '#FFFFFF',
          border: '1px solid #312DFB',
          borderRadius: '0px',
        };
      }
      return {
        backgroundColor: '#17504A',
        color: '#EDE9E0',
        border: '1px solid #17504A',
        borderRadius: '0px',
      };
    }
    if (isLinear) {
      if (tone === 'positive') {
        return {
          backgroundColor: 'rgba(104, 204, 88, 0.14)',
          color: '#68CC58',
          border: '1px solid rgba(104, 204, 88, 0.35)',
          borderRadius: '9999px',
        };
      }
      if (tone === 'warning') {
        return {
          backgroundColor: 'rgba(212, 177, 68, 0.14)',
          color: '#D4B144',
          border: '1px solid rgba(212, 177, 68, 0.35)',
          borderRadius: '9999px',
        };
      }
      return {
        backgroundColor: 'rgba(94, 106, 210, 0.18)',
        color: '#828FFF',
        border: '1px solid rgba(130, 143, 255, 0.35)',
        borderRadius: '9999px',
      };
    }
    if (tone === 'positive') {
      return {
        backgroundColor: 'rgba(0, 178, 97, 0.18)',
        color: '#B6F2C7',
        border: '1px solid rgba(0, 178, 97, 0.4)',
        borderRadius: '4px',
      };
    }
    if (tone === 'warning') {
      return {
        backgroundColor: 'rgba(255, 97, 24, 0.2)',
        color: '#FFD8C6',
        border: '1px solid rgba(255, 97, 24, 0.45)',
        borderRadius: '4px',
      };
    }
    return {
      backgroundColor: 'rgba(83, 58, 253, 0.35)',
      color: '#E8E9FF',
      border: '1px solid rgba(154, 154, 254, 0.45)',
      borderRadius: '4px',
    };
  };

  return (
    <div
      ref={wrapperRef}
      data-specimen-variant={variant}
      data-specimen-viewport={viewport}
      data-specimen-scale={scale.toFixed(4)}
      className="specimen-wrapper"
    >
      <div
        data-specimen-canvas="true"
        style={{
          ...canvasStyle,
          width: `${canonicalWidth}px`,
          height: `${canonicalHeight}px`,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
        className="specimen-canvas"
      >
        {/* 1. SPECIMEN HEADER BAR */}
        <div style={headerStyle} className="specimen-header">
          <div className="specimen-header-left">
            <div
              data-specimen-anchor="header-brand"
              style={{ fontSize: isMobile ? '10px' : '11px' }}
              className="specimen-brand"
            >
              <span
                style={{
                  backgroundColor: isNeutral
                    ? '#27272A'
                    : isPlaidis
                    ? '#D9A62E'
                    : isLinear
                    ? '#5E6AD2'
                    : '#533AFD',
                  borderRadius: isPlaidis ? '0px' : isLinear ? '9999px' : '3px',
                }}
                className="specimen-brand-dot"
              />
              <span className="specimen-truncate">CM // SPECIMEN-04</span>
            </div>

            <div
              style={{
                color: isNeutral
                  ? '#52525B'
                  : isPlaidis
                  ? 'rgba(237, 233, 224, 0.78)'
                  : isLinear
                  ? '#8A8F98'
                  : '#50617A',
                fontSize: isMobile ? '9.5px' : isLinear ? '12.5px' : '13px',
              }}
              className={`specimen-nav ${isMobile ? 'specimen-nav-mobile' : 'specimen-nav-desktop'}`}
            >
              <span>Overview</span>
              <span>Pipelines</span>
              <span>Verification</span>
            </div>
          </div>

          <div className="specimen-header-right">
            <span
              style={{
                fontFamily:
                  'ui-monospace, "Berkeley Mono", "SourceCodePro", SFMono-Regular, monospace',
                fontSize: isMobile ? '9px' : '10px',
                padding: isMobile ? '1.5px 5px' : '2px 7px',
                borderRadius: isPlaidis ? '0px' : isLinear ? '9999px' : '4px',
                backgroundColor: isNeutral
                  ? '#F4F4F5'
                  : isPlaidis
                  ? '#17504A'
                  : isLinear
                  ? 'rgba(255, 255, 255, 0.05)'
                  : '#E8E9FF',
                color: isNeutral
                  ? '#3F3F46'
                  : isPlaidis
                  ? '#EDE9E0'
                  : isLinear
                  ? '#D0D6E0'
                  : '#533AFD',
                border: isLinear ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              }}
            >
              SPECIMEN · v4.2
            </span>
          </div>
        </div>

        {/* 2. MAIN SPECIMEN BODY */}
        <div style={bodyPaddingStyle} className="specimen-body">
          {/* HERO SECTION */}
          <div className="specimen-hero">
            <div
              style={{
                borderBottom: isPlaidis
                  ? '1px solid rgba(35, 40, 42, 0.35)'
                  : '1px solid transparent',
                paddingBottom: '4px',
              }}
              className="specimen-eyebrow-row"
            >
              <span
                data-specimen-anchor="eyebrow-label"
                style={{
                  fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                  fontSize: '10.5px',
                  fontWeight: isStripe ? 500 : 600,
                  letterSpacing: isPlaidis && !isMobile ? '0.14em' : '0.06em',
                  color: isNeutral
                    ? '#52525B'
                    : isPlaidis
                    ? '#17504A'
                    : isLinear
                    ? '#828FFF'
                    : '#533AFD',
                  textTransform: 'uppercase',
                }}
              >
                01 / Synthetic Interface Specimen
              </span>

              <span
                style={{
                  fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                  fontSize: '10px',
                  color: isNeutral
                    ? '#52525B'
                    : isPlaidis
                    ? '#23282A'
                    : isLinear
                    ? '#8A8F98'
                    : '#64748D',
                }}
              >
                Synthetic Demo Fixture · Mock Data
              </span>
            </div>

            <div className="specimen-copy-block">
              <h3 data-specimen-anchor="hero-heading" style={headlineStyle}>
                Deterministic workflow telemetry for operational teams.
              </h3>
              <p data-specimen-anchor="hero-lead" style={leadStyle}>
                Standardizes intake routing, latency thresholds, and verification gates across distributed product environments without altering core logic.
              </p>
            </div>

            <div className="specimen-actions">
              <span
                data-specimen-anchor="primary-cta"
                style={primaryCtaStyle}
                className="specimen-cta"
              >
                <span>Deploy Verification Gate</span>
                <ArrowUpRight className="specimen-icon-sm" />
              </span>
              <span style={secondaryCtaStyle} className="specimen-cta">
                <span>Inspect Rule Graph</span>
              </span>
            </div>
          </div>

          {/* 3. THREE-CARD METRIC & CAPABILITY GRID */}
          <div
            data-specimen-anchor="card-grid"
            className={`specimen-grid ${isMobile ? 'specimen-grid-mobile' : 'specimen-grid-desktop'}`}
          >
            {METRIC_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  data-specimen-card={card.id}
                  style={getCardStyle(idx)}
                  className="specimen-card"
                >
                  <div className="specimen-card-top">
                    <span
                      style={{
                        fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        color: isNeutral
                          ? '#52525B'
                          : isPlaidis
                          ? '#17504A'
                          : isLinear
                          ? '#8A8F98'
                          : '#64748D',
                      }}
                    >
                      {card.id} / {card.code}
                    </span>
                    <Icon
                      className="specimen-icon-sm"
                      style={{
                        color: isNeutral
                          ? '#52525B'
                          : isPlaidis
                          ? '#23282A'
                          : isLinear
                          ? '#5E6AD2'
                          : '#533AFD',
                      }}
                    />
                  </div>

                  <div className="specimen-card-metric">
                    <div
                      style={{
                        fontSize: isMobile ? '17px' : '21px',
                        fontWeight: isNeutral ? 700 : isPlaidis ? 800 : isLinear ? 590 : 300,
                        letterSpacing: isLinear ? '-0.02em' : '-0.01em',
                        color: isNeutral
                          ? '#18181B'
                          : isPlaidis
                          ? '#23282A'
                          : isLinear
                          ? '#F7F8F8'
                          : '#061B31',
                      }}
                    >
                      {card.value}
                    </div>
                    <span
                      style={{
                        fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: isPlaidis ? '0px' : isLinear ? '9999px' : '4px',
                        backgroundColor: isNeutral
                          ? '#F4F4F5'
                          : isPlaidis
                          ? idx === 1
                            ? '#D9A62E'
                            : '#EDE9E0'
                          : isLinear
                          ? 'rgba(104, 204, 88, 0.12)'
                          : '#E8E9FF',
                        color: isNeutral
                          ? '#3F3F46'
                          : isPlaidis
                          ? '#141617'
                          : isLinear
                          ? '#68CC58'
                          : '#533AFD',
                        border: isPlaidis ? '1px solid rgba(35,40,42,0.35)' : 'none',
                      }}
                    >
                      {card.delta}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: isMobile ? '11.5px' : isLinear ? '12px' : '12.5px',
                      fontWeight: isStripe ? 300 : 400,
                      lineHeight: 1.38,
                      margin: 0,
                      color: isNeutral
                        ? '#52525B'
                        : isPlaidis
                        ? 'rgba(35, 40, 42, 0.85)'
                        : isLinear
                        ? '#8A8F98'
                        : '#50617A',
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 4. ACTIVE DISPATCH QUEUE / TELEMETRY LEDGER */}
          <div
            data-specimen-anchor="ledger"
            style={
              isNeutral
                ? {
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4E4E7',
                    borderRadius: '6px',
                    padding: isMobile ? '8px 10px' : '10px 14px',
                  }
                : isPlaidis
                ? {
                    backgroundColor: '#23282A',
                    color: '#EDE9E0',
                    borderTop: '2px solid #141617',
                    borderRadius: '0px',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                  }
                : isLinear
                ? {
                    backgroundColor: '#141516',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: isMobile ? '8px 10px' : '10px 14px',
                  }
                : {
                    backgroundColor: '#0D1738',
                    color: '#FFFFFF',
                    border: '1px solid #23356E',
                    borderRadius: '6px',
                    boxShadow: '0px 12px 24px rgba(13, 23, 56, 0.16)',
                    padding: isMobile ? '8px 10px' : '10px 16px',
                  }
            }
            className="specimen-ledger"
          >
            <div className="specimen-ledger-header">
              <span
                style={{
                  fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: isNeutral
                    ? '#52525B'
                    : isPlaidis
                    ? '#D9A62E'
                    : isLinear
                    ? '#D0D6E0'
                    : '#A3B5D6',
                  textTransform: 'uppercase',
                }}
              >
                Synthetic Telemetry Ledger (Demo)
              </span>
              <span
                style={{
                  fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                  fontSize: '10px',
                  color: isNeutral
                    ? '#52525B'
                    : isPlaidis
                    ? 'rgba(237, 233, 224, 0.75)'
                    : isLinear
                    ? '#8A8F98'
                    : '#839BC8',
                }}
              >
                3 Mock Rows · Synthetic Data
              </span>
            </div>

            <div className="specimen-ledger-rows">
              {QUEUE_ROWS.map((row) => (
                <div key={row.id} className="specimen-ledger-row">
                  <div className="specimen-ledger-row-left">
                    <span
                      style={{
                        fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: isNeutral
                          ? '#52525B'
                          : isPlaidis
                          ? '#D9A62E'
                          : isLinear
                          ? '#8A8F98'
                          : '#92ADFF',
                      }}
                    >
                      {row.id}
                    </span>
                    <span
                      style={{
                        fontWeight: isLinear ? 510 : isStripe ? 300 : 500,
                        color: isNeutral
                          ? '#18181B'
                          : isPlaidis
                          ? '#EDE9E0'
                          : isLinear
                          ? '#F7F8F8'
                          : '#FFFFFF',
                      }}
                      className="specimen-truncate"
                    >
                      {row.task}
                    </span>
                  </div>

                  <div className="specimen-ledger-row-right">
                    <span
                      style={{
                        fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                        fontSize: '9.5px',
                        color: isNeutral
                          ? '#52525B'
                          : isPlaidis
                          ? 'rgba(237, 233, 224, 0.72)'
                          : isLinear
                          ? '#8A8F98'
                          : '#839BC8',
                        display: isMobile ? 'none' : 'inline',
                      }}
                    >
                      {row.env} · {row.latency}
                    </span>
                    <span
                      style={{
                        ...getStatusBadgeStyle(row.tone),
                        fontFamily: 'ui-monospace, "Berkeley Mono", "SourceCodePro", monospace',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '1px 6px',
                      }}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemSpecimen;
