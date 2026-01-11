/**
 * @fileoverview Hook para obtener información de stock disponible en tiempo real
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createInventoryStockService, type StockSummary } from '../services/inventoryStockService';
import type { ConversionData } from '@/lib/unidadConversion';
import { convertirEntreUnidades } from '@/lib/unidadConversion';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface UseInventoryStockResult {
  stockInfo: StockSummary | null;
  loadingState: LoadingState;
  errorMessage?: string;
  conversiones: ConversionData[];
  checkStock: (nombreProducto: string) => Promise<void>;
  clearStock: () => void;
  isStockSufficient: (cantidadSolicitada: number, simboloUnidad?: string) => boolean;
  getStockMessage: (cantidadSolicitada?: number, simboloUnidad?: string) => string;
}

export const useInventoryStock = (supabaseClient: SupabaseClient): UseInventoryStockResult => {
  const [stockInfo, setStockInfo] = useState<StockSummary | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [conversiones, setConversiones] = useState<ConversionData[]>([]);

  const service = useMemo(
    () => createInventoryStockService(supabaseClient),
    [supabaseClient]
  );

  // Cargar conversiones al montar
  useEffect(() => {
    const cargarConversiones = async () => {
      try {
        const { data } = await supabaseClient
          .from('conversiones')
          .select(`
            factor_conversion,
            unidad_origen:unidades!conversiones_unidad_origen_id_fkey(nombre, simbolo),
            unidad_destino:unidades!conversiones_unidad_destino_id_fkey(nombre, simbolo)
          `);

        if (data) {
          const conversionesData = data.map(row => ({
            unidad_origen: (row.unidad_origen as any)?.nombre || '',
            simbolo_origen: (row.unidad_origen as any)?.simbolo || '',
            unidad_destino: (row.unidad_destino as any)?.nombre || '',
            simbolo_destino: (row.unidad_destino as any)?.simbolo || '',
            factor_conversion: Number(row.factor_conversion) || 0
          }));
          setConversiones(conversionesData);
        }
      } catch (error) {
        console.error('[useInventoryStock] Error cargando conversiones:', error);
      }
    };

    cargarConversiones();
  }, [supabaseClient]);

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

  const isStockSufficient = useCallback((
    cantidadSolicitada: number, 
    simboloUnidad?: string
  ): boolean => {
    if (!stockInfo || cantidadSolicitada <= 0) return false;
    
    const stockSymbol = stockInfo.unidad_simbolo || '';
    
    // Si no se proporciona unidad o son iguales, comparación directa
    if (!simboloUnidad || simboloUnidad === stockSymbol) {
      return stockInfo.total_disponible >= cantidadSolicitada;
    }
    
    // Convertir la cantidad solicitada a la unidad base del stock
    const cantidadConvertida = convertirEntreUnidades(
      cantidadSolicitada,
      simboloUnidad,
      stockSymbol,
      conversiones
    );
    
    if (cantidadConvertida === null) {
      console.error(`[useInventoryStock] No se pudo convertir de ${simboloUnidad} a ${stockSymbol}`);
      return false;
    }
    
    return stockInfo.total_disponible >= cantidadConvertida;
  }, [stockInfo, conversiones]);

  const getStockMessage = useCallback((cantidadSolicitada?: number, simboloUnidad?: string): string => {
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
    
    if (cantidadSolicitada && cantidadSolicitada > 0 && simboloUnidad) {
      const stockSymbol = stockInfo.unidad_simbolo || '';
      
      // Si son la misma unidad, comparación directa
      if (simboloUnidad === stockSymbol) {
        if (stockInfo.total_disponible >= cantidadSolicitada) {
          return `✓ ${baseMessage} (suficiente)`;
        } else {
          const faltante = cantidadSolicitada - stockInfo.total_disponible;
          return `⚠️ ${baseMessage} (faltan ${faltante.toFixed(2)} ${simboloUnidad})`;
        }
      }
      
      // Necesitamos convertir
      const cantidadConvertida = convertirEntreUnidades(
        cantidadSolicitada,
        simboloUnidad,
        stockSymbol,
        conversiones
      );
      
      if (cantidadConvertida === null) {
        return `${baseMessage} (no se puede convertir de ${simboloUnidad} a ${stockSymbol})`;
      }
      
      if (stockInfo.total_disponible >= cantidadConvertida) {
        return `✓ ${baseMessage} (suficiente para ${cantidadSolicitada} ${simboloUnidad})`;
      } else {
        const faltanteEnBase = cantidadConvertida - stockInfo.total_disponible;
        return `⚠️ ${baseMessage} (faltan ${faltanteEnBase.toFixed(2)} ${stockSymbol} para cubrir ${cantidadSolicitada} ${simboloUnidad})`;
      }
    }

    return baseMessage;
  }, [stockInfo, conversiones]);

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
    conversiones,
    checkStock,
    clearStock,
    isStockSufficient,
    getStockMessage
  };
};