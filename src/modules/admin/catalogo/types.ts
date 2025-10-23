export interface FoodRecord {
  id: number;
  nombre: string;
  categoria: string;
}

export interface CatalogStats {
  totalAlimentos: number;
  totalCategorias: number;
}

export interface CatalogFilters {
  search: string;
  category: string;
}

export interface FoodFormValues {
  nombre: string;
  categoria: string;
  categoriaPersonalizada?: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: unknown;
}
