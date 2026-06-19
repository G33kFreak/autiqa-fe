<script setup lang="ts">
/**
 * Locale switcher shared by the landing header and the app top bar.
 * Driven by the configured i18n locales, so adding a language to
 * nuxt.config requires no change here. The trigger inherits `currentColor`,
 * which lets it sit on the dark hero, the scrolled white header, and the
 * app top bar without per-context restyling.
 */
withDefaults(
  defineProps<{
    /** Which edge the popover aligns to. */
    align?: 'start' | 'end';
    /** Open the popover above the trigger (e.g. inside a bottom-anchored menu). */
    placement?: 'bottom' | 'top';
  }>(),
  { align: 'end', placement: 'bottom' },
);

const { locale, locales, t } = useI18n();
const switchLocalePath = useSwitchLocalePath();

type LocaleLike = { code: string; name?: string };

const options = computed(() =>
  (locales.value as LocaleLike[]).map((l) => ({
    code: l.code,
    name: l.name ?? l.code.toUpperCase(),
    short: l.code.toUpperCase(),
  })),
);

const current = computed(
  () => options.value.find((o) => o.code === locale.value) ?? options.value[0],
);

const open = ref(false);
const root = ref<HTMLElement | null>(null);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function onPointerDown(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    close();
    (root.value?.querySelector('.lang__trigger') as HTMLElement | null)?.focus();
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown);
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div ref="root" class="lang" :class="[`lang--${align}`, `lang--${placement}`]">
    <button
      type="button"
      class="lang__trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="t('langSwitcher.label')"
      @click="toggle"
    >
      <AppIcon name="globe" :size="18" class="lang__globe" />
      <span class="lang__code">{{ current?.short }}</span>
      <AppIcon
        name="chevron"
        :size="16"
        class="lang__chevron"
        :class="{ 'is-open': open }"
      />
    </button>

    <Transition name="lang-pop">
      <ul
        v-if="open"
        class="lang__panel"
        role="menu"
        :aria-label="t('langSwitcher.label')"
      >
        <li v-for="opt in options" :key="opt.code" role="none">
          <NuxtLink
            :to="switchLocalePath(opt.code)"
            class="lang__item"
            :class="{ 'is-active': opt.code === locale }"
            role="menuitemradio"
            :aria-checked="opt.code === locale"
            @click="close"
          >
            <span class="lang__item-badge" aria-hidden="true">{{ opt.short }}</span>
            <span class="lang__item-name">{{ opt.name }}</span>
            <AppIcon
              v-if="opt.code === locale"
              name="tick"
              :size="16"
              class="lang__item-check"
            />
          </NuxtLink>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.lang {
  position: relative;
  display: inline-flex;
  color: inherit;
}

/* ── Trigger ──────────────────────────────────────────────── */
.lang__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  height: 40px;
  padding: 0 var(--space-2);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: inherit;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.lang__trigger:hover {
  background: color-mix(in oklch, currentColor 10%, transparent);
}

.lang__trigger[aria-expanded='true'] {
  background: color-mix(in oklch, currentColor 12%, transparent);
}

.lang__trigger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.lang__globe {
  opacity: 0.85;
}

.lang__code {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.lang__chevron {
  opacity: 0.6;
  transition: transform var(--duration-ui) var(--ease-out);
}

.lang__chevron.is-open {
  transform: rotate(180deg);
}

/* ── Panel ────────────────────────────────────────────────── */
.lang__panel {
  position: absolute;
  top: calc(100% + 8px);
  min-width: 196px;
  margin: 0;
  padding: var(--space-2);
  list-style: none;
  background: var(--color-bg);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-float);
  z-index: var(--z-dropdown);
}

.lang--end .lang__panel {
  right: 0;
}

.lang--start .lang__panel {
  left: 0;
}

.lang--top .lang__panel {
  top: auto;
  bottom: calc(100% + 8px);
}

/* ── Items ────────────────────────────────────────────────── */
.lang__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--color-ink);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.lang__item:hover {
  background: var(--color-surface-mid);
}

.lang__item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.lang__item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 30px;
  height: 22px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-mid);
  color: var(--color-muted);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.lang__item-name {
  flex: 1;
}

.lang__item-check {
  color: var(--color-primary);
}

.lang__item.is-active {
  color: var(--color-primary);
  font-weight: 600;
}

.lang__item.is-active .lang__item-badge {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

/* ── Pop transition ───────────────────────────────────────── */
.lang-pop-enter-active,
.lang-pop-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.lang-pop-enter-from,
.lang-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.lang--top .lang-pop-enter-from,
.lang--top .lang-pop-leave-to {
  transform: translateY(6px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .lang__chevron,
  .lang-pop-enter-active,
  .lang-pop-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
