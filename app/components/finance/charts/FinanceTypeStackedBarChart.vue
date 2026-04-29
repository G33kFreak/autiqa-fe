<script setup lang="ts">
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  labels: string[];
  series: Array<{ name: string; data: number[] }>;
}>();

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { top: 0, textStyle: { color: '#6b7280', fontSize: 11 } },
  grid: { left: 16, right: 12, top: 36, bottom: 16, containLabel: true },
  xAxis: { type: 'category', data: props.labels, axisLine: { show: false }, axisLabel: { color: '#6b7280' } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(118, 119, 125, 0.12)' } } },
  series: props.series.map((item) => ({
    ...item,
    type: 'bar',
    stack: 'total',
    barMaxWidth: 24,
    emphasis: { focus: 'series' },
    animationDuration: 500,
  })),
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
