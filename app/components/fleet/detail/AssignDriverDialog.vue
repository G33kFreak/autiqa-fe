<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';
import BaseDialog from '~/components/app/BaseDialog.vue';

const props = defineProps<{
  assign: (driver: DriverDto) => Promise<void>;
}>();

const { t } = useI18n();
const driversStore = useDriversStore();
const dialog = ref<InstanceType<typeof BaseDialog> | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);

const query = ref('');
const suggestions = ref<DriverDto[]>([]);
const searching = ref(false);
const assigningId = ref<string | null>(null);
const error = ref('');
let timer: ReturnType<typeof setTimeout> | null = null;

function open() {
  query.value = '';
  suggestions.value = [];
  error.value = '';
  assigningId.value = null;
  dialog.value?.open();
  nextTick(() => searchInput.value?.focus());
  void runSearch('');
}

async function runSearch(q: string) {
  searching.value = true;
  error.value = '';
  try {
    suggestions.value = q.trim()
      ? await driversStore.searchDrivers(q, 12)
      : await driversStore.getDriverSuggestions(12);
  } catch {
    error.value = t('app.car.assignDriver.error');
  } finally {
    searching.value = false;
  }
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => runSearch(query.value), 300);
}

function driverName(d: DriverDto): string {
  return `${d.firstName} ${d.lastName}`.trim();
}

function initials(d: DriverDto): string {
  return `${d.firstName?.[0] ?? ''}${d.lastName?.[0] ?? ''}`.toUpperCase() || '—';
}

async function pick(driver: DriverDto) {
  if (assigningId.value) return;
  assigningId.value = driver.id;
  error.value = '';
  try {
    await props.assign(driver);
    dialog.value?.close();
  } catch {
    error.value = t('app.car.assignDriver.error');
  } finally {
    assigningId.value = null;
  }
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

defineExpose({ open });
</script>

<template>
  <BaseDialog
    ref="dialog"
    :title="t('app.car.assignDriver.title')"
    :subtitle="t('app.car.assignDriver.subtitle')"
    icon="drivers"
  >
    <div class="ad">
      <label class="ad__search">
        <span class="ad__search-icon" aria-hidden="true">
          <AppIcon name="search" :size="18" />
        </span>
        <input
          ref="searchInput"
          :value="query"
          type="search"
          class="ui-input ad__search-input"
          :placeholder="t('app.car.assignDriver.searchPlaceholder')"
          :aria-label="t('app.car.assignDriver.searchPlaceholder')"
          @input="onInput"
        >
      </label>

      <p v-if="error" class="ui-banner ui-banner--error" role="alert">
        <AppIcon name="alert" :size="16" />
        <span>{{ error }}</span>
      </p>

      <div class="ad__list" role="listbox" :aria-busy="searching">
        <p v-if="searching" class="ad__state">{{ t('app.common.loading') }}</p>
        <p v-else-if="suggestions.length === 0" class="ad__state">
          {{ t('app.car.assignDriver.noResults') }}
        </p>
        <button
          v-for="driver in suggestions"
          v-else
          :key="driver.id"
          type="button"
          class="ad__item"
          :disabled="assigningId !== null"
          @click="pick(driver)"
        >
          <span class="ad__avatar" aria-hidden="true">{{ initials(driver) }}</span>
          <span class="ad__item-copy">
            <span class="ad__item-name">{{ driverName(driver) }}</span>
            <span class="ad__item-meta">
              {{ driver.email || driver.phoneNumber || t('app.car.common.noContact') }}
            </span>
          </span>
          <span v-if="assigningId === driver.id" class="ui-spinner ui-spinner--ink" aria-hidden="true" />
          <span v-else class="ad__item-go" aria-hidden="true">
            <AppIcon name="chevron-right" :size="18" />
          </span>
        </button>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.ad {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-bottom: var(--space-6);
}

.ad__search {
  position: relative;
  display: block;
}

.ad__search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  display: inline-flex;
  color: var(--color-muted);
  pointer-events: none;
}

.ad__search-input {
  padding-left: 2.5rem;
}

.ad__list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  max-height: 22rem;
  overflow-y: auto;
}

.ad__state {
  margin: 0;
  padding: var(--space-6);
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.ad__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: 0.6rem 0.65rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  text-align: left;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.ad__item:hover:not(:disabled),
.ad__item:focus-visible {
  background: var(--color-surface-mid);
  outline: none;
}

.ad__item:disabled {
  opacity: 0.6;
}

.ad__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 700;
}

.ad__item-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.ad__item-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad__item-meta {
  font-size: 0.8125rem;
  color: var(--color-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad__item-go {
  display: inline-flex;
  color: var(--color-muted);
  flex-shrink: 0;
}
</style>
