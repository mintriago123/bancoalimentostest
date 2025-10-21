import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface UserPreferences {
  recibir_notificaciones: boolean;
  idioma: string;
  perfil_publico: boolean;
}

interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  isSaving: boolean;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  savePreferences: (supabase: SupabaseClient, userId: string) => Promise<boolean>;
}

export function useUserPreferences(
  initialPreferences: UserPreferences = {
    recibir_notificaciones: true,
    idioma: 'es',
    perfil_publico: true
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
      // Aquí puedes agregar la lógica real para guardar en Supabase
      const { error } = await supabase
        .from('usuarios')
        .update({
          recibir_notificaciones: preferences.recibir_notificaciones,
          idioma: preferences.idioma,
          perfil_publico: preferences.perfil_publico
        })
        .eq('id', userId);

      if (error) throw error;

      // Simulación temporal si no existe la columna
      await new Promise(res => setTimeout(res, 1000));
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
