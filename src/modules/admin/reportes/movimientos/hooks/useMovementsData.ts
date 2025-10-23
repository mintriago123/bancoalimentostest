/**
 * @fileoverview Hook personalizado para gestión de datos de movimientos
 * Encapsula toda la lógica de estado, carga de datos y filtrado
 * para el reporte de movimientos de inventario.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MovementItem, ReportFilters, MovementSummary, LoadingState } from '../types';
import { INITIAL_FILTERS } from '../constants';
import { applyMovementFilters, buildFilterDescriptions, buildMovementSummary } from '../utils/formatters';
import { createMovementDataService } from '../services/movementDataService';

/**
 * Resultado del hook useMovementsData
 */
interface UseMovementsDataResult {
  /** Datos raw sin filtrar */
  rawData: MovementItem[];
  
  /** Datos filtrados según los filtros activos */
  filteredData: MovementItem[];
  
  /** Resumen estadístico de los datos filtrados */
  summary: MovementSummary;
  
  /** Estado de carga actual */
  loadingState: LoadingState;
  
  /** Mensaje de error si existe */
  errorMessage?: string;
  
  /** Timestamp de última actualización exitosa */
  lastUpdate?: string;
  
  /** Función para recargar los datos */
  refetchData: () => Promise<void>;
  
  /** Indica si hay datos disponibles después del filtrado */
  hasData: boolean;
}

/**
 * Hook personalizado para gestión de datos de movimientos
 * 
 * @param supabaseClient - Cliente de Supabase configurado
 * @param filters - Filtros activos a aplicar
 * @returns Objeto con datos, estado y funciones de control
 * 
 * @example
 * const { filteredData, summary, loadingState, refetchData } = useMovementsData(supabase, filters);
 */
export const useMovementsData = (
  supabaseClient: SupabaseClient,
  filters: ReportFilters
): UseMovementsDataResult => {
  const [rawData, setRawData] = useState<MovementItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [lastUpdate, setLastUpdate] = useState<string | undefined>();

  // Crear servicio de datos usando factory function
  const dataService = useMemo(
    () => createMovementDataService(supabaseClient),
    [supabaseClient]
  );

  // Función para cargar datos
  const loadData = useCallback(async () => {
    setLoadingState('loading');
    setErrorMessage(undefined);

    try {
      const result = await dataService.getAllMovements();
      
      if (result.success && result.data) {
        setRawData(result.data);
        setLastUpdate(new Date().toISOString());
        setLoadingState('success');
      } else {
        setErrorMessage(result.error || 'Error desconocido al cargar datos');
        setLoadingState('error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado';
      setErrorMessage(message);
      setLoadingState('error');
    }
  }, [dataService]);

  // Función pública para refetch
  const refetchData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calcular datos filtrados cuando cambien los filtros o datos raw
  const filteredData = useMemo(
    () => applyMovementFilters(rawData, filters),
    [rawData, filters]
  );

  // Calcular resumen estadístico
  const summary = useMemo(
    () => buildMovementSummary(filteredData),
    [filteredData]
  );

  // Verificar si hay datos después del filtrado
  const hasData = filteredData.length > 0;

  return {
    rawData,
    filteredData,
    summary,
    loadingState,
    errorMessage,
    lastUpdate,
    refetchData,
    hasData
  };
};

/**
 * Resultado del hook useReportFilters
 */
interface UseReportFiltersResult {
  /** Filtros actuales */
  filters: ReportFilters;
  
  /** Función para cambiar un filtro específico */
  setFilter: (key: keyof ReportFilters, value: string) => void;
  
  /** Función para limpiar todos los filtros */
  clearFilters: () => void;
  
  /** Descripciones legibles de filtros activos */
  filterDescriptions: string[];
  
  /** Indica si hay filtros activos */
  hasActiveFilters: boolean;
  
  /** Función para aplicar múltiples filtros a la vez */
  setMultipleFilters: (newFilters: Partial<ReportFilters>) => void;
}

/**
 * Hook personalizado para gestión de filtros de reporte
 * 
 * @param initialFilters - Filtros iniciales (opcional)
 * @returns Objeto con filtros, funciones de control y estado
 * 
 * @example
 * const { filters, setFilter, clearFilters, filterDescriptions } = useReportFilters();
 */
export const useReportFilters = (
  initialFilters: ReportFilters = INITIAL_FILTERS
): UseReportFiltersResult => {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);

  // Función para cambiar un filtro específico
  const setFilter = useCallback((key: keyof ReportFilters, value: string) => {
    setFilters(prevFilters => {
      if (key === 'tipo_movimiento') {
        return {
          ...prevFilters,
          [key]: value ? (value as MovementItem['tipo_movimiento']) : undefined
        };
      }

      return {
        ...prevFilters,
        [key]: value
      };
    });
  }, []);

  // Función para limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({ ...INITIAL_FILTERS });
  }, []);

  // Función para aplicar múltiples filtros
  const setMultipleFilters = useCallback((newFilters: Partial<ReportFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Calcular descripciones de filtros activos
  const filterDescriptions = useMemo(
    () => buildFilterDescriptions(filters),
    [filters]
  );

  // Verificar si hay filtros activos
  const hasActiveFilters = filterDescriptions.length > 0;

  return {
    filters,
    setFilter,
    clearFilters,
    filterDescriptions,
    hasActiveFilters,
    setMultipleFilters
  };
};

/**
 * Resultado del hook useExportReport
 */
interface UseExportReportResult {
  /** Función para exportar el reporte */
  exportReport: () => Promise<void>;
  
  /** Indica si la exportación está en progreso */
  isExporting: boolean;
  
  /** Mensaje de error de exportación si existe */
  exportError?: string;
  
  /** Indica si la exportación está disponible */
  canExport: boolean;
}

/**
 * Hook personalizado para gestión de exportación de reportes
 * 
 * @param data - Datos a exportar
 * @param summary - Resumen estadístico
 * @param filterDescriptions - Descripciones de filtros
 * @param lastUpdate - Timestamp de última actualización
 * @returns Objeto con función de exportación y estado
 * 
 * @example
 * const { exportReport, isExporting, canExport } = useExportReport(data, summary, filters, lastUpdate);
 */
export const useExportReport = (
  data: MovementItem[],
  summary: MovementSummary,
  filterDescriptions: string[],
  lastUpdate?: string
): UseExportReportResult => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | undefined>();

  // Función para exportar
  const exportReport = useCallback(async () => {
    setIsExporting(true);
    setExportError(undefined);

    try {
      // Importación dinámica del servicio de exportación
      const { createExportService } = await import('../services/exportService');
      const exportService = createExportService();
      
      await exportService.exportMovementsReport(
        data,
        summary,
        filterDescriptions,
        lastUpdate
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en la exportación';
      setExportError(message);
    } finally {
      setIsExporting(false);
    }
  }, [data, summary, filterDescriptions, lastUpdate]);

  // Determinar si la exportación está disponible
  const canExport = data.length > 0 && !isExporting;

  return {
    exportReport,
    isExporting,
    exportError,
    canExport
  };
};