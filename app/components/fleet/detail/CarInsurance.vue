<script setup lang="ts">
import type { CarInsuranceDto } from '#shared/dto/car-insurance.dto';
import { complianceStatus, type ComplianceStatus } from '~/utils/compliance';
import { formatMoney, formatDate } from '~/utils/format';

const props = defineProps<{
  policies: CarInsuranceDto[];
  currency: string;
  isPending: (id: string) => boolean;
}>();

const emit = defineEmits<{
  add: [];
  'toggle-installment': [payload: { policyId: string; installmentId: string; paid: boolean }];
  'delete-policy': [policyId: string];
}>();

const { t, locale } = useI18n();

const sorted = computed(() =>
  [...props.policies].sort(
    (a, b) => new Date(b.coverageEnd).getTime() - new Date(a.coverageEnd).getTime(),
  ),
);

const money = (value: number | string, currency: string) =>
  formatMoney(value, currency, locale.value);

function statusLabel(status: ComplianceStatus): string {
  const { tone, daysLeft } = status;
  if (tone === 'missing' || daysLeft === null) return t('app.fleet.compliance.notSet');
  if (tone === 'overdue') return t('app.car.insurance.expired');
  if (daysLeft === 0) return t('app.fleet.compliance.today');
  return t('app.car.insurance.activeFor', { n: daysLeft });
}

function paidCount(policy: CarInsuranceDto): number {
  return policy.installments.filter((i) => i.paidAt).length;
}

function paidSum(policy: CarInsuranceDto): number {
  return policy.installments
    .filter((i) => i.paidAt)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
}
</script>

