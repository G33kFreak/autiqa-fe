import { defineStore } from 'pinia';
import type { AlertsOverviewResponseDto } from '#shared/dto/alerts-overview-response.dto';
import { getAlertsOverview } from '../api/alerts';

export const useAlertsStore = defineStore('alerts', () => {
  const { authenticatedApi } = useApi();

  const overview = ref<AlertsOverviewResponseDto | null>(null);
  const loading = ref(false);
  const error = ref<unknown | null>(null);

  const resolved = computed(() => overview.value !== null);

  function reset() {
    overview.value = null;
    loading.value = false;
    error.value = null;
  }

  async function fetchOverview(): Promise<AlertsOverviewResponseDto> {
    loading.value = true;
    error.value = null;
    try {
      const response = await getAlertsOverview(authenticatedApi);
      overview.value = response;
      return response;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    overview,
    loading,
    error,
    resolved,
    reset,
    fetchOverview,
  };
});
