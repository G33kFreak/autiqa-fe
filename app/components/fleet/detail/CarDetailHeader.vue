<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import type { CarPhotoDto } from '#shared/dto/car-photo.dto';
import { formatDate } from '~/utils/format';

const props = defineProps<{
  car: CarDto;
  coverPhoto: CarPhotoDto | null;
}>();

const emit = defineEmits<{ edit: []; 'add-entry': [] }>();
const { t, locale } = useI18n();

const title = computed(
  () => props.car.model?.trim() || t('app.car.header.unnamed'),
);
</script>

<template>
  <header class="cdh">
    <div class="cdh__identity">
      <span class="cdh__thumb" :class="{ 'cdh__thumb--empty': !coverPhoto }">
        <img v-if="coverPhoto" :src="coverPhoto.thumbnailUrl || coverPhoto.url" :alt="title">
        <AppIcon v-else name="car" :size="28" />
      </span>

      <div class="cdh__copy">
        <h1 class="cdh__title">{{ title }}</h1>
        <div class="cdh__meta">
          <span v-if="car.plateNumber" class="cdh__plate">{{ car.plateNumber }}</span>
          <span v-if="car.vin" class="cdh__vin">
            <AppIcon name="hash" :size="14" />
            {{ car.vin }}
          </span>
          <span class="cdh__added">
            {{ t('app.car.header.added', { date: formatDate(car.createdAt, locale) }) }}
          </span>
        </div>
      </div>
    </div>

    <div class="cdh__actions">
      <button type="button" class="ui-btn ui-btn--secondary" @click="emit('edit')">
        <AppIcon name="edit" :size="18" />
        <span>{{ t('app.car.header.edit') }}</span>
      </button>
      <button type="button" class="ui-btn ui-btn--primary" @click="emit('add-entry')">
        <AppIcon name="plus" :size="18" />
        <span>{{ t('app.car.header.addEntry') }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.cdh {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.cdh__identity {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;
}

.cdh__thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 64px;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface-mid);
  color: var(--color-primary);
}

.cdh__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cdh__thumb--empty {
  border: 1px solid var(--color-outline);
}

.cdh__copy {
  min-width: 0;
}

.cdh__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-ink);
  text-wrap: balance;
}

.cdh__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  margin-top: var(--space-2);
}

.cdh__plate {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 0.8125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color: var(--color-ink);
}

.cdh__vin {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--color-muted);
}

.cdh__added {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.cdh__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

@media (max-width: 560px) {
  .cdh__actions {
    width: 100%;
  }
  .cdh__actions .ui-btn {
    flex: 1;
  }
}
</style>
