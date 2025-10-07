import type { SupabaseClient } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  rol: string;
  tipo_persona: 'Natural' | 'Juridica';
  nombre: string;
  ruc?: string;
  cedula?: string;
  direccion?: string;
  telefono?: string;
  representante?: string;
};

export async function fetchUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, rol, tipo_persona, nombre, ruc, cedula, direccion, telefono, representante')
    .eq('id', userId)
    .single();
  if (error) {
    // Si no existe, devolvemos null y dejamos que el caller decida
    return null;
  }
  return data as UserProfile;
}

export async function isDocumentDuplicate(supabase: SupabaseClient, field: 'cedula' | 'ruc', value: string, currentUserId: string) {
  const { data } = await supabase
    .from('usuarios')
    .select('id')
    .eq(field, value)
    .neq('id', currentUserId)
    .maybeSingle();
  return !!data;
}
