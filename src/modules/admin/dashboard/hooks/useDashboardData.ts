import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createDashboardDataService } from '../services/dashboardDataService';
import type { DashboardData } from '../types';

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

export const useDashboardData = (supabaseClient: SupabaseClient): UseDashboardDataResult => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const service = useMemo(() => createDashboardDataService(supabaseClient), [supabaseClient]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const dashboardData = await service.fetchDashboardData();
      setData(dashboardData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al cargar el dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};
