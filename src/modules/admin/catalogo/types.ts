export interface Unidad {
  id: number;
  nombre: string;
  simbolo: string;
  tipo_magnitud_id: number;
  tipo_magnitud_nombre?: string;
  es_base: boolean;
}

export interface UnidadAlimento {
  unidad_id: number;
  nombre: string;
  simbolo: string;
  tipo_magnitud_id: number;
  tipo_magnitud_nombre: string;
  es_base: boolean;
  es_principal: boolean;
}

export interface FoodRecord {
  id: number;
  nombre: string;
  categoria: string;
  unidades?: UnidadAlimento[];
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
  unidades_ids: number[];
  unidad_principal_id?: number;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: unknown;
}
