/**
 * Hook para manejo de verificación de email
 */

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { createAuthService } from '../services/authService';
import type { MensajeAuth } from '../types';
import { AUTH_CONSTANTS } from '../constants';

export const useVerifyEmail = () => {
  const { supabase } = useSupabase();
  const authService = createAuthService(supabase);

  const [estaCargando, setEstaCargando] = useState(true);
  const [mensaje, setMensaje] = useState<MensajeAuth | null>(null);
  const [emailVerificado, setEmailVerificado] = useState(false);

  useEffect(() => {
    const verificarEmail = async () => {
      try {
        const sesion = await authService.verificarSesion();
        
        if (sesion.user?.email_confirmed_at) {
          setEmailVerificado(true);
          setMensaje({
            tipo: 'exito',
            texto: AUTH_CONSTANTS.MENSAJES.VERIFICACION_EXITOSA,
          });
          
          // Actualizar estado en la tabla usuarios
          if (sesion.user.id) {
            await authService.actualizarVerificacionEmail(sesion.user.id);
          }
        } else {
          setMensaje({
            tipo: 'error',
            texto: AUTH_CONSTANTS.MENSAJES.ENLACE_INVALIDO,
          });
        }
      } catch (error) {
        setMensaje({
          tipo: 'error',
          texto: AUTH_CONSTANTS.MENSAJES.ERROR_INESPERADO,
        });
      } finally {
        setEstaCargando(false);
      }
    };

    verificarEmail();
  }, []);

  const reenviarEmail = async (email: string) => {
    setEstaCargando(true);
    setMensaje(null);

    const resultado = await authService.reenviarVerificacion(email);

    if (resultado.success) {
      setMensaje({
        tipo: 'exito',
        texto: resultado.mensaje || 'Email reenviado exitosamente',
      });
    } else {
      setMensaje({
        tipo: 'error',
        texto: resultado.error || 'Error al reenviar email',
      });
    }

    setEstaCargando(false);
    return resultado;
  };

  const limpiarMensaje = () => setMensaje(null);

  return {
    estaCargando,
    mensaje,
    emailVerificado,
    reenviarEmail,
    limpiarMensaje,
  };
};
