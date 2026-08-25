import { useCallback, useEffect, useState } from "react";

/**
 * Small fetch helper for pages: exposes loading / error / retry.
 * `fetcher` must be a stable callback returning a promise (e.g. () => api.get(...)).
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refetch = useCallback((applyData) => {
    if (typeof applyData === "function") setData(applyData);
    setTick((t) => t + 1);
  }, []);

  return { data, loading, error, refetch };
}
