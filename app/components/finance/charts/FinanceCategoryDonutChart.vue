<script setup lang="ts">
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  rows: Array<{ name: string; value: number }>;
}>();

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, textStyle: { color: '#6b7280', fontSize: 11 } },
  series: [
    {
      type: 'pie',
      radius: ['52%', '72%'],
      center: ['50%', '45%'],
      itemStyle: { borderRadius: 6 },
      label: { color: '#374151', fontSize: 11 },
      data: props.rows,
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
