<script setup lang="ts">
import type { CarDocumentDto } from '#shared/dto/car-document.dto';
import { complianceStatus } from '~/utils/compliance';
import { formatBytes, formatDate } from '~/utils/format';
import { documentMimeIcon } from '~/utils/asset-meta';

const props = defineProps<{
  documents: CarDocumentDto[];
  isPending: (id: string) => boolean;
}>();

const emit = defineEmits<{ add: []; delete: [id: string] }>();
const { t, locale } = useI18n();

const sorted = computed(() =>
  [...props.documents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
);

function expiryTone(doc: CarDocumentDto) {
  if (!doc.expiresAt) return null;
  return complianceStatus(doc.expiresAt);
}
</script>

<template>
  <section class="doc" aria-labelledby="doc-title">
    <div class="ui-section-head">
      <div>
        <h2 id="doc-title" class="ui-section-title">{{ t('app.car.documents.title') }}</h2>
        <p class="ui-section-sub">{{ t('app.car.documents.sectionSub') }}</p>
      </div>
      <button type="button" class="ui-btn ui-btn--primary ui-btn--sm" @click="emit('add')">
        <AppIcon name="upload" :size="18" />
        <span>{{ t('app.car.documents.add') }}</span>
      </button>
    </div>

    <div v-if="documents.length === 0" class="ui-empty">
      <span class="ui-empty__icon" aria-hidden="true">
        <AppIcon name="document" :size="24" />
      </span>
      <h3 class="ui-empty__title">{{ t('app.car.documents.emptyTitle') }}</h3>
      <p class="ui-empty__body">{{ t('app.car.documents.emptyBody') }}</p>
      <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" @click="emit('add')">
        <AppIcon name="upload" :size="16" />
        <span>{{ t('app.car.documents.add') }}</span>
      </button>
    </div>

    <ul v-else class="doc__list">
      <li v-for="doc in sorted" :key="doc.id" class="doc__item">
        <span class="doc__icon" aria-hidden="true">
          <AppIcon :name="documentMimeIcon(doc.mimeType)" :size="20" />
        </span>

        <div class="doc__copy">
          <span class="doc__name">{{ doc.name }}</span>
          <span class="doc__meta">
            {{ t(`app.car.documents.categories.${doc.category}`) }}
            <template v-if="doc.sizeBytes"> · {{ formatBytes(doc.sizeBytes) }}</template>
            · {{ formatDate(doc.createdAt, locale) }}
          </span>
        </div>

        <span
          v-if="expiryTone(doc) && expiryTone(doc)!.tone !== 'ok'"
          class="ui-chip doc__expiry"
          :data-tone="expiryTone(doc)!.tone"
        >
          <AppIcon name="clock" :size="13" />
          {{ t('app.car.documents.expires', { date: formatDate(doc.expiresAt, locale) }) }}
        </span>

        <div class="doc__actions">
          <a
            :href="doc.url"
            :download="doc.name"
            target="_blank"
            rel="noopener"
            class="ui-iconbtn"
            :aria-label="t('app.car.documents.download', { name: doc.name })"
          >
            <AppIcon name="download" :size="16" />
          </a>
          <button
            type="button"
            class="ui-iconbtn ui-iconbtn--danger"
            :aria-label="t('app.common.delete')"
            :disabled="isPending(doc.id)"
            @click="emit('delete', doc.id)"
          >
            <span v-if="isPending(doc.id)" class="ui-spinner ui-spinner--ink" aria-hidden="true" />
            <AppIcon v-else name="trash" :size="16" />
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.doc__list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.doc__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0.85rem var(--space-4);
  transition: background-color var(--duration-fast) var(--ease-out);
}

.doc__item:not(:last-child) {
  border-bottom: 1px solid var(--color-surface-mid);
}

.doc__item:hover {
  background: var(--color-surface);
}

.doc__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.doc__copy {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.doc__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc__meta {
  font-size: 0.8125rem;
  color: var(--color-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc__expiry {
  flex-shrink: 0;
}

.doc__actions {
  display: flex;
  gap: 0.1rem;
  flex-shrink: 0;
}

@media (max-width: 560px) {
  .doc__expiry {
    display: none;
  }
}
</style>
