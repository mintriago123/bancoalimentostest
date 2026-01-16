// ============================================================================
// Types - Módulo Usuario/Solicitante
// ============================================================================

// ---------- Solicitudes ----------
export interface Solicitud {
  id: number;
  usuario_id: string;
  tipo_alimento: string;
  cantidad: number;
  unidad_id: number;
  comentarios: string | null;
  estado: SolicitudEstado;
  latitud: number | null;
  longitud: number | null;
  created_at: string;
  updated_at?: string;
  motivo_rechazo?: string | null;
  comentario_admin?: string | null;
  operador_rechazo_id?: string | null;
  fecha_rechazo?: string | null;
  operador_aprobacion_id?: string | null;
  fecha_aprobacion?: string | null;
}

export type SolicitudEstado = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudFormData {
  tipo_alimento: string;
  cantidad: number;
  unidad_id: number;
  comentarios: string;
  latitud: number | null;
  longitud: number | null;
}

export interface SolicitudEditData {
  comentarios: string;
}

// ---------- Perfil de Usuario ----------
export interface UserProfile {
  id: string;
  email?: string;
  nombre: string;
  cedula?: string;
  telefono: string;
  direccion: string;
  tipo_persona: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileFormData {
  nombre: string;
  telefono: string;
  direccion: string;
}

// ---------- Alimentos ----------
export interface UnidadAlimento {
  unidad_id: number;
  nombre: string;
  simbolo: string;
  tipo_magnitud_id: number;
  tipo_magnitud_nombre: string;
  es_base: boolean;
  es_principal: boolean;
}

export interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
  descripcion?: string;
  unidades?: UnidadAlimento[];
}

// ---------- Unidades de Medida ----------
export interface Unidad {
  id: number;
  nombre: string;
  simbolo: string;
  tipo?: string;
}

// ---------- Inventario ----------
export interface CantidadFormateada {
  cantidad: number;
  simbolo: string;
  unidad_nombre: string;
  cantidad_original: number;
  simbolo_original: string;
  fue_convertido: boolean;
}

export interface StockInfo {
  producto_encontrado: boolean;
  total_disponible: number;
  depositos: DepositoStock[];
  unidad_nombre?: string;
  unidad_simbolo?: string;
  total_formateado?: CantidadFormateada;
}

export interface DepositoStock {
  deposito: string;
  cantidad_disponible: number;
  unidad_nombre?: string;
  unidad_simbolo?: string;
  cantidad_formateada?: CantidadFormateada;
}

// ---------- Ubicación ----------
export interface Ubicacion {
  latitud: number;
  longitud: number;
}

// ---------- Filtros ----------
export type FiltroEstadoSolicitud = 'TODOS' | SolicitudEstado;

// ---------- Mensajes ----------
export interface MessageState {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

// ---------- Loading States ----------
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
