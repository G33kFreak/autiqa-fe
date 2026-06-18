/**
 * Compliance urgency for a single valid-until date (inspection or insurance).
 *
 * Tone never travels alone in the UI — it's always paired with a label or icon,
 * so the severity reads for colour-blind operators too.
 */
export type ComplianceTone = 'ok' | 'soon' | 'urgent' | 'overdue' | 'missing';

export interface ComplianceStatus {
  tone: ComplianceTone;
  /** Whole days until expiry; negative when overdue, `null` when no date. */
  daysLeft: number | null;
}

/** Days within which a deadline counts as "expiring soon" (amber warning). */
const SOON_THRESHOLD_DAYS = 30;

/** Days within which a deadline becomes urgent — a red alert, not a warning. */
const URGENT_THRESHOLD_DAYS = 7;

const MS_PER_DAY = 86_400_000;

/** Parse an ISO date string to a local-midnight Date, or null if unparseable. */
function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function complianceStatus(
  value: string | null | undefined,
  now: Date = new Date(),
): ComplianceStatus {
  const date = parseDate(value);
  if (!date) return { tone: 'missing', daysLeft: null };

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const daysLeft = Math.round((date.getTime() - today.getTime()) / MS_PER_DAY);

  if (daysLeft < 0) return { tone: 'overdue', daysLeft };
  if (daysLeft <= URGENT_THRESHOLD_DAYS) return { tone: 'urgent', daysLeft };
  if (daysLeft <= SOON_THRESHOLD_DAYS) return { tone: 'soon', daysLeft };
  return { tone: 'ok', daysLeft };
}
