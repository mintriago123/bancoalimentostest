import type { SupabaseClient } from '@supabase/supabase-js';
import type { FoodRecord, FoodFormValues, ServiceResult, UnidadAlimento } from '../types';

const normalizeFood = (row: any): FoodRecord => ({
  id: row.id,
  nombre: row.nombre,
  categoria: row.categoria,
  unidades: row.unidades || []
});

export const createCatalogService = (supabaseClient: SupabaseClient) => {
  const fetchFoods = async (): Promise<ServiceResult<FoodRecord[]>> => {
    try {
      // Primero obtener los alimentos
      const { data: alimentosData, error: alimentosError } = await supabaseClient
        .from('alimentos')
        .select('id, nombre, categoria')
        .order('nombre', { ascending: true });

      if (alimentosError) {
        return {
          success: false,
          error: 'No fue posible cargar los alimentos',
          errorDetails: alimentosError
        };
      }

      // Luego obtener las unidades asociadas a cada alimento
      const alimentosConUnidades = await Promise.all(
        (alimentosData ?? []).map(async (alimento) => {
          const { data: unidadesData, error: unidadesError } = await supabaseClient
            .rpc('obtener_unidades_alimento', { p_alimento_id: alimento.id });

          if (unidadesError) {
            console.error(`Error al cargar unidades para alimento ${alimento.id}:`, unidadesError);
          }

          return {
            ...alimento,
            unidades: (unidadesData ?? []) as UnidadAlimento[]
          };
        })
      );

      return {
        success: true,
        data: alimentosConUnidades.map(normalizeFood)
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

      // Validar que se hayan seleccionado unidades
      if (!values.unidades_ids || values.unidades_ids.length === 0) {
        return {
          success: false,
          error: 'Debes seleccionar al menos una unidad de medida'
        };
      }

      // Insertar el alimento
      const { data: alimentoData, error: alimentoError } = await supabaseClient
        .from('alimentos')
        .insert({
          nombre: values.nombre.trim(),
          categoria: categoriaFinal
        })
        .select()
        .single();

      if (alimentoError || !alimentoData) {
        return {
          success: false,
          error: 'No fue posible registrar el alimento',
          errorDetails: alimentoError
        };
      }

      // Insertar las relaciones con las unidades
      const unidadesRelaciones = values.unidades_ids.map(unidadId => ({
        alimento_id: alimentoData.id,
        unidad_id: unidadId,
        es_unidad_principal: values.unidad_principal_id === unidadId
      }));

      const { error: unidadesError } = await supabaseClient
        .from('alimentos_unidades')
        .insert(unidadesRelaciones);

      if (unidadesError) {
        // Si falla, intentar eliminar el alimento creado
        await supabaseClient.from('alimentos').delete().eq('id', alimentoData.id);
        return {
          success: false,
          error: 'No fue posible asociar las unidades al alimento',
          errorDetails: unidadesError
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

      // Validar que se hayan seleccionado unidades
      if (!values.unidades_ids || values.unidades_ids.length === 0) {
        return {
          success: false,
          error: 'Debes seleccionar al menos una unidad de medida'
        };
      }

      // Actualizar el alimento
      const { error: alimentoError } = await supabaseClient
        .from('alimentos')
        .update({
          nombre: values.nombre.trim(),
          categoria: categoriaFinal
        })
        .eq('id', foodId);

      if (alimentoError) {
        return {
          success: false,
          error: 'No fue posible actualizar el alimento',
          errorDetails: alimentoError
        };
      }

      // Eliminar las relaciones existentes
      const { error: deleteError } = await supabaseClient
        .from('alimentos_unidades')
        .delete()
        .eq('alimento_id', foodId);

      if (deleteError) {
        return {
          success: false,
          error: 'Error al actualizar las unidades',
          errorDetails: deleteError
        };
      }

      // Insertar las nuevas relaciones
      const unidadesRelaciones = values.unidades_ids.map(unidadId => ({
        alimento_id: foodId,
        unidad_id: unidadId,
        es_unidad_principal: values.unidad_principal_id === unidadId
      }));

      const { error: insertError } = await supabaseClient
        .from('alimentos_unidades')
        .insert(unidadesRelaciones);

      if (insertError) {
        return {
          success: false,
          error: 'Error al asociar las nuevas unidades',
          errorDetails: insertError
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
