/**
 * @fileoverview Servicio para consultar stock disponible en inventario
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CantidadFormateada, ConversionData } from '@/lib/unidadConversion';
import { convertirCantidad } from '@/lib/unidadConversion';

export interface StockInfo {
  id_inventario: string;
  cantidad_disponible: number;
  deposito: string;
  fecha_actualizacion: string | null;
  unidad_nombre?: string;
  unidad_simbolo?: string;
  cantidad_formateada?: CantidadFormateada;
}

export interface StockSummary {
  total_disponible: number;
  depositos: StockInfo[];
  producto_encontrado: boolean;
  unidad_nombre?: string;
  unidad_simbolo?: string;
  total_formateado?: CantidadFormateada;
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
   * Obtiene las conversiones disponibles de la base de datos
   */
  const obtenerConversiones = async (): Promise<ConversionData[]> => {
    try {
      const { data, error } = await supabaseClient
        .from('conversiones')
        .select(`
          factor_conversion,
          unidad_origen:unidades!conversiones_unidad_origen_id_fkey(nombre, simbolo),
          unidad_destino:unidades!conversiones_unidad_destino_id_fkey(nombre, simbolo)
        `);

      if (error || !data) {
        logger.error('Error obteniendo conversiones', error);
        return [];
      }

      return data.map(row => ({
        unidad_origen: (row.unidad_origen as any)?.nombre || '',
        simbolo_origen: (row.unidad_origen as any)?.simbolo || '',
        unidad_destino: (row.unidad_destino as any)?.nombre || '',
        simbolo_destino: (row.unidad_destino as any)?.simbolo || '',
        factor_conversion: Number(row.factor_conversion) || 0
      }));
    } catch (err) {
      logger.error('Excepción obteniendo conversiones', err);
      return [];
    }
  };

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
      
      // Obtener conversiones disponibles
      const conversiones = await obtenerConversiones();
      
      const { data, error } = await supabaseClient
        .from('inventario')
        .select(`
          id_inventario,
          cantidad_disponible,
          fecha_actualizacion,
          productos_donados!inner(
            nombre_producto,
            unidades!inner(
              id,
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
      const stockInfoRaw: StockInfo[] = data.map(row => {
        const unidad = (row.productos_donados as any)?.unidades;
        const cantidad = row.cantidad_disponible ?? 0;
        
        // Convertir cantidad a unidad más legible
        const cantidadFormateada = convertirCantidad(
          cantidad,
          unidad?.simbolo || '',
          unidad?.nombre || '',
          conversiones
        );

        return {
          id_inventario: row.id_inventario,
          cantidad_disponible: cantidad,
          deposito: (row.depositos as any)?.nombre ?? 'Sin depósito',
          fecha_actualizacion: row.fecha_actualizacion,
          unidad_nombre: unidad?.nombre,
          unidad_simbolo: unidad?.simbolo,
          cantidad_formateada: cantidadFormateada
        };
      });

      // Agrupar por depósito para evitar duplicados
      const depositosAgrupados = new Map<string, StockInfo>();
      
      for (const item of stockInfoRaw) {
        const depositoKey = item.deposito;
        const existing = depositosAgrupados.get(depositoKey);
        
        if (existing) {
          // Si ya existe una entrada para este depósito, sumar las cantidades
          const nuevaCantidad = existing.cantidad_disponible + item.cantidad_disponible;
          
          // Reconvertir con la nueva cantidad sumada
          const cantidadFormateada = convertirCantidad(
            nuevaCantidad,
            item.unidad_simbolo || '',
            item.unidad_nombre || '',
            conversiones
          );
          
          existing.cantidad_disponible = nuevaCantidad;
          existing.cantidad_formateada = cantidadFormateada;
          
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

      // Convertir el total a unidad más legible
      const totalFormateado = convertirCantidad(
        totalDisponible,
        primeraUnidad?.unidad_simbolo || '',
        primeraUnidad?.unidad_nombre || '',
        conversiones
      );

      return {
        success: true,
        data: {
          total_disponible: totalDisponible,
          depositos: stockInfo,
          producto_encontrado: true,
          unidad_nombre: primeraUnidad?.unidad_nombre,
          unidad_simbolo: primeraUnidad?.unidad_simbolo,
          total_formateado: totalFormateado
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

  /**
   * Verifica si hay stock suficiente considerando la conversión de unidades
   * @param nombreProducto - Nombre del producto a verificar
   * @param cantidadSolicitada - Cantidad solicitada por el usuario
   * @param simboloUnidadSolicitada - Símbolo de la unidad solicitada (ej: "lb", "kg")
   * @returns Resultado con información de suficiencia y conversiones aplicadas
   */
  const checkStockSufficiencyWithConversion = async (
    nombreProducto: string,
    cantidadSolicitada: number,
    simboloUnidadSolicitada: string
  ): Promise<ServiceResult<{
    sufficient: boolean;
    available: number;
    availableSymbol: string;
    requested: number;
    requestedSymbol: string;
    requestedInBaseUnit: number | null;
    missing: number;
  }>> => {
    const stockResult = await getStockByProductName(nombreProducto);

    if (!stockResult.success || !stockResult.data) {
      return {
        success: false,
        error: stockResult.error || 'Error verificando stock'
      };
    }

    const stockData = stockResult.data;
    const available = stockData.total_disponible;
    const stockSymbol = stockData.unidad_simbolo || '';

    // Si las unidades son iguales, comparación directa
    if (simboloUnidadSolicitada === stockSymbol) {
      const sufficient = available >= cantidadSolicitada;
      const missing = sufficient ? 0 : cantidadSolicitada - available;

      return {
        success: true,
        data: {
          sufficient,
          available,
          availableSymbol: stockSymbol,
          requested: cantidadSolicitada,
          requestedSymbol: simboloUnidadSolicitada,
          requestedInBaseUnit: cantidadSolicitada,
          missing
        }
      };
    }

    // Necesitamos convertir - obtener conversiones
    const conversiones = await obtenerConversiones();
    
    // Importar la función de conversión
    const { convertirEntreUnidades } = await import('@/lib/unidadConversion');
    
    // Convertir la cantidad solicitada a la unidad base del inventario
    const cantidadConvertida = convertirEntreUnidades(
      cantidadSolicitada,
      simboloUnidadSolicitada,
      stockSymbol,
      conversiones
    );

    if (cantidadConvertida === null) {
      // No se pudo convertir - no hay conversión disponible
      logger.error(`No se encontró conversión de ${simboloUnidadSolicitada} a ${stockSymbol}`);
      return {
        success: false,
        error: `No se puede convertir de ${simboloUnidadSolicitada} a ${stockSymbol}`
      };
    }

    const sufficient = available >= cantidadConvertida;
    const missing = sufficient ? 0 : cantidadConvertida - available;

    return {
      success: true,
      data: {
        sufficient,
        available,
        availableSymbol: stockSymbol,
        requested: cantidadSolicitada,
        requestedSymbol: simboloUnidadSolicitada,
        requestedInBaseUnit: cantidadConvertida,
        missing
      }
    };
  };

  return {
    getStockByProductName,
    checkStockSufficiency,
    checkStockSufficiencyWithConversion
  };
};