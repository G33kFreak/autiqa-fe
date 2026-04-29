<script setup lang="ts">
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  names: string[];
  values: number[];
}>();

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 130, right: 16, top: 14, bottom: 16 },
  xAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: 'rgba(118, 119, 125, 0.12)' } } },
  yAxis: {
    type: 'category',
    data: props.names,
    axisLabel: { color: '#374151', fontSize: 11, overflow: 'truncate', width: 118 },
    axisLine: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: props.values,
      barMaxWidth: 16,
      itemStyle: { borderRadius: [0, 5, 5, 0], color: '#0266ff' },
      animationDuration: 460,
    },
  ],
}));
</script>

<template>
  <VChart class="finance-chart" autoresize :option="option" />
</template>

<style scoped>
.finance-chart {
  height: 17rem;
}
</style>
