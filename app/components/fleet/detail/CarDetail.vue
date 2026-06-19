<script setup lang="ts">
import type { LedgerEntryDto, LedgerDirection } from '#shared/dto/ledger-entry.dto';
import CarDetailHeader from '~/components/fleet/detail/CarDetailHeader.vue';
import CarSignalBar from '~/components/fleet/detail/CarSignalBar.vue';
import CarDriverCard from '~/components/fleet/detail/CarDriverCard.vue';
import CarComplianceSnapshot from '~/components/fleet/detail/CarComplianceSnapshot.vue';
import CarFinances from '~/components/fleet/detail/CarFinances.vue';
import CarMaintenance from '~/components/fleet/detail/CarMaintenance.vue';
import CarInsurance from '~/components/fleet/detail/CarInsurance.vue';
import CarPhotos from '~/components/fleet/detail/CarPhotos.vue';
import CarDocuments from '~/components/fleet/detail/CarDocuments.vue';
import EditVehicleDialog from '~/components/fleet/detail/EditVehicleDialog.vue';
import AssignDriverDialog from '~/components/fleet/detail/AssignDriverDialog.vue';
import LedgerEntryDialog from '~/components/fleet/detail/LedgerEntryDialog.vue';
import InsurancePolicyDialog from '~/components/fleet/detail/InsurancePolicyDialog.vue';
import DocumentUploadDialog from '~/components/fleet/detail/DocumentUploadDialog.vue';
import CarPhotoLightbox from '~/components/fleet/detail/CarPhotoLightbox.vue';
import ConfirmDialog from '~/components/app/ConfirmDialog.vue';
import type { IconName } from '~/components/app/Icon.vue';

const props = defineProps<{ carId: string }>();

const { t } = useI18n();
const localePath = useLocalePath();

const carId = computed(() => props.carId);
const d = useCarDetail(carId);

/** Specific worst-compliance label for the signal tile (e.g. "Overdue by 3d"). */
const complianceSignalLabel = computed(() => {
  const status = d.worstComplianceStatus.value;
  const { tone, daysLeft } = status;
  if (tone === 'ok') return t('app.car.signal.allClear');
  if (tone === 'missing' || daysLeft === null) return t('app.fleet.compliance.notSet');
  if (tone === 'overdue') return t('app.fleet.compliance.overdue', { n: Math.abs(daysLeft) });
  if (daysLeft === 0) return t('app.fleet.compliance.today');
  return t('app.fleet.compliance.inDays', { n: daysLeft });
});

type TabKey = 'finances' | 'maintenance' | 'insurance' | 'photos' | 'documents';
const tab = ref<TabKey>('finances');
const tabs = computed<Array<{ key: TabKey; label: string; icon: IconName; count: number }>>(() => [
  { key: 'finances', label: t('app.car.tabs.finances'), icon: 'wallet', count: d.ledger.value.length },
  { key: 'maintenance', label: t('app.car.tabs.maintenance'), icon: 'wrench', count: d.maintenance.value.length },
  { key: 'insurance', label: t('app.car.tabs.insurance'), icon: 'shield', count: d.policies.value.length },
  { key: 'photos', label: t('app.car.tabs.photos'), icon: 'image', count: d.photos.value.length },
  { key: 'documents', label: t('app.car.tabs.documents'), icon: 'document', count: d.documents.value.length },
]);

// ── Tab bar: scroll + edge-fade + keyboard nav ──
const tabScroller = ref<HTMLElement | null>(null);
const canScrollStart = ref(false);
const canScrollEnd = ref(false);

