import { useState, useCallback } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { DonacionesService } from '../services/donacionesService';
import { Donacion } from '../types';

export function useDonacionesData(supabase: SupabaseClient, user: User | null) {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const service = new DonacionesService(supabase);

  const cargarDonaciones = useCallback(async () => {
    if (!user) return;

    setCargando(true);
    setMensaje('');
    
    try {
      const data = await service.obtenerDonaciones(user.id);
      setDonaciones(data);
    } catch (error: any) {
      setMensaje(error.message || 'Error al cargar donaciones');
      console.error('Error al cargar donaciones:', error);
    } finally {
      setCargando(false);
    }
  }, [user]);

  const eliminarDonacion = useCallback(async (id: number): Promise<boolean> => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta donación?')) {
      return false;
    }

    try {
      await service.eliminarDonacion(id);
      setDonaciones(prev => prev.filter(d => d.id !== id));
      setMensaje('Donación eliminada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
      return true;
    } catch (error: any) {
      setMensaje(error.message || 'Error al eliminar donación');
      console.error('Error al eliminar:', error);
      return false;
    }
  }, []);

  const actualizarDonacion = useCallback(async (donacion: Donacion): Promise<boolean> => {
    try {
      await service.actualizarDonacion(donacion);
      setDonaciones(prev =>
        prev.map(d => (d.id === donacion.id ? donacion : d))
      );
      setMensaje('Donación actualizada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
      return true;
    } catch (error: any) {
      setMensaje(error.message || 'Error al actualizar donación');
      console.error('Error al actualizar:', error);
      return false;
    }
  }, []);

  return {
    donaciones,
    cargando,
    mensaje,
    cargarDonaciones,
    eliminarDonacion,
    actualizarDonacion,
  };
}
