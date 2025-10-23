/**
 * @fileoverview Hook para gestión de datos y filtros de inventario.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_FILTERS, SYSTEM_MESSAGES } from '../constants';
import type {
  Deposito,
  InventarioFilters,
  InventarioItem,
  InventarioStats,
  LoadingState
} from '../types';
import { createInventoryDataService } from '../services/inventoryDataService';
import { buildStats, determineStockLevel } from '../utils/formatters';

interface UseInventoryDataResult {
  inventario: InventarioItem[];
  filteredInventario: InventarioItem[];
  depositos: Deposito[];
  filters: InventarioFilters;
  loadingState: LoadingState;
  errorMessage?: string;
  stats: InventarioStats;
  hasActiveFilters: boolean;
  refetch: () => Promise<void>;
  setSearch: (value: string) => void;
  setDeposito: (value: string) => void;
  setStockLevel: (value: InventarioFilters['stockLevel']) => void;
  resetFilters: () => void;
  messages: typeof SYSTEM_MESSAGES;
}

const applyFilters = (items: InventarioItem[], filters: InventarioFilters) => {
  const term = filters.search.trim().toLowerCase();

  return items.filter(item => {
    if (term) {
      const matchesSearch =
        item.producto.nombre_producto?.toLowerCase().includes(term) ||
        item.producto.descripcion?.toLowerCase().includes(term) ||
        item.deposito.nombre?.toLowerCase().includes(term);

      if (!matchesSearch) return false;
    }

    if (filters.depositoId !== 'todos' && item.id_deposito !== filters.depositoId) {
      return false;
    }

    if (filters.stockLevel !== 'todos') {
      const level = determineStockLevel(item.cantidad_disponible);
      if (level !== filters.stockLevel) {
        return false;
      }
    }

    return true;
  });
};

const cloneInitialFilters = (): InventarioFilters => ({
  search: INITIAL_FILTERS.search,
  depositoId: INITIAL_FILTERS.depositoId,
  stockLevel: INITIAL_FILTERS.stockLevel
});

export const useInventoryData = (supabaseClient: SupabaseClient): UseInventoryDataResult => {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [filters, setFilters] = useState<InventarioFilters>(() => cloneInitialFilters());
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const dataService = useMemo(
    () => createInventoryDataService(supabaseClient),
    [supabaseClient]
  );

  const loadInventario = useCallback(async () => {
    setLoadingState('loading');
    setErrorMessage(undefined);

    const result = await dataService.fetchInventario();
    if (result.success && result.data) {
      setInventario(result.data);
      setLoadingState('success');
    } else {
      setInventario([]);
      setLoadingState('error');
      setErrorMessage(result.error ?? SYSTEM_MESSAGES.loadError);
    }
  }, [dataService]);

  const loadDepositos = useCallback(async () => {
    const result = await dataService.fetchDepositos();
    if (result.success && result.data) {
      setDepositos(result.data);
    }
  }, [dataService]);

  useEffect(() => {
    void loadInventario();
    void loadDepositos();
  }, [loadInventario, loadDepositos]);

  const filteredInventario = useMemo(
    () => applyFilters(inventario, filters),
    [inventario, filters]
  );

  const stats = useMemo(
    () => buildStats(inventario),
    [inventario]
  );

  const hasActiveFilters = filters.search.trim() !== '' ||
    filters.depositoId !== 'todos' ||
    filters.stockLevel !== 'todos';

  const setSearch = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  }, []);

  const setDeposito = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      depositoId: value
    }));
  }, []);

  const setStockLevel = useCallback((value: InventarioFilters['stockLevel']) => {
    setFilters(prev => ({
      ...prev,
      stockLevel: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(cloneInitialFilters());
  }, []);

  const refetch = useCallback(async () => {
    await loadInventario();
  }, [loadInventario]);

  return {
    inventario,
    filteredInventario,
    depositos,
    filters,
    loadingState,
    errorMessage,
    stats,
    hasActiveFilters,
    refetch,
    setSearch,
    setDeposito,
    setStockLevel,
    resetFilters,
    messages: SYSTEM_MESSAGES
  };
};
