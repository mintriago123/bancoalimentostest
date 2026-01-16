/**
 * @fileoverview Tipos compartidos para el módulo de reportes de donaciones.
 */

export type DonationEstado = 'Pendiente' | 'Recogida' | 'Entregada' | 'Cancelada';

export type DonationPersonType = 'Natural' | 'Juridica';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface DonationAlimento {
  nombre: string;
  categoria: string;
}

export interface Donation {
  id: number;
  user_id: string;
  nombre_donante: string;
  ruc_donante?: string;
  cedula_donante?: string;
  direccion_donante_completa?: string;
  telefono: string;
  email: string;
  representante_donante?: string;
  tipo_persona_donante: DonationPersonType;
  alimento_id?: number;
  tipo_producto: string;
  categoria_comida: string;
  es_producto_personalizado: boolean;
  cantidad: number;
  unidad_id: number;
  unidad_nombre: string;
  unidad_simbolo: string;
  fecha_vencimiento?: string | null;
  fecha_disponible: string;
  direccion_entrega: string;
  horario_preferido?: string | null;
  observaciones?: string | null;
  impacto_estimado_personas?: number | null;
  impacto_equivalente?: string | null;
  estado: DonationEstado;
  creado_en: string;
  actualizado_en: string;
  alimento?: DonationAlimento | null;
  codigo_comprobante?: string;
}

export interface DonationEstadoFilter {
  todos: boolean;
  Pendiente: boolean;
  Recogida: boolean;
  Entregada: boolean;
  Cancelada: boolean;
}

export interface DonationPersonTypeFilter {
  todos: boolean;
  Natural: boolean;
  Juridica: boolean;
}

export interface DonationFilters {
  search: string;
  estado: DonationEstadoFilter;
  tipoPersona: DonationPersonTypeFilter;
}

export interface DonationCounters {
  total: number;
  pendientes: number;
  recogidas: number;
  entregadas: number;
  canceladas: number;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: unknown;
}

export interface DonationInventoryIntegrationResult {
  productoId?: number;
  depositoId?: string;
  error?: string;
}

export interface SupabaseDonationRow {
  id: number;
  user_id: string;
  nombre_donante: string;
  ruc_donante?: string | null;
  cedula_donante?: string | null;
  direccion_donante_completa?: string | null;
  telefono: string;
  email: string;
  representante_donante?: string | null;
  tipo_persona_donante: DonationPersonType;
  alimento_id?: number | null;
  tipo_producto: string;
  categoria_comida: string;
  es_producto_personalizado: boolean;
  cantidad: number;
  unidad_id: number;
  unidad_nombre: string;
  unidad_simbolo: string;
  fecha_vencimiento?: string | null;
  fecha_disponible: string;
  direccion_entrega: string;
  horario_preferido?: string | null;
  observaciones?: string | null;
  impacto_estimado_personas?: number | null;
  impacto_equivalente?: string | null;
  estado: DonationEstado;
  creado_en: string;
  actualizado_en: string;
  codigo_comprobante?: string | null;
}

export interface SupabaseAlimentoRow {
  id: number;
  nombre?: string | null;
  categoria?: string | null;
}
