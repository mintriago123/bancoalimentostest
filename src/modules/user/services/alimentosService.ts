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
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching alimentos:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching alimentos:', error);
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

  /**
   * Obtener categorías únicas solo de productos con stock disponible
   */
  async getCategoriasConStock(): Promise<{ data: string[] | null; error: any }> {
    try {
      // Primero obtener productos con stock
      const { data: inventarioData, error: inventarioError } = await this.supabase
        .from('inventario')
        .select('id_producto')
        .gt('cantidad_disponible', 0);

      if (inventarioError) {
        console.error('Error fetching inventario for categories:', inventarioError);
        return { data: [], error: inventarioError };
      }

      if (!inventarioData || inventarioData.length === 0) {
        console.log('No hay productos con stock para categorías');
        return { data: [], error: null };
      }

      const productosConStock = inventarioData.map(item => item.id_producto);

      // Obtener alimento_id de esos productos
      const { data: productosData, error: productosError } = await this.supabase
        .from('productos_donados')
        .select('alimento_id')
        .in('id_producto', productosConStock)
        .not('alimento_id', 'is', null);

      if (productosError) {
        console.error('Error fetching productos for categories:', productosError);
        return { data: [], error: productosError };
      }

      if (!productosData || productosData.length === 0) {
        console.log('No hay productos vinculados para categorías');
        return { data: [], error: null };
      }

      const alimentoIds = [...new Set(productosData.map(p => p.alimento_id).filter(Boolean))];

      if (alimentoIds.length === 0) {
        return { data: [], error: null };
      }

      // Obtener categorías de esos alimentos
      const { data: alimentosData, error: alimentosError } = await this.supabase
        .from('alimentos')
        .select('categoria')
        .in('id', alimentoIds);

      if (alimentosError) {
        console.error('Error fetching categories:', alimentosError);
        return { data: [], error: alimentosError };
      }

      if (!alimentosData || alimentosData.length === 0) {
        return { data: [], error: null };
      }

      const categorias = [...new Set(alimentosData.map(a => a.categoria))].sort();
      console.log('Categorías con stock:', categorias);

      return { data: categorias, error: null };
    } catch (error) {
      console.error('Exception in getCategoriasConStock:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener alimentos que tienen stock disponible
   */
  async getAlimentosConStock(): Promise<{ data: Alimento[] | null; error: any }> {
    try {
      // Paso 1: Obtener productos con stock
      const { data: inventarioData, error: inventarioError } = await this.supabase
        .from('inventario')
        .select('id_producto')
        .gt('cantidad_disponible', 0);

      if (inventarioError) {
        console.error('Error fetching inventario:', inventarioError);
        return { data: [], error: inventarioError };
      }

      if (!inventarioData || inventarioData.length === 0) {
        console.log('No hay productos con stock disponible');
        return { data: [], error: null };
      }

      const productosConStock = inventarioData.map(item => item.id_producto);
      console.log('Productos con stock:', productosConStock);

      // Paso 2: Obtener alimento_id de esos productos
      const { data: productosData, error: productosError } = await this.supabase
        .from('productos_donados')
        .select('alimento_id')
        .in('id_producto', productosConStock)
        .not('alimento_id', 'is', null);

      if (productosError) {
        console.error('Error fetching productos_donados:', productosError);
        return { data: [], error: productosError };
      }

      if (!productosData || productosData.length === 0) {
        console.log('No se encontraron alimentos vinculados');
        return { data: [], error: null };
      }

      const alimentoIds = [...new Set(productosData.map(p => p.alimento_id).filter(Boolean))];
      console.log('IDs de alimentos con stock:', alimentoIds);

      if (alimentoIds.length === 0) {
        return { data: [], error: null };
      }

      // Paso 3: Obtener detalles de los alimentos
      const { data: alimentosData, error: alimentosError } = await this.supabase
        .from('alimentos')
        .select('*')
        .in('id', alimentoIds)
        .order('nombre', { ascending: true });

      if (alimentosError) {
        console.error('Error fetching alimentos:', alimentosError);
        return { data: [], error: alimentosError };
      }

      console.log('Alimentos encontrados:', alimentosData?.length || 0);
      return { data: alimentosData || [], error: null };
    } catch (error) {
      console.error('Exception in getAlimentosConStock:', error);
      return { data: null, error };
    }
  }
}
