/**
 * Hook para manejo de registro de usuarios
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { createAuthService } from '../services/authService';
import { validarDatosRegistro } from '../utils/validation';
import type { DatosRegistro, MensajeAuth } from '../types';
import { AUTH_CONSTANTS } from '../constants';

export const useRegister = () => {
  const router = useRouter();
  const { supabase } = useSupabase();
  const authService = createAuthService(supabase);

  const [estaCargando, setEstaCargando] = useState(false);
  const [mensaje, setMensaje] = useState<MensajeAuth | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const registrar = async (datos: DatosRegistro) => {
    setEstaCargando(true);
    setMensaje(null);

    // Validar datos antes de enviar
    const validacion = validarDatosRegistro(datos);
    if (!validacion.valido) {
      setMensaje({
        tipo: 'error',
        texto: validacion.error || 'Datos inválidos',
      });
      setEstaCargando(false);
      return { success: false, error: validacion.error };
    }

    const resultado = await authService.registrar(datos);

    if (resultado.success) {
      setRegistroExitoso(true);
      setMensaje({
        tipo: 'exito',
        texto: resultado.mensaje || AUTH_CONSTANTS.MENSAJES.EMAIL_VERIFICACION_ENVIADO,
      });
    } else {
      setMensaje({
        tipo: 'error',
        texto: resultado.error || 'Error al registrar usuario',
      });
    }

    setEstaCargando(false);
    return resultado;
  };

  const irALogin = () => {
    router.push(AUTH_CONSTANTS.RUTAS.INICIAR_SESION);
  };

  const limpiarMensaje = () => setMensaje(null);

  return {
    registrar,
    estaCargando,
    mensaje,
    registroExitoso,
    irALogin,
    limpiarMensaje,
  };
};
