// ============================================================================
// Service: Unidades
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { Unidad } from '../types';

export class UnidadesService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Obtener todas las unidades de medida
   */
  async getUnidades(): Promise<{ data: Unidad[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('unidades')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching unidades:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching unidades:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener una unidad por ID
   */
  async getUnidadById(
    unidadId: number
  ): Promise<{ data: Unidad | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('unidades')
        .select('id, nombre, simbolo, tipo')
        .eq('id', unidadId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}
