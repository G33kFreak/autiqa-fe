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
  | 'chevron'
  | 'search'
  | 'plus'
  | 'car'
  | 'calendar'
  | 'shield'
  | 'refresh'
  | 'alert'
  | 'check'
  | 'phone'
  | 'mail'
  | 'circle'
  | 'globe'
  | 'tick'
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-left'
  | 'edit'
  | 'trash'
  | 'upload'
  | 'download'
  | 'image'
  | 'document'
  | 'wallet'
  | 'wrench'
  | 'fuel'
  | 'receipt'
  | 'more'
  | 'eye'
  | 'star'
  | 'trending-up'
  | 'trending-down'
  | 'clock'
  | 'info'
  | 'building'
  | 'gauge'
  | 'hash'
  | 'plus-circle';

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
  search: 'M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Zm4.6-1.9L20 20',
  plus: 'M12 5v14M5 12h14',
  car:
    'M4 15h16M5.5 15l1.6-5A2 2 0 0 1 9 8.6h6a2 2 0 0 1 1.9 1.4l1.6 5M8 11h8M8 17.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  calendar:
    'M5 6.5h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1ZM8 4.5v4M16 4.5v4M4 10.5h16',
  shield:
    'M12 3.8l6.6 2.4v5c0 4-2.8 6.8-6.6 8.1-3.8-1.3-6.6-4.1-6.6-8.1v-5L12 3.8ZM9.4 11.8l1.8 1.8 3.4-3.6',
  refresh:
    'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5',
  alert: 'M12 4.5 2.5 19.5h19L12 4.5ZM12 10v4M12 17h.01',
  check: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM8.5 12l2.5 2.5 4.5-4.8',
  phone:
    'M6.5 4.5h2.2l1.1 3.2-1.6 1.2a11 11 0 0 0 5.1 5.1l1.2-1.6 3.2 1.1v2.2a1.5 1.5 0 0 1-1.6 1.5C10.3 17.5 6.5 13.7 5 8.1A1.5 1.5 0 0 1 6.5 4.5Z',
  mail:
    'M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm.4.6 7.6 5.4 7.6-5.4',
  circle: 'M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z',
  globe:
    'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM3.6 12h16.8M12 3.5c2.3 2.3 3.6 5.3 3.6 8.5s-1.3 6.2-3.6 8.5c-2.3-2.3-3.6-5.3-3.6-8.5S9.7 5.8 12 3.5Z',
  tick: 'M5 12.5l4.5 4.5L19 7',
  'chevron-right': 'M10 7l5 5-5 5',
  'chevron-left': 'M14 7l-5 5 5 5',
  'arrow-left': 'M11 6.5 5.5 12 11 17.5M5.5 12H19',
  edit: 'M4 20l1-4L16 5l3 3L8 19l-4 1ZM14 7l3 3',
  trash:
    'M5 7h14M10 7V5.2A1.2 1.2 0 0 1 11.2 4h1.6A1.2 1.2 0 0 1 14 5.2V7M6.5 7l.8 12a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9l.8-12M10 11v5.5M14 11v5.5',
  upload:
    'M12 16V5m0 0L8 9m4-4 4 4M5 15v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3',
  download:
    'M12 4v11m0 0 4-4m-4 4-4-4M5 17v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1',
  image:
    'M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM4.5 16l4-4 3 3 3.5-3.5L20 15M9.3 9.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z',
  document:
    'M7 3.5h6.2L18 8.2V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1ZM13 3.6V8.5h4.9M9 13h6M9 16.5h4',
  wallet:
    'M3.5 8A1.5 1.5 0 0 1 5 6.5h11.5a1 1 0 0 1 1 1V9M3.5 8v9.5a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1V12a1 1 0 0 0-1-1H4M16.5 14.5h.5',
  wrench:
    'M15.6 4.6a3.8 3.8 0 0 0-4.9 4.8L4 16.2V20h3.8l6.8-6.8a3.8 3.8 0 0 0 4.8-4.9l-2.6 2.6-2.4-.4-.4-2.4 2.6-2.5Z',
  fuel:
    'M6 20V6.5A1.5 1.5 0 0 1 7.5 5h3.5A1.5 1.5 0 0 1 12.5 6.5V20M4.5 20h9.5M12.5 10h2.5A1.5 1.5 0 0 1 16.5 11.5V16a1.5 1.5 0 0 0 3 0V9l-2.6-2.6',
  receipt:
    'M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3.5ZM9 8h6M9 11.5h6M9 15h4',
  more: 'M12 6.4h.01M12 12h.01M12 17.6h.01',
  eye:
    'M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12ZM12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z',
  star: 'M12 4l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 16.6 7.2 18.3l.9-5.2L4.3 9.5l5.2-.7L12 4Z',
  'trending-up': 'M4 16l5-5 3 3 7-7M15 7h5v5',
  'trending-down': 'M4 8l5 5 3-3 7 7M15 17h5v-5',
  clock: 'M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM12 8.5V12l2.6 1.6',
  info: 'M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM12 11.2v5M12 8.2h.01',
  building:
    'M5 20.5V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15.5M13 9.5h5a1 1 0 0 1 1 1v10M3.5 20.5h17M8 8h2M8 11.5h2M8 15h2M16 13.5h.5M16 17h.5',
  gauge: 'M4.5 17.5a8.5 8.5 0 1 1 15 0M12 13.5l3.5-3.5',
  hash: 'M9.5 4 7.5 20M16.5 4l-2 16M4.5 9h15M3.5 15h15',
  'plus-circle': 'M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM12 9v6M9 12h6',
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
