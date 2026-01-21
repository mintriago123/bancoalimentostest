// ============================================================================
// Service: Solicitudes
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';
import {
  Solicitud,
  SolicitudFormData,
  SolicitudEditData,
  FiltroEstadoSolicitud,
} from '../types';

export class SolicitudesService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Obtener todas las solicitudes de un usuario
   */
  async getSolicitudesByUsuario(
    usuarioId: string,
    filtroEstado?: FiltroEstadoSolicitud
  ): Promise<{ data: Solicitud[] | null; error: any }> {
    try {
      let query = this.supabase
        .from('solicitudes')
        .select(`
          *,
          unidades:unidad_id (
            simbolo
          )
        `)
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false });

      // Aplicar filtro de estado si no es TODOS
      if (filtroEstado && filtroEstado !== 'TODOS') {
        query = query.eq('estado', filtroEstado);
      }

      const { data, error } = await query;
      
      // Log de depuración para ver datos de solicitudes rechazadas
      if (data) {
        const rechazadas = data.filter((s: any) => s.estado === 'rechazada');
        if (rechazadas.length > 0) {
          console.log('📋 Solicitudes rechazadas obtenidas desde BD:', rechazadas.map((s: any) => ({
            id: s.id,
            motivo_rechazo: s.motivo_rechazo,
            fecha_rechazo: s.fecha_rechazo,
            operador_rechazo_id: s.operador_rechazo_id,
            comentario_admin: s.comentario_admin
          })));
        }
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Crear una nueva solicitud
   */
  async createSolicitud(
    usuarioId: string,
    solicitudData: SolicitudFormData
  ): Promise<{ data: Solicitud | null; error: any }> {
    try {
      console.log('[SolicitudesService] Intentando crear solicitud:', {
        usuarioId,
        solicitudData
      });

      const insertData = {
        usuario_id: usuarioId,
        tipo_alimento: solicitudData.tipo_alimento,
        cantidad: solicitudData.cantidad,
        unidad_id: solicitudData.unidad_id,
        comentarios: solicitudData.comentarios || null,
        latitud: solicitudData.latitud || null,
        longitud: solicitudData.longitud || null,
      };

      console.log('[SolicitudesService] Datos a insertar:', insertData);

      const { data, error } = await this.supabase
        .from('solicitudes')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[SolicitudesService] Error al crear solicitud:', error);
      } else {
        console.log('[SolicitudesService] Solicitud creada exitosamente:', data);
      }

      return { data, error };
    } catch (error) {
      console.error('[SolicitudesService] Exception al crear solicitud:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualizar una solicitud existente
   */
  async updateSolicitud(
    solicitudId: string,
    updateData: SolicitudEditData
  ): Promise<{ data: Solicitud | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('solicitudes')
        .update(updateData)
        .eq('id', solicitudId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Eliminar una solicitud
   */
  async deleteSolicitud(id: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('solicitudes')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Obtener una solicitud por ID
   */
  async getSolicitudById(
    solicitudId: number
  ): Promise<{ data: Solicitud | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('solicitudes')
        .select('*')
        .eq('id', solicitudId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}
