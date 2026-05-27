/** Scroll reveal + hero entrance for the marketing landing page. */
export function useLandingMotion(rootRef: Ref<HTMLElement | null>) {
  const reduceMotion = ref(true);

  onMounted(() => {
    reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = rootRef.value;
    if (!root) return;

    root.setAttribute('data-ready', '');

    const revealEls = root.querySelectorAll<HTMLElement>('[data-reveal]');
    if (reduceMotion.value) {
      revealEls.forEach((el) => el.setAttribute('data-inview', ''));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-inview', '');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '-72px 0px', threshold: 0.1 },
    );
    revealEls.forEach((el) => observer.observe(el));
  });

  return { reduceMotion };
}
