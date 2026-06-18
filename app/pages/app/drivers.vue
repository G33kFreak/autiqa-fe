<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';
import AddDriverDialog from '~/components/drivers/AddDriverDialog.vue';
import DriversTable from '~/components/drivers/DriversTable.vue';

const { t } = useI18n();
const driversStore = useDriversStore();

const dialog = ref<InstanceType<typeof AddDriverDialog> | null>(null);
const search = ref('');
const drivers = ref<DriverDto[]>([]);
const loading = ref(true);
const loadError = ref(false);
const highlightedIds = ref<Set<string>>(new Set());
let highlightTimer: ReturnType<typeof setTimeout> | null = null;

const showError = computed(() => loadError.value);
const showSkeleton = computed(() => loading.value && !loadError.value);
const showEmpty = computed(() => !loading.value && !loadError.value && drivers.value.length === 0);
const showRoster = computed(() => !loading.value && !loadError.value && drivers.value.length > 0);

const normalizedQuery = computed(() => search.value.trim().toLowerCase());

const filteredDrivers = computed<DriverDto[]>(() => {
  const q = normalizedQuery.value;
  if (!q) return drivers.value;
  return drivers.value.filter((driver) => {
    const name = `${driver.firstName} ${driver.lastName}`;
    return [name, driver.phoneNumber, driver.email]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q));
  });
});

const noResults = computed(
  () => showRoster.value && normalizedQuery.value !== '' && filteredDrivers.value.length === 0,
);

const resultLabel = computed(() => {
  if (normalizedQuery.value) {
    return t('app.drivers.resultsFiltered', {
      shown: filteredDrivers.value.length,
      total: drivers.value.length,
    });
  }
  return t('app.drivers.count', { n: drivers.value.length });
});

function openDialog() {
  dialog.value?.open();
}

function onCreated(driver: DriverDto) {
  search.value = '';
  drivers.value = [driver, ...drivers.value];
  const next = new Set(highlightedIds.value);
  next.add(driver.id);
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
    drivers.value = await driversStore.fetchDrivers();
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
  title: () => t('app.pages.drivers.title'),
  description: () => t('app.drivers.subtitle'),
});
</script>

<template>
  <div class="drivers">
    <!-- Header -->
    <header class="drivers__header">
      <div class="drivers__heading">
        <h1 class="drivers__title">{{ t('app.pages.drivers.title') }}</h1>
        <p class="drivers__subtitle">{{ t('app.drivers.subtitle') }}</p>
      </div>
      <button
        v-if="showRoster"
        type="button"
        class="drivers__add"
        @click="openDialog"
      >
        <AppIcon name="plus" :size="18" />
        <span>{{ t('app.drivers.addDriver') }}</span>
      </button>
    </header>

    <!-- Loading skeleton -->
    <div v-if="showSkeleton" class="drivers__skeleton" aria-hidden="true">
      <div class="sk-toolbar">
        <div class="sk sk-search" />
        <div class="sk sk-btn" />
      </div>
      <div class="sk-table">
        <div v-for="n in 6" :key="n" class="sk-row">
          <div class="sk-lead">
            <div class="sk sk-avatar" />
            <div class="sk sk-cell sk-cell--name" />
          </div>
          <div class="sk sk-cell" />
          <div class="sk sk-cell" />
          <div class="sk sk-cell sk-cell--chip" />
        </div>
      </div>
      <span class="drivers__sr">{{ t('app.drivers.loading') }}</span>
    </div>

    <!-- Error -->
    <div v-else-if="showError" class="drivers__state drivers__state--error" role="alert">
      <span class="drivers__state-icon drivers__state-icon--error" aria-hidden="true">
        <AppIcon name="alert" :size="26" />
      </span>
      <h2 class="drivers__state-title">{{ t('app.drivers.errorTitle') }}</h2>
      <p class="drivers__state-body">{{ t('app.drivers.errorBody') }}</p>
      <button type="button" class="drivers__add drivers__add--retry" @click="load">
        <AppIcon name="refresh" :size="18" />
        <span>{{ t('app.drivers.retry') }}</span>
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="showEmpty" class="drivers__state">
      <span class="drivers__state-icon" aria-hidden="true">
        <AppIcon name="drivers" :size="30" />
      </span>
      <h2 class="drivers__state-title">{{ t('app.drivers.emptyTitle') }}</h2>
      <p class="drivers__state-body">{{ t('app.drivers.emptyBody') }}</p>
      <button type="button" class="drivers__add" @click="openDialog">
        <AppIcon name="plus" :size="18" />
        <span>{{ t('app.drivers.emptyCta') }}</span>
      </button>
    </div>

    <!-- Populated -->
    <template v-else-if="showRoster">
      <div class="drivers__toolbar">
        <div class="drivers__search">
          <span class="drivers__search-icon" aria-hidden="true">
            <AppIcon name="search" :size="18" />
          </span>
          <input
            v-model="search"
            type="search"
            class="drivers__search-input"
            :placeholder="t('app.drivers.searchPlaceholder')"
            :aria-label="t('app.drivers.searchPlaceholder')"
          >
        </div>
        <p class="drivers__count">{{ resultLabel }}</p>
      </div>

      <DriversTable
        v-if="!noResults"
        :drivers="filteredDrivers"
        :highlighted-ids="highlightedIds"
      />

      <div v-else class="drivers__noresults">
        <span class="drivers__noresults-icon" aria-hidden="true">
          <AppIcon name="search" :size="22" />
        </span>
        <p class="drivers__noresults-title">{{ t('app.drivers.noResultsTitle', { q: search.trim() }) }}</p>
        <button type="button" class="drivers__link" @click="search = ''">
          {{ t('app.drivers.clearSearch') }}
        </button>
      </div>
    </template>

    <AddDriverDialog ref="dialog" @created="onCreated" />
  </div>
