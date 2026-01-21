/**
 * @fileoverview Servicio de datos para solicitudes.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  InventarioDisponible,
  ServiceResult,
  Solicitud,
  SolicitudUsuario,
  SupabaseInventarioDisponibleRow,
  SupabaseSolicitudRow,
  SupabaseSolicitudUsuario
} from '../types';

const logger = {
  info: (message: string, details?: unknown) => console.info(`[SolicitudesDataService] ${message}`, details),
  error: (message: string, error?: unknown) => console.error(`[SolicitudesDataService] ${message}`, error)
};

export const createSolicitudesDataService = (supabaseClient: SupabaseClient) => {
  const fetchSolicitudes = async (): Promise<ServiceResult<Solicitud[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('solicitudes')
        .select(`
          id,
          usuario_id,
          tipo_alimento,
          cantidad,
          comentarios,
          estado,
          created_at,
          latitud,
          longitud,
          fecha_respuesta,
          comentario_admin,
          unidad_id,
          motivo_rechazo,
          operador_rechazo_id,
          fecha_rechazo,
          operador_aprobacion_id,
          fecha_aprobacion,
          codigo_comprobante,
          unidades:unidad_id (
            id,
            nombre,
            simbolo,
            tipo_magnitud_id,
            es_base
          ),
          usuarios:usuario_id (
            nombre,
            cedula,
            telefono,
            email,
            direccion,
            tipo_persona
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error al consultar solicitudes', error);
        return {
          success: false,
          error: 'No fue posible obtener las solicitudes',
          errorDetails: error
        };
      }

      const solicitudes = ((data ?? []) as SupabaseSolicitudRow[]).map(mapSolicitudRowToDomain);

      return {
        success: true,
        data: solicitudes
      };
    } catch (err) {
      logger.error('Excepción inesperada al obtener solicitudes', err);
      return {
        success: false,
        error: 'Error inesperado al obtener solicitudes',
        errorDetails: err
      };
    }
  };

  const fetchInventarioDisponible = async (tipoAlimento: string): Promise<ServiceResult<InventarioDisponible[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('inventario')
        .select(`
          id_inventario,
          cantidad_disponible,
          fecha_actualizacion,
          productos_donados!inner(
            nombre_producto,
            unidades(
              nombre,
              simbolo
            )
          ),
          depositos!inner(
            nombre
          )
        `)
        .ilike('productos_donados.nombre_producto', `%${tipoAlimento}%`)
        .gt('cantidad_disponible', 0)
        .order('fecha_actualizacion', { ascending: true, nullsFirst: false });

      if (error) {
        logger.error('Error al consultar inventario disponible', error);
        return {
          success: false,
          error: 'No fue posible obtener el inventario disponible',
          errorDetails: error
        };
      }

      const inventarioFormateado: InventarioDisponible[] = ((data ?? []) as SupabaseInventarioDisponibleRow[])
        .map(mapInventarioDisponibleRowToDomain);

      return {
        success: true,
        data: inventarioFormateado
      };
    } catch (err) {
      logger.error('Excepción inesperada al cargar inventario', err);
      return {
        success: false,
        error: 'Error inesperado al obtener inventario disponible',
        errorDetails: err
      };
    }
  };

  return {
    fetchSolicitudes,
    fetchInventarioDisponible
  };
};

const mapSolicitudRowToDomain = (row: SupabaseSolicitudRow): Solicitud => ({
  id: row.id,
  usuario_id: row.usuario_id,
  tipo_alimento: row.tipo_alimento ?? 'Producto desconocido',
  cantidad: row.cantidad ?? 0,
  comentarios: row.comentarios ?? undefined,
  estado: row.estado,
  created_at: row.created_at,
  latitud: row.latitud ?? undefined,
  longitud: row.longitud ?? undefined,
  fecha_respuesta: row.fecha_respuesta ?? undefined,
  comentario_admin: row.comentario_admin ?? undefined,
  unidad_id: row.unidad_id ?? undefined,
  motivo_rechazo: row.motivo_rechazo ?? undefined,
  operador_rechazo_id: row.operador_rechazo_id ?? undefined,
  fecha_rechazo: row.fecha_rechazo ?? undefined,
  operador_aprobacion_id: row.operador_aprobacion_id ?? undefined,
  fecha_aprobacion: row.fecha_aprobacion ?? undefined,
  unidades: mapSolicitudUnidad(row.unidades),
  usuarios: mapSolicitudUsuario(row.usuarios),
  codigo_comprobante: row.codigo_comprobante ?? undefined
});

const mapSolicitudUsuario = (usuario: SupabaseSolicitudUsuario | null): SolicitudUsuario | null => {
  if (!usuario) {
    return null;
  }

  return {
    nombre: usuario.nombre ?? 'N/A',
    cedula: usuario.cedula ?? 'N/A',
    telefono: usuario.telefono ?? 'N/A',
    email: usuario.email ?? undefined,
    direccion: usuario.direccion ?? undefined,
    tipo_persona: usuario.tipo_persona ?? undefined
  };
};

const mapSolicitudUnidad = (unidad: unknown): import('../types').SolicitudUnidad | null => {
  const normalized = normalizeRelation(unidad);
  
  if (!normalized || typeof normalized !== 'object') {
    return null;
  }

  const u = normalized as { 
    id?: number | null;
    nombre?: string | null;
    simbolo?: string | null;
    tipo_magnitud_id?: number | null;
    es_base?: boolean | null;
  };

  if (!u.id || !u.nombre || !u.simbolo || u.tipo_magnitud_id === null || u.tipo_magnitud_id === undefined) {
    return null;
  }

  return {
    id: u.id,
    nombre: u.nombre,
    simbolo: u.simbolo,
    tipo_magnitud_id: u.tipo_magnitud_id,
    es_base: u.es_base ?? false
  };
};

const normalizeRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return (value[0] ?? null) as T | null;
  }

  return (value ?? null) as T | null;
};

const mapInventarioDisponibleRowToDomain = (
  row: SupabaseInventarioDisponibleRow
): InventarioDisponible => {
  const producto = normalizeRelation(row.productos_donados);
  const deposito = normalizeRelation(row.depositos);
  const unidad = producto?.unidades ? normalizeRelation(producto.unidades) : null;

  return {
    id: String(row.id_inventario),
    tipo_alimento: producto?.nombre_producto ?? 'Producto desconocido',
    cantidad_disponible: row.cantidad_disponible ?? 0,
    deposito: deposito?.nombre ?? 'Depósito desconocido',
    fecha_vencimiento: row.fecha_actualizacion ?? null,
    unidad_nombre: unidad?.nombre ?? undefined,
    unidad_simbolo: unidad?.simbolo ?? undefined
  };
};
