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
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false });

      // Aplicar filtro de estado si no es TODOS
      if (filtroEstado && filtroEstado !== 'TODOS') {
        query = query.eq('estado', filtroEstado);
      }

      const { data, error } = await query;
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
      const { data, error } = await this.supabase
        .from('solicitudes')
        .insert([
          {
            usuario_id: usuarioId,
            ...solicitudData,
          },
        ])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Actualizar una solicitud existente
   */
  async updateSolicitud(
    solicitudId: number,
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
  async deleteSolicitud(solicitudId: number): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('solicitudes')
        .delete()
        .eq('id', solicitudId);

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
