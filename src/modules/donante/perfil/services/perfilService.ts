import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, PerfilFormData } from '../types';

export class PerfilService {
  constructor(private supabase: SupabaseClient) {}

  async obtenerPerfil(userId: string): Promise<UserProfile> {
    const { data: authUser, error: authError } = await this.supabase.auth.getUser();
    if (authError) throw authError;

    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error('No se pudieron cargar los datos del perfil');
    }

    if (!data) {
      throw new Error('No se encontró el perfil del usuario');
    }

    return {
      ...data,
      email: authUser.user?.email || data.email || '',
    };
  }

  async actualizarPerfil(userId: string, formData: PerfilFormData): Promise<UserProfile> {
    const updateData = {
      nombre: formData.nombre.trim(),
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new Error('Error al actualizar el perfil: ' + error.message);
    }

    const { data: updatedData } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (!updatedData) {
      throw new Error('No se pudieron cargar los datos actualizados');
    }

    const { data: authUser } = await this.supabase.auth.getUser();
    
    return {
      ...updatedData,
      email: authUser.user?.email || updatedData.email || '',
    };
  }

  validarFormulario(formData: PerfilFormData): string | null {
    if (!formData.nombre.trim()) {
      return 'El nombre es obligatorio';
    }
    if (formData.telefono && formData.telefono.replace(/\D/g, '').length !== 10) {
      return 'El teléfono debe tener 10 dígitos';
    }
    return null;
  }
}
