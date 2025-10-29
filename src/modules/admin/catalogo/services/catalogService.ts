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
      // Si la categoría es "personalizada", usar categoriaPersonalizada
      // De lo contrario, usar la categoría seleccionada
      const categoriaFinal = values.categoria === 'personalizada'
        ? values.categoriaPersonalizada?.trim()
        : values.categoria?.trim();

      // Validar que se haya proporcionado una categoría
      if (!categoriaFinal) {
        return {
          success: false,
          error: 'Debes proporcionar una categoría para el alimento'
        };
      }

      const { error } = await supabaseClient.from('alimentos').insert({
        nombre: values.nombre.trim(),
        categoria: categoriaFinal
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
      // Si la categoría es "personalizada", usar categoriaPersonalizada
      // De lo contrario, usar la categoría seleccionada
      const categoriaFinal = values.categoria === 'personalizada'
        ? values.categoriaPersonalizada?.trim()
        : values.categoria?.trim();

      // Validar que se haya proporcionado una categoría
      if (!categoriaFinal) {
        return {
          success: false,
          error: 'Debes proporcionar una categoría para el alimento'
        };
      }

      const { error } = await supabaseClient
        .from('alimentos')
        .update({
          nombre: values.nombre.trim(),
          categoria: categoriaFinal
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

  const checkFoodUsage = async (foodId: number): Promise<ServiceResult<{ totalDonaciones: number; totalProductos: number }>> => {
    try {
      const [donacionesResult, productosResult] = await Promise.all([
        supabaseClient
          .from('donaciones')
          .select('id', { count: 'exact', head: true })
          .eq('alimento_id', foodId),
        supabaseClient
          .from('productos_donados')
          .select('id_producto', { count: 'exact', head: true })
          .eq('alimento_id', foodId)
      ]);

      return {
        success: true,
        data: {
          totalDonaciones: donacionesResult.count || 0,
          totalProductos: productosResult.count || 0
        }
      };
    } catch (err) {
      return {
        success: false,
        error: 'Error al verificar el uso del alimento',
        errorDetails: err
      };
    }
  };

  const deleteFood = async (foodId: number, cascade: boolean = false): Promise<ServiceResult<void>> => {
    try {
      // Verificar si el alimento está siendo usado
      const usageResult = await checkFoodUsage(foodId);
      
      if (!usageResult.success || !usageResult.data) {
        return {
          success: false,
          error: usageResult.error || 'No se pudo verificar el uso del alimento'
        };
      }

      const { totalDonaciones, totalProductos } = usageResult.data;
      const totalReferencias = totalDonaciones + totalProductos;

      // Si está siendo usado y no se solicita cascade, retornar información
      if (totalReferencias > 0 && !cascade) {
        const mensajes = [];
        if (totalDonaciones > 0) {
          mensajes.push(`${totalDonaciones} donación${totalDonaciones > 1 ? 'es' : ''}`);
        }
        if (totalProductos > 0) {
          mensajes.push(`${totalProductos} producto${totalProductos > 1 ? 's' : ''} donado${totalProductos > 1 ? 's' : ''}`);
        }

        return {
          success: false,
          error: `Este alimento está siendo usado en ${mensajes.join(' y ')}`,
          errorDetails: { needsCascade: true, totalDonaciones, totalProductos }
        };
      }

      // Si cascade es true, eliminar primero las referencias
      if (cascade && totalReferencias > 0) {
        // Eliminar referencias en donaciones (establecer a NULL)
        if (totalDonaciones > 0) {
          const { error: donacionesError } = await supabaseClient
            .from('donaciones')
            .update({ alimento_id: null })
            .eq('alimento_id', foodId);

          if (donacionesError) {
            return {
              success: false,
              error: 'Error al desvincular las donaciones',
              errorDetails: donacionesError
            };
          }
        }

        // Eliminar referencias en productos_donados (establecer a NULL)
        if (totalProductos > 0) {
          const { error: productosError } = await supabaseClient
            .from('productos_donados')
            .update({ alimento_id: null })
            .eq('alimento_id', foodId);

          if (productosError) {
            return {
              success: false,
              error: 'Error al desvincular los productos donados',
              errorDetails: productosError
            };
          }
        }
      }

      // Eliminar el alimento
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
    deleteFood,
    checkFoodUsage
  };
};
