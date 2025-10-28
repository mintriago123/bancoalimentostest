import { SupabaseClient } from '@supabase/supabase-js';
import { Donacion } from '../types';

export class DonacionesService {
  constructor(private supabase: SupabaseClient) {}

  async obtenerDonaciones(userId: string): Promise<Donacion[]> {
    const { data, error } = await this.supabase
      .from('donaciones')
      .select(`
        *,
        unidades:unidad_id (
          nombre,
          simbolo
        )
      `)
      .eq('user_id', userId)
      .order('creado_en', { ascending: false });

    if (error) {
      throw new Error(`Error al cargar donaciones: ${error.message}`);
    }

    return (data || []).map((donacion: any) => ({
      ...donacion,
      unidad_nombre: donacion.unidades?.nombre || '',
      unidad_simbolo: donacion.unidades?.simbolo || '',
    }));
  }

  async eliminarDonacion(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('donaciones')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar donación: ${error.message}`);
    }
  }

  async actualizarDonacion(donacion: Donacion): Promise<void> {
    const { error } = await this.supabase
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
      .eq('id', donacion.id);

    if (error) {
      throw new Error(`Error al actualizar donación: ${error.message}`);
    }
  }
}
