<script setup lang="ts">
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  rows: Array<[number, number, number]>;
}>();

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const blocks = ['06-09', '09-12', '12-15', '15-18', '18-21'];

const maxValue = computed(() => Math.max(...props.rows.map((x) => x[2]), 1));

const option = computed<EChartsOption>(() => ({
  tooltip: { position: 'top' },
  grid: { left: 24, right: 18, top: 12, bottom: 46, containLabel: true },
  xAxis: { type: 'category', data: weekdays, splitArea: { show: true }, axisLine: { show: false } },
  yAxis: { type: 'category', data: blocks, splitArea: { show: true }, axisLine: { show: false } },
  visualMap: {
    min: 0,
    max: maxValue.value,
    calculable: false,
    orient: 'horizontal',
    left: 'center',
    bottom: 6,
  },
  series: [
    {
      type: 'heatmap',
      data: props.rows,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 6 } },
      animationDuration: 420,
    },
  ],
}));
</script>

<template>
  <VChart class="finance-chart" autoresize :option="option" />
</template>

<style scoped>
.finance-chart {
  height: 16rem;
}
</style>
