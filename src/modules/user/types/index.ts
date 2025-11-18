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
  cantidad: number;
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
export interface StockInfo {
  producto_encontrado: boolean;
  total_disponible: number;
  depositos: DepositoStock[];
  unidad_nombre?: string;
  unidad_simbolo?: string;
}

export interface DepositoStock {
  deposito: string;
  cantidad_disponible: number;
  unidad_nombre?: string;
  unidad_simbolo?: string;
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
