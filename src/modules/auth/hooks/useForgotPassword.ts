/**
 * Hook para manejo de recuperación de contraseña
 */

import { useState } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { createAuthService } from '../services/authService';
import { validarEmail } from '../utils/validation';
import type { DatosRecuperacion, MensajeAuth } from '../types';

export const useForgotPassword = () => {
  const { supabase } = useSupabase();
  const authService = createAuthService(supabase);

  const [estaCargando, setEstaCargando] = useState(false);
  const [mensaje, setMensaje] = useState<MensajeAuth | null>(null);

  const enviarRecuperacion = async (datos: DatosRecuperacion) => {
    setEstaCargando(true);
    setMensaje(null);

    // Validar email
    const validacion = validarEmail(datos.email);
    if (!validacion.valido) {
      setMensaje({
        tipo: 'error',
        texto: validacion.error || 'Email inválido',
      });
      setEstaCargando(false);
      return { success: false, error: validacion.error };
    }

    const redirectUrl = `${window.location.origin}/auth/restablecer-contrasena`;
    const resultado = await authService.recuperarContrasena(datos, redirectUrl);

    if (resultado.success) {
      setMensaje({
        tipo: 'exito',
        texto: resultado.mensaje || 'Email enviado exitosamente',
      });
    } else {
      setMensaje({
        tipo: 'error',
        texto: resultado.error || 'Error al enviar email',
      });
    }

    setEstaCargando(false);
    return resultado;
  };

  const limpiarMensaje = () => setMensaje(null);

  return {
    enviarRecuperacion,
    estaCargando,
    mensaje,
    limpiarMensaje,
  };
};
