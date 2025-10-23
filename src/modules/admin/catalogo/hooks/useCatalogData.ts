import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createCatalogService } from '../services/catalogService';
import type { CatalogFilters, CatalogStats, FoodFormValues, FoodRecord } from '../types';

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
  const uniqueCategories = new Set(foods.map(food => food.categoria.trim().toLowerCase()));
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
      : food.categoria.toLowerCase() === filters.category.toLowerCase();

    return matchesSearch && matchesCategory;
  });
};

export const useCatalogData = (supabaseClient: SupabaseClient) => {
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    void loadFoods();
  }, [loadFoods]);

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

  const deleteFood = useCallback(async (foodId: number) => {
    const result = await service.deleteFood(foodId);
    if (result.success) {
      await loadFoods();
    }
    return result;
  }, [service, loadFoods]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(foods.map(food => food.categoria.trim())));
    const combined = new Set([...NORMALIZED_CATEGORIES, ...dynamicCategories]);
    return ['todos', ...Array.from(combined)];
  }, [foods]);

  return {
    foods,
    filteredFoods,
    stats,
    filters,
    categories,
    loading,
    error,
    setSearch,
    setCategory,
    resetFilters,
    createFood,
    updateFood,
    deleteFood
  };
};
