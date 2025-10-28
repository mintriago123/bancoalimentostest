import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { PerfilService } from '../services/perfilService';
import { UserProfile, PerfilFormData, MessageState } from '../types';

export function usePerfilData(supabase: SupabaseClient, user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [formData, setFormData] = useState<PerfilFormData>({
    nombre: '',
    telefono: '',
    direccion: '',
  });

  const service = new PerfilService(supabase);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Usuario no autenticado' });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await service.obtenerPerfil(user.id);
      
      setProfile(data);
      setFormData({
        nombre: data.nombre || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
      });
      setMessage(null);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al cargar los datos del perfil',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (message?.type === 'error') setMessage(null);
    },
    [message]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = service.validarFormulario(formData);
      if (validationError) {
        setMessage({ type: 'error', text: validationError });
        return;
      }

      setIsSaving(true);
      setMessage(null);

      try {
        if (!user?.id) throw new Error('Usuario no autenticado');

        const updatedProfile = await service.actualizarPerfil(user.id, formData);
        setProfile(updatedProfile);
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error.message || 'Error al actualizar el perfil',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [formData, user]
  );

  return {
    profile,
    isLoading,
    isSaving,
    message,
    formData,
    handleInputChange,
    handleSubmit,
  };
}
