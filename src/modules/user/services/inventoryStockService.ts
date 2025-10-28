/**
 * @fileoverview Servicio para consultar stock disponible en inventario
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface StockInfo {
  id_inventario: string;
  cantidad_disponible: number;
  deposito: string;
  fecha_actualizacion: string | null;
}

export interface StockSummary {
  total_disponible: number;
  depositos: StockInfo[];
  producto_encontrado: boolean;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const logger = {
  info: (message: string, details?: unknown) => console.info(`[InventoryStockService] ${message}`, details),
  error: (message: string, error?: unknown) => console.error(`[InventoryStockService] ${message}`, error)
};

export const createInventoryStockService = (supabaseClient: SupabaseClient) => {
  /**
   * Obtiene el stock disponible de un producto por nombre
   */
  const getStockByProductName = async (nombreProducto: string): Promise<ServiceResult<StockSummary>> => {
    if (!nombreProducto.trim()) {
      return {
        success: true,
        data: {
          total_disponible: 0,
          depositos: [],
          producto_encontrado: false
        }
      };
    }

    try {
      const { data, error } = await supabaseClient
        .from('inventario')
        .select(`
          id_inventario,
          cantidad_disponible,
          fecha_actualizacion,
          productos_donados!inner(
            nombre_producto
          ),
          depositos!inner(
            nombre
          )
        `)
        .ilike('productos_donados.nombre_producto', `%${nombreProducto}%`)
        .gt('cantidad_disponible', 0)
        .order('cantidad_disponible', { ascending: false });

      if (error) {
        logger.error('Error consultando stock disponible', error);
        return {
          success: false,
          error: 'No fue posible consultar el inventario'
        };
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          data: {
            total_disponible: 0,
            depositos: [],
            producto_encontrado: false
          }
        };
      }

      // Procesar los datos
      const stockInfo: StockInfo[] = data.map(row => ({
        id_inventario: row.id_inventario,
        cantidad_disponible: row.cantidad_disponible ?? 0,
        deposito: (row.depositos as any)?.nombre ?? 'Sin depósito',
        fecha_actualizacion: row.fecha_actualizacion
      }));

      const totalDisponible = stockInfo.reduce((sum, item) => sum + item.cantidad_disponible, 0);

      return {
        success: true,
        data: {
          total_disponible: totalDisponible,
          depositos: stockInfo,
          producto_encontrado: true
        }
      };

    } catch (err) {
      logger.error('Excepción consultando stock', err);
      return {
        success: false,
        error: 'Error inesperado al consultar inventario'
      };
    }
  };

  /**
   * Verifica si hay stock suficiente para una cantidad solicitada
   */
  const checkStockSufficiency = async (
    nombreProducto: string, 
    cantidadSolicitada: number
  ): Promise<ServiceResult<{ 
    sufficient: boolean; 
    available: number; 
    missing: number;
  }>> => {
    const stockResult = await getStockByProductName(nombreProducto);
    
    if (!stockResult.success || !stockResult.data) {
      return {
        success: false,
        error: stockResult.error || 'Error verificando stock'
      };
    }

    const available = stockResult.data.total_disponible;
    const sufficient = available >= cantidadSolicitada;
    const missing = sufficient ? 0 : cantidadSolicitada - available;

    return {
      success: true,
      data: {
        sufficient,
        available,
        missing
      }
    };
  };

  return {
    getStockByProductName,
    checkStockSufficiency
  };
};