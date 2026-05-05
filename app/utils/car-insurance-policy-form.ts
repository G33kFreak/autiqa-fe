import type { CreateCarInsuranceInstallmentItemDto } from '#shared/dto/car-insurance.dto';

const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

export function isValidPolicyAmountString(s: string): boolean {
  return AMOUNT_RE.test(String(s).trim());
}

export function parseAmountToCents(s: string): number | null {
  const t = String(s).trim();
  if (!AMOUNT_RE.test(t)) return null;
  const parts = t.split('.');
  const intPart = parts[0] ?? '0';
  const frac = parts[1] ?? '';
  const frac2 = `${frac}00`.slice(0, 2);
  return Number.parseInt(intPart, 10) * 100 + Number.parseInt(frac2, 10);
}

export function centsToAmountString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Split total into n parts (cents) so string amounts sum exactly to total. */
export function splitAmountEqually(totalStr: string, n: number): string[] | null {
  if (n < 1) return null;
  const total = parseAmountToCents(totalStr);
  if (total === null || total < 0) return null;
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const cents = base + (i < remainder ? 1 : 0);
    out.push(centsToAmountString(cents));
  }
  return out;
}

/**
 * Evenly spaced due instants between coverage start and end (inclusive endpoints).
 * `startDate` / `endDate` are YYYY-MM-DD (local calendar).
 */
export function buildEvenlySpacedDueDates(
  startDate: string,
  endDate: string,
  n: number,
): string[] {
  const startMs = new Date(`${startDate.trim()}T12:00:00.000Z`).getTime();
  const endMs = new Date(`${endDate.trim()}T12:00:00.000Z`).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs || n < 1) {
    return [];
  }
  if (n === 1) {
    return [new Date(endMs).toISOString()];
  }
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = startMs + ((endMs - startMs) * i) / (n - 1);
    out.push(new Date(t).toISOString());
  }
  return out;
}

export function dateInputToIsoNoon(dateInput: string): string {
  return new Date(`${dateInput.trim()}T12:00:00.000Z`).toISOString();
}

export function buildEqualInstallments(
  coverageStartDate: string,
  coverageEndDate: string,
  paymentAmount: string,
  count: number,
): CreateCarInsuranceInstallmentItemDto[] | null {
  const amounts = splitAmountEqually(paymentAmount, count);
  const dueDates = buildEvenlySpacedDueDates(coverageStartDate, coverageEndDate, count);
  if (!amounts || dueDates.length !== amounts.length) return null;
  return amounts.map((amount, i) => ({
    dueDate: dueDates[i]!,
    amount,
  }));
}

export function sumInstallmentAmountsCents(rows: readonly { amount: string }[]): number | null {
  let sum = 0;
  for (const row of rows) {
    const c = parseAmountToCents(row.amount);
    if (c === null) return null;
    sum += c;
  }
  return sum;
}
