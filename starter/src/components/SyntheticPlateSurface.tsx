import React from 'react';
import type { ViewportModeId } from '../data/studies';

interface SyntheticPlateSurfaceProps {
  phase: 'before' | 'after';
  viewport: ViewportModeId;
}

/**
 * Purely synthetic SVG architectural calibration plate (CC0 / MIT).
 * Replaces external website screenshots with deterministic coordinate rulers,
 * four-quadrant structural geometry, and an explicit 40px desktop / 20px mobile
 * plumb-line reference axis.
 */
export const SyntheticPlateSurface: React.FC<SyntheticPlateSurfaceProps> = ({
  phase,
  viewport,
}) => {
  const isMobile = viewport === 'mobile';
  const width = isMobile ? 390 : 1040;
  const height = isMobile ? 844 : 650;
  const isBefore = phase === 'before';

  // Before phase intentionally depicts the historical 24px -> 64px stepped baseline drift;
  // After phase depicts the unified 40px desktop / 20px mobile plumb line.
  const plumbX = isMobile ? 20 : 40;
  const heroX = isBefore ? (isMobile ? 28 : 64) : plumbX;
  const bg = isBefore ? '#F4F4F5' : '#23282A';
  const fg = isBefore ? '#18181B' : '#EDE9E0';
  const accent = isBefore ? '#71717A' : '#D9A62E';
  const teal = isBefore ? '#E4E4E7' : '#17504A';
  const cardBg = isBefore ? '#FFFFFF' : '#181B1D';
  const borderStroke = isBefore ? '#D4D4D8' : '#D9A62E';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Synthetic calibration plate (${phase.toUpperCase()} — ${viewport})`}
      style={{ display: 'block', width: '100%', height: '100%', userSelect: 'none' }}
    >
      <rect width={width} height={height} fill={bg} />

      {/* Plumb-Line Calibration Axis */}
      <line
        x1={plumbX}
        y1={0}
        x2={plumbX}
        y2={height}
        stroke={accent}
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      <text
        x={plumbX + 6}
        y={22}
        fill={accent}
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        fontSize="10"
        fontWeight="700"
      >
        {`PLUMB AXIS x=${plumbX}px (${isBefore ? 'STEPPED BASELINE' : 'UNIFIED 0px DRIFT'})`}
      </text>

      {/* Top Header Frame */}
      <rect
        x={plumbX}
        y={34}
        width={width - plumbX * 2}
        height={44}
        fill={cardBg}
        stroke={borderStroke}
        strokeWidth={isBefore ? 1 : 2}
        rx={isBefore ? 6 : 0}
      />
      <circle cx={plumbX + 18} cy={56} r={5} fill={accent} />
      <text
        x={plumbX + 32}
        y={60}
        fill={fg}
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        fontSize="12"
        fontWeight="700"
      >
        {isBefore ? 'SYNTHETIC PLATE // BASELINE-v1' : 'SYNTHETIC PLATE // ALIGNED-v2'}
      </text>

      {/* Hero Structural Block */}
      <rect
        x={heroX}
        y={102}
        width={width - heroX - plumbX}
        height={isMobile ? 210 : 180}
        fill={cardBg}
        stroke={borderStroke}
        strokeWidth={isBefore ? 1 : 2}
        rx={isBefore ? 8 : 0}
      />
      <text
        x={heroX + 20}
        y={136}
        fill={accent}
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        fontSize="11"
        fontWeight="700"
      >
        {isBefore
          ? `01 / BASELINE HERO (x=${heroX}px · +${heroX - plumbX}px DRIFT)`
          : `01 / CALIBRATED HERO (x=${heroX}px · 0px DRIFT)`}
      </text>
      <text
        x={heroX + 20}
        y={172}
        fill={fg}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={isMobile ? '18' : '26'}
        fontWeight="800"
      >
        Architectural Grid &amp; Plumb-Line Calibration
      </text>
      <text
        x={heroX + 20}
        y={200}
        fill={fg}
        opacity="0.78"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={isMobile ? '11' : '13'}
      >
        Synthetic vector fixture verifying pixel-locked split overlay geometry across viewports.
      </text>
      <rect
        x={heroX + 20}
        y={224}
        width={176}
        height={36}
        fill={accent}
        rx={isBefore ? 6 : 0}
      />
      <text
        x={heroX + 34}
        y={246}
        fill="#141617"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        fontSize="11"
        fontWeight="700"
      >
        VERIFY GEOMETRY →
      </text>

      {/* Quadrant / Telemetry Grid */}
      {[0, 1].map((row) =>
        [0, 1].map((col) => {
          const idx = row * 2 + col + 1;
          const gap = 16;
          const gridTop = isMobile ? 336 : 308;
          const totalW = width - plumbX * 2;
          const cellW = (totalW - gap) / 2;
          const cellH = isMobile ? 210 : 140;
          const cx = plumbX + col * (cellW + gap);
          const cy = gridTop + row * (cellH + gap);
          return (
            <g key={`${row}-${col}`}>
              <rect
                x={cx}
                y={cy}
                width={cellW}
                height={cellH}
                fill={idx === 2 && !isBefore ? teal : cardBg}
                stroke={borderStroke}
                strokeWidth={isBefore ? 1 : 2}
                rx={isBefore ? 6 : 0}
              />
              <text
                x={cx + 16}
                y={cy + 28}
                fill={accent}
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fontSize="11"
                fontWeight="700"
              >
                {`0${idx} / QUADRANT NODE`}
              </text>
              <text
                x={cx + 16}
                y={cy + 60}
                fill={fg}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize={isMobile ? '15' : '20'}
                fontWeight="800"
              >
                {isBefore ? 'Unaligned Frame' : 'Locked Plumb Edge'}
              </text>
              <text
                x={cx + 16}
                y={cy + 88}
                fill={fg}
                opacity="0.72"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fontSize="10"
              >
                {`x=${Math.round(cx)}px · w=${Math.round(cellW)}px`}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
};

export default SyntheticPlateSurface;
