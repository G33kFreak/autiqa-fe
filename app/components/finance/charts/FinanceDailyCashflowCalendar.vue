<script setup lang="ts">
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  weeks: string[];
  rows: Array<{ value: [number, number, number]; date: string }>;
}>();

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const maxAbs = computed(() =>
  Math.max(...props.rows.map((row) => Math.abs(row.value[2])), 1),
);

const dateRange = computed<[string, string]>(() => {
  const all = props.rows.map((row) => row.date).sort();
  const first = all[0] ?? new Date().toISOString().slice(0, 10);
  const last = all[all.length - 1] ?? first;
  return [first, last];
});

const option = computed<EChartsOption>(() => ({
  tooltip: {
    position: 'top',
    formatter: (params: any) => {
      const amount = Number(params.value?.[1] ?? 0);
      const sign = amount >= 0 ? '+' : '';
      return `${params.value?.[0]}<br/>Net: ${sign}${amount.toLocaleString()}`;
    },
  },
  calendar: {
    top: 8,
    left: 20,
    right: 20,
    cellSize: [14, 14],
    range: dateRange.value,
    orient: 'horizontal',
    splitLine: { show: false },
    itemStyle: {
      color: '#eff6ff',
      borderWidth: 1,
      borderColor: 'rgba(118, 119, 125, 0.08)',
    },
    dayLabel: {
      firstDay: 1,
      nameMap: weekdays,
      color: '#6b7280',
      margin: 6,
    },
    monthLabel: { show: false },
    yearLabel: { show: false },
  },
  visualMap: {
    min: -maxAbs.value,
    max: maxAbs.value,
    calculable: false,
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    inRange: {
      color: ['#ba1a1a', '#dbeafe', '#0f8a46'],
    },
  },
  series: [
    {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: props.rows.map((row) => [row.date, row.value[2]]),
      animationDuration: 420,
      emphasis: { itemStyle: { shadowBlur: 6 } },
      itemStyle: { borderRadius: 3 },
    },
  ],
}));
</script>

<template>
  <VChart class="finance-chart" autoresize :option="option" />
</template>

<style scoped>
.finance-chart {
  height: 13rem;
}
</style>
