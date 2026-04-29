<script setup lang="ts">
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  labels: string[];
  spendValues: number[];
  revenueValues: number[];
  profitLossValues: number[];
}>();

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    top: 0,
    textStyle: { color: '#6b7280', fontSize: 11 },
  },
  grid: { left: 20, right: 16, top: 42, bottom: 20, containLabel: true },
  xAxis: {
    type: 'category',
    data: props.labels,
    boundaryGap: false,
    axisLabel: { color: '#6b7280', fontSize: 11 },
    axisLine: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#6b7280', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(118, 119, 125, 0.12)' } },
  },
  series: [
    {
      name: 'Expenses',
      data: props.spendValues,
      type: 'bar',
      barMaxWidth: 18,
      barGap: '-100%',
      barCategoryGap: '45%',
      itemStyle: { color: 'rgba(186, 26, 26, 0.85)', borderRadius: [0, 0, 4, 4] },
      animationDuration: 520,
      animationEasing: 'cubicOut',
    },
    {
      name: 'Earnings',
      data: props.revenueValues,
      type: 'bar',
      barMaxWidth: 18,
      barGap: '-100%',
      barCategoryGap: '45%',
      itemStyle: { color: 'rgba(15, 138, 70, 0.78)', borderRadius: [4, 4, 0, 0] },
      animationDuration: 520,
      animationEasing: 'cubicOut',
    },
    {
      name: 'Profit / Loss',
      data: props.profitLossValues,
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2.5, color: '#0050cc' },
      itemStyle: { color: '#0050cc' },
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
