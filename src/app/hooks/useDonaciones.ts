import { useState, useCallback } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';

interface Donacion {
  id: number;
  user_id: string;
  nombre_donante: string;
  ruc_donante?: string;
  cedula_donante?: string;
  direccion_donante_completa?: string;
  telefono: string;
  email: string;
  representante_donante?: string;
  tipo_persona_donante?: string;
  alimento_id?: number;
  tipo_producto: string;
  categoria_comida: string;
  es_producto_personalizado: boolean;
  cantidad: number;
  unidad_id: number;
  unidad_nombre: string;
  unidad_simbolo: string;
  fecha_vencimiento?: string;
  fecha_disponible: string;
  direccion_entrega: string;
  horario_preferido?: string;
  observaciones?: string;
  impacto_estimado_personas?: number;
  impacto_equivalente?: string;
  estado: 'Pendiente' | 'Recogida' | 'Entregada' | 'Cancelada';
  creado_en: string;
  actualizado_en: string;
}

interface UseDonacionesReturn {
  donaciones: Donacion[];
  cargando: boolean;
  mensaje: string;
  cargarDonaciones: () => Promise<void>;
  eliminarDonacion: (id: number) => Promise<boolean>;
  actualizarDonacion: (donacion: Donacion) => Promise<boolean>;
  setMensaje: (mensaje: string) => void;
  limpiarMensaje: () => void;
}

export function useDonaciones(
  supabase: SupabaseClient | null,
  user: User | null | undefined
): UseDonacionesReturn {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const limpiarMensaje = useCallback(() => {
    setMensaje('');
  }, []);

  const cargarDonaciones = useCallback(async () => {
    if (!supabase || !user?.id) {
      console.log('No hay usuario autenticado o cliente de Supabase');
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      
      console.log('Cargando donaciones para usuario:', user.id);
      
      const { data, error } = await supabase
        .from('donaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error en query:', error);
        throw error;
      }
      
      console.log('Donaciones cargadas:', data?.length || 0);
      setDonaciones(data || []);
    } catch (error) {
      console.error('Error al cargar donaciones:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje(`Error al cargar las donaciones: ${errorMessage}`);
      setTimeout(() => setMensaje(''), 3000);
    } finally {
      setCargando(false);
    }
  }, [supabase, user]);

  const eliminarDonacion = async (id: number): Promise<boolean> => {
    if (!supabase || !user?.id) {
      setMensaje('Usuario no autenticado.');
      return false;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta donación?')) {
      return false;
    }
    
    console.log('Intentando eliminar donación:', { id, userId: user.id });
    
    try {
      // Verificar que la donación pertenece al usuario
      const { data: donacionExistente, error: errorVerificar } = await supabase
        .from('donaciones')
        .select('id, user_id, estado')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (errorVerificar) {
        console.error('Error al verificar donación:', errorVerificar);
        setMensaje('Error al verificar la donación.');
        return false;
      }

      if (!donacionExistente) {
        setMensaje('No tienes permiso para eliminar esta donación.');
        return false;
      }

      if (donacionExistente.estado !== 'Pendiente') {
        setMensaje('Solo se pueden eliminar donaciones pendientes.');
        return false;
      }

      // Proceder con la eliminación
      const { error } = await supabase
        .from('donaciones')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error en delete:', error);
        throw error;
      }

      console.log('Donación eliminada exitosamente');
      await cargarDonaciones();
      setMensaje('Donación eliminada con éxito.');
      setTimeout(() => setMensaje(''), 2000);
      return true;
    } catch (error) {
      console.error('Error al eliminar donación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje(`Error al eliminar la donación: ${errorMessage}`);
      setTimeout(() => setMensaje(''), 3000);
      return false;
    }
  };

  const actualizarDonacion = async (donacion: Donacion): Promise<boolean> => {
    if (!supabase || !user?.id) {
      setMensaje('Usuario no autenticado.');
      return false;
    }

    console.log('Intentando actualizar donación:', { 
      id: donacion.id, 
      userId: user.id,
      estado: donacion.estado 
    });

    try {
      // Verificar que la donación está pendiente
      if (donacion.estado !== 'Pendiente') {
        setMensaje('Solo se pueden editar donaciones pendientes.');
        return false;
      }

      const { data, error } = await supabase
        .from('donaciones')
        .update({
          tipo_producto: donacion.tipo_producto,
          categoria_comida: donacion.categoria_comida,
          cantidad: donacion.cantidad,
          fecha_disponible: donacion.fecha_disponible,
          direccion_entrega: donacion.direccion_entrega,
          horario_preferido: donacion.horario_preferido,
          observaciones: donacion.observaciones,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', donacion.id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error en update:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Donación actualizada exitosamente:', data[0]);
        setDonaciones(donaciones.map(d => d.id === donacion.id ? data[0] : d));
        setMensaje('Donación actualizada con éxito.');
      } else {
        console.log('No se retornaron datos después de la actualización');
        await cargarDonaciones();
        setMensaje('Donación actualizada.');
      }
      
      setTimeout(() => setMensaje(''), 3000);
      return true;
    } catch (error) {
      console.error('Error al actualizar la donación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje(`Error al actualizar la donación: ${errorMessage}`);
      setTimeout(() => setMensaje(''), 3000);
      return false;
    }
  };

  return {
    donaciones,
    cargando,
    mensaje,
    cargarDonaciones,
    eliminarDonacion,
    actualizarDonacion,
    setMensaje,
    limpiarMensaje,
  };
}
