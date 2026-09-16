import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';

/**
 * Generic paginated-list data hook. `fetcher(params)` must return an axios
 * response shaped like the backend's ApiResponse: { data: { data, meta } }.
 * `filters` is any object of additional query params (search, status, etc.)
 * — changing it resets back to page 1 and refetches.
 */
export function usePaginatedList(fetcher, filters = {}, deps = []) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const filtersKey = JSON.stringify(filters);

  const refresh = useCallback(() => setRefreshIndex((i) => i + 1), []);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, ...deps]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetcher({ page, limit: 10, ...filters })
      .then((response) => {
        if (cancelled) return;
        setItems(response.data?.data || []);
        setMeta(response.data?.meta || null);
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filtersKey, refreshIndex, ...deps]);

  return { items, meta, page, setPage, isLoading, refresh };
}
