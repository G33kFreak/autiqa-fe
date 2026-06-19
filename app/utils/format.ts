/**
 * Locale-aware formatters shared across the app surface.
 *
 * Currency, dates and sizes are locale-driven on purpose: Autiqa ships to any
 * market and must read native in each (see PRODUCT.md, Locale-first trust).
 * Callers pass the active `locale`; these helpers never hard-code one.
 */

/** Format a decimal amount (string or number) as currency. */
export function formatMoney(
  amount: string | number,
  currency: string,
  locale: string,
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  const code = (currency || 'PLN').toUpperCase();
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Compact currency for tight spaces — no fraction digits, signed-friendly. */
export function formatMoneyCompact(
  amount: string | number,
  currency: string,
  locale: string,
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  const code = (currency || 'PLN').toUpperCase();
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

/** "19 Jun 2026" style — short, unambiguous across locales. */
export function formatDate(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** "19 Jun 2026, 14:30" — for activity timestamps. */
export function formatDateTime(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Normalize any date-ish string to a `yyyy-mm-dd` value for <input type="date">. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** A `yyyy-mm-dd` field value back to a stable midday ISO string (timezone-safe). */
export function dateInputToIso(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return new Date(`${trimmed}T12:00:00.000Z`).toISOString();
}

/** Human file size: 24 KB, 1.4 MB. */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const rounded = value >= 10 || exponent === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[exponent]}`;
}
