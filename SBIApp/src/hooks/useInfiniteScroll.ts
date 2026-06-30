import { useState, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  pageSize?: number;
  initialPage?: number;
}

export const useInfiniteScroll = <T>(options: UseInfiniteScrollOptions = {}) => {
  const { pageSize = 10, initialPage = 1 } = options;
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async (fetchFn: (page: number, size: number) => Promise<T[]>) => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const newItems = await fetchFn(page, pageSize);
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [page, pageSize, hasMore]);

  const refresh = useCallback(async (fetchFn: (page: number, size: number) => Promise<T[]>) => {
    setIsRefreshing(true);
    loadingRef.current = true;
    
    try {
      const newItems = await fetchFn(1, pageSize);
      setItems(newItems);
      setPage(2);
      setHasMore(newItems.length === pageSize);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      loadingRef.current = false;
      setIsRefreshing(false);
    }
  }, [pageSize]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setIsLoading(false);
    setIsRefreshing(false);
    loadingRef.current = false;
  }, [initialPage]);

  return {
    items,
    setItems,
    hasMore,
    isLoading,
    isRefreshing,
    loadMore,
    refresh,
    reset,
  };
};