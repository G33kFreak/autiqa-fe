/**
 * Lazily loads a nullable resource once per "session" (until {@link reset}):
 * returns cached data (including `null`) from {@link getViewModel}, otherwise
 * runs `load` and dedupes concurrent calls.
 *
 * Use in Pinia stores (or components) when you want a single public
 * {@link getViewModel} instead of exposing fetch + a hydrated flag.
 */
export function useLazyViewModel<T>(options: {
  load: () => Promise<T | null>;
}) {
  /** `undefined` = never resolved; `null` = resolved, empty; else value. */
  const data = ref<T | null | undefined>();
  const loading = ref(false);
  let inFlight: Promise<T | null> | null = null;

  async function getViewModel(): Promise<T | null> {
    if (data.value !== undefined) {
      return data.value;
    }
    if (inFlight) {
      return inFlight;
    }

    loading.value = true;
    inFlight = options
      .load()
      .then((result) => {
        data.value = result;
        return result;
      })
      .finally(() => {
        loading.value = false;
        inFlight = null;
      });

    return inFlight;
  }

  /** Set state after a mutation (e.g. POST) without going through `load`. */
  function setLoaded(value: T | null) {
    data.value = value;
  }

  function reset() {
    data.value = undefined;
    inFlight = null;
    loading.value = false;
  }

  return {
    data,
    loading,
    getViewModel,
    setLoaded,
    reset,
  };
}
