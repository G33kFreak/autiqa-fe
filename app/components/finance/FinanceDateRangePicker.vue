<script setup lang="ts">
const props = defineProps<{
  dateFrom: string;
  dateTo: string;
}>();

const emit = defineEmits<{
  'update:dateFrom': [value: string];
  'update:dateTo': [value: string];
}>();

const { locale, t } = useI18n();

const isOpen = ref(false);
const root = ref<HTMLElement | null>(null);
const monthCursor = ref(startOfMonth(new Date()));

const weekdays = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' });
  const mondayFirst = new Date(Date.UTC(2024, 0, 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayFirst);
    d.setUTCDate(mondayFirst.getUTCDate() + i);
    return formatter.format(d);
  });
});

const monthLabel = computed(() => new Intl.DateTimeFormat(locale.value, {
  month: 'long',
  year: 'numeric',
}).format(monthCursor.value));

const displayValue = computed(() => {
  if (!props.dateFrom && !props.dateTo) return t('appSections.finance.filters.pickRange');
  if (!props.dateTo) return `${props.dateFrom} - ...`;
  return `${props.dateFrom} - ${props.dateTo}`;
});

const calendarDays = computed(() => {
  const monthStart = startOfMonth(monthCursor.value);
  const offset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - offset);
  const startTime = parseIsoDate(props.dateFrom)?.getTime() ?? 0;
  const endTime = parseIsoDate(props.dateTo)?.getTime() ?? 0;

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const iso = formatIsoDate(date);
    const value = date.getTime();
    return {
      key: `${iso}-${index}`,
      iso,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isRangeStart: props.dateFrom === iso,
      isRangeEnd: props.dateTo === iso,
      isInRange: startTime > 0 && endTime > 0 && value >= startTime && value <= endTime,
    };
  });
});

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function shiftMonth(delta: number) {
  const next = new Date(monthCursor.value);
  next.setMonth(next.getMonth() + delta);
  monthCursor.value = startOfMonth(next);
}

function toggle() {
  isOpen.value = !isOpen.value;
}

function pickDate(iso: string) {
  if (!props.dateFrom || props.dateTo) {
    emit('update:dateFrom', iso);
    emit('update:dateTo', '');
    return;
  }

  if (iso < props.dateFrom) {
    emit('update:dateFrom', iso);
    emit('update:dateTo', props.dateFrom);
  } else {
    emit('update:dateTo', iso);
  }
  isOpen.value = false;
}

watch(
  () => [props.dateFrom, props.dateTo],
  ([from, to]) => {
    if (isOpen.value && from && to) {
      isOpen.value = false;
    }
  },
);

function onDocumentClick(event: MouseEvent) {
  if (!isOpen.value) return;
  if (!(event.target instanceof Node)) return;
  if (root.value?.contains(event.target)) return;
  isOpen.value = false;
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick);
});
</script>

<template>
  <div ref="root" class="range-picker">
    <button type="button" class="range-picker__trigger" @click="toggle">
      <span class="range-picker__value">{{ displayValue }}</span>
      <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
    </button>

    <div v-if="isOpen" class="range-picker__panel">
      <div class="range-picker__head">
        <button type="button" class="range-picker__nav" @click="shiftMonth(-1)">
          <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        </button>
        <p class="range-picker__month">{{ monthLabel }}</p>
        <button type="button" class="range-picker__nav" @click="shiftMonth(1)">
          <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </button>
      </div>

      <div class="range-picker__weekdays" aria-hidden="true">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>

      <div class="range-picker__grid">
        <button
          v-for="day in calendarDays"
          :key="day.key"
          type="button"
          class="range-picker__day"
          :class="{
            'range-picker__day--outside': !day.isCurrentMonth,
            'range-picker__day--in-range': day.isInRange,
            'range-picker__day--edge': day.isRangeStart || day.isRangeEnd,
          }"
          @click="pickDate(day.iso)"
        >
          {{ day.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.range-picker {
  position: relative;
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

.range-picker__panel {
  position: absolute;
  z-index: 80;
  inset-inline-start: 0;
  top: calc(100% + 0.25rem);
  width: min(20rem, 100vw - 2rem);
  padding: 0.65rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-secondary-container) 16%, var(--color-surface-container-lowest));
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(25, 28, 30, 0.22);
}

.range-picker__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.45rem;
}

.range-picker__month {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 700;
}

.range-picker__nav {
  border: 0;
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 0.5rem;
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  cursor: pointer;
}

.range-picker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.2rem;
}

.range-picker__weekdays span {
  text-align: center;
  font-size: 0.63rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}

.range-picker__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
}

.range-picker__day {
  border: 0;
  min-height: 1.8rem;
  border-radius: 0.4rem;
  background: transparent;
  color: var(--color-on-surface);
  cursor: pointer;
}

.range-picker__day--outside {
  color: color-mix(in srgb, var(--color-on-surface-variant) 66%, transparent);
}

.range-picker__day--in-range {
  background: color-mix(in srgb, var(--color-secondary) 16%, transparent);
}

.range-picker__day--edge {
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
  color: var(--color-on-secondary);
}
</style>
