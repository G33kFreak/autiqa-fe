/** Demo KPI for hero chart: PL locale always PLN. */
export function useLandingHeroKpi() {
  const { t, locale } = useI18n();

  return computed(() => {
    if (locale.value === 'pl') {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        currencyDisplay: 'code',
        maximumFractionDigits: 0,
      }).format(42500);
    }
    return t('landing.visual.chartKpi');
  });
}
