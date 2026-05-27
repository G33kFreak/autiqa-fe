const FLEET_MIN = 3;
const FLEET_MAX = 41;
const FREE_INCLUDED = 3;
const PRICE_PER_VEHICLE_PLN = 12;
const ENTERPRISE_THRESHOLD = 40;
export const LANDING_SALES_EMAIL = 'sales@autiqa.pl';

export function useFleetPricing(reduceMotion: Ref<boolean>) {
  const { t, locale } = useI18n();
  const fleetCount = ref(FLEET_MIN);
  const calcTransitioning = ref(false);
  let calcBlurTimer: ReturnType<typeof setTimeout> | undefined;

  const isEnterprise = computed(() => fleetCount.value > ENTERPRISE_THRESHOLD);
  const isFreeTier = computed(() => fleetCount.value <= FREE_INCLUDED);
  const billableVehicles = computed(() =>
    isFreeTier.value || isEnterprise.value ? 0 : fleetCount.value - FREE_INCLUDED,
  );
  const monthlyPln = computed(() => billableVehicles.value * PRICE_PER_VEHICLE_PLN);

  const plnFormatter = computed(
    () =>
      new Intl.NumberFormat(locale.value === 'pl' ? 'pl-PL' : 'en-GB', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0,
      }),
  );

  const monthlyFormatted = computed(() => plnFormatter.value.format(monthlyPln.value));

  const sliderFillPct = computed(() => {
    const span = FLEET_MAX - FLEET_MIN;
    if (span <= 0) return 0;
    return ((fleetCount.value - FLEET_MIN) / span) * 100;
  });

  const salesMailto = computed(() => {
    const subject = encodeURIComponent(t('landing.calculator.contactSubject'));
    return `mailto:${LANDING_SALES_EMAIL}?subject=${subject}`;
  });

  watch(fleetCount, () => {
    if (reduceMotion.value) return;
    calcTransitioning.value = true;
    if (calcBlurTimer) clearTimeout(calcBlurTimer);
    calcBlurTimer = setTimeout(() => {
      calcTransitioning.value = false;
    }, 200);
  });

  return {
    FLEET_MIN,
    FLEET_MAX,
    PRICE_PER_VEHICLE_PLN,
    fleetCount,
    calcTransitioning,
    isEnterprise,
    isFreeTier,
    billableVehicles,
    monthlyFormatted,
    sliderFillPct,
    salesMailto,
  };
}
