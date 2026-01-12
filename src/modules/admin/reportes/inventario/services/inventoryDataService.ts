/**
 * @fileoverview Servicio de datos para inventario.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  InventarioItem,
  Deposito,
  ServiceResult,
  SupabaseInventarioRow,
} from '../types';

const logger = {
  info: (message: string, details?: unknown) => console.info(`[InventoryDataService] ${message}`, details),
  error: (message: string, error?: unknown) => console.error(`[InventoryDataService] ${message}`, error)
};

export const createInventoryDataService = (supabaseClient: SupabaseClient) => {
  const fetchInventario = async (): Promise<ServiceResult<InventarioItem[]>> => {
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
            alimento_id,
            unidades:unidades(
              id,
              nombre,
              simbolo
            ),
            alimentos:alimentos(
              id,
              nombre,
              categoria
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

      const inventario = ((data ?? []) as SupabaseInventarioRow[]).map(mapInventarioRowToDomain);

      return {
        success: true,
        data: inventario
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

  return {
    fetchInventario,
    fetchDepositos
  };
};

const normalizeRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return (value[0] ?? null) as T | null;
  }

  return (value ?? null) as T | null;
};

const mapInventarioRowToDomain = (row: SupabaseInventarioRow): InventarioItem => {
  const deposito = normalizeRelation(row.depositos);
  const producto = normalizeRelation(row.productos);

  // Normalizar la información de unidad
  const unidadInfo = producto?.unidades;
  const unidadNormalizada = unidadInfo 
    ? (Array.isArray(unidadInfo) ? unidadInfo[0] : unidadInfo)
    : null;

  // Normalizar la información del alimento
  const alimentoInfo = producto?.alimentos;
  const alimentoNormalizado = alimentoInfo 
    ? (Array.isArray(alimentoInfo) ? alimentoInfo[0] : alimentoInfo)
    : null;

  return {
    id_inventario: row.id_inventario,
    id_deposito: row.id_deposito,
    id_producto: row.id_producto,
    cantidad_disponible: row.cantidad_disponible ?? 0,
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
      categoria: alimentoNormalizado?.categoria ?? null,
      unidad_medida: producto?.unidad_medida ?? null,
      unidad_id: producto?.unidad_id ?? null,
      unidad_nombre: unidadNormalizada?.nombre ?? null,
      unidad_simbolo: unidadNormalizada?.simbolo ?? null,
      fecha_caducidad: producto?.fecha_caducidad ?? null,
      fecha_donacion: producto?.fecha_donacion ?? null
    }
  };
};
