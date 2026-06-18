<script setup lang="ts">
/**
 * Inline SVG icon set for the app shell. Stroke-based, `currentColor`,
 * matching the project's hand-rolled SVG approach (see AutiqaLogo).
 */
export type IconName =
  | 'dashboard'
  | 'fleet'
  | 'drivers'
  | 'finances'
  | 'settings'
  | 'panel'
  | 'menu'
  | 'close'
  | 'logout'
  | 'chevron';

withDefaults(
  defineProps<{
    name: IconName;
    size?: number;
  }>(),
  { size: 22 },
);

/** 24×24 path data, drawn with a 1.75 stroke, round caps + joins. */
const paths: Record<string, string> = {
  dashboard: 'M4 4h6v6H4V4Zm10 0h6v4h-6V4ZM4 14h6v6H4v-6Zm10-2h6v8h-6v-8Z',
  fleet:
    'M5 16.5h14M6.5 16.5v1.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1.5m15.5 0v1.5a1 1 0 0 1-1 1h-.5a1 1 0 0 1-1-1v-1.5M5 16.5l1.4-5.2A2 2 0 0 1 8.3 9.8h7.4a2 2 0 0 1 1.9 1.5L19 16.5M7.5 13.2h9',
  drivers:
    'M12 11.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM5.5 19.5a6.5 6.5 0 0 1 13 0',
  finances:
    'M3.5 7.5h17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm0 3.5h17M6 15.5h3',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.16-1.6l1.7-1.32-1.7-2.94-2.02.82a8 8 0 0 0-2.77-1.6L14.5 3h-5l-.35 2.16a8 8 0 0 0-2.77 1.6l-2.02-.82-1.7 2.94 1.7 1.32a8.06 8.06 0 0 0 0 3.2l-1.7 1.32 1.7 2.94 2.02-.82a8 8 0 0 0 2.77 1.6L9.5 21h5l.35-2.16a8 8 0 0 0 2.77-1.6l2.02.82 1.7-2.94-1.7-1.32A8 8 0 0 0 20 12Z',
  panel:
    'M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Zm5 0v15',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  logout: 'M15 7V5.5a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h7a1.5 1.5 0 0 0 1.5-1.5V17M10 12h11m0 0-3-3m3 3-3 3',
  chevron: 'M8 10l4 4 4-4',
};
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="paths[name]" />
  </svg>
</template>
