<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    inputId?: string;
    title?: string;
    placeholder?: string;
  }>(),
  {
    inputId: undefined,
    title: '',
    placeholder: 'YYYY-MM-DD',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { locale } = useI18n();

const isCalendarOpen = ref(false);
const calendarMonthCursor = ref(startOfMonth(new Date()));

const calendarWeekdays = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' });
  const mondayFirst = new Date(Date.UTC(2024, 0, 1)); // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayFirst);
    d.setUTCDate(mondayFirst.getUTCDate() + i);
    return formatter.format(d);
  });
});

const calendarMonthLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    month: 'long',
    year: 'numeric',
  }).format(calendarMonthCursor.value),
);

const calendarDays = computed(() => {
  const monthStart = startOfMonth(calendarMonthCursor.value);
  const weekdayOffset = (monthStart.getDay() + 6) % 7; // Monday-first index
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - weekdayOffset);
  const selectedIso = props.modelValue || null;
  const todayIso = formatIsoDate(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const iso = formatIsoDate(date);
    return {
      key: `${iso}-${index}`,
      iso,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isSelected: selectedIso === iso,
      isToday: iso === todayIso,
    };
  });
});

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(delta: number) {
  const next = new Date(calendarMonthCursor.value);
  next.setMonth(next.getMonth() + delta);
  calendarMonthCursor.value = startOfMonth(next);
}

function openCalendar() {
  isCalendarOpen.value = true;
  const selectedDate = parseIsoDate(props.modelValue);
  calendarMonthCursor.value = startOfMonth(selectedDate ?? new Date());
}

function toggleCalendar() {
  if (isCalendarOpen.value) {
    isCalendarOpen.value = false;
    return;
  }
  openCalendar();
}

function onInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  emit('update:modelValue', target.value);
}

function normalizeInput() {
  const parsed = parseIsoDate(props.modelValue);
  if (!parsed) return;
  emit('update:modelValue', formatIsoDate(parsed));
}

function onFocusOut(event: FocusEvent) {
  const currentTarget = event.currentTarget;
  if (!(currentTarget instanceof HTMLElement)) return;
  const nextFocused = event.relatedTarget;
  if (nextFocused instanceof Node && currentTarget.contains(nextFocused)) return;
  isCalendarOpen.value = false;
}

function selectCalendarDay(iso: string) {
  emit('update:modelValue', iso);
  isCalendarOpen.value = false;
}
</script>

<template>
  <div class="fleet-date-input" @focusout="onFocusOut">
    <div class="fleet-date-input__wrap">
      <input
        :id="inputId"
        :value="modelValue"
        type="text"
        inputmode="numeric"
        class="ti-input fleet-date-input__control"
        :placeholder="placeholder"
        :title="title"
        @focus="openCalendar"
        @input="onInput"
        @blur="normalizeInput"
      >
      <button
        type="button"
        class="fleet-date-input__toggle"
        :aria-label="title || placeholder"
        @click="toggleCalendar"
      >
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
      </button>
    </div>

    <div
      v-if="isCalendarOpen"
      class="fleet-date-input__calendar"
      role="dialog"
      :aria-label="title || placeholder"
    >
      <div class="fleet-date-input__header">
        <button
          type="button"
          class="fleet-date-input__nav"
          aria-label="Previous month"
          @click="shiftMonth(-1)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        </button>
        <p class="fleet-date-input__month">{{ calendarMonthLabel }}</p>
        <button
          type="button"
          class="fleet-date-input__nav"
          aria-label="Next month"
          @click="shiftMonth(1)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </button>
      </div>

      <div class="fleet-date-input__weekdays" aria-hidden="true">
        <span v-for="day in calendarWeekdays" :key="day">{{ day }}</span>
      </div>

      <div class="fleet-date-input__grid">
        <button
          v-for="day in calendarDays"
          :key="day.key"
          type="button"
          class="fleet-date-input__day"
          :class="{
            'fleet-date-input__day--outside': !day.isCurrentMonth,
            'fleet-date-input__day--today': day.isToday,
            'fleet-date-input__day--selected': day.isSelected,
          }"
          :aria-label="day.iso"
          @click="selectCalendarDay(day.iso)"
        >
          {{ day.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fleet-date-input {
  position: relative;
  z-index: 1;
}

.fleet-date-input:focus-within {
  z-index: 40;
}

.fleet-date-input__wrap {
  position: relative;
}

.fleet-date-input__control {
  padding-right: 2.35rem;
}

.fleet-date-input__toggle {
  position: absolute;
  top: 50%;
  right: 0.55rem;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.55rem;
  height: 1.55rem;
  padding: 0;
  border: none;
  border-radius: 0.45rem;
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.fleet-date-input__toggle .material-symbols-outlined {
  font-size: 1.05rem;
}

.fleet-date-input__toggle:hover {
  background: var(--color-surface-container);
  color: var(--color-on-surface);
}

.fleet-date-input__toggle:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.fleet-date-input__calendar {
  position: absolute;
  bottom: calc(100% + 0.4rem);
  right: 0;
  z-index: 80;
  width: min(18rem, calc(100vw - 4.5rem));
  padding: 0.65rem;
  border-radius: 0.75rem;
  background: color-mix(
    in srgb,
    var(--color-secondary-container) 16%,
    var(--color-surface-container-lowest)
  );
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(25, 28, 30, 0.26);
}

.fleet-date-input__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  margin-bottom: 0.5rem;
}

.fleet-date-input__month {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--color-on-surface);
}

.fleet-date-input__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-container-low);
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.fleet-date-input__nav .material-symbols-outlined {
  font-size: 1rem;
}

.fleet-date-input__nav:hover {
  color: var(--color-on-surface);
  background: var(--color-surface-container);
}

.fleet-date-input__nav:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.fleet-date-input__weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin-bottom: 0.25rem;
}

.fleet-date-input__weekdays > span {
  text-align: center;
  font-family: var(--font-sans);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.fleet-date-input__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.2rem;
}

.fleet-date-input__day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: 0.45rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-on-surface);
  background: transparent;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.fleet-date-input__day:hover {
  background: var(--color-surface-container);
}

.fleet-date-input__day--outside {
  color: color-mix(in srgb, var(--color-on-surface-variant) 68%, transparent);
}

.fleet-date-input__day--today {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-secondary) 40%, transparent);
}

.fleet-date-input__day--selected {
  color: var(--color-on-secondary);
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
}
</style>
