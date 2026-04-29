import type { ExpenseDto } from '#shared/dto/expense.dto';

type ExpenseType = 'MAINTENANCE' | 'CAR_PAYMENT' | 'INSURANCE' | 'FEE' | 'OTHER';

const EXPENSE_TYPES: ExpenseType[] = [
  'MAINTENANCE',
  'CAR_PAYMENT',
  'INSURANCE',
  'FEE',
  'OTHER',
];

const TITLES: Record<ExpenseType, string[]> = {
  MAINTENANCE: ['Brake pads replacement', 'Oil + filters service', 'Tire alignment', 'Suspension inspection'],
  CAR_PAYMENT: ['Leasing monthly installment', 'Balloon payment segment', 'Down payment correction'],
  INSURANCE: ['Fleet insurance premium', 'OC + AC split payment', 'Roadside assistance package'],
  FEE: ['Toll pass refill', 'Parking invoice', 'City entry fee', 'Road vignette'],
  OTHER: ['Cleaning and detailing', 'Driver allowance adjustment', 'Telematics subscription', 'Unexpected repair'],
};

const CURRENCIES = ['PLN', 'EUR'] as const;

function makeId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length] as T;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function generateAmount(type: ExpenseType, seed: number): number {
  const roll = pseudoRandom(seed);
  if (type === 'CAR_PAYMENT') return 1000 + roll * 2800;
  if (type === 'MAINTENANCE') return 220 + roll * 1400;
  if (type === 'INSURANCE') return 350 + roll * 1200;
  if (type === 'FEE') return 40 + roll * 320;
  return 80 + roll * 750;
}

export function createFinanceExpenseMocks(days = 160): ExpenseDto[] {
  const now = new Date();
  const rows: ExpenseDto[] = [];
  let index = 0;

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - dayOffset);
    const weekday = date.getDay();
    const recordsForDay = weekday === 1 ? 4 : weekday === 5 ? 3 : 2;

    for (let i = 0; i < recordsForDay; i += 1) {
      const type = pick(EXPENSE_TYPES, dayOffset + i);
      const amount = generateAmount(type, dayOffset * 7 + i * 13);
      const currency = pick(CURRENCIES, dayOffset + i * 3);
      const title = pick(TITLES[type], dayOffset + i);
      const occurredAt = new Date(date);
      occurredAt.setHours(7 + ((dayOffset + i) % 12), (dayOffset * 11 + i * 7) % 60, 0, 0);
      const iso = occurredAt.toISOString();

      rows.push({
        id: makeId('exp', index),
        organizationId: 'org-mock-001',
        type,
        amount: amount.toFixed(2),
        currency,
        occurredAt: iso,
        title,
        notes: pseudoRandom(index) > 0.72 ? 'Flagged by internal quality check.' : null,
        carPaymentKind: type === 'CAR_PAYMENT' ? (index % 2 === 0 ? 'LEASE' : 'BUY') : null,
        carId: `car-${String((index % 14) + 1).padStart(2, '0')}`,
        driverId: index % 3 === 0 ? `drv-${String((index % 10) + 1).padStart(2, '0')}` : null,
        createdAt: iso,
        updatedAt: iso,
      });
      index += 1;
    }
  }

  return rows.sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt));
}
