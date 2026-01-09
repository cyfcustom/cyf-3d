export function parseMoney(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  const cleaned = value
    .toString()
    .trim()
    // Remove currency symbols and spaces
    .replace(/[^0-9,.-]/g, '')
    // If both comma and dot, assume comma is decimal
    .replace(/(\.)(?=.*\.)/g, '')
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return isFinite(num) ? num : 0;
}

export function formatMoney(value: number, currency: 'USD' | 'EUR' = 'USD'): string {
  const formatter = new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(isFinite(value) ? value : 0);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(isFinite(value) ? value : 0);
}

export function clampNumber(value: number, min = 0, max = Number.POSITIVE_INFINITY): number {
  if (!isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}