</template>

<style scoped>
.drivers__sr {
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

.drivers {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 72rem;
}

/* ── Header ───────────────────────────────────────────────── */
.drivers__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.drivers__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.625rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-ink);
}

.drivers__subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-muted);
  max-width: 52ch;
  text-wrap: pretty;
}

/* ── Primary button ───────────────────────────────────────── */
.drivers__add {
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

.drivers__add:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 16px var(--color-primary-subtle);
}

.drivers__add:active {
  transform: scale(0.98);
}

.drivers__add:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.drivers__add--retry {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.drivers__add--retry:hover {
  background: var(--color-surface-high);
  box-shadow: none;
}

/* ── Toolbar ──────────────────────────────────────────────── */
.drivers__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.drivers__search {
  position: relative;
  flex: 1 1 18rem;
  max-width: 26rem;
}

.drivers__search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  display: inline-flex;
  color: var(--color-muted);
  pointer-events: none;
}

.drivers__search-input {
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

.drivers__search-input::placeholder {
  color: var(--color-muted);
  opacity: 0.6;
}

.drivers__search-input:hover {
  border-color: oklch(0.68 0.012 268);
}

.drivers__search-input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.drivers__count {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ── States (empty / error) ───────────────────────────────── */
.drivers__state {
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

.drivers__state-icon {
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

.drivers__state-icon--error {
  background: var(--color-risk-bg);
  color: var(--color-risk);
}

.drivers__state-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.3125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.drivers__state-body {
  margin: 0 0 var(--space-3);
  max-width: 38ch;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-muted);
  text-wrap: pretty;
}

/* ── No results ───────────────────────────────────────────── */
.drivers__noresults {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-12) var(--space-6);
  border: 1px dashed var(--color-outline);
  border-radius: var(--radius-lg);
}

.drivers__noresults-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-surface-mid);
  color: var(--color-muted);
}

.drivers__noresults-title {
  margin: var(--space-1) 0 0;
  font-size: 0.9375rem;
  color: var(--color-ink);
}

.drivers__link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--color-primary);
  transition: opacity var(--duration-fast) var(--ease-out);
}

.drivers__link:hover {
  opacity: 0.75;
}

.drivers__link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* ── Skeleton ─────────────────────────────────────────────── */
.drivers__skeleton {
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
  grid-template-columns: 2fr 1.4fr 1.6fr 1fr;
  gap: var(--space-4);
  align-items: center;
  padding: 0.85rem var(--space-3);
}

.sk-lead {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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
.sk-avatar { flex: 0 0 34px; width: 34px; height: 34px; border-radius: var(--radius-full); }
.sk-cell { height: 1rem; }
.sk-cell--name { width: 60%; height: 1.1rem; }
.sk-cell--chip { width: 5.5rem; height: 1.5rem; border-radius: var(--radius-full); }

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
