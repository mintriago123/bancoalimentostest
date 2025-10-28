import { useState, useCallback } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { NuevaDonacionService } from '../services/nuevaDonacionService';
import { DonacionFormulario } from '../../donaciones/types';
import { NuevoProducto, ProductoSeleccionado, ImpactoCalculado } from '../types';

interface UserProfile {
  nombre?: string;
  telefono?: string;
  email?: string;
  ruc?: string;
  cedula?: string;
  direccion?: string;
  tipo_persona?: string;
  representante?: string;
}

export function useNuevaDonacionSubmit(
  supabase: SupabaseClient,
  user: User | null,
  userProfile: UserProfile | null
) {
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const service = new NuevaDonacionService(supabase);

  const enviarDonacion = useCallback(
    async (
      formulario: DonacionFormulario,
      nuevoProducto: NuevoProducto,
      impacto: ImpactoCalculado,
      productoInfo: ProductoSeleccionado | null,
      unidadInfo: { id: number; nombre: string; simbolo: string } | null,
      alimentos: any[]
    ): Promise<boolean> => {
      if (!user) {
        setMensaje('Usuario no autenticado');
        return false;
      }

      setEnviando(true);
      setMensaje('');

      try {
        await service.crearDonacion(
          formulario,
          nuevoProducto,
          impacto,
          productoInfo,
          unidadInfo,
          alimentos,
          user.id,
          userProfile
        );

        setMensaje('¡Donación registrada exitosamente! Gracias por tu contribución.');
        setTimeout(() => setMensaje(''), 5000);
        return true;
      } catch (error: any) {
        setMensaje(error.message || 'Error al registrar la donación');
        console.error('Error al enviar donación:', error);
        return false;
      } finally {
        setEnviando(false);
      }
    },
    [user, userProfile]
  );

  const limpiarMensaje = useCallback(() => {
    setMensaje('');
  }, []);

  return {
    enviando,
    mensaje,
    enviarDonacion,
    limpiarMensaje,
  };
}
