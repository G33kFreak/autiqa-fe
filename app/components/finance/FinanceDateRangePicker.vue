<script setup lang="ts">
import { enUS } from 'date-fns/locale/en-US';
import { pl } from 'date-fns/locale/pl';
import { VueDatePicker, WeekStart } from '@vuepic/vue-datepicker';

const props = defineProps<{
  dateFrom: string;
  dateTo: string;
}>();

const emit = defineEmits<{
  'update:dateFrom': [value: string];
  'update:dateTo': [value: string];
}>();

const { locale, t } = useI18n();

const dfLocale = computed(() => (locale.value === 'pl' ? pl : enUS));

/** Range model as ISO strings (partial range uses `null` for the end date). */
type RangeStrings = [string, string] | [string, null];

const rangeModel = ref<RangeStrings | null>(null);

function isIsoDateString(value: string): boolean {
  return /^(\d{4})-(\d{2})-(\d{2})$/.test(value.trim());
}

function propsToRange(from: string, to: string): RangeStrings | null {
  const f = from?.trim() ?? '';
  const t = to?.trim() ?? '';
  if (!f && !t) return null;
  if (f && isIsoDateString(f) && !t) return [f, null];
  if (f && t && isIsoDateString(f) && isIsoDateString(t)) return [f, t];
  return null;
}

watch(
  () => [props.dateFrom, props.dateTo] as const,
  ([from, to]) => {
    rangeModel.value = propsToRange(from, to);
  },
  { immediate: true },
);

function onRangeUpdate(value: unknown) {
  if (!value || !Array.isArray(value)) {
    rangeModel.value = null;
    emit('update:dateFrom', '');
    emit('update:dateTo', '');
    return;
  }
  const [from, to] = value as [string | null | undefined, string | null | undefined];
  rangeModel.value = [from ?? '', to ?? null] as RangeStrings;
  emit('update:dateFrom', from ?? '');
  emit('update:dateTo', to == null || to === '' ? '' : String(to));
}

const displayValue = computed(() => {
  if (!props.dateFrom && !props.dateTo) return t('appSections.finance.filters.pickRange');
  if (!props.dateTo) return `${props.dateFrom} - ...`;
  return `${props.dateFrom} - ${props.dateTo}`;
});

</script>

<template>
  <div class="range-picker">
    <VueDatePicker
      :model-value="rangeModel as any"
      model-type="yyyy-MM-dd"
      range
      :time-picker="false"
      :time-config="{ enableTimePicker: false }"
      auto-apply
      :locale="dfLocale"
      :week-start="WeekStart.Monday"
      :formats="{ input: 'yyyy-MM-dd' }"
      :input-attrs="{ clearable: false }"
      class="range-picker__dp"
      @update:model-value="onRangeUpdate"
    >
      <template #trigger>
        <button type="button" class="range-picker__trigger">
          <span class="range-picker__value">{{ displayValue }}</span>
          <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        </button>
      </template>
    </VueDatePicker>
  </div>
</template>

<style scoped>
.range-picker {
  position: relative;
}

.range-picker__dp {
  width: 100%;
}

.range-picker__dp :deep(.dp__input_wrap) {
  display: none;
}

.range-picker__trigger {
  width: 100%;
  border: 0;
  border-radius: 0.7rem;
  background: var(--color-surface-container-lowest);
  color: var(--color-on-surface);
  padding: 0.58rem 0.7rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.range-picker__value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
