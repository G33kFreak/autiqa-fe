<script setup lang="ts">
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  labels: string[];
  actualValues: Array<number | null>;
  projectedValues: Array<number | null>;
}>();

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 20, right: 16, top: 24, bottom: 20, containLabel: true },
  xAxis: {
    type: 'category',
    data: props.labels,
    axisLine: { show: false },
    axisLabel: { color: '#6b7280', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#6b7280', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(118, 119, 125, 0.12)' } },
  },
  series: [
    {
      name: 'Actual',
      data: props.actualValues,
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2.5, color: '#0050cc' },
      itemStyle: { color: '#0050cc' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 80, 204, 0.25)' },
            { offset: 1, color: 'rgba(0, 80, 204, 0.02)' },
          ],
        },
      },
      animationDuration: 520,
      animationEasing: 'cubicOut',
    },
    {
      name: 'Projected',
      data: props.projectedValues,
      type: 'line',
      smooth: false,
      symbol: 'none',
      lineStyle: { width: 2, type: 'dashed', color: '#f59e0b' },
      itemStyle: { color: '#f59e0b' },
      animationDuration: 520,
      animationEasing: 'cubicOut',
    },
  ],
}));
</script>

<template>
  <VChart class="finance-chart" autoresize :option="option" />
</template>

<style scoped>
.finance-chart {
  height: 18rem;
}
</style>
