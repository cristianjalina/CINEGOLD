import { useCallback, useEffect, useState } from 'react';

export function useAsyncData(loader, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      setData(result || []);
    } catch (loadError) {
      setData([]);
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
