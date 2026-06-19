/**
 * Client-side demo persistence for vehicle sub-resources.
 *
 * The detail screen targets a real REST API first; whenever a call fails
 * (endpoint not deployed yet, backend down in local dev), the store falls back
 * here so the UI stays fully interactive. Everything is namespaced per car in
 * localStorage and seeded deterministically the first time it's read, so a
 * freshly opened vehicle looks alive rather than empty.
 *
 * This is a single, swappable seam: when the backend ships these endpoints, the
 * `withDemoFallback` wrappers in the stores simply stop hitting it.
 */
import type { CarDto } from '#shared/dto/car.dto';
import type { CarPhotoDto } from '#shared/dto/car-photo.dto';
import type {
  CarDocumentDto,
  CarDocumentCategory,
} from '#shared/dto/car-document.dto';
import type {
  LedgerEntryDto,
  CreateLedgerEntryDto,
} from '#shared/dto/ledger-entry.dto';
import type {
  CarInsuranceDto,
  CreateCarInsuranceDto,
  InsuranceInstallmentDto,
} from '#shared/dto/car-insurance.dto';

const NS = 'autiqa.demo';
const SEEDED_FLAG = `${NS}.seeded`;

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function read<T>(resource: string, carId: string): T | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(`${NS}.${resource}.${carId}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(resource: string, carId: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(`${NS}.${resource}.${carId}`, JSON.stringify(value));
  } catch {
    // Quota exceeded (large data URLs) — degrade silently; the in-memory
    // store still reflects the change for this session.
  }
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Tiny deterministic PRNG seeded from a string, so a car's demo data is stable. */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function hasSeeded(carId: string): boolean {
  if (!isClient()) return true;
  try {
    return localStorage.getItem(`${SEEDED_FLAG}.${carId}`) === '1';
  } catch {
    return true;
  }
}

function markSeeded(carId: string): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(`${SEEDED_FLAG}.${carId}`, '1');
  } catch {
    /* ignore */
  }
}

// ── Run the real call; on any failure, resolve from the demo layer ──────────
export async function withDemoFallback<T>(
  real: () => Promise<T>,
  demo: () => T | Promise<T>,
): Promise<T> {
  try {
    return await real();
  } catch {
    return await demo();
  }
}

// ── File helpers ────────────────────────────────────────────────────────────

/** Downscale an image file to a compact JPEG data URL so it survives a reload. */
export function imageFileToDataUrl(file: File, maxEdge = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(url);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

/** Read any file as a data URL (used for demo document downloads). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

// ── Seeds ───────────────────────────────────────────────────────────────────

function seedPhotos(carId: string): CarPhotoDto[] {
  const rand = seededRandom(`${carId}:photos`);
  const count = 3 + Math.floor(rand() * 2); // 3–4
  const labels = [
    'Front three-quarter',
    'Driver side',
    'Interior — dashboard',
    'Rear & plate',
  ];
  return Array.from({ length: count }, (_, i) => {
    const seed = `${carId.slice(0, 8)}-${i}`;
    return {
      id: uid(),
      carId,
      url: `https://picsum.photos/seed/${seed}/1280/860`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/520/360`,
      name: labels[i] ?? `Photo ${i + 1}`,
      isCover: i === 0,
      sizeBytes: 180_000 + Math.floor(rand() * 600_000),
      createdAt: daysFromNow(-30 - i * 9),
    };
  });
}

