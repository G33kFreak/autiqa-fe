<script setup lang="ts">
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  labels: string[];
  values: number[];
  color?: string;
}>();

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 80, right: 18, top: 14, bottom: 16, containLabel: true },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#6b7280', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(118, 119, 125, 0.12)' } },
  },
  yAxis: {
    type: 'category',
    data: props.labels,
    inverse: true,
    axisLabel: { color: '#374151', fontSize: 11 },
    axisLine: { show: false },
  },
  series: [
    {
      data: props.values,
      type: 'bar',
      barMaxWidth: 16,
      itemStyle: { color: props.color || '#ba1a1a', borderRadius: [0, 5, 5, 0] },
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
