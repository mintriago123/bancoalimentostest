/**
 * @fileoverview Tipos compartidos para el módulo de reportes de inventario.
 */

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type StockLevelFilter = 'todos' | 'bajo' | 'normal' | 'alto';
export type StockLevel = Exclude<StockLevelFilter, 'todos'>;

export interface Deposito {
  id_deposito: string;
  nombre: string;
  descripcion: string | null;
}

export interface ProductoInventario {
  id_producto: string;
  nombre_producto: string;
  descripcion: string | null;
  unidad_medida: string | null;
  fecha_caducidad: string | null;
  fecha_donacion: string | null;
}

export interface InventarioItem {
  id_inventario: string;
  id_deposito: string;
  id_producto: string;
  cantidad_disponible: number;
  fecha_actualizacion: string | null;
  deposito: Deposito;
  producto: ProductoInventario;
}

export type SupabaseDepositoRelation = {
  id_deposito?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
} | null;

export type SupabaseProductoRelation = {
  id_producto?: string | null;
  nombre_producto?: string | null;
  descripcion?: string | null;
  unidad_medida?: string | null;
  fecha_caducidad?: string | null;
  fecha_donacion?: string | null;
} | null;

export interface SupabaseInventarioRow {
  id_inventario: string;
  id_deposito: string;
  id_producto: string;
  cantidad_disponible: number | null;
  fecha_actualizacion: string | null;
  depositos: SupabaseDepositoRelation | SupabaseDepositoRelation[];
  productos: SupabaseProductoRelation | SupabaseProductoRelation[];
}

export interface InventarioFilters {
  search: string;
  depositoId: string;
  stockLevel: StockLevelFilter;
}

export interface InventarioStats {
  totalProductos: number;
  stockBajo: number;
  stockNormal: number;
  stockAlto: number;
  totalUnidades: number;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: unknown;
}
