<script setup lang="ts">
import { enUS } from 'date-fns/locale/en-US';
import { pl } from 'date-fns/locale/pl';
import { VueDatePicker, WeekStart } from '@vuepic/vue-datepicker';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    inputId?: string;
    title?: string;
    placeholder?: string;
    /** Renders the calendar inline (no text field / overlay). Use inside dialogs. */
    inline?: boolean;
  }>(),
  {
    inputId: undefined,
    title: '',
    placeholder: 'YYYY-MM-DD',
    inline: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { locale } = useI18n();

const root = ref<HTMLElement | null>(null);
const teleportTarget = ref<string | HTMLElement>('body');

const dfLocale = computed(() => (locale.value === 'pl' ? pl : enUS));

const innerModel = computed<string | null>({
  get() {
    const v = props.modelValue?.trim();
    return parseIsoDate(v) ? v : null;
  },
  set(v) {
    emit('update:modelValue', v ?? '');
  },
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

function resolveTeleportTarget() {
  const hostDialog = root.value?.closest('dialog');
  teleportTarget.value = hostDialog instanceof HTMLElement ? hostDialog : 'body';
}

function normalizeTypedValue() {
  const parsed = parseIsoDate(props.modelValue);
  if (!parsed) return;
  emit('update:modelValue', formatIsoDate(parsed));
}
</script>

<template>
  <div
    ref="root"
    class="fleet-date-input"
    :class="{ 'fleet-date-input--inline': inline }"
  >
    <VueDatePicker
      v-if="inline"
      v-model="innerModel"
      inline
      model-type="yyyy-MM-dd"
      :locale="dfLocale"
      :week-start="WeekStart.Monday"
      :time-picker="false"
      :time-config="{ enableTimePicker: false }"
      auto-apply
      :formats="{ input: 'yyyy-MM-dd' }"
      class="fleet-date-input__dp fleet-date-input__dp--inline"
    />
    <VueDatePicker
      v-else
      v-model="innerModel"
      model-type="yyyy-MM-dd"
      :locale="dfLocale"
      :week-start="WeekStart.Monday"
      :teleport="teleportTarget"
      :time-picker="false"
      :time-config="{ enableTimePicker: false }"
      auto-apply
      :formats="{ input: 'yyyy-MM-dd' }"
      :text-input="{ format: 'yyyy-MM-dd', openMenu: 'open' }"
      :input-attrs="{ clearable: false }"
      class="fleet-date-input__dp"
      @open="resolveTeleportTarget"
    >
      <template
        #dp-input="{
          value,
          onInput,
          onFocus,
          onBlur,
          onKeypress,
          onPaste,
          onEnter,
          onTab,
          toggleMenu,
        }"
      >
        <div class="fleet-date-input__wrap">
          <input
            :id="inputId"
            type="text"
            inputmode="numeric"
            class="ti-input fleet-date-input__control"
            :placeholder="placeholder"
            :title="title"
            :value="value"
            @input="onInput($event)"
            @focus="
              () => {
                resolveTeleportTarget();
                onFocus();
              }
            "
            @blur="
              () => {
                onBlur();
                normalizeTypedValue();
              }
            "
            @keypress="onKeypress($event)"
            @paste="onPaste()"
            @keydown.enter="onEnter($event)"
            @keydown.tab="onTab($event)"
          >
          <button
            type="button"
            class="fleet-date-input__toggle"
            :aria-label="title || placeholder"
            @click="
              () => {
                resolveTeleportTarget();
                toggleMenu();
              }
            "
          >
            <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
          </button>
        </div>
      </template>
    </VueDatePicker>
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

.fleet-date-input__dp {
  width: 100%;
}

.fleet-date-input--inline {
  z-index: auto;
}

.fleet-date-input__dp--inline {
  width: 100%;
}

.fleet-date-input__dp--inline :deep(.dp__outer_menu_wrap) {
  width: 100%;
  border: none;
  box-shadow: none;
  background: transparent;
}

.fleet-date-input__dp--inline :deep(.dp__menu_inner) {
  padding: 0;
}

.fleet-date-input__dp :deep(.dp__input_wrap) {
  width: 100%;
}

.fleet-date-input__dp :deep(.dp__input) {
  display: none;
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
</style>
