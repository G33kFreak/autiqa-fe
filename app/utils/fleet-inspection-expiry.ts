/**
 * Shared inspection / valid-until date rules for fleet list and vehicle compliance UI.
 */

/** Signed calendar days until expiry (negative if date is in the past). */
export function rawDaysUntilInspection(value: string | null | undefined): number | null {
  if (value == null || String(value).trim() === '') return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((startOfTarget.getTime() - startOfToday.getTime()) / msPerDay);
}

/** Days remaining for display and bar math (never negative). */
export function inspectionDaysLeftClamped(value: string | null | undefined): number | null {
  const raw = rawDaysUntilInspection(value);
  if (raw === null) return null;
  return Math.max(raw, 0);
}

/** Due today or overdue — use “Expired” copy instead of “0 days left”. */
export function isInspectionDueOrExpired(value: string | null | undefined): boolean {
  const raw = rawDaysUntilInspection(value);
  return raw !== null && raw <= 0;
}

/** Bar fill: 0% with lots of time left, 100% at / past deadline. */
export function inspectionUrgencyFillPercent(
  daysClamped: number,
  maxDays = 365,
): number {
  const clamped = Math.min(Math.max(daysClamped, 0), maxDays);
  return Math.round(((maxDays - clamped) / maxDays) * 100);
}

export type InspectionExpiryTone = 'ok' | 'warn' | 'critical';

/** Matches FleetComplianceExpiryItem: >30 ok, 8–30 warn, ≤7 critical (includes expired). */
export function inspectionExpiryTone(
  value: string | null | undefined,
): InspectionExpiryTone | null {
  const d = inspectionDaysLeftClamped(value);
  if (d === null) return null;
  if (d <= 7) return 'critical';
  if (d <= 30) return 'warn';
  return 'ok';
}
