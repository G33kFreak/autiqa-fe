<script setup lang="ts">
export type AppBreadcrumbItem = {
  label: string;
  to?: string;
};

defineProps<{
  items: AppBreadcrumbItem[];
}>();
</script>

<template>
  <nav class="app-breadcrumbs" aria-label="Breadcrumb">
    <ol class="app-breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="app-breadcrumbs__item"
      >
        <NuxtLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="app-breadcrumbs__link"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="app-breadcrumbs__current"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="app-breadcrumbs__sep material-symbols-outlined"
          aria-hidden="true"
        >chevron_right</span>
      </li>
    </ol>
  </nav>
</template>
