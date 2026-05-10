import type { ApiClient } from './types';
import type { AlertsOverviewResponseDto } from '~~/shared/dto/alerts-overview-response.dto';

export function getAlertsOverview(client: ApiClient) {
  return client<AlertsOverviewResponseDto>('/alerts/overview', {
    method: 'GET',
  });
}
