import type { SupabaseClient } from '@supabase/supabase-js';
import type { FoodRecord, FoodFormValues, ServiceResult } from '../types';

const normalizeFood = (row: any): FoodRecord => ({
  id: row.id,
  nombre: row.nombre,
  categoria: row.categoria
});

export const createCatalogService = (supabaseClient: SupabaseClient) => {
  const fetchFoods = async (): Promise<ServiceResult<FoodRecord[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('alimentos')
        .select('id, nombre, categoria')
        .order('nombre', { ascending: true });

      if (error) {
        return {
          success: false,
          error: 'No fue posible cargar los alimentos',
          errorDetails: error
        };
      }

      return {
        success: true,
        data: (data ?? []).map(normalizeFood)
      };
    } catch (err) {
      return {
        success: false,
        error: 'Error inesperado al cargar los alimentos',
        errorDetails: err
      };
    }
  };

  const createFood = async (values: FoodFormValues): Promise<ServiceResult<void>> => {
    try {
      const needsCustom = values.categoria === 'personalizada' || values.categoria === 'Otros';
      const categoriaFinal = needsCustom
        ? values.categoriaPersonalizada?.trim()
        : values.categoria;

      const { error } = await supabaseClient.from('alimentos').insert({
        nombre: values.nombre.trim(),
        categoria: categoriaFinal?.trim() || 'Sin categoría'
      });

      if (error) {
        return {
          success: false,
          error: 'No fue posible registrar el alimento',
          errorDetails: error
        };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Error inesperado al registrar el alimento',
        errorDetails: err
      };
    }
  };

  const updateFood = async (foodId: number, values: FoodFormValues): Promise<ServiceResult<void>> => {
    try {
      const needsCustom = values.categoria === 'personalizada' || values.categoria === 'Otros';
      const categoriaFinal = needsCustom
        ? values.categoriaPersonalizada?.trim()
        : values.categoria;

      const { error } = await supabaseClient
        .from('alimentos')
        .update({
          nombre: values.nombre.trim(),
          categoria: categoriaFinal?.trim() || 'Sin categoría'
        })
        .eq('id', foodId);

      if (error) {
        return {
          success: false,
          error: 'No fue posible actualizar el alimento',
          errorDetails: error
        };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Error inesperado al actualizar el alimento',
        errorDetails: err
      };
    }
  };

  const deleteFood = async (foodId: number): Promise<ServiceResult<void>> => {
    try {
      const { error } = await supabaseClient
        .from('alimentos')
        .delete()
        .eq('id', foodId);

      if (error) {
        return {
          success: false,
          error: 'No fue posible eliminar el alimento',
          errorDetails: error
        };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Error inesperado al eliminar el alimento',
        errorDetails: err
      };
    }
  };

  return {
    fetchFoods,
    createFood,
    updateFood,
    deleteFood
  };
};
