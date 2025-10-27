/**
 * @fileoverview Hook específico para gestión de datos de inventario del operador.
 * Incluye funcionalidades optimizadas para las tareas específicas del operador.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Deposito,
  OperadorInventarioFilters,
  InventarioItem,
  OperadorInventarioStats,
  AlertaInventario,
  LoadingState
} from '../types';
import { createOperadorInventoryDataService } from '../services/inventoryDataService';

interface UseOperadorInventoryDataResult {
  inventario: InventarioItem[];
  filteredInventario: InventarioItem[];
  depositos: Deposito[];
  alertas: AlertaInventario[];
  filters: OperadorInventarioFilters;
  loadingState: LoadingState;
  errorMessage?: string;
  stats: OperadorInventarioStats;
  hasActiveFilters: boolean;
  refetch: () => Promise<void>;
  refetchAlertas: () => Promise<void>;
  setSearch: (value: string) => void;
  setDeposito: (value: string) => void;
  setStockLevel: (value: OperadorInventarioFilters['stockLevel']) => void;
  setAlertasOnly: (value: boolean) => void;
  setProximosVencer: (value: boolean) => void;
  resetFilters: () => void;
}

const INITIAL_FILTERS: OperadorInventarioFilters = {
  search: '',
  depositoId: 'todos',
  stockLevel: 'todos',
  alertasOnly: false,
  proximosVencer: false
};

const SYSTEM_MESSAGES = {
  loadError: 'Error al cargar los datos del inventario',
  noResults: 'No se encontraron productos en el inventario',
  alertasError: 'Error al cargar las alertas del inventario'
} as const;

const applyFilters = (items: InventarioItem[], filters: OperadorInventarioFilters) => {
  const term = filters.search.trim().toLowerCase();

  return items.filter(item => {
    // Filtro de búsqueda
    if (term) {
      const matchesSearch =
        item.producto.nombre_producto?.toLowerCase().includes(term) ||
        item.producto.descripcion?.toLowerCase().includes(term) ||
        item.deposito.nombre?.toLowerCase().includes(term);

      if (!matchesSearch) return false;
    }

    // Filtro por depósito
    if (filters.depositoId !== 'todos' && item.id_deposito !== filters.depositoId) {
      return false;
    }

    // Filtro por nivel de stock
    if (filters.stockLevel !== 'todos') {
      const level = item.stock_status;
      if (level !== filters.stockLevel) {
        return false;
      }
    }

    // Filtro solo alertas (productos que necesitan atención)
    if (filters.alertasOnly && !item.necesita_atencion) {
      return false;
    }

    // Filtro productos próximos a vencer
    if (filters.proximosVencer) {
      const estadoCaducidad = item.producto.estado_caducidad;
      if (estadoCaducidad !== 'proximo' && estadoCaducidad !== 'vencido') {
        return false;
      }
    }

    return true;
  });
};

const cloneInitialFilters = (): OperadorInventarioFilters => ({
  search: INITIAL_FILTERS.search,
  depositoId: INITIAL_FILTERS.depositoId,
  stockLevel: INITIAL_FILTERS.stockLevel,
  alertasOnly: INITIAL_FILTERS.alertasOnly,
  proximosVencer: INITIAL_FILTERS.proximosVencer
});

export const useOperadorInventoryData = (supabaseClient: SupabaseClient): UseOperadorInventoryDataResult => {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [alertas, setAlertas] = useState<AlertaInventario[]>([]);
  const [filters, setFilters] = useState<OperadorInventarioFilters>(() => cloneInitialFilters());
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [stats, setStats] = useState<OperadorInventarioStats>({
    totalProductos: 0,
    stockBajo: 0,
    stockNormal: 0,
    stockAlto: 0,
    totalUnidades: 0,
    productosProximosVencer: 0,
    productosVencidos: 0,
    alertasActivas: 0
  });

  const dataService = useMemo(
    () => createOperadorInventoryDataService(supabaseClient),
    [supabaseClient]
  );

  const loadInventario = useCallback(async () => {
    console.log('[OperadorInventoryHook] Iniciando carga de inventario...');
    setLoadingState('loading');
    setErrorMessage(undefined);

    try {
      const result = await dataService.fetchInventario();
      console.log('[OperadorInventoryHook] Resultado de inventario:', result);
      
      if (result.success) {
        setInventario(result.data || []);
        setLoadingState('success');
        console.log('[OperadorInventoryHook] Inventario cargado exitosamente:', result.data?.length);
      } else {
        setInventario([]);
        setLoadingState('error');
        setErrorMessage(result.error ?? SYSTEM_MESSAGES.loadError);
        console.error('[OperadorInventoryHook] Error cargando inventario:', result.error);
      }
    } catch (error) {
      console.error('[OperadorInventoryHook] Excepción cargando inventario:', error);
      setInventario([]);
      setLoadingState('error');
      setErrorMessage('Error inesperado al cargar inventario');
    }
  }, [dataService]);

  const loadDepositos = useCallback(async () => {
    const result = await dataService.fetchDepositos();
    if (result.success && result.data) {
      setDepositos(result.data);
    }
  }, [dataService]);

  const loadStats = useCallback(async () => {
    const result = await dataService.fetchOperadorStats();
    if (result.success && result.data) {
      setStats(result.data);
    }
  }, [dataService]);

  const loadAlertas = useCallback(async () => {
    const result = await dataService.fetchAlertas();
    if (result.success && result.data) {
      setAlertas(result.data);
    }
  }, [dataService]);

  useEffect(() => {
    void loadInventario();
    void loadDepositos();
    void loadStats();
    void loadAlertas();
  }, [loadInventario, loadDepositos, loadStats, loadAlertas]);

  const filteredInventario = useMemo(
    () => applyFilters(inventario, filters),
    [inventario, filters]
  );

  const hasActiveFilters = filters.search.trim() !== '' ||
    filters.depositoId !== 'todos' ||
    filters.stockLevel !== 'todos' ||
    filters.alertasOnly ||
    filters.proximosVencer;

  // Filter setters
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

  const setStockLevel = useCallback((value: OperadorInventarioFilters['stockLevel']) => {
    setFilters(prev => ({
      ...prev,
      stockLevel: value
    }));
  }, []);

  const setAlertasOnly = useCallback((value: boolean) => {
    setFilters(prev => ({
      ...prev,
      alertasOnly: value
    }));
  }, []);

  const setProximosVencer = useCallback((value: boolean) => {
    setFilters(prev => ({
      ...prev,
      proximosVencer: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(cloneInitialFilters());
  }, []);

  const refetch = useCallback(async () => {
    await loadInventario();
    await loadStats();
  }, [loadInventario, loadStats]);

  const refetchAlertas = useCallback(async () => {
    await loadAlertas();
  }, [loadAlertas]);

  return {
    inventario,
    filteredInventario,
    depositos,
    alertas,
    filters,
    loadingState,
    errorMessage,
    stats,
    hasActiveFilters,
    refetch,
    refetchAlertas,
    setSearch,
    setDeposito,
    setStockLevel,
    setAlertasOnly,
    setProximosVencer,
    resetFilters
  };
};