<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import AddVehicleDialog from '~/components/fleet/AddVehicleDialog.vue';

const { t } = useI18n();
const carsStore = useCarsStore();

const dialog = ref<InstanceType<typeof AddVehicleDialog> | null>(null);
const search = ref('');
const cars = ref<CarDto[]>([]);
const loading = ref(true);
const loadError = ref(false);
const highlightedIds = ref<Set<string>>(new Set());
let highlightTimer: ReturnType<typeof setTimeout> | null = null;

const showError = computed(() => loadError.value);
const showSkeleton = computed(() => loading.value && !loadError.value);
const showEmpty = computed(() => !loading.value && !loadError.value && cars.value.length === 0);
const showFleet = computed(() => !loading.value && !loadError.value && cars.value.length > 0);

const normalizedQuery = computed(() => search.value.trim().toLowerCase());

const filteredCars = computed<CarDto[]>(() => {
  const q = normalizedQuery.value;
  if (!q) return cars.value;
  return cars.value.filter((car) => {
    const driver = car.driver
      ? `${car.driver.firstName} ${car.driver.lastName}`
      : '';
    return [car.model, car.plateNumber, car.vin, driver]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q));
  });
});

const noResults = computed(
  () => showFleet.value && normalizedQuery.value !== '' && filteredCars.value.length === 0,
);

const resultLabel = computed(() => {
  if (normalizedQuery.value) {
    return t('app.fleet.resultsFiltered', {
      shown: filteredCars.value.length,
      total: cars.value.length,
    });
  }
  return t('app.fleet.count', { n: cars.value.length });
});

function openDialog() {
  dialog.value?.open();
}

function onCreated(car: CarDto) {
  search.value = '';
  cars.value = [car, ...cars.value];
  const next = new Set(highlightedIds.value);
  next.add(car.id);
  highlightedIds.value = next;
  if (highlightTimer) clearTimeout(highlightTimer);
  highlightTimer = setTimeout(() => {
    highlightedIds.value = new Set();
  }, 2600);
}

async function load() {
  loading.value = true;
  loadError.value = false;
  try {
    cars.value = await carsStore.fetchCars();
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

onBeforeUnmount(() => {
  if (highlightTimer) clearTimeout(highlightTimer);
});

useSeoMeta({
  title: () => t('app.pages.fleet.title'),
  description: () => t('app.fleet.subtitle'),
});
</script>

<template>
  <div class="fleet">
    <!-- Header -->
    <header class="fleet__header">
      <div class="fleet__heading">
        <h1 class="fleet__title">{{ t('app.pages.fleet.title') }}</h1>
        <p class="fleet__subtitle">{{ t('app.fleet.subtitle') }}</p>
      </div>
      <button
        v-if="showFleet"
        type="button"
        class="fleet__add"
        @click="openDialog"
      >
        <AppIcon name="plus" :size="18" />
        <span>{{ t('app.fleet.addVehicle') }}</span>
      </button>
    </header>

    <!-- Loading skeleton -->
    <div v-if="showSkeleton" class="fleet__skeleton" aria-hidden="true">
      <div class="sk-toolbar">
        <div class="sk sk-search" />
        <div class="sk sk-btn" />
      </div>
      <div class="sk-table">
        <div v-for="n in 6" :key="n" class="sk-row">
          <div class="sk sk-cell sk-cell--lead" />
          <div class="sk sk-cell" />
          <div class="sk sk-cell" />
          <div class="sk sk-cell" />
        </div>
      </div>
      <span class="fleet__sr">{{ t('app.fleet.loading') }}</span>
    </div>

    <!-- Error -->
    <div v-else-if="showError" class="fleet__state fleet__state--error" role="alert">
      <span class="fleet__state-icon fleet__state-icon--error" aria-hidden="true">
        <AppIcon name="alert" :size="26" />
      </span>
      <h2 class="fleet__state-title">{{ t('app.fleet.errorTitle') }}</h2>
      <p class="fleet__state-body">{{ t('app.fleet.errorBody') }}</p>
      <button type="button" class="fleet__add fleet__add--retry" @click="load">
        <AppIcon name="refresh" :size="18" />
        <span>{{ t('app.fleet.retry') }}</span>
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="showEmpty" class="fleet__state">
      <span class="fleet__state-icon" aria-hidden="true">
        <AppIcon name="car" :size="30" />
      </span>
      <h2 class="fleet__state-title">{{ t('app.fleet.emptyTitle') }}</h2>
      <p class="fleet__state-body">{{ t('app.fleet.emptyBody') }}</p>
      <button type="button" class="fleet__add" @click="openDialog">
        <AppIcon name="plus" :size="18" />
        <span>{{ t('app.fleet.emptyCta') }}</span>
      </button>
    </div>

    <!-- Populated -->
    <template v-else-if="showFleet">
      <div class="fleet__toolbar">
        <div class="fleet__search">
          <span class="fleet__search-icon" aria-hidden="true">
            <AppIcon name="search" :size="18" />
          </span>
          <input
            v-model="search"
            type="search"
            class="fleet__search-input"
            :placeholder="t('app.fleet.searchPlaceholder')"
            :aria-label="t('app.fleet.searchPlaceholder')"
          >
        </div>
        <p class="fleet__count">{{ resultLabel }}</p>
      </div>

      <FleetTable
        v-if="!noResults"
        :cars="filteredCars"
        :highlighted-ids="highlightedIds"
      />

      <div v-else class="fleet__noresults">
        <span class="fleet__noresults-icon" aria-hidden="true">
          <AppIcon name="search" :size="22" />
        </span>
        <p class="fleet__noresults-title">{{ t('app.fleet.noResultsTitle', { q: search.trim() }) }}</p>
        <button type="button" class="fleet__link" @click="search = ''">
          {{ t('app.fleet.clearSearch') }}
        </button>
      </div>
    </template>

    <AddVehicleDialog ref="dialog" @created="onCreated" />
  </div>
</template>

<style scoped>
.fleet__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.fleet {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 72rem;
}

/* ── Header ───────────────────────────────────────────────── */
.fleet__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.fleet__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.625rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-ink);
}

