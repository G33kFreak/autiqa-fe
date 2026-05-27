/** Structured data + extended meta for the home route. */
export function useLandingSeo() {
  const { t, locale } = useI18n();
  const localePath = useLocalePath();
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteUrl = computed(() => {
    const base = config.public.siteUrl as string | undefined;
    if (base) return base.replace(/\/$/, '');
    if (import.meta.client && typeof window !== 'undefined') return window.location.origin;
    return 'https://autiqa.pl';
  });

  const canonicalUrl = computed(() => `${siteUrl.value}${route.path}`);

  const title = computed(() => t('meta.home.title'));
  const description = computed(() => t('meta.home.description'));

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogLocale: computed(() => (locale.value === 'pl' ? 'pl_PL' : 'en_US')),
    ogUrl: canonicalUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
  });

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: computed(() => [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Autiqa',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description: description.value,
          url: `${siteUrl.value}${localePath('/')}`,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'PLN',
            description: t('landing.hero.proof1'),
          },
        }),
      },
    ]),
  });
}
