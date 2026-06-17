export const DURESS_MASK_VALUE = 45000;

export function maskValue(value: number, active: boolean): number {
  return active ? DURESS_MASK_VALUE : value;
}

export function formatCurrencyMask(value: number, active: boolean): string {
  return `₹${maskValue(value, active).toLocaleString()}`;
}

export function formatCroreMask(value: number, active: boolean): string {
  if (active) return `₹${DURESS_MASK_VALUE.toLocaleString()}`;
  return `₹${(value / 1e7).toFixed(2)}Cr`;
}
