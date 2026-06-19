import type { Ref } from 'vue';
import type { CarDto } from '#shared/dto/car.dto';
import type { CarPhotoDto } from '#shared/dto/car-photo.dto';
import type { CarDocumentDto, CarDocumentCategory } from '#shared/dto/car-document.dto';
import type {
  LedgerEntryDto,
  CreateLedgerEntryDto,
  LedgerCategory,
} from '#shared/dto/ledger-entry.dto';
import type {
  CarInsuranceDto,
  CreateCarInsuranceDto,
} from '#shared/dto/car-insurance.dto';
import type { DriverDto } from '#shared/dto/driver.dto';
import { CarNotFoundError } from '~/utils/car-errors';
import { complianceStatus, type ComplianceTone } from '~/utils/compliance';

/**
 * Single orchestrator for the vehicle detail screen. Owns every reactive slice,
 * the one-shot load, per-resource refreshers, the mutating actions, and the
 * derived operating-picture summaries. The page and sections stay declarative.
 */
export function useCarDetail(carId: Ref<string>) {
  const carsStore = useCarsStore();
  const assetsStore = useCarAssetsStore();
  const ledgerStore = useLedgerStore();
  const insuranceStore = useCarInsuranceStore();

  const car = ref<CarDto | null>(null);
  const photos = ref<CarPhotoDto[]>([]);
  const documents = ref<CarDocumentDto[]>([]);
  const ledger = ref<LedgerEntryDto[]>([]);
  const policies = ref<CarInsuranceDto[]>([]);

  const loading = ref(true);
  const resolved = ref(false);
  const notFound = ref(false);
  const loadError = ref(false);

  /** Ids of rows with an in-flight inline mutation (delete, toggle, cover…). */
  const pending = reactive(new Set<string>());
  const isPending = (id: string) => pending.has(id);
  async function withPending<T>(id: string, fn: () => Promise<T>): Promise<T> {
    pending.add(id);
    try {
      return await fn();
    } finally {
      pending.delete(id);
    }
  }

  async function load() {
    loading.value = true;
    notFound.value = false;
    loadError.value = false;
    const id = carId.value;
    try {
      const [c, ph, docs, led, pol] = await Promise.all([
        carsStore.fetchCarById(id),
        assetsStore.listPhotos(id),
        assetsStore.listDocuments(id),
        ledgerStore.list(id),
        insuranceStore.list(id),
      ]);
      car.value = c;
      photos.value = ph;
      documents.value = docs;
      ledger.value = led;
      policies.value = pol;
    } catch (error) {
      if (error instanceof CarNotFoundError) notFound.value = true;
      else loadError.value = true;
    } finally {
      loading.value = false;
      resolved.value = true;
    }
  }

  // ── Vehicle + driver ──
  async function updateVehicle(patch: {
    model: string;
    plateNumber: string;
    vin: string;
  }) {
    car.value = await carsStore.updateCar(carId.value, {
      model: patch.model,
      plateNumber: patch.plateNumber || undefined,
      vin: patch.vin || undefined,
    });
  }

  async function setInspectionDate(isoDate: string) {
    car.value = await carsStore.updateCar(carId.value, {
      inspectionValidUntil: isoDate || undefined,
    });
  }

  async function assignDriver(driver: DriverDto) {
    car.value = await carsStore.assignDriver(carId.value, driver);
  }

  async function removeDriver() {
    car.value = await carsStore.unassignDriver(carId.value);
  }

  // ── Ledger ──
  /** Attribute entries to the car's current driver when the caller hasn't. */
  function withCarDriver(body: CreateLedgerEntryDto): CreateLedgerEntryDto {
    return { ...body, driverId: body.driverId ?? car.value?.driver?.id ?? null };
  }
  async function addLedgerEntry(body: CreateLedgerEntryDto) {
    ledger.value = await ledgerStore.create(carId.value, withCarDriver(body));
  }
  async function updateLedgerEntry(id: string, body: CreateLedgerEntryDto) {
    ledger.value = await ledgerStore.update(carId.value, id, withCarDriver(body));
  }
  async function deleteLedgerEntry(entry: LedgerEntryDto) {
    ledger.value = await ledgerStore.remove(carId.value, entry.id, entry.direction);
  }

  // ── Insurance ──
  async function addPolicy(body: CreateCarInsuranceDto) {
    policies.value = await insuranceStore.create(carId.value, body);
  }
  async function toggleInstallment(
    policyId: string,
    installmentId: string,
    paid: boolean,
  ) {
    policies.value = await insuranceStore.setInstallmentPaid(
      carId.value,
      policyId,
      installmentId,
      paid,
    );
  }
  async function deletePolicy(policyId: string) {
    policies.value = await insuranceStore.remove(carId.value, policyId);
  }

  // ── Photos ──
  async function uploadPhoto(file: File) {
    photos.value = await assetsStore.uploadPhoto(carId.value, file);
  }
  async function setCoverPhoto(photoId: string) {
    photos.value = await assetsStore.setCoverPhoto(carId.value, photoId);
  }
  async function deletePhoto(photoId: string) {
    photos.value = await assetsStore.removePhoto(carId.value, photoId);
  }

  // ── Documents ──
  async function uploadDocument(
    file: File,
    meta: { category: CarDocumentCategory; expiresAt?: string | null },
  ) {
    documents.value = await assetsStore.uploadDocument(carId.value, file, meta);
  }
  async function deleteDocument(documentId: string) {
    documents.value = await assetsStore.removeDocument(carId.value, documentId);
  }

  // ── Derived: operating picture ──
  const currency = computed(
    () =>
      ledger.value[0]?.currency ||
      policies.value[0]?.currency ||
      'PLN',
  );

  const totalIncome = computed(() =>
    ledger.value
      .filter((e) => e.direction === 'income')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
  );
  const totalExpense = computed(() =>
    ledger.value
      .filter((e) => e.direction === 'expense')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
  );
  const net = computed(() => totalIncome.value - totalExpense.value);
  const isProfit = computed(() => net.value >= 0);

  /**
   * Maintenance service history — the `maintenance`-category expenses on their
   * own, newest first. Same ledger data, read as a service log rather than a
   * money column; drives the dedicated maintenance timeline.
   */
  const maintenance = computed(() =>
    ledger.value
      .filter((e) => e.category === 'maintenance')
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      ),
  );
  const maintenanceTotal = computed(() =>
    maintenance.value.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
  );
  const lastServiceDate = computed(
    () => maintenance.value[0]?.occurredAt ?? null,
  );

  /** Expense totals per category, descending — drives the cost breakdown. */
  const expenseByCategory = computed(() => {
    const map = new Map<LedgerCategory, number>();
    for (const e of ledger.value) {
      if (e.direction !== 'expense') continue;
      map.set(e.category, (map.get(e.category) ?? 0) + (Number(e.amount) || 0));
    }
    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  });

  /** The policy with the latest coverage end is the active one. */
  const activePolicy = computed<CarInsuranceDto | null>(() => {
    if (policies.value.length === 0) return null;
    return [...policies.value].sort(
      (a, b) =>
        new Date(b.coverageEnd).getTime() - new Date(a.coverageEnd).getTime(),
    )[0]!;
  });

  const inspectionDate = computed(() => car.value?.inspectionValidUntil ?? null);
  const insuranceDate = computed(
    () => activePolicy.value?.coverageEnd ?? car.value?.insuranceValidUntil ?? null,
  );

  const inspectionStatus = computed(() => complianceStatus(inspectionDate.value));
  const insuranceStatus = computed(() => complianceStatus(insuranceDate.value));

  /** The more severe of the two compliance items — drives the header signal. */
  const worstComplianceTone = computed<ComplianceTone>(() => {
    const order: ComplianceTone[] = ['overdue', 'urgent', 'soon', 'missing', 'ok'];
    const a = inspectionStatus.value.tone;
    const b = insuranceStatus.value.tone;
    return order.indexOf(a) < order.indexOf(b) ? a : b;
  });

  /** The status object of the more severe compliance item. */
  const worstComplianceStatus = computed(() =>
    worstComplianceTone.value === inspectionStatus.value.tone
      ? inspectionStatus.value
      : insuranceStatus.value,
  );

  const coverPhoto = computed<CarPhotoDto | null>(
    () => photos.value.find((p) => p.isCover) ?? photos.value[0] ?? null,
  );

  const recentLedger = computed(() =>
    [...ledger.value]
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      )
      .slice(0, 5),
  );

  return {
    // state
    car,
    photos,
    documents,
    ledger,
    policies,
    loading,
    resolved,
    notFound,
    loadError,
    isPending,
    withPending,
    // lifecycle
    load,
    // actions
    updateVehicle,
    setInspectionDate,
    assignDriver,
    removeDriver,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
    addPolicy,
    toggleInstallment,
    deletePolicy,
    uploadPhoto,
    setCoverPhoto,
    deletePhoto,
    uploadDocument,
    deleteDocument,
    // derived
    currency,
    totalIncome,
    totalExpense,
    net,
    isProfit,
    maintenance,
    maintenanceTotal,
    lastServiceDate,
    expenseByCategory,
    activePolicy,
    inspectionDate,
    insuranceDate,
    inspectionStatus,
    insuranceStatus,
    worstComplianceTone,
    worstComplianceStatus,
    coverPhoto,
    recentLedger,
  };
}