function textDataUrl(title: string): string {
  const body = `Autiqa demo document\n\n${title}\n\nThis placeholder stands in for the real file until the documents API is connected.`;
  return `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;
}

function seedDocuments(carId: string): CarDocumentDto[] {
  const defs: Array<{ name: string; category: CarDocumentCategory; expiresAt: string | null }> = [
    { name: 'Vehicle registration.pdf', category: 'registration', expiresAt: null },
    { name: 'OC/AC policy.pdf', category: 'insurance', expiresAt: daysFromNow(280) },
    { name: 'Inspection report.pdf', category: 'inspection', expiresAt: daysFromNow(150) },
  ];
  return defs.map((d, i) => ({
    id: uid(),
    carId,
    name: d.name,
    category: d.category,
    url: textDataUrl(d.name),
    mimeType: 'application/pdf',
    sizeBytes: 120_000 + i * 48_000,
    expiresAt: d.expiresAt,
    createdAt: daysFromNow(-40 - i * 12),
  }));
}

function seedLedger(carId: string): LedgerEntryDto[] {
  const rand = seededRandom(`${carId}:ledger`);
  const entries: LedgerEntryDto[] = [];
  const push = (
    direction: LedgerEntryDto['direction'],
    category: LedgerEntryDto['category'],
    amount: number,
    daysAgo: number,
    note: string | null,
  ) => {
    entries.push({
      id: uid(),
      carId,
      direction,
      category,
      amount: amount.toFixed(2),
      currency: 'PLN',
      occurredAt: daysFromNow(-daysAgo),
      note,
      driverId: null,
      createdAt: daysFromNow(-daysAgo),
    });
  };
  // A few months of plausible activity.
  for (let week = 0; week < 10; week += 1) {
    push('income', 'rental', 900 + Math.round(rand() * 700), week * 7 + 2, 'Weekly rental');
  }
  push('expense', 'fuel', 240 + Math.round(rand() * 120), 6, 'Fuel top-up');
  push('expense', 'fuel', 210 + Math.round(rand() * 120), 34, 'Fuel top-up');
  push('expense', 'maintenance', 680 + Math.round(rand() * 400), 21, 'Brake pads & service');
  push('expense', 'fee', 120, 15, 'Cleaning & detailing');
  push('expense', 'fine', 300, 44, 'Parking penalty');
  push('income', 'deposit', 1500, 3, 'Security deposit held');
  return entries.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

function seedInsurance(carId: string): CarInsuranceDto[] {
  const installments: InsuranceInstallmentDto[] = Array.from({ length: 4 }, (_, i) => ({
    id: uid(),
    dueDate: daysFromNow(-90 + i * 90),
    amount: '780.00',
    paidAt: i < 2 ? daysFromNow(-88 + i * 90) : null,
  }));
  return [
    {
      id: uid(),
      carId,
      provider: 'PZU',
      policyNumber: `OC-${carId.slice(0, 6).toUpperCase()}`,
      coverageStart: daysFromNow(-95),
      coverageEnd: daysFromNow(270),
      premium: '3120.00',
      currency: 'PLN',
      installments,
      createdAt: daysFromNow(-95),
    },
  ];
}

/** Lazily seed every resource for a car the first time it's touched. */
function ensureSeeded(carId: string): void {
  if (hasSeeded(carId)) return;
  write('photos', carId, seedPhotos(carId));
  write('documents', carId, seedDocuments(carId));
  write('ledger', carId, seedLedger(carId));
  write('insurance', carId, seedInsurance(carId));
  markSeeded(carId);
}

// ── Photos ──────────────────────────────────────────────────────────────────

export const demoPhotos = {
  list(carId: string): CarPhotoDto[] {
    ensureSeeded(carId);
    return read<CarPhotoDto[]>('photos', carId) ?? [];
  },
  add(carId: string, photo: { url: string; name: string; sizeBytes: number | null }): CarPhotoDto {
    const items = demoPhotos.list(carId);
    const created: CarPhotoDto = {
      id: uid(),
      carId,
      url: photo.url,
      thumbnailUrl: photo.url,
      name: photo.name,
      isCover: items.length === 0,
      sizeBytes: photo.sizeBytes,
      createdAt: new Date().toISOString(),
    };
    write('photos', carId, [created, ...items]);
    return created;
  },
  setCover(carId: string, photoId: string): CarPhotoDto[] {
    const items = demoPhotos
      .list(carId)
      .map((p) => ({ ...p, isCover: p.id === photoId }));
    write('photos', carId, items);
    return items;
  },
  remove(carId: string, photoId: string): CarPhotoDto[] {
    let items = demoPhotos.list(carId).filter((p) => p.id !== photoId);
    if (items.length && !items.some((p) => p.isCover)) {
      items = items.map((p, i) => ({ ...p, isCover: i === 0 }));
    }
    write('photos', carId, items);
    return items;
  },
};

// ── Documents ─────────────────────────────────────────────────────────────────

export const demoDocuments = {
  list(carId: string): CarDocumentDto[] {
    ensureSeeded(carId);
    return read<CarDocumentDto[]>('documents', carId) ?? [];
  },
  add(
    carId: string,
    doc: {
      name: string;
      category: CarDocumentCategory;
      url: string;
      mimeType: string | null;
      sizeBytes: number | null;
      expiresAt: string | null;
    },
  ): CarDocumentDto {
    const items = demoDocuments.list(carId);
    const created: CarDocumentDto = {
      id: uid(),
      carId,
      ...doc,
      createdAt: new Date().toISOString(),
    };
    write('documents', carId, [created, ...items]);
    return created;
  },
  remove(carId: string, docId: string): CarDocumentDto[] {
    const items = demoDocuments.list(carId).filter((d) => d.id !== docId);
    write('documents', carId, items);
    return items;
  },
};

// ── Ledger ────────────────────────────────────────────────────────────────────

export const demoLedger = {
  list(carId: string): LedgerEntryDto[] {
    ensureSeeded(carId);
    return read<LedgerEntryDto[]>('ledger', carId) ?? [];
  },
  add(carId: string, body: CreateLedgerEntryDto): LedgerEntryDto {
    const items = demoLedger.list(carId);
    const created: LedgerEntryDto = {
      id: uid(),
      carId,
      direction: body.direction,
      category: body.category,
      amount: body.amount,
      currency: body.currency,
      occurredAt: body.occurredAt,
      note: body.note ?? null,
      driverId: body.driverId ?? null,
      createdAt: new Date().toISOString(),
    };
    write('ledger', carId, [created, ...items]);
    return created;
  },
  update(carId: string, id: string, body: CreateLedgerEntryDto): LedgerEntryDto | null {
    const items = demoLedger.list(carId);
    const idx = items.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const updated: LedgerEntryDto = { ...items[idx]!, ...body, note: body.note ?? null, driverId: body.driverId ?? null };
    items[idx] = updated;
    write('ledger', carId, items);
    return updated;
  },
  remove(carId: string, id: string): LedgerEntryDto[] {
    const items = demoLedger.list(carId).filter((e) => e.id !== id);
    write('ledger', carId, items);
    return items;
  },
};

// ── Insurance ─────────────────────────────────────────────────────────────────

function buildInstallments(body: CreateCarInsuranceDto): InsuranceInstallmentDto[] {
  const count = Math.max(1, Math.min(12, Math.round(body.installmentCount)));
  const total = Number(body.premium) || 0;
  const each = total / count;
  const start = new Date(body.coverageStart);
  const end = new Date(body.coverageEnd);
  const span = Math.max(0, end.getTime() - start.getTime());
  return Array.from({ length: count }, (_, i) => {
    const due = new Date(start.getTime() + (span * i) / count);
    return {
      id: uid(),
      dueDate: due.toISOString(),
      amount: each.toFixed(2),
      paidAt: null,
    };
  });
}

export const demoInsurance = {
  list(carId: string): CarInsuranceDto[] {
    ensureSeeded(carId);
    return read<CarInsuranceDto[]>('insurance', carId) ?? [];
  },
  add(carId: string, body: CreateCarInsuranceDto): CarInsuranceDto {
    const items = demoInsurance.list(carId);
    const created: CarInsuranceDto = {
      id: uid(),
      carId,
      provider: body.provider,
      policyNumber: body.policyNumber ?? null,
      coverageStart: body.coverageStart,
      coverageEnd: body.coverageEnd,
      premium: body.premium,
      currency: body.currency,
      installments: buildInstallments(body),
      createdAt: new Date().toISOString(),
    };
    write('insurance', carId, [created, ...items]);
    return created;
  },
  setInstallmentPaid(
    carId: string,
    policyId: string,
    installmentId: string,
    paid: boolean,
  ): CarInsuranceDto[] {
    const items = demoInsurance.list(carId).map((policy) => {
      if (policy.id !== policyId) return policy;
      return {
        ...policy,
        installments: policy.installments.map((inst) =>
          inst.id === installmentId
            ? { ...inst, paidAt: paid ? new Date().toISOString() : null }
            : inst,
        ),
      };
    });
    write('insurance', carId, items);
    return items;
  },
  remove(carId: string, policyId: string): CarInsuranceDto[] {
    const items = demoInsurance.list(carId).filter((p) => p.id !== policyId);
    write('insurance', carId, items);
    return items;
  },
};

// ── Car field overrides (edit / assign when there's no write endpoint) ─────────

type CarOverride = Partial<
  Pick<CarDto, 'model' | 'vin' | 'plateNumber' | 'driver' | 'inspectionValidUntil' | 'insuranceValidUntil'>
>;

const DEMO_MODELS = [
  'Toyota Corolla',
  'Škoda Octavia',
  'Volkswagen Passat',
  'Kia Ceed',
  'Renault Mégane',
  'Ford Focus',
  'Hyundai i30',
];

export const demoCar = {
  applyOverride(car: CarDto): CarDto {
    const override = read<CarOverride>('car', car.id);
    return override ? { ...car, ...override } : car;
  },
  setOverride(carId: string, patch: CarOverride): void {
    const current = read<CarOverride>('car', carId) ?? {};
    write('car', carId, { ...current, ...patch });
  },
  /** Deterministic stand-in car when no backend is reachable at all. */
  synthesize(carId: string): CarDto {
    const rand = seededRandom(carId);
    const model = DEMO_MODELS[Math.floor(rand() * DEMO_MODELS.length)]!;
    const plateNum = 1000 + Math.floor(rand() * 8999);
    const cities = ['WA', 'KR', 'GD', 'PO', 'WR'];
    const city = cities[Math.floor(rand() * cities.length)]!;
    const vinChars = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ';
    const vin = Array.from(
      { length: 17 },
      () => vinChars[Math.floor(rand() * vinChars.length)],
    ).join('');
    return {
      id: carId,
      organizationId: 'demo-org',
      model,
      vin,
      plateNumber: `${city} ${plateNum}`,
      driver: null,
      inspectionValidUntil: daysFromNow(40 + Math.floor(rand() * 200)),
      insuranceValidUntil: daysFromNow(270),
      createdAt: daysFromNow(-200),
      updatedAt: daysFromNow(-10),
    };
  },
};

/** Thrown when a real backend responds but has no car with the given id. */
export class CarNotFoundError extends Error {
  constructor() {
    super('CAR_NOT_FOUND');
    this.name = 'CarNotFoundError';
  }
}
