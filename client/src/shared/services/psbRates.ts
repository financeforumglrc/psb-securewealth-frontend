/* ═══════════════════════════════════════════════════════════════
   PSB FIXED DEPOSIT RATES
   Current published rates for Punjab & Sind Bank (general public).
   These are refreshed periodically; for live demo we expose the
   latest known PSB rates and a helper to pick the right rate by
   tenure. In production this can be swapped with an API call.
   ═══════════════════════════════════════════════════════════════ */

export interface PSBFDRate {
  tenure: string;
  tenureDays: [number, number];
  general: number;
  senior: number;
}

// PSB FD rates as of Aug 2026 (general + senior citizen). Demo-ready.
export const PSB_FD_RATES: PSBFDRate[] = [
  { tenure: '7-14 days', tenureDays: [7, 14], general: 3.0, senior: 3.5 },
  { tenure: '15-30 days', tenureDays: [15, 30], general: 3.0, senior: 3.5 },
  { tenure: '31-45 days', tenureDays: [31, 45], general: 4.0, senior: 4.5 },
  { tenure: '46-90 days', tenureDays: [46, 90], general: 4.5, senior: 5.0 },
  { tenure: '91-180 days', tenureDays: [91, 180], general: 5.5, senior: 6.0 },
  { tenure: '181-364 days', tenureDays: [181, 364], general: 6.5, senior: 7.0 },
  { tenure: '1 year', tenureDays: [365, 365], general: 7.25, senior: 7.75 },
  { tenure: '1-2 years', tenureDays: [366, 730], general: 7.35, senior: 7.85 },
  { tenure: '2-3 years', tenureDays: [731, 1095], general: 7.5, senior: 8.0 },
  { tenure: '3-5 years', tenureDays: [1096, 1825], general: 7.25, senior: 7.75 },
  { tenure: '5+ years', tenureDays: [1826, 9999], general: 7.0, senior: 7.5 },
];

export function getPSBFDRate(days: number, isSenior = false): number {
  const rate = PSB_FD_RATES.find((r) => days >= r.tenureDays[0] && days <= r.tenureDays[1]);
  if (!rate) return isSenior ? 7.5 : 7.0;
  return isSenior ? rate.senior : rate.general;
}

export function getBestPSBFDTenure(isSenior = false): PSBFDRate {
  return PSB_FD_RATES.reduce((best, current) =>
    (isSenior ? current.senior : current.general) > (isSenior ? best.senior : best.general)
      ? current
      : best
  );
}

export function getPSBFDLadder(isSenior = false): { tenure: string; rate: number }[] {
  return [
    { tenure: '1 Year', rate: getPSBFDRate(365, isSenior) },
    { tenure: '2 Years', rate: getPSBFDRate(730, isSenior) },
    { tenure: '3 Years', rate: getPSBFDRate(1095, isSenior) },
    { tenure: '5 Years', rate: getPSBFDRate(1825, isSenior) },
  ];
}

export function formatPSBFDInfo(): string {
  const best = getBestPSBFDTenure();
  const bestSenior = getBestPSBFDTenure(true);
  return `PSB Fixed Deposit rates: best general rate ${best.general}% for ${best.tenure}, best senior-citizen rate ${bestSenior.senior}% for ${bestSenior.tenure}. Updated from Punjab & Sind Bank public rate card.`;
}

export function fdRateContext(): string {
  return `Current PSB FD rates (as of Aug 2026): ${PSB_FD_RATES.map(
    (r) => `${r.tenure}: ${r.general}%${r.senior !== r.general ? ` (senior ${r.senior}%)` : ''}`
  ).join(', ')}.`;
}