<template>
  <section class="ins" aria-labelledby="ins-title">
    <div class="ui-section-head">
      <div>
        <h2 id="ins-title" class="ui-section-title">{{ t('app.car.insurance.title') }}</h2>
        <p class="ui-section-sub">{{ t('app.car.insurance.sectionSub') }}</p>
      </div>
      <button type="button" class="ui-btn ui-btn--primary ui-btn--sm" @click="emit('add')">
        <AppIcon name="plus" :size="18" />
        <span>{{ t('app.car.insurance.add') }}</span>
      </button>
    </div>

    <div v-if="policies.length === 0" class="ui-empty">
      <span class="ui-empty__icon" aria-hidden="true">
        <AppIcon name="shield" :size="24" />
      </span>
      <h3 class="ui-empty__title">{{ t('app.car.insurance.emptyTitle') }}</h3>
      <p class="ui-empty__body">{{ t('app.car.insurance.emptyBody') }}</p>
      <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" @click="emit('add')">
        <AppIcon name="plus" :size="16" />
        <span>{{ t('app.car.insurance.add') }}</span>
      </button>
    </div>

    <div v-else class="ins__policies">
      <article
        v-for="(policy, idx) in sorted"
        :key="policy.id"
        class="ins__policy"
        :class="{ 'ins__policy--active': idx === 0 }"
      >
        <header class="ins__policy-head">
          <div class="ins__policy-id">
            <span class="ins__provider">{{ policy.provider }}</span>
            <span v-if="policy.policyNumber" class="ins__number">{{ policy.policyNumber }}</span>
          </div>
          <div class="ins__policy-head-right">
            <span v-if="idx === 0" class="ui-chip" data-tone="primary">
              {{ t('app.car.insurance.activePolicy') }}
            </span>
            <span class="ui-chip" :data-tone="complianceStatus(policy.coverageEnd).tone">
              {{ statusLabel(complianceStatus(policy.coverageEnd)) }}
            </span>
            <button
              type="button"
              class="ui-iconbtn ui-iconbtn--danger"
              :aria-label="t('app.car.insurance.deletePolicy')"
              :disabled="isPending(policy.id)"
              @click="emit('delete-policy', policy.id)"
            >
              <span v-if="isPending(policy.id)" class="ui-spinner ui-spinner--ink" aria-hidden="true" />
              <AppIcon v-else name="trash" :size="16" />
            </button>
          </div>
        </header>

        <dl class="ins__facts">
          <div class="ins__fact">
            <dt>{{ t('app.car.insurance.coverage') }}</dt>
            <dd>{{ formatDate(policy.coverageStart, locale) }} – {{ formatDate(policy.coverageEnd, locale) }}</dd>
          </div>
          <div class="ins__fact">
            <dt>{{ t('app.car.insurance.premium') }}</dt>
            <dd>{{ money(policy.premium, policy.currency) }}</dd>
          </div>
          <div class="ins__fact">
            <dt>{{ t('app.car.insurance.paid') }}</dt>
            <dd>
              {{ money(paidSum(policy), policy.currency) }}
              <span class="ins__fact-sub">
                {{ t('app.car.insurance.ofInstallments', { paid: paidCount(policy), total: policy.installments.length }) }}
              </span>
            </dd>
          </div>
        </dl>

        <div v-if="policy.installments.length > 1" class="ins__schedule">
          <h4 class="ins__schedule-title">{{ t('app.car.insurance.schedule') }}</h4>
          <ul class="ins__installments">
            <li
              v-for="inst in policy.installments"
              :key="inst.id"
              class="ins__installment"
              :class="{ 'ins__installment--paid': inst.paidAt }"
            >
              <button
                type="button"
                class="ins__check"
                :class="{ 'ins__check--on': inst.paidAt }"
                :aria-pressed="!!inst.paidAt"
                :aria-label="inst.paidAt ? t('app.car.insurance.markUnpaid') : t('app.car.insurance.markPaid')"
                :disabled="isPending(inst.id)"
                @click="emit('toggle-installment', { policyId: policy.id, installmentId: inst.id, paid: !inst.paidAt })"
              >
                <span v-if="isPending(inst.id)" class="ui-spinner ui-spinner--ink" aria-hidden="true" />
                <AppIcon v-else-if="inst.paidAt" name="tick" :size="15" />
              </button>
              <span class="ins__installment-date">{{ formatDate(inst.dueDate, locale) }}</span>
              <span class="ins__installment-amount">{{ money(inst.amount, policy.currency) }}</span>
              <span class="ins__installment-status">
                {{ inst.paidAt ? t('app.car.insurance.statusPaid') : t('app.car.insurance.statusDue') }}
              </span>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.ins__policies {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ins__policy {
  padding: var(--space-5);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
}

.ins__policy--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.ins__policy-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.ins__policy-id {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ins__provider {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-ink);
}

.ins__number {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

.ins__policy-head-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.ins__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  margin: 0 0 var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.ins__fact dt {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 0.2rem;
}

.ins__fact dd {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.ins__fact-sub {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-muted);
}

.ins__schedule-title {
  margin: 0 0 var(--space-3);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.ins__installments {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ins__installment {
  display: grid;
  grid-template-columns: 2rem 1fr auto auto;
  align-items: center;
  gap: var(--space-3);
  padding: 0.5rem 0.4rem;
  border-radius: var(--radius-md);
}

.ins__installment:hover {
  background: var(--color-surface);
}

.ins__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1.5px solid var(--color-outline);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-on-primary);
  transition: background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.ins__check--on {
  background: var(--color-comply);
  border-color: var(--color-comply);
}

.ins__check:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.ins__check:disabled {
  cursor: not-allowed;
}

.ins__installment-date {
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.ins__installment-amount {
  font-size: 0.875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  white-space: nowrap;
}

.ins__installment-status {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-warn-text);
  white-space: nowrap;
}

.ins__installment--paid .ins__installment-status {
  color: var(--color-comply);
}

.ins__installment--paid .ins__installment-date,
.ins__installment--paid .ins__installment-amount {
  color: var(--color-muted);
}

@media (max-width: 560px) {
  .ins__facts {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  .ins__installment {
    grid-template-columns: 1.75rem 1fr auto;
  }
  .ins__installment-status {
    display: none;
  }
}
</style>