function prefersReducedMotion(): boolean {
  return (
    import.meta.client &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function updateTabFade() {
  const el = tabScroller.value;
  if (!el) return;
  canScrollStart.value = el.scrollLeft > 1;
  canScrollEnd.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

/** Centre the active tab when the bar scrolls, hinting there's more either side. */
function scrollTabIntoView(key: TabKey) {
  const scroller = tabScroller.value;
  const el = scroller?.querySelector<HTMLElement>(`#cd-tab-${key}`);
  if (!scroller || !el) return;
  const scrollerRect = scroller.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const offsetInView = elRect.left - scrollerRect.left;
  const delta = offsetInView - (scroller.clientWidth - el.offsetWidth) / 2;
  scroller.scrollTo({
    left: scroller.scrollLeft + delta, // scrollTo clamps to the valid range
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

function selectTab(key: TabKey) {
  tab.value = key;
  nextTick(() => scrollTabIntoView(key));
}

/** Roving-focus arrow-key navigation, per WAI-ARIA tablist. */
function onTabKeydown(event: KeyboardEvent) {
  const items = tabs.value;
  const current = items.findIndex((i) => i.key === tab.value);
  let next = current;
  switch (event.key) {
    case 'ArrowRight':
      next = (current + 1) % items.length;
      break;
    case 'ArrowLeft':
      next = (current - 1 + items.length) % items.length;
      break;
    case 'Home':
      next = 0;
      break;
    case 'End':
      next = items.length - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  const key = items[next]!.key;
  tab.value = key;
  nextTick(() => {
    tabScroller.value?.querySelector<HTMLElement>(`#cd-tab-${key}`)?.focus();
    scrollTabIntoView(key);
  });
}

let tabResizeObserver: ResizeObserver | null = null;
onMounted(() => {
  updateTabFade();
  if (import.meta.client && tabScroller.value) {
    tabResizeObserver = new ResizeObserver(updateTabFade);
    tabResizeObserver.observe(tabScroller.value);
  }
});
onBeforeUnmount(() => tabResizeObserver?.disconnect());
// Label widths change with locale — recheck overflow when they do.
watch(tabs, () => nextTick(updateTabFade));

// ── Dialog refs ──
const editVehicleDialog = ref<InstanceType<typeof EditVehicleDialog> | null>(null);
const assignDriverDialog = ref<InstanceType<typeof AssignDriverDialog> | null>(null);
const ledgerDialog = ref<InstanceType<typeof LedgerEntryDialog> | null>(null);
const insuranceDialog = ref<InstanceType<typeof InsurancePolicyDialog> | null>(null);
const documentDialog = ref<InstanceType<typeof DocumentUploadDialog> | null>(null);
const lightbox = ref<InstanceType<typeof CarPhotoLightbox> | null>(null);
const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);

// ── Transient action state ──
const savingInspection = ref(false);
const removingDriver = ref(false);
const uploadingPhoto = ref(false);

// ── Generic confirm ──
const confirmBusy = ref(false);
const confirmError = ref<string | null>(null);
const confirmConfig = reactive({
  title: '',
  message: '' as string | undefined,
  confirmLabel: '',
  icon: 'alert' as IconName,
  action: async () => {},
});

function askConfirm(cfg: {
  title: string;
  message?: string;
  confirmLabel: string;
  icon?: IconName;
  action: () => Promise<void>;
}) {
  confirmConfig.title = cfg.title;
  confirmConfig.message = cfg.message;
  confirmConfig.confirmLabel = cfg.confirmLabel;
  confirmConfig.icon = cfg.icon ?? 'alert';
  confirmConfig.action = cfg.action;
  confirmError.value = null;
  confirmDialog.value?.open();
}

async function onConfirmAccept() {
  confirmBusy.value = true;
  confirmError.value = null;
  try {
    await confirmConfig.action();
    confirmDialog.value?.close();
  } catch {
    confirmError.value = t('app.common.actionError');
  } finally {
    confirmBusy.value = false;
  }
}

// ── Vehicle ──
function onEditVehicle() {
  editVehicleDialog.value?.open();
}

// ── Driver ──
function onAssignDriver() {
  assignDriverDialog.value?.open();
}
function onRemoveDriver() {
  askConfirm({
    title: t('app.car.driver.removeConfirmTitle'),
    message: t('app.car.driver.removeConfirmBody'),
    confirmLabel: t('app.car.driver.remove'),
    icon: 'drivers',
    action: () => d.removeDriver(),
  });
}

// ── Inspection ──
async function onSaveInspection(isoDate: string) {
  savingInspection.value = true;
  try {
    await d.setInspectionDate(isoDate);
  } finally {
    savingInspection.value = false;
  }
}

// ── Ledger ──
function onAddEntry(direction: LedgerDirection = 'expense') {
  ledgerDialog.value?.openCreate(direction);
}
function onAddMaintenance() {
  ledgerDialog.value?.openCreate('expense', 'maintenance');
}
function onEditEntry(entry: LedgerEntryDto) {
  ledgerDialog.value?.openEdit(entry);
}
function onDeleteEntry(entry: LedgerEntryDto) {
  askConfirm({
    title: t('app.car.ledger.deleteConfirmTitle'),
    message: t('app.car.ledger.deleteConfirmBody'),
    confirmLabel: t('app.common.delete'),
    action: () => d.deleteLedgerEntry(entry),
  });
}

// ── Insurance ──
function onAddPolicy() {
  insuranceDialog.value?.open();
}
async function onToggleInstallment(payload: {
  policyId: string;
  installmentId: string;
  paid: boolean;
}) {
  await d.withPending(payload.installmentId, () =>
    d.toggleInstallment(payload.policyId, payload.installmentId, payload.paid),
  );
}
function onDeletePolicy(policyId: string) {
  askConfirm({
    title: t('app.car.insurance.deleteConfirmTitle'),
    message: t('app.car.insurance.deleteConfirmBody'),
    confirmLabel: t('app.car.insurance.deletePolicy'),
    icon: 'shield',
    action: () => d.deletePolicy(policyId),
  });
}

// ── Photos ──
async function onUploadPhotos(files: File[]) {
  uploadingPhoto.value = true;
  try {
    for (const file of files) {
      await d.uploadPhoto(file);
    }
  } finally {
    uploadingPhoto.value = false;
  }
}
function onOpenPhoto(index: number) {
  lightbox.value?.openAt(index);
}
async function onSetCover(id: string) {
  await d.withPending(id, () => d.setCoverPhoto(id));
}
function onDeletePhoto(id: string) {
  askConfirm({
    title: t('app.car.photos.deleteConfirmTitle'),
    message: t('app.car.photos.deleteConfirmBody'),
    confirmLabel: t('app.common.delete'),
    icon: 'image',
    action: () => d.deletePhoto(id),
  });
}

// ── Documents ──
function onAddDocument() {
  documentDialog.value?.open();
}
function onDeleteDocument(id: string) {
  askConfirm({
    title: t('app.car.documents.deleteConfirmTitle'),
    message: t('app.car.documents.deleteConfirmBody'),
    confirmLabel: t('app.common.delete'),
    icon: 'document',
    action: () => d.deleteDocument(id),
  });
}

onMounted(d.load);

useSeoMeta({
  title: () =>
    d.car.value?.model
      ? `${d.car.value.model} · ${t('app.pages.fleet.title')}`
      : t('app.pages.fleet.title'),
});
</script>

<template>
  <div class="cd">
    <!-- Breadcrumb -->
    <nav class="cd__crumbs" :aria-label="t('app.car.breadcrumbAria')">
      <NuxtLink :to="localePath('/app/fleet')" class="cd__crumb-link">
        <AppIcon name="arrow-left" :size="16" />
        <span>{{ t('app.nav.fleet') }}</span>
      </NuxtLink>
    </nav>

    <!-- Loading -->
    <div v-if="d.loading.value && !d.resolved.value" class="cd__skeleton" aria-hidden="true">
      <div class="cd__sk cd__sk--header" />
      <div class="cd__sk-row">
        <div v-for="n in 4" :key="n" class="cd__sk cd__sk--tile" />
      </div>
      <div class="cd__sk-grid">
        <div class="cd__sk cd__sk--main" />
        <div class="cd__sk cd__sk--rail" />
      </div>
      <span class="ui-sr">{{ t('app.common.loading') }}</span>
    </div>

    <!-- Not found -->
    <div v-else-if="d.notFound.value" class="cd__state">
      <span class="cd__state-icon" aria-hidden="true">
        <AppIcon name="car" :size="28" />
      </span>
      <h1 class="cd__state-title">{{ t('app.car.notFoundTitle') }}</h1>
      <p class="cd__state-body">{{ t('app.car.notFoundBody') }}</p>
      <NuxtLink :to="localePath('/app/fleet')" class="ui-btn ui-btn--primary">
        <AppIcon name="arrow-left" :size="18" />
        <span>{{ t('app.car.backToFleet') }}</span>
      </NuxtLink>
    </div>

    <!-- Error -->
    <div v-else-if="d.loadError.value" class="cd__state" role="alert">
      <span class="cd__state-icon cd__state-icon--error" aria-hidden="true">
        <AppIcon name="alert" :size="26" />
      </span>
      <h1 class="cd__state-title">{{ t('app.car.errorTitle') }}</h1>
      <p class="cd__state-body">{{ t('app.car.errorBody') }}</p>
      <button type="button" class="ui-btn ui-btn--secondary" @click="d.load">
        <AppIcon name="refresh" :size="18" />
        <span>{{ t('app.common.retry') }}</span>
      </button>
    </div>

    <!-- Loaded -->
    <template v-else-if="d.car.value">
      <CarDetailHeader
        :car="d.car.value"
        :cover-photo="d.coverPhoto.value"
        @edit="onEditVehicle"
        @add-entry="onAddEntry('expense')"
      />

      <CarSignalBar
        :net="d.net.value"
        :total-income="d.totalIncome.value"
        :total-expense="d.totalExpense.value"
        :currency="d.currency.value"
        :is-profit="d.isProfit.value"
        :worst-tone="d.worstComplianceTone.value"
        :compliance-label="complianceSignalLabel"
      />

      <div class="cd__layout">
        <!-- Main: tabbed -->
        <main class="cd__main">
          <div
            class="cd__tabs"
            :class="{ 'cd__tabs--fade-start': canScrollStart, 'cd__tabs--fade-end': canScrollEnd }"
          >
            <div
              ref="tabScroller"
              class="cd__tabscroll"
              role="tablist"
              :aria-label="t('app.car.tabsAria')"
              @scroll="updateTabFade"
              @keydown="onTabKeydown"
            >
              <button
                v-for="item in tabs"
                :id="`cd-tab-${item.key}`"
                :key="item.key"
                type="button"
                class="cd__tab"
                :class="{ 'cd__tab--active': tab === item.key }"
                role="tab"
                :aria-selected="tab === item.key"
                :aria-controls="`cd-panel-${item.key}`"
                :tabindex="tab === item.key ? 0 : -1"
                @click="selectTab(item.key)"
              >
                <AppIcon :name="item.icon" :size="17" />
                <span class="cd__tab-label">{{ item.label }}</span>
                <span v-if="item.count > 0" class="cd__tab-count">{{ item.count }}</span>
              </button>
            </div>
          </div>

          <div
            v-show="tab === 'finances'"
            :id="`cd-panel-finances`"
            class="cd__panel"
            role="tabpanel"
            aria-labelledby="cd-tab-finances"
          >
            <CarFinances
              :ledger="d.ledger.value"
              :currency="d.currency.value"
              :total-income="d.totalIncome.value"
              :total-expense="d.totalExpense.value"
              :expense-by-category="d.expenseByCategory.value"
              @add="onAddEntry('expense')"
              @edit="onEditEntry"
              @delete="onDeleteEntry"
            />
          </div>

          <div
            v-show="tab === 'maintenance'"
            :id="`cd-panel-maintenance`"
            class="cd__panel"
            role="tabpanel"
            aria-labelledby="cd-tab-maintenance"
          >
            <CarMaintenance
              :entries="d.maintenance.value"
              :currency="d.currency.value"
              :total="d.maintenanceTotal.value"
              :last-service-date="d.lastServiceDate.value"
              @add="onAddMaintenance"
              @edit="onEditEntry"
              @delete="onDeleteEntry"
            />
          </div>

          <div
            v-show="tab === 'insurance'"
            :id="`cd-panel-insurance`"
            class="cd__panel"
            role="tabpanel"
            aria-labelledby="cd-tab-insurance"
          >
            <CarInsurance
              :policies="d.policies.value"
              :currency="d.currency.value"
              :is-pending="d.isPending"
              @add="onAddPolicy"
              @toggle-installment="onToggleInstallment"
              @delete-policy="onDeletePolicy"
            />
          </div>

          <div
            v-show="tab === 'photos'"
            :id="`cd-panel-photos`"
            class="cd__panel"
            role="tabpanel"
            aria-labelledby="cd-tab-photos"
          >
            <CarPhotos
              :photos="d.photos.value"
              :uploading="uploadingPhoto"
              :is-pending="d.isPending"
              @upload="onUploadPhotos"
              @open="onOpenPhoto"
              @set-cover="onSetCover"
              @delete="onDeletePhoto"
            />
          </div>

          <div
            v-show="tab === 'documents'"
            :id="`cd-panel-documents`"
            class="cd__panel"
            role="tabpanel"
            aria-labelledby="cd-tab-documents"
          >
            <CarDocuments
              :documents="d.documents.value"
              :is-pending="d.isPending"
              @add="onAddDocument"
              @delete="onDeleteDocument"
            />
          </div>
        </main>

        <!-- Rail: always-visible operating picture -->
        <aside class="cd__rail">
          <CarDriverCard
            :driver="d.car.value.driver"
            :removing="removingDriver"
            @assign="onAssignDriver"
            @remove="onRemoveDriver"
          />
          <CarComplianceSnapshot
            :inspection-date="d.inspectionDate.value"
            :insurance-date="d.insuranceDate.value"
            :inspection-status="d.inspectionStatus.value"
            :insurance-status="d.insuranceStatus.value"
            :active-policy="d.activePolicy.value"
            :saving-inspection="savingInspection"
            @save-inspection="onSaveInspection"
            @view-insurance="tab = 'insurance'"
          />
        </aside>
      </div>

      <!-- Dialogs -->
      <EditVehicleDialog
        ref="editVehicleDialog"
        :car="d.car.value"
        :submit="d.updateVehicle"
      />
      <AssignDriverDialog ref="assignDriverDialog" :assign="d.assignDriver" />
      <LedgerEntryDialog
        ref="ledgerDialog"
        :currency="d.currency.value"
        :submit="async (body, editingId) => editingId ? d.updateLedgerEntry(editingId, body) : d.addLedgerEntry(body)"
      />
      <InsurancePolicyDialog
        ref="insuranceDialog"
        :currency="d.currency.value"
        :submit="d.addPolicy"
      />
      <DocumentUploadDialog
        ref="documentDialog"
        :submit="async (p) => d.uploadDocument(p.file, { category: p.category, expiresAt: p.expiresAt })"
      />
      <CarPhotoLightbox
        ref="lightbox"
        :photos="d.photos.value"
        @set-cover="onSetCover"
        @delete="onDeletePhoto"
      />
      <ConfirmDialog
        ref="confirmDialog"
        :title="confirmConfig.title"
        :message="confirmConfig.message"
        :confirm-label="confirmConfig.confirmLabel"
        :cancel-label="t('app.common.cancel')"
        :icon="confirmConfig.icon"
        :busy="confirmBusy"
        :error="confirmError"
        @confirm="onConfirmAccept"
      />
    </template>
  </div>
</template>

<style scoped>
.cd {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 78rem;
}

/* ── Breadcrumb ───────────────────────────────────────────── */
.cd__crumbs {
  margin-bottom: calc(-1 * var(--space-2));
}

.cd__crumb-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-muted);
  border-radius: var(--radius-sm);
  transition: color var(--duration-fast) var(--ease-out);
}

.cd__crumb-link:hover {
  color: var(--color-primary);
}

.cd__crumb-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

/* ── Layout ───────────────────────────────────────────────── */
.cd__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: var(--space-6);
  align-items: start;
}

.cd__main {
  min-width: 0;
}

.cd__rail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: var(--space-6);
}

/* ── Tabs ─────────────────────────────────────────────────────
   Segmented pill track. When the tabs outgrow the track it scrolls
   horizontally *inside* the track — scrollbar hidden, edges softly
   faded on whichever side has more, and the active tab is centred on
   change so it's obvious there are more tabs either way. */
.cd__tabs {
  position: relative;
  margin-bottom: var(--space-5);
  padding: 0.25rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface-mid);
  overflow: hidden;
}

.cd__tabscroll {
  display: flex;
  gap: 0.2rem;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.cd__tabscroll::-webkit-scrollbar {
  display: none;
}

/* Fade only the side that actually has hidden tabs. */
.cd__tabs--fade-start .cd__tabscroll {
  mask-image: linear-gradient(to right, transparent 0, #000 var(--space-6));
}

.cd__tabs--fade-end .cd__tabscroll {
  mask-image: linear-gradient(to left, transparent 0, #000 var(--space-6));
}

.cd__tabs--fade-start.cd__tabs--fade-end .cd__tabscroll {
  mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 var(--space-6),
    #000 calc(100% - var(--space-6)),
    transparent 100%
  );
}

.cd__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex: 1;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 0.85rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: var(--color-muted);
  background: transparent;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.cd__tab:hover:not(.cd__tab--active) {
  color: var(--color-ink);
}

.cd__tab--active {
  color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: var(--shadow-ambient);
}

.cd__tab :deep(svg) {
  flex-shrink: 0;
}

.cd__tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.cd__tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  border-radius: var(--radius-full);
  background: var(--color-surface-high);
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

.cd__tab--active .cd__tab-count {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

/* ── States ───────────────────────────────────────────────── */
.cd__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: clamp(var(--space-12), 10vw, var(--space-24)) var(--space-6);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-xl);
  background: radial-gradient(120% 120% at 50% 0%, var(--color-surface) 0%, var(--color-bg) 60%);
}

.cd__state-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-bottom: var(--space-1);
  border-radius: var(--radius-lg);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.cd__state-icon--error {
  background: var(--color-risk-bg);
  color: var(--color-risk);
}

.cd__state-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.3125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.cd__state-body {
  margin: 0 0 var(--space-3);
  max-width: 38ch;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-muted);
  text-wrap: pretty;
}

/* ── Skeleton ─────────────────────────────────────────────── */
.cd__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.cd__sk-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.cd__sk-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: var(--space-6);
}

.cd__sk {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-surface-mid);
}

.cd__sk::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, oklch(1 0 0 / 0.55), transparent);
  animation: cd-sk 1.4s infinite;
}

.cd__sk--header { height: 5rem; }
.cd__sk--tile { height: 6rem; }
.cd__sk--main { height: 26rem; }
.cd__sk--rail { height: 20rem; }

@keyframes cd-sk {
  to { transform: translateX(100%); }
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 920px) {
  .cd__layout,
  .cd__sk-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .cd__rail {
    position: static;
    order: -1;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .cd__rail > * {
    flex: 1 1 16rem;
  }

  .cd__sk-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .cd__rail {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cd__sk::after {
    animation: none;
  }

  .cd__tabscroll {
    scroll-behavior: auto;
  }
}
</style>
