/**
 * @fileoverview Tipos específicos para el módulo de inventario del operador.
 * Optimizado para las tareas específicas del rol operador.
 */

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type StockLevelFilter = 'todos' | 'bajo' | 'normal' | 'alto';
export type StockLevel = Exclude<StockLevelFilter, 'todos'>;

export type InventoryActionType = 'ingreso' | 'egreso' | 'ajuste' | 'baja';

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
  dias_para_vencer?: number; // Calculado
  estado_caducidad?: 'vigente' | 'proximo' | 'vencido'; // Para operador
}

export interface InventarioItem {
  id_inventario: string;
  id_deposito: string;
  id_producto: string;
  cantidad_disponible: number;
  fecha_actualizacion: string | null;
  deposito: Deposito;
  producto: ProductoInventario;
  necesita_atencion?: boolean; // Para alertas del operador
  stock_status?: StockLevel; // Estado calculado
}

// Tipos específicos para operaciones de operador
export interface MovimientoInventario {
  id_movimiento: string;
  fecha_movimiento: string;
  tipo_transaccion: InventoryActionType;
  cantidad: number;
  producto: ProductoInventario;
  deposito: Deposito;
  observaciones?: string;
}

export interface AjusteInventario {
  id_inventario: string;
  cantidad_anterior: number;
  cantidad_nueva: number;
  motivo: string;
  observaciones?: string;
}

export interface AlertaInventario {
  tipo: 'stock_bajo' | 'proximo_vencer' | 'vencido';
  producto: ProductoInventario;
  cantidad_actual: number;
  deposito: Deposito;
  prioridad: 'alta' | 'media' | 'baja';
}

// Supabase related types
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
  productos: SupabaseProductoRelation | SupabaseProductoRelation[]; // Alias usado en la consulta
}

export interface OperadorInventarioFilters {
  search: string;
  depositoId: string;
  stockLevel: StockLevelFilter;
  alertasOnly: boolean; // Filtro específico para operador
  proximosVencer: boolean; // Filtro específico para operador
}

export interface OperadorInventarioStats {
  totalProductos: number;
  stockBajo: number;
  stockNormal: number;
  stockAlto: number;
  totalUnidades: number;
  productosProximosVencer: number; // Específico para operador
  productosVencidos: number; // Específico para operador
  alertasActivas: number; // Específico para operador
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: unknown;
}

// Constantes específicas del operador
export const STOCK_LEVELS = {
  BAJO: 10,     // Menos de 10 unidades
  NORMAL: 50,   // Entre 10 y 50 unidades  
  ALTO: 50      // Más de 50 unidades
} as const;

export const DAYS_TO_EXPIRE = {
  PROXIMO: 30,  // Próximo a vencer en 30 días
  CRITICO: 7    // Crítico en 7 días
} as const;