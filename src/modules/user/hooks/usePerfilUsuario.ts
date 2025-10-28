// ============================================================================
// Hook: usePerfilUsuario
// Manejo del perfil del usuario
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  UserProfileFormData,
  LoadingState,
  MessageState,
} from '../types';
import { PerfilService } from '../services/perfilService';
import { MESSAGES } from '../constants';

interface UsePerfilUsuarioResult {
  profile: UserProfile | null;
  loading: LoadingState;
  message: MessageState | null;
  updateProfile: (data: UserProfileFormData) => Promise<boolean>;
  setMessage: (message: MessageState | null) => void;
}

export function usePerfilUsuario(
  supabase: SupabaseClient,
  usuarioId: string | undefined
): UsePerfilUsuarioResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [message, setMessage] = useState<MessageState | null>(null);

  const service = new PerfilService(supabase);

  const loadProfile = useCallback(async () => {
    if (!usuarioId) {
      setMessage({ type: 'error', text: MESSAGES.AUTH.NOT_AUTHENTICATED });
      setLoading('error');
      return;
    }

    setLoading('loading');
    setMessage(null);

    const { data, error } = await service.getPerfilUsuario(usuarioId);

    if (error || !data) {
      setMessage({
        type: 'error',
        text: MESSAGES.PERFIL.ERROR_LOAD,
      });
      setLoading('error');
    } else {
      setProfile(data);
      setLoading('success');
    }
  }, [usuarioId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (
    data: UserProfileFormData
  ): Promise<boolean> => {
    if (!usuarioId) return false;

    setLoading('loading');
    setMessage(null);

    const { data: updatedData, error } = await service.updatePerfilUsuario(
      usuarioId,
      data
    );

    if (error || !updatedData) {
      setMessage({
        type: 'error',
        text: error?.message || MESSAGES.PERFIL.ERROR_UPDATE,
      });
      setLoading('error');
      return false;
    }

    setProfile(updatedData);
    setMessage({ type: 'success', text: MESSAGES.PERFIL.SUCCESS_UPDATE });
    setLoading('success');

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMessage(null), 3000);

    return true;
  };

  return {
    profile,
    loading,
    message,
    updateProfile,
    setMessage,
  };
}