.fleet__subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-muted);
  max-width: 52ch;
  text-wrap: pretty;
}

/* ── Primary button ───────────────────────────────────────── */
.fleet__add {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
  min-height: 2.625rem;
  padding: 0 var(--space-4);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  transition: background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.fleet__add:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 16px var(--color-primary-subtle);
}

.fleet__add:active {
  transform: scale(0.98);
}

.fleet__add:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.fleet__add--retry {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.fleet__add--retry:hover {
  background: var(--color-surface-high);
  box-shadow: none;
}

/* ── Toolbar ──────────────────────────────────────────────── */
.fleet__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.fleet__search {
  position: relative;
  flex: 1 1 18rem;
  max-width: 26rem;
}

.fleet__search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  display: inline-flex;
  color: var(--color-muted);
  pointer-events: none;
}

.fleet__search-input {
  width: 100%;
  height: 2.625rem;
  padding: 0 0.875rem 0 2.5rem;
  background: var(--color-surface);
  border: 1.5px solid var(--color-outline);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--color-ink);
  outline: none;
  appearance: none;
  transition: border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.fleet__search-input::placeholder {
  color: var(--color-muted);
  opacity: 0.6;
}

.fleet__search-input:hover {
  border-color: oklch(0.68 0.012 268);
}

.fleet__search-input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.fleet__count {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ── States (empty / error) ───────────────────────────────── */
.fleet__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: clamp(var(--space-10), 8vw, var(--space-24)) var(--space-6);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(120% 120% at 50% 0%, var(--color-surface) 0%, var(--color-bg) 60%);
}

.fleet__state-icon {
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

.fleet__state-icon--error {
  background: var(--color-risk-bg);
  color: var(--color-risk);
}

.fleet__state-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.3125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.fleet__state-body {
  margin: 0 0 var(--space-3);
  max-width: 38ch;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-muted);
  text-wrap: pretty;
}

/* ── No results ───────────────────────────────────────────── */
.fleet__noresults {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-12) var(--space-6);
  border: 1px dashed var(--color-outline);
  border-radius: var(--radius-lg);
}

.fleet__noresults-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-surface-mid);
  color: var(--color-muted);
}

.fleet__noresults-title {
  margin: var(--space-1) 0 0;
  font-size: 0.9375rem;
  color: var(--color-ink);
}

.fleet__link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--color-primary);
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fleet__link:hover {
  opacity: 0.75;
}

.fleet__link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* ── Skeleton ─────────────────────────────────────────────── */
.fleet__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.sk-toolbar {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
}

.sk-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
}

.sk-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.2fr;
  gap: var(--space-4);
  align-items: center;
  padding: 0.75rem var(--space-3);
}

.sk {
  position: relative;
  overflow: hidden;
  background: var(--color-surface-mid);
  border-radius: var(--radius-sm);
}

.sk::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    oklch(1 0 0 / 0.55),
    transparent
  );
  animation: sk-shimmer 1.4s infinite;
}

.sk-search { width: min(26rem, 60%); height: 2.625rem; }
.sk-btn { width: 8rem; height: 2.625rem; }
.sk-cell { height: 1rem; }
.sk-cell--lead { height: 1.5rem; }

@keyframes sk-shimmer {
  to { transform: translateX(100%); }
}

@media (max-width: 720px) {
  .sk-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sk::after {
    animation: none;
  }
}
</style>
