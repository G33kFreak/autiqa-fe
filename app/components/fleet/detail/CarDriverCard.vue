<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';

const props = defineProps<{
  driver: DriverDto | null;
  removing?: boolean;
}>();

const emit = defineEmits<{ assign: []; remove: [] }>();
const { t } = useI18n();

const name = computed(() =>
  props.driver ? `${props.driver.firstName} ${props.driver.lastName}`.trim() : '',
);
const initials = computed(() =>
  props.driver
    ? `${props.driver.firstName?.[0] ?? ''}${props.driver.lastName?.[0] ?? ''}`.toUpperCase()
    : '',
);
</script>

<template>
  <section class="dc" aria-labelledby="dc-title">
    <div class="ui-section-head dc__head">
      <h2 id="dc-title" class="ui-section-title">{{ t('app.car.driver.title') }}</h2>
      <button
        v-if="driver"
        type="button"
        class="ui-btn ui-btn--ghost ui-btn--sm"
        @click="emit('assign')"
      >
        {{ t('app.car.driver.change') }}
      </button>
    </div>

    <div v-if="driver" class="dc__body">
      <div class="dc__person">
        <span class="dc__avatar" aria-hidden="true">{{ initials || '—' }}</span>
        <span class="dc__name">{{ name }}</span>
      </div>

      <ul class="dc__contacts">
        <li v-if="driver.phoneNumber" class="dc__contact">
          <AppIcon name="phone" :size="16" />
          <a :href="`tel:${driver.phoneNumber}`" class="dc__contact-link">{{ driver.phoneNumber }}</a>
        </li>
        <li v-if="driver.email" class="dc__contact">
          <AppIcon name="mail" :size="16" />
          <a :href="`mailto:${driver.email}`" class="dc__contact-link">{{ driver.email }}</a>
        </li>
        <li v-if="!driver.phoneNumber && !driver.email" class="dc__contact dc__contact--muted">
          {{ t('app.car.common.noContact') }}
        </li>
      </ul>

      <button
        type="button"
        class="ui-btn ui-btn--ghost ui-btn--sm dc__remove"
        :disabled="removing"
        @click="emit('remove')"
      >
        <span v-if="removing" class="ui-spinner ui-spinner--ink" aria-hidden="true" />
        <AppIcon v-else name="close" :size="16" />
        <span>{{ t('app.car.driver.remove') }}</span>
      </button>
    </div>

    <div v-else class="dc__empty">
      <span class="dc__empty-icon" aria-hidden="true">
        <AppIcon name="drivers" :size="22" />
      </span>
      <p class="dc__empty-copy">{{ t('app.car.driver.emptyCopy') }}</p>
      <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm ui-btn--block" @click="emit('assign')">
        <AppIcon name="plus" :size="16" />
        <span>{{ t('app.car.driver.assign') }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.dc {
  padding: var(--space-5);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
}

.dc__head {
  margin-bottom: var(--space-4);
}

.dc__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.dc__person {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.dc__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: 0.9375rem;
  font-weight: 700;
}

.dc__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
}

.dc__contacts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.dc__contact {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-muted);
  min-width: 0;
}

.dc__contact-link {
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out);
}

.dc__contact-link:hover {
  color: var(--color-primary);
}

.dc__contact--muted {
  color: var(--color-muted);
}

.dc__remove {
  align-self: flex-start;
  color: var(--color-muted);
}

.dc__remove:hover:not(:disabled) {
  color: var(--color-risk);
  background: var(--color-risk-bg);
}

.dc__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
}

.dc__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  background: var(--color-surface-mid);
  color: var(--color-muted);
}

.dc__empty-copy {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-muted);
  text-wrap: pretty;
}
</style>
