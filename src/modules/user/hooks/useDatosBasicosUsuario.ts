// ============================================================================
// Hook: useDatosBasicosUsuario
// Obtener datos básicos del usuario (nombre, cédula, teléfono)
// ============================================================================

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, LoadingState } from '../types';
import { PerfilService } from '../services/perfilService';

interface UseDatosBasicosUsuarioResult {
  userData: Pick<UserProfile, 'id' | 'nombre' | 'cedula' | 'telefono'> | null;
  loading: LoadingState;
  error: string | null;
}

export function useDatosBasicosUsuario(
  supabase: SupabaseClient,
  usuarioId: string | undefined
): UseDatosBasicosUsuarioResult {
  const [userData, setUserData] = useState<Pick<
    UserProfile,
    'id' | 'nombre' | 'cedula' | 'telefono'
  > | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const service = new PerfilService(supabase);

  useEffect(() => {
    const fetchDatosBasicos = async () => {
      if (!usuarioId) return;

      setLoading('loading');
      setError(null);

      const { data, error: fetchError } =
        await service.getDatosBasicosUsuario(usuarioId);

      if (fetchError || !data) {
        setError('Error al cargar los datos del usuario');
        setLoading('error');
      } else {
        setUserData(data);
        setLoading('success');
      }
    };

    fetchDatosBasicos();
  }, [usuarioId, supabase]);

  return {
    userData,
    loading,
    error,
  };
}
