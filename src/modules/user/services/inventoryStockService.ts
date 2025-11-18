/**
 * @fileoverview Servicio para consultar stock disponible en inventario
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface StockInfo {
  id_inventario: string;
  cantidad_disponible: number;
  deposito: string;
  fecha_actualizacion: string | null;
  unidad_nombre?: string;
  unidad_simbolo?: string;
}

export interface StockSummary {
  total_disponible: number;
  depositos: StockInfo[];
  producto_encontrado: boolean;
  unidad_nombre?: string;
  unidad_simbolo?: string;
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
      logger.info(`Consultando stock para producto: "${nombreProducto}"`);
      
      const { data, error } = await supabaseClient
        .from('inventario')
        .select(`
          id_inventario,
          cantidad_disponible,
          fecha_actualizacion,
          productos_donados!inner(
            nombre_producto,
            unidades!inner(
              nombre,
              simbolo
            )
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
        logger.error('Detalles del error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return {
          success: false,
          error: 'No fue posible consultar el inventario'
        };
      }

      logger.info(`Resultados de consulta de stock:`, {
        cantidadResultados: data?.length ?? 0,
        datos: data
      });

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
      const stockInfoRaw: StockInfo[] = data.map(row => ({
        id_inventario: row.id_inventario,
        cantidad_disponible: row.cantidad_disponible ?? 0,
        deposito: (row.depositos as any)?.nombre ?? 'Sin depósito',
        fecha_actualizacion: row.fecha_actualizacion,
        unidad_nombre: (row.productos_donados as any)?.unidades?.nombre,
        unidad_simbolo: (row.productos_donados as any)?.unidades?.simbolo
      }));

      // Agrupar por depósito para evitar duplicados
      const depositosAgrupados = new Map<string, StockInfo>();
      
      for (const item of stockInfoRaw) {
        const depositoKey = item.deposito;
        const existing = depositosAgrupados.get(depositoKey);
        
        if (existing) {
          // Si ya existe una entrada para este depósito, sumar las cantidades
          existing.cantidad_disponible += item.cantidad_disponible;
          // Mantener la fecha más reciente
          if (item.fecha_actualizacion && (!existing.fecha_actualizacion || 
              item.fecha_actualizacion > existing.fecha_actualizacion)) {
            existing.fecha_actualizacion = item.fecha_actualizacion;
          }
        } else {
          // Primera entrada para este depósito
          depositosAgrupados.set(depositoKey, { ...item });
        }
      }

      const stockInfo = Array.from(depositosAgrupados.values());
      const totalDisponible = stockInfo.reduce((sum, item) => sum + item.cantidad_disponible, 0);
      
      // Obtener la unidad del primer registro (todos deberían tener la misma)
      const primeraUnidad = stockInfo[0];

      return {
        success: true,
        data: {
          total_disponible: totalDisponible,
          depositos: stockInfo,
          producto_encontrado: true,
          unidad_nombre: primeraUnidad?.unidad_nombre,
          unidad_simbolo: primeraUnidad?.unidad_simbolo
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