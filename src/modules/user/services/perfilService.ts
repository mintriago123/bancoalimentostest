// ============================================================================
// Service: Perfil de Usuario
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, UserProfileFormData } from '../types';

export class PerfilService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Obtener el perfil de un usuario
   */
  async getPerfilUsuario(
    usuarioId: string
  ): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data: authUser, error: authError } =
        await this.supabase.auth.getUser();
      if (authError) throw authError;

      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioId)
        .single();

      if (error || !data) {
        return { data: null, error };
      }

      const combinedProfile: UserProfile = {
        ...data,
        email: authUser.user?.email || data.email || '',
      };

      return { data: combinedProfile, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Actualizar el perfil de un usuario
   */
  async updatePerfilUsuario(
    usuarioId: string,
    profileData: UserProfileFormData
  ): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const updateData = {
        nombre: profileData.nombre.trim(),
        telefono: profileData.telefono.trim(),
        direccion: profileData.direccion.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await this.supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', usuarioId);

      if (updateError) throw updateError;

      // Obtener los datos actualizados
      const { data, error } = await this.getPerfilUsuario(usuarioId);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obtener datos básicos del usuario (nombre, cedula, telefono)
   */
  async getDatosBasicosUsuario(
    usuarioId: string
  ): Promise<{
    data: Pick<UserProfile, 'id' | 'nombre' | 'cedula' | 'telefono'> | null;
    error: any;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('id, nombre, cedula, telefono')
        .eq('id', usuarioId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}
