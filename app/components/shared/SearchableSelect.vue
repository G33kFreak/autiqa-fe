<script setup lang="ts">
type SearchableSelectOption = {
  id: string;
  label: string;
  meta?: string;
};

const props = withDefaults(defineProps<{
  modelValue: string;
  inputId?: string;
  ariaLabel?: string;
  placeholder: string;
  selectedLabel?: string;
  searchPlaceholder: string;
  options: SearchableSelectOption[];
  loading?: boolean;
  emptyOptionLabel?: string;
}>(), {
  inputId: '',
  ariaLabel: '',
  selectedLabel: '',
  loading: false,
  emptyOptionLabel: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  search: [query: string];
  open: [];
  close: [];
}>();

const { t } = useI18n();
const opened = ref(false);
const searchInput = ref('');
const rootEl = ref<HTMLElement | null>(null);
const instanceId = `searchable-select-${crypto.randomUUID()}`;

const hasSelection = computed(() => Boolean(props.modelValue));
const displayLabel = computed(() => props.selectedLabel || props.placeholder);

function toggle() {
  if (opened.value) {
    close();
    return;
  }

  window.dispatchEvent(new CustomEvent('searchable-select:open', {
    detail: { id: instanceId },
  }));
  opened.value = true;
  emit('open');
}

function close() {
  if (!opened.value) return;
  opened.value = false;
  emit('close');
}

function onSearchInput(event: Event) {
  const el = event.target as HTMLInputElement;
  searchInput.value = el.value;
  emit('search', searchInput.value);
}

function onPick(value: string) {
  emit('update:modelValue', value);
  close();
}

function onClear() {
  emit('update:modelValue', '');
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!opened.value) return;
  const target = event.target as Node | null;
  if (!target) return;
  if (rootEl.value?.contains(target)) return;
  close();
}

function onPeerOpen(event: Event) {
  const customEvent = event as CustomEvent<{ id?: string }>;
  if (customEvent.detail?.id === instanceId) return;
  close();
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown);
  window.addEventListener('searchable-select:open', onPeerOpen as EventListener);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
  window.removeEventListener('searchable-select:open', onPeerOpen as EventListener);
});
</script>

<template>
  <div ref="rootEl" class="searchable-select">
    <button
      :id="inputId"
      type="button"
      class="ti-input searchable-select__trigger"
      :aria-label="ariaLabel || placeholder"
      @click="toggle"
    >
      <span
        class="searchable-select__trigger-text"
        :class="{ 'searchable-select__trigger-text--placeholder': !hasSelection }"
      >
        {{ displayLabel }}
      </span>
      <span class="searchable-select__trigger-actions">
        <span
          v-if="hasSelection"
          class="searchable-select__clear"
          role="button"
          tabindex="0"
          :aria-label="t('common.clear')"
          @click.stop="onClear"
          @keydown.enter.stop.prevent="onClear"
          @keydown.space.stop.prevent="onClear"
        >
          <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
        </span>
        <span
          v-else
          class="material-symbols-outlined searchable-select__chevron"
          aria-hidden="true"
        >
          {{ opened ? 'expand_less' : 'expand_more' }}
        </span>
      </span>
    </button>

    <div v-if="opened" class="searchable-select__dropdown">
      <label class="searchable-select__search">
        <span class="material-symbols-outlined searchable-select__search-icon" aria-hidden="true">search</span>
        <input
          :value="searchInput"
          class="ti-input searchable-select__search-input"
          type="text"
          :placeholder="searchPlaceholder"
          @input="onSearchInput"
        >
      </label>

      <div class="searchable-select__suggestions">
        <p v-if="loading" class="searchable-select__state">{{ t('common.loading') }}</p>
        <button
          v-for="option in options"
          v-else
          :key="option.id"
          type="button"
          class="searchable-select__option"
          @click="onPick(option.id)"
        >
          <span class="searchable-select__option-main">{{ option.label }}</span>
          <span v-if="option.meta" class="searchable-select__option-meta">{{ option.meta }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.searchable-select {
  position: relative;
  z-index: 1;
}

.searchable-select:focus-within {
  z-index: 80;
}

.searchable-select__trigger {
  width: 100%;
  min-height: 2.5rem;
  padding: 0.5rem 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  text-align: left;
  cursor: pointer;
}

.searchable-select__trigger-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.searchable-select__trigger-text--placeholder {
  color: var(--color-on-surface-variant);
}

.searchable-select__trigger-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.searchable-select__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--color-outline);
  padding: 0;
  cursor: pointer;
}

.searchable-select__clear:hover {
  color: var(--color-on-surface-variant);
  background: color-mix(in srgb, var(--color-on-surface) 8%, transparent);
}

.searchable-select__chevron {
  color: var(--color-outline);
}

.searchable-select__trigger:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.searchable-select__dropdown {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  z-index: 90;
  border-radius: 0.65rem;
  padding: 0.45rem;
  border: 1px solid color-mix(in srgb, var(--color-outline) 18%, transparent);
  background: var(--color-surface-container);
  box-shadow: 0 8px 18px color-mix(in srgb, var(--color-on-surface) 10%, transparent);
}

.searchable-select__search {
  position: relative;
  display: block;
}

.searchable-select__search-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-outline);
  font-size: 1rem;
  pointer-events: none;
}

.searchable-select__search-input {
  padding-left: 2.2rem;
  background: var(--color-surface);
}

.searchable-select__suggestions {
  margin-top: 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  max-height: 10rem;
  overflow-y: auto;
}

.searchable-select__state {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-on-surface-variant);
}

.searchable-select__option {
  border: none;
  border-radius: 0.45rem;
  background: var(--color-surface);
  padding: 0.46rem 0.55rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
}

.searchable-select__option:hover {
  background: color-mix(in srgb, var(--color-secondary) 12%, var(--color-surface));
}

.searchable-select__option-main {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.searchable-select__option-meta {
  font-size: 0.74rem;
  color: var(--color-on-surface-variant);
}
</style>
