import { useState, useCallback } from 'react';

interface UseRefreshControlProps {
  onRefresh: () => Promise<void>;
  initialRefreshing?: boolean;
}

export const useRefreshControl = ({ onRefresh, initialRefreshing = false }: UseRefreshControlProps) => {
  const [refreshing, setRefreshing] = useState(initialRefreshing);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
    setRefreshing,
  };
};