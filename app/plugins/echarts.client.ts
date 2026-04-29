import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
} from 'echarts/charts';
import {
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  HeatmapChart,
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
]);

export default defineNuxtPlugin(() => {});
