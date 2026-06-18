<script setup lang="ts">
const rows = [
  { plate: 'WI 12345', model: 'Toyota Camry', driver: 'Adam K.', status: 'on-trip' as const },
  { plate: 'KR 98765', model: 'Honda Accord', driver: 'Marek W.', status: 'available' as const },
  { plate: 'GD 55100', model: 'BMW 520d', driver: null, status: 'expiring' as const },
  { plate: 'PO 43210', model: 'Skoda Octavia', driver: 'Julia S.', status: 'available' as const },
]
</script>

<template>
  <div class="feature-panel">
    <table class="fleet-table">
      <thead>
        <tr>
          <th>{{ $t('featureFleet.colVehicle') }}</th>
          <th>{{ $t('featureFleet.colDriver') }}</th>
          <th>{{ $t('featureFleet.colStatus') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.plate">
          <td>
            <span class="plate">{{ row.plate }}</span>
            <span class="model">{{ row.model }}</span>
          </td>
          <td class="driver">{{ row.driver ?? $t('featureFleet.noDriver') }}</td>
          <td>
            <span class="status" :class="`status--${row.status}`">
              <template v-if="row.status === 'on-trip'">{{ $t('featureFleet.statusOnTrip') }}</template>
              <template v-else-if="row.status === 'available'">{{ $t('featureFleet.statusAvailable') }}</template>
              <template v-else>{{ $t('featureFleet.statusExpiring') }}</template>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.fleet-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.fleet-table thead th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-muted);
  background: var(--color-surface-mid);
  border-bottom: 1px solid var(--color-outline);
}

.fleet-table thead th:first-child { padding-left: var(--space-5); }
.fleet-table thead th:last-child  { padding-right: var(--space-5); }

.fleet-table tbody tr {
  border-bottom: 1px solid var(--color-outline);
  transition: background-color var(--duration-fast) var(--ease-out);
}

.fleet-table tbody tr:last-child {
  border-bottom: none;
}

.fleet-table tbody tr:hover {
  background: var(--color-surface);
}

.fleet-table tbody td {
  padding: var(--space-3) var(--space-4);
  vertical-align: middle;
}

.fleet-table tbody td:first-child { padding-left: var(--space-5); }
.fleet-table tbody td:last-child  { padding-right: var(--space-5); }

.plate {
  display: block;
  font-weight: 600;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

.model {
  display: block;
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: 1px;
}

.driver {
  color: var(--color-muted);
}

.status {
  display: inline-flex;
  align-items: center;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.2em 0.6em;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.status--on-trip {
  color: var(--color-comply);
  background: var(--color-comply-bg);
}

.status--available {
  color: var(--color-muted);
  background: var(--color-surface-mid);
}

.status--expiring {
  color: var(--color-risk);
  background: var(--color-risk-bg);
}
</style>
