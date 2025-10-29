/**
 * @fileoverview Servicio de datos de inventario específico para operadores.
 * Incluye funcionalidades y consultas optimizadas para las tareas del operador.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  InventarioItem,
  Deposito,
  ServiceResult,
  SupabaseInventarioRow,
  OperadorInventarioStats,
  AlertaInventario,
  MovimientoInventario
} from '../types';

// Constantes locales
const STOCK_LEVELS = {
  BAJO: 10,
  NORMAL: 50,
  ALTO: 50
} as const;

const DAYS_TO_EXPIRE = {
  PROXIMO: 30,
  CRITICO: 7
} as const;

const logger = {
  info: (message: string, details?: unknown) => console.info(`[OperadorInventoryService] ${message}`, details),
  error: (message: string, error?: unknown) => console.error(`[OperadorInventoryService] ${message}`, error)
};

export const createOperadorInventoryDataService = (supabaseClient: SupabaseClient) => {
  
  /**
   * Obtener inventario con información enriquecida para operadores
   */
  const fetchInventario = async (): Promise<ServiceResult<InventarioItem[]>> => {
    try {
      logger.info('Consultando inventario para operador');
      
      const { data, error } = await supabaseClient
        .from('inventario')
        .select(`
          id_inventario,
          id_deposito,
          id_producto,
          cantidad_disponible,
          fecha_actualizacion,
          depositos:depositos!inventario_id_deposito_fkey(
            id_deposito,
            nombre,
            descripcion
          ),
          productos:productos_donados!inventario_id_producto_fkey(
            id_producto,
            nombre_producto,
            descripcion,
            unidad_medida,
            unidad_id,
            fecha_caducidad,
            fecha_donacion,
            unidades:unidades(
              id,
              nombre,
              simbolo
            )
          )
        `)
        .order('fecha_actualizacion', { ascending: false });

      if (error) {
        logger.error('Error consultando inventario', error);
        return {
          success: false,
          error: 'Error al cargar el inventario',
          errorDetails: error
        };
      }

      if (!data) {
        logger.info('No se encontraron datos de inventario');
        return {
          success: true,
          data: []
        };
      }

      logger.info('Datos de inventario recibidos', { count: data.length });
      
      const mappedData = ((data ?? []) as SupabaseInventarioRow[]).map(mapInventarioRowToDomainWithOperatorInfo);
      logger.info('Datos mapeados correctamente', { count: mappedData.length });
      
      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      logger.error('Excepción obteniendo inventario', error);
      return {
        success: false,
        error: 'Error inesperado al cargar inventario',
        errorDetails: error
      };
    }
  };

  /**
   * Obtener solo productos que necesitan atención del operador
   */
  const fetchProductosConAlertas = async (): Promise<ServiceResult<InventarioItem[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('inventario')
        .select(`
          id_inventario,
          id_deposito,
          id_producto,
          cantidad_disponible,
          fecha_actualizacion,
          depositos:depositos!inventario_id_deposito_fkey(
            id_deposito,
            nombre,
            descripcion
          ),
          productos:productos_donados!inventario_id_producto_fkey(
            id_producto,
            nombre_producto,
            descripcion,
            unidad_medida,
            unidad_id,
            fecha_caducidad,
            fecha_donacion,
            unidades:unidades(
              id,
              nombre,
              simbolo
            )
          )
        `)
        .or(`cantidad_disponible.lt.${STOCK_LEVELS.BAJO}`)
        .order('cantidad_disponible', { ascending: true });

      if (error) {
        logger.error('Error consultando productos con alertas', error);
        return {
          success: false,
          error: 'Error al cargar productos con alertas',
          errorDetails: error
        };
      }

      const inventario = ((data ?? []) as SupabaseInventarioRow[])
        .map(mapInventarioRowToDomainWithOperatorInfo)
        .filter(item => item.necesita_atencion);

      return {
        success: true,
        data: inventario
      };
    } catch (error) {
      logger.error('Excepción obteniendo productos con alertas', error);
      return {
        success: false,
        error: 'Error inesperado al cargar productos con alertas',
        errorDetails: error
      };
    }
  };

  /**
   * Obtener estadísticas específicas para operador
   */
  const fetchOperadorStats = async (): Promise<ServiceResult<OperadorInventarioStats>> => {
    try {
      const { data, error } = await supabaseClient
        .from('inventario')
        .select(`
          cantidad_disponible,
          productos:productos_donados!inventario_id_producto_fkey(
            fecha_caducidad
          )
        `);

      if (error) {
        logger.error('Error consultando estadísticas', error);
        return {
          success: false,
          error: 'Error al cargar estadísticas',
          errorDetails: error
        };
      }

      const stats = calculateOperadorStats(data as any[]);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      logger.error('Excepción obteniendo estadísticas', error);
      return {
        success: false,
        error: 'Error inesperado al cargar estadísticas',
        errorDetails: error
      };
    }
  };

  /**
   * Obtener depósitos
   */
  const fetchDepositos = async (): Promise<ServiceResult<Deposito[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('depositos')
        .select('id_deposito, nombre, descripcion')
        .order('nombre', { ascending: true });

      if (error) {
        logger.error('Error consultando depósitos', error);
        return {
          success: false,
          error: 'Error al cargar los depósitos',
          errorDetails: error
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      logger.error('Excepción obteniendo depósitos', error);
      return {
        success: false,
        error: 'Error inesperado al cargar depósitos',
        errorDetails: error
      };
    }
  };

  /**
   * Obtener alertas activas
   */
  const fetchAlertas = async (): Promise<ServiceResult<AlertaInventario[]>> => {
    try {
      const inventarioResult = await fetchInventario();
      if (!inventarioResult.success || !inventarioResult.data) {
        return {
          success: false,
          error: 'No se pudo obtener datos de inventario para alertas'
        };
      }

      const alertas = generateAlertas(inventarioResult.data);

      return {
        success: true,
        data: alertas
      };
    } catch (error) {
      logger.error('Excepción obteniendo alertas', error);
      return {
        success: false,
        error: 'Error inesperado al cargar alertas',
        errorDetails: error
      };
    }
  };

  return {
    fetchInventario,
    fetchProductosConAlertas,
    fetchOperadorStats,
    fetchDepositos,
    fetchAlertas
  };
};

