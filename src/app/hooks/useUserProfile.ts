import { useState, useEffect } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  rol: string;
  tipo_persona: 'Natural' | 'Juridica';
  nombre: string;
  ruc?: string;
  cedula?: string;
  direccion: string;
  telefono: string;
  representante?: string;
  email?: string;
}

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  loadingUser: boolean;
}

export function useUserProfile(
  supabase: SupabaseClient | null,
  currentUser: User | null | undefined,
  authLoading: boolean
): UseUserProfileReturn {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const cargarPerfilUsuario = async (user: User) => {
    if (!supabase) return;
    
    setLoadingUser(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, rol, tipo_persona, nombre, ruc, cedula, direccion, telefono, representante')
        .eq('id', user.id)
        .single();

      if (error && error.details?.includes('0 rows')) {
        console.log('Usuario no encontrado en la tabla usuarios');
        setUserProfile(null);
      } else if (error) {
        console.error('Error al cargar perfil:', error);
        setUserProfile(null);
      } else if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error al cargar perfil del usuario:', error);
      setUserProfile(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser !== undefined) {
      if (currentUser) {
        cargarPerfilUsuario(currentUser);
      } else {
        setUserProfile(null);
        setLoadingUser(false);
      }
    }
  }, [currentUser, authLoading, supabase]);

  return {
    userProfile,
    loadingUser,
  };
}
