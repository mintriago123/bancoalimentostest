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
  estado: row.estado ?? null
});

export const createUserDataService = (supabaseClient: SupabaseClient) => {
  const fetchUsers = async (): Promise<ServiceResult<UserRecord[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, cedula, ruc, rol, tipo_persona, telefono, direccion, representante, email, created_at, estado')
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

  const updateUserStatus = async (userId: string, newStatus: UserStatus): Promise<ServiceResult<void>> => {
    try {
      // Usar la API route con cliente admin para bypass RLS
      const response = await fetch('/api/admin/usuarios', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates: { estado: newStatus }
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
