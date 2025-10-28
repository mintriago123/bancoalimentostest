/**
 * Hook para manejo de inicio de sesión
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { createAuthService } from '../services/authService';
import type { DatosLogin, MensajeAuth } from '../types';

export const useLogin = () => {
  const router = useRouter();
  const { supabase } = useSupabase();
  const authService = createAuthService(supabase);

  const [estaCargando, setEstaCargando] = useState(false);
  const [mensaje, setMensaje] = useState<MensajeAuth | null>(null);

  const login = async (datos: DatosLogin) => {
    setEstaCargando(true);
    setMensaje(null);

    const resultado = await authService.login(datos);

    if (resultado.success) {
      if (resultado.redirect) {
        router.push(resultado.redirect);
      }
    } else {
      setMensaje({
        tipo: 'error',
        texto: resultado.error || 'Error al iniciar sesión',
      });
    }

    setEstaCargando(false);
    return resultado;
  };

  const limpiarMensaje = () => setMensaje(null);

  return {
    login,
    estaCargando,
    mensaje,
    limpiarMensaje,
  };
};