// Utility functions
const normalizeRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return (value[0] ?? null) as T | null;
  }
  return (value ?? null) as T | null;
};

const mapInventarioRowToDomainWithOperatorInfo = (row: SupabaseInventarioRow): InventarioItem => {
  const deposito = normalizeRelation(row.depositos);
  const producto = normalizeRelation(row.productos);

  // Calcular información específica para operador
  const cantidad = row.cantidad_disponible ?? 0;
  const fechaCaducidad = producto?.fecha_caducidad;
  const diasParaVencer = fechaCaducidad ? getDiasParaVencer(fechaCaducidad) : null;
  
  const stockStatus = getStockStatus(cantidad);
  const estadoCaducidad = getEstadoCaducidad(diasParaVencer);
  const necesitaAtencion = stockStatus === 'bajo' || estadoCaducidad === 'proximo' || estadoCaducidad === 'vencido';

  // Obtener información de unidad estructurada
  const unidadInfo = producto?.unidades;
  const unidadNombre = Array.isArray(unidadInfo) ? unidadInfo[0]?.nombre : unidadInfo?.nombre;
  const unidadSimbolo = Array.isArray(unidadInfo) ? unidadInfo[0]?.simbolo : unidadInfo?.simbolo;

  return {
    id_inventario: row.id_inventario,
    id_deposito: row.id_deposito,
    id_producto: row.id_producto,
    cantidad_disponible: cantidad,
    fecha_actualizacion: row.fecha_actualizacion ?? null,
    deposito: {
      id_deposito: deposito?.id_deposito ?? row.id_deposito,
      nombre: deposito?.nombre ?? 'Sin depósito',
      descripcion: deposito?.descripcion ?? null
    },
    producto: {
      id_producto: producto?.id_producto ?? row.id_producto,
      nombre_producto: producto?.nombre_producto ?? 'Sin nombre',
      descripcion: producto?.descripcion ?? null,
      unidad_medida: producto?.unidad_medida ?? null,
      unidad_id: producto?.unidad_id ?? null,
      unidad_nombre: unidadNombre ?? null,
      unidad_simbolo: unidadSimbolo ?? null,
      fecha_caducidad: producto?.fecha_caducidad ?? null,
      fecha_donacion: producto?.fecha_donacion ?? null,
      dias_para_vencer: diasParaVencer ?? undefined,
      estado_caducidad: estadoCaducidad
    },
    necesita_atencion: necesitaAtencion,
    stock_status: stockStatus
  };
};

