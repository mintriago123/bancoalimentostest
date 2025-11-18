/**
 * @fileoverview Hook para obtener información de stock disponible en tiempo real
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createInventoryStockService, type StockSummary } from '../services/inventoryStockService';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface UseInventoryStockResult {
  stockInfo: StockSummary | null;
  loadingState: LoadingState;
  errorMessage?: string;
  checkStock: (nombreProducto: string) => Promise<void>;
  clearStock: () => void;
  isStockSufficient: (cantidadSolicitada: number) => boolean;
  getStockMessage: (cantidadSolicitada?: number) => string;
}

export const useInventoryStock = (supabaseClient: SupabaseClient): UseInventoryStockResult => {
  const [stockInfo, setStockInfo] = useState<StockSummary | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const service = useMemo(
    () => createInventoryStockService(supabaseClient),
    [supabaseClient]
  );

  const checkStock = useCallback(async (nombreProducto: string) => {
    if (!nombreProducto.trim()) {
      setStockInfo(null);
      setLoadingState('idle');
      setErrorMessage(undefined);
      return;
    }

    setLoadingState('loading');
    setErrorMessage(undefined);

    const result = await service.getStockByProductName(nombreProducto);

    if (result.success && result.data) {
      setStockInfo(result.data);
      setLoadingState('success');
    } else {
      setStockInfo(null);
      setLoadingState('error');
      setErrorMessage(result.error || 'Error consultando inventario');
    }
  }, [service]);

  const clearStock = useCallback(() => {
    setStockInfo(null);
    setLoadingState('idle');
    setErrorMessage(undefined);
  }, []);

  const isStockSufficient = useCallback((cantidadSolicitada: number): boolean => {
    if (!stockInfo || cantidadSolicitada <= 0) return false;
    return stockInfo.total_disponible >= cantidadSolicitada;
  }, [stockInfo]);

  const getStockMessage = useCallback((cantidadSolicitada?: number): string => {
    if (!stockInfo) return '';

    if (!stockInfo.producto_encontrado) {
      return 'Producto no disponible en inventario';
    }

    if (stockInfo.total_disponible === 0) {
      return 'Sin stock disponible';
    }

    // Usar la cantidad formateada si está disponible
    const cantidadTexto = stockInfo.total_formateado 
      ? `${stockInfo.total_formateado.cantidad} ${stockInfo.total_formateado.simbolo}`
      : `${stockInfo.total_disponible} ${stockInfo.unidad_simbolo || 'unidades'}`;
    
    const baseMessage = `${cantidadTexto} disponibles`;
    
    if (cantidadSolicitada && cantidadSolicitada > 0) {
      if (stockInfo.total_disponible >= cantidadSolicitada) {
        return `✓ ${baseMessage} (suficiente)`;
      } else {
        const faltante = cantidadSolicitada - stockInfo.total_disponible;
        const unidad = stockInfo.unidad_simbolo || stockInfo.unidad_nombre || 'unidades';
        return `⚠️ ${baseMessage} (faltan ${faltante} ${unidad})`;
      }
    }

    return baseMessage;
  }, [stockInfo]);

  // Efecto para limpiar cuando cambia el cliente de Supabase
  useEffect(() => {
    return () => {
      setStockInfo(null);
      setLoadingState('idle');
      setErrorMessage(undefined);
    };
  }, [supabaseClient]);

  return {
    stockInfo,
    loadingState,
    errorMessage,
    checkStock,
    clearStock,
    isStockSufficient,
    getStockMessage
  };
};