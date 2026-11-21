export type StudyId = 'plaidis' | 'linear' | 'stripe';
export type SpecimenVariant = 'neutral' | StudyId;
export type ViewportModeId = 'desktop' | 'mobile';
export type ComparisonViewMode = 'original' | 'split' | 'transformed';
export type ComparisonSurface = 'specimen' | 'synthetic-plate';

export interface StudyConfig {
  id: StudyId;
  num: string;
  selectorSub: string;
  selectorLabel: string;
  shortName: string;
  name: string;
  subtitle: string;
  accentHex: string;
  recordedOuterMarginDesktop: string;
  recordedOuterMarginMobile: string;
  sharedSpecimenInsetDesktop: number;
  sharedSpecimenInsetMobile: number;
  summary: string;
}

export const DESIGN_STUDIES: StudyConfig[] = [
  {
    id: 'plaidis',
    num: '01',
    selectorSub: 'Study 01 · Structure & Motion',
    selectorLabel: 'Plaidis (Editorial Grid)',
    shortName: 'Plaidis',
    name: 'Study 01 — Plaidis / Editorial Grid Architecture',
    subtitle: '2px Structural Overlines, 0px Corner Geometry & Quintic Motion Curve',
    accentHex: '#D9A62E',
    recordedOuterMarginDesktop: '40px',
    recordedOuterMarginMobile: '20px',
    sharedSpecimenInsetDesktop: 40,
    sharedSpecimenInsetMobile: 20,
    summary:
      'Exposes the architectural grid through 2px structural overlines, zero-radius framing, and a shared 40px desktop / 20px mobile outer plumb line.',
  },
  {
    id: 'linear',
    num: '02',
    selectorSub: 'Study 02 · Stepped Dark Density',
    selectorLabel: 'Linear (Obsidian Luminance)',
    shortName: 'Linear',
    name: 'Study 02 — Linear / Stepped Obsidian Surfaces',
    subtitle: 'Obsidian Luminance Stepping, 1px Translucent Hairlines & Fractional Variable Type',
    accentHex: '#5E6AD2',
    recordedOuterMarginDesktop: '46px (recorded evidence; held at 40px on specimen)',
    recordedOuterMarginMobile: '24px (recorded evidence; held at 20px on specimen)',
    sharedSpecimenInsetDesktop: 40,
    sharedSpecimenInsetMobile: 20,
    summary:
      'Replaces dark-mode drop shadows with stepped obsidian luminance (#08090A → #0F1011 → #141516) and 1px translucent hairlines while holding the specimen inset at 40px/20px for split alignment.',
  },
  {
    id: 'stripe',
    num: '03',
    selectorSub: 'Study 03 · Light Display & Elevation',
    selectorLabel: 'Stripe (Daylight Hierarchy)',
    shortName: 'Stripe',
    name: 'Study 03 — Stripe / High-Key Daylight & Tinted Elevation',
    subtitle: 'Light 300-Weight Display Typography, Deep Navy Ink & Indigo-Tinted Shadow Depth',
    accentHex: '#533AFD',
    recordedOuterMarginDesktop: '48px (recorded evidence; held at 40px on specimen)',
    recordedOuterMarginMobile: '16px (recorded evidence; held at 20px on specimen)',
    sharedSpecimenInsetDesktop: 40,
    sharedSpecimenInsetMobile: 20,
    summary:
      'Pairs high-key daylight surfaces (#F8FAFD / #FFFFFF) and 300-weight headings with navy-tinted elevation and a dark enterprise telemetry ledger (#0D1738).',
  },
];

export const STUDY_BY_ID: Record<StudyId, StudyConfig> = {
  plaidis: DESIGN_STUDIES[0],
  linear: DESIGN_STUDIES[1],
  stripe: DESIGN_STUDIES[2],
};

export interface ViewportModeConfig {
  id: ViewportModeId;
  label: string;
  fullLabel: string;
  canonicalWidth: number;
  canonicalHeight: number;
  plumbInsetPx: number;
}

export const VIEWPORT_MODES: ViewportModeConfig[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    fullLabel: 'Desktop (1040 × 650 Specimen / 1440 × 900 Reference)',
    canonicalWidth: 1040,
    canonicalHeight: 650,
    plumbInsetPx: 40,
  },
  {
    id: 'mobile',
    label: 'Mobile',
    fullLabel: 'Mobile (390 × 844)',
    canonicalWidth: 390,
    canonicalHeight: 844,
    plumbInsetPx: 20,
  },
];