const getDiasParaVencer = (fechaCaducidad: string): number => {
  const hoy = new Date();
  const fechaVence = new Date(fechaCaducidad);
  const diferencia = fechaVence.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 3600 * 24));
};

const getStockStatus = (cantidad: number): 'bajo' | 'normal' | 'alto' => {
  if (cantidad < STOCK_LEVELS.BAJO) return 'bajo';
  if (cantidad >= STOCK_LEVELS.ALTO) return 'alto';
  return 'normal';
};

const getEstadoCaducidad = (diasParaVencer: number | null): 'vigente' | 'proximo' | 'vencido' => {
  if (diasParaVencer === null) return 'vigente';
  if (diasParaVencer < 0) return 'vencido';
  if (diasParaVencer <= DAYS_TO_EXPIRE.CRITICO) return 'proximo';
  return 'vigente';
};

const calculateOperadorStats = (data: any[]): OperadorInventarioStats => {
  const stats = {
    totalProductos: data.length,
    stockBajo: 0,
    stockNormal: 0,
    stockAlto: 0,
    totalUnidades: 0,
    productosProximosVencer: 0,
    productosVencidos: 0,
    alertasActivas: 0
  };

  data.forEach(item => {
    const cantidad = item.cantidad_disponible ?? 0;
    stats.totalUnidades += cantidad;

    // Stock levels
    if (cantidad < STOCK_LEVELS.BAJO) {
      stats.stockBajo++;
    } else if (cantidad >= STOCK_LEVELS.ALTO) {
      stats.stockAlto++;
    } else {
      stats.stockNormal++;
    }

    // Productos próximos a vencer o vencidos
    const fechaCaducidad = item.productos?.fecha_caducidad;
    if (fechaCaducidad) {
      const diasParaVencer = getDiasParaVencer(fechaCaducidad);
      if (diasParaVencer < 0) {
        stats.productosVencidos++;
        stats.alertasActivas++;
      } else if (diasParaVencer <= DAYS_TO_EXPIRE.PROXIMO) {
        stats.productosProximosVencer++;
        stats.alertasActivas++;
      }
    }

    // Alertas por stock bajo
    if (cantidad < STOCK_LEVELS.BAJO) {
      stats.alertasActivas++;
    }
  });

  return stats;
};

const generateAlertas = (inventario: InventarioItem[]): AlertaInventario[] => {
  const alertas: AlertaInventario[] = [];

  inventario.forEach(item => {
    // Alerta por stock bajo
    if (item.stock_status === 'bajo') {
      alertas.push({
        tipo: 'stock_bajo',
        producto: item.producto,
        cantidad_actual: item.cantidad_disponible,
        deposito: item.deposito,
        prioridad: item.cantidad_disponible === 0 ? 'alta' : 'media'
      });
    }

    // Alertas por caducidad
    if (item.producto.estado_caducidad === 'vencido') {
      alertas.push({
        tipo: 'vencido',
        producto: item.producto,
        cantidad_actual: item.cantidad_disponible,
        deposito: item.deposito,
        prioridad: 'alta'
      });
    } else if (item.producto.estado_caducidad === 'proximo') {
      alertas.push({
        tipo: 'proximo_vencer',
        producto: item.producto,
        cantidad_actual: item.cantidad_disponible,
        deposito: item.deposito,
        prioridad: item.producto.dias_para_vencer! <= DAYS_TO_EXPIRE.CRITICO ? 'alta' : 'media'
      });
    }
  });

  return alertas.sort((a, b) => {
    const prioridadOrder = { alta: 0, media: 1, baja: 2 };
    return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
  });
};