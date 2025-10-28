// ============================================================================
// Service: Alimentos
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { Alimento } from '../types';

export class AlimentosService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Obtener todos los alimentos disponibles
   */
  async getAlimentos(): Promise<{ data: Alimento[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('alimentos')
        .select('id, nombre, categoria, descripcion')
        .order('nombre');

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obtener un alimento por ID
   */
  async getAlimentoById(
    alimentoId: number
  ): Promise<{ data: Alimento | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('alimentos')
        .select('id, nombre, categoria, descripcion')
        .eq('id', alimentoId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obtener categorías únicas de alimentos
   */
  async getCategorias(): Promise<{ data: string[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('alimentos')
        .select('categoria');

      if (error || !data) {
        return { data: null, error };
      }

      const categorias = [...new Set(data.map((item) => item.categoria))].sort();
      return { data: categorias, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
