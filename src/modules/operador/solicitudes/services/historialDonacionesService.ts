/**
 * @fileoverview Servicio para obtener el historial de donaciones de una solicitud.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface HistorialDonacion {
  id: string;
  solicitud_id: string;
  cantidad_entregada: number;
  porcentaje_entregado: number;
  cantidad_solicitada: number;
  operador_id: string | null;
  comentario: string | null;
  created_at: string;
  operador?: {
    nombre: string;
    rol: string;
  };
}

export const obtenerHistorialDonaciones = async (
  supabase: SupabaseClient,
  solicitudId: string
): Promise<HistorialDonacion[]> => {
  try {
    const { data, error } = await supabase
      .from('historial_donaciones')
      .select(`
        *,
        operador:usuarios!operador_id(nombre, rol)
      `)
      .eq('solicitud_id', solicitudId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo historial de donaciones:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Excepción al obtener historial de donaciones:', err);
    return [];
  }
};
