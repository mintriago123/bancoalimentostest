import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createCatalogService } from '../services/catalogService';
import type { CatalogFilters, CatalogStats, FoodFormValues, FoodRecord, Unidad } from '../types';

const DEFAULT_FILTERS: CatalogFilters = {
  search: '',
  category: 'todos'
};

const NORMALIZED_CATEGORIES = [
  'Granos y Cereales',
  'Legumbres',
  'Lácteos',
  'Carnes y Proteínas',
  'Frutas',
  'Verduras',
  'Aceites y Grasas',
  'Condimentos',
  'Bebidas',
  'Productos Enlatados',
  'Otros'
];

const computeStats = (foods: FoodRecord[]): CatalogStats => {
  const uniqueCategories = new Set(
    foods
      .filter(food => food.categoria)
      .map(food => food.categoria.trim().toLowerCase())
  );
  return {
    totalAlimentos: foods.length,
    totalCategorias: uniqueCategories.size
  };
};

const applyFilters = (foods: FoodRecord[], filters: CatalogFilters): FoodRecord[] => {
  const term = filters.search.trim().toLowerCase();

  return foods.filter(food => {
    const matchesSearch = term ? food.nombre.toLowerCase().includes(term) : true;
    const matchesCategory = filters.category === 'todos'
      ? true
      : food.categoria 
        ? food.categoria.toLowerCase() === filters.category.toLowerCase()
        : filters.category === 'Sin categoría';

    return matchesSearch && matchesCategory;
  });
};

export const useCatalogData = (supabaseClient: SupabaseClient) => {
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const service = useMemo(() => createCatalogService(supabaseClient), [supabaseClient]);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    const result = await service.fetchFoods();

    if (result.success && result.data) {
      setFoods(result.data);
    } else {
      setError(result.error ?? 'No fue posible cargar el catálogo');
    }

    setLoading(false);
  }, [service]);

  const loadUnidades = useCallback(async () => {
    setLoadingUnidades(true);
    try {
      const { data, error } = await supabaseClient
        .from('unidades')
        .select(`
          id, 
          nombre, 
          simbolo, 
          tipo_magnitud_id, 
          es_base,
          tipos_magnitud!inner(nombre)
        `)
        .order('tipo_magnitud_id', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error al cargar unidades:', error);
      } else {
        // Mapear para incluir tipo_magnitud_nombre
        const unidadesConTipo = (data || []).map(u => ({
          id: u.id,
          nombre: u.nombre,
          simbolo: u.simbolo,
          tipo_magnitud_id: u.tipo_magnitud_id,
          tipo_magnitud_nombre: (u.tipos_magnitud as any)?.nombre,
          es_base: u.es_base
        }));
        setUnidades(unidadesConTipo);
      }
    } catch (err) {
      console.error('Error inesperado al cargar unidades:', err);
    }
    setLoadingUnidades(false);
  }, [supabaseClient]);

  useEffect(() => {
    void loadFoods();
    void loadUnidades();
  }, [loadFoods, loadUnidades]);

  const stats = useMemo(() => computeStats(foods), [foods]);
  const filteredFoods = useMemo(() => applyFilters(foods, filters), [foods, filters]);

  const setSearch = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      category
    }));
  }, []);

  const createFood = useCallback(async (values: FoodFormValues) => {
    const result = await service.createFood(values);
    if (result.success) {
      await loadFoods();
    }
    return result;
  }, [service, loadFoods]);

  const updateFood = useCallback(async (foodId: number, values: FoodFormValues) => {
    const result = await service.updateFood(foodId, values);
    if (result.success) {
      await loadFoods();
    }
    return result;
  }, [service, loadFoods]);

  const deleteFood = useCallback(async (foodId: number, cascade: boolean = false) => {
    const result = await service.deleteFood(foodId, cascade);
    if (result.success) {
      await loadFoods();
    }
    return result;
  }, [service, loadFoods]);

  const checkFoodUsage = useCallback(async (foodId: number) => {
    return await service.checkFoodUsage(foodId);
  }, [service]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        foods
          .filter(food => food.categoria)
          .map(food => food.categoria.trim())
      )
    );
    const combined = new Set([...NORMALIZED_CATEGORIES, ...dynamicCategories]);
    
    // Verificar si hay alimentos sin categoría
    const hasFoodWithoutCategory = foods.some(food => !food.categoria);
    const categoriesArray = ['todos', ...Array.from(combined)];
    
    if (hasFoodWithoutCategory) {
      categoriesArray.push('Sin categoría');
    }
    
    return categoriesArray;
  }, [foods]);

  const categoriesWithCount = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    
    // Contar alimentos por categoría (solo las que tienen alimentos)
    foods.forEach(food => {
      if (food.categoria) {
        const cat = food.categoria.trim();
        categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
      }
    });

    // Convertir a array de objetos, solo incluir categorías que tienen alimentos
    return Array.from(categoryCounts.entries())
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad
      }))
      .filter(cat => cat.cantidad > 0);
  }, [foods]);

  const deleteCategory = useCallback(async (categoryName: string) => {
    try {
      // Si la categoría es "Sin categoría", no hacer nada
      if (categoryName === 'Sin categoría') {
        return {
          success: false,
          error: 'No se puede eliminar la categoría "Sin categoría"'
        };
      }

      // Eliminar todos los alimentos de esta categoría
      const { error } = await supabaseClient
        .from('alimentos')
        .delete()
        .eq('categoria', categoryName);

      if (error) {
        return {
          success: false,
          error: 'No fue posible eliminar la categoría y sus alimentos',
          errorDetails: error
        };
      }

      // Recargar los alimentos para actualizar la lista
      await loadFoods();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Error inesperado al eliminar la categoría',
        errorDetails: err
      };
    }
  }, [supabaseClient, loadFoods]);

  return {
    foods,
    filteredFoods,
    stats,
    filters,
    categories,
    categoriesWithCount,
    unidades,
    loading,
    loadingUnidades,
    error,
    setSearch,
    setCategory,
    resetFilters,
    createFood,
    updateFood,
    deleteFood,
    checkFoodUsage,
    deleteCategory
  };
};
