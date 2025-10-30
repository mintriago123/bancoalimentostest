import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
interface UserPreferences {
  recibir_notificaciones: boolean;
}

interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  isSaving: boolean;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  savePreferences: (supabase: SupabaseClient, userId: string) => Promise<boolean>;
}

export function useUserPreferences(
  initialPreferences: UserPreferences = {
    recibir_notificaciones: true
  }
): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const savePreferences = async (
    supabase: SupabaseClient,
    userId: string
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          recibir_notificaciones: preferences.recibir_notificaciones
        })
        .eq('id', userId);

      if (error) {
        if ((error as any).code === 'PGRST204') {
          console.warn('Columna recibir_notificaciones no existe en usuarios, la preferencia de correo no se persistirá.');
          return true;
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    preferences,
    isSaving,
    updatePreference,
    savePreferences,
  };
}
