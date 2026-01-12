import type { SupabaseClient } from '@supabase/supabase-js';
import type { ServiceResult, UserRecord, UserRole, UserStatus } from '../types';

const mapUserRow = (row: any): UserRecord => ({
  id: row.id,
  nombre: row.nombre,
  cedula: row.cedula ?? undefined,
  ruc: row.ruc ?? undefined,
  rol: row.rol,
  tipo_persona: row.tipo_persona,
  telefono: row.telefono ?? undefined,
  direccion: row.direccion ?? undefined,
  representante: row.representante ?? undefined,
  email: row.email ?? undefined,
  created_at: row.created_at ?? undefined,
  estado: row.estado ?? null,
  fecha_fin_bloqueo: row.fecha_fin_bloqueo ?? undefined
});

export const createUserDataService = (supabaseClient: SupabaseClient) => {
  const fetchUsers = async (): Promise<ServiceResult<UserRecord[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, cedula, ruc, rol, tipo_persona, telefono, direccion, representante, email, created_at, estado, fecha_fin_bloqueo, motivo_bloqueo')
        .order('nombre', { ascending: true });

      if (error) {
        return { success: false, error: 'No fue posible obtener los usuarios', errorDetails: error };
      }

      return {
        success: true,
        data: (data ?? []).map(mapUserRow)
      };
    } catch (err) {
      return { success: false, error: 'Error inesperado al cargar usuarios', errorDetails: err };
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<ServiceResult<void>> => {
    try {
      // Usar la API route con cliente admin para bypass RLS
      const response = await fetch('/api/admin/usuarios', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates: { rol: newRole }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || 'No fue posible actualizar el rol', 
          errorDetails: errorData 
        };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error inesperado al actualizar el rol', errorDetails: err };
    }
  };

  const updateUserStatus = async (
    userId: string, 
    newStatus: UserStatus, 
    fechaFinBloqueo?: string | null,
    motivoBloqueo?: string | null
  ): Promise<ServiceResult<void>> => {
    try {
      const updates: { estado: UserStatus; fecha_fin_bloqueo?: string | null; motivo_bloqueo?: string | null } = { 
        estado: newStatus 
      };
      
      // Si es un bloqueo temporal, incluir la fecha de fin y el motivo
      if (newStatus === 'bloqueado' && fechaFinBloqueo) {
        updates.fecha_fin_bloqueo = fechaFinBloqueo;
        updates.motivo_bloqueo = motivoBloqueo || null;
      }
      
      // Si se desactiva, incluir el motivo
      if (newStatus === 'desactivado') {
        updates.fecha_fin_bloqueo = null;
        updates.motivo_bloqueo = motivoBloqueo || null;
      }
      
      // Si se activa, limpiar todo
      if (newStatus === 'activo') {
        updates.fecha_fin_bloqueo = null;
        updates.motivo_bloqueo = null;
      }

      // Usar la API route con cliente admin para bypass RLS
      const response = await fetch('/api/admin/usuarios', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || 'No fue posible actualizar el estado', 
          errorDetails: errorData 
        };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error inesperado al actualizar el estado', errorDetails: err };
    }
  };

  return {
    fetchUsers,
    updateUserRole,
    updateUserStatus
  };
};
