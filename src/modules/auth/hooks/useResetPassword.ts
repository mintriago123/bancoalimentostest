/**
 * Hook para manejo de restablecimiento de contraseña
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { createAuthService } from '../services/authService';
import { validarDatosRestablecimiento } from '../utils/validation';
import type { DatosRestablecimiento, MensajeAuth } from '../types';
import { AUTH_CONSTANTS } from '../constants';

export const useResetPassword = () => {
  const router = useRouter();
  const { supabase } = useSupabase();
  const authService = createAuthService(supabase);

  const [estaCargando, setEstaCargando] = useState(false);
  const [mensaje, setMensaje] = useState<MensajeAuth | null>(null);
  const [sesionValida, setSesionValida] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const sesion = await authService.verificarSesion();
      if (!sesion.session) {
        setMensaje({
          tipo: 'error',
          texto: AUTH_CONSTANTS.MENSAJES.ENLACE_INVALIDO,
        });
        setSesionValida(false);
      } else {
        setSesionValida(true);
      }
      setVerificandoSesion(false);
    };

    verificarSesion();
  }, []);

  const restablecerContrasena = async (datos: DatosRestablecimiento) => {
    setEstaCargando(true);
    setMensaje(null);

    // Validar datos
    const validacion = validarDatosRestablecimiento(datos);
    if (!validacion.valido) {
      setMensaje({
        tipo: 'error',
        texto: validacion.error || 'Datos inválidos',
      });
      setEstaCargando(false);
      return { success: false, error: validacion.error };
    }

    const resultado = await authService.restablecerContrasena(datos);

    if (resultado.success) {
      setMensaje({
        tipo: 'exito',
        texto: resultado.mensaje || AUTH_CONSTANTS.MENSAJES.PASSWORD_ACTUALIZADO,
      });
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(AUTH_CONSTANTS.RUTAS.INICIAR_SESION);
      }, 2000);
    } else {
      setMensaje({
        tipo: 'error',
        texto: resultado.error || 'Error al restablecer contraseña',
      });
    }

    setEstaCargando(false);
    return resultado;
  };

  const limpiarMensaje = () => setMensaje(null);

  return {
    restablecerContrasena,
    estaCargando,
    mensaje,
    sesionValida,
    verificandoSesion,
    limpiarMensaje,
  };
};
