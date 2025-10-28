// ============================================================================
// Constants - Módulo Usuario/Solicitante
// ============================================================================

import { SolicitudEstado } from '../types';

// ---------- Estados de Solicitudes ----------
export const ESTADOS_SOLICITUD: Record<SolicitudEstado, { label: string; color: string }> = {
  pendiente: {
    label: 'Pendiente',
    color: 'yellow',
  },
  aprobada: {
    label: 'Aprobada',
    color: 'green',
  },
  rechazada: {
    label: 'Rechazada',
    color: 'red',
  },
};

// ---------- Filtros de Estado ----------
export const FILTROS_ESTADO = [
  { label: 'TODOS', value: 'TODOS' },
  { label: 'PENDIENTES', value: 'pendiente' },
  { label: 'APROBADAS', value: 'aprobada' },
  { label: 'RECHAZADAS', value: 'rechazada' },
] as const;

// ---------- Mensajes ----------
export const MESSAGES = {
  SOLICITUD: {
    SUCCESS_CREATE: 'Solicitud enviada con éxito.',
    SUCCESS_UPDATE: 'Solicitud actualizada.',
    SUCCESS_DELETE: 'Solicitud eliminada.',
    ERROR_CREATE: 'Error al enviar la solicitud',
    ERROR_UPDATE: 'Error al actualizar la solicitud.',
    ERROR_DELETE: 'Error al eliminar la solicitud.',
    ERROR_LOAD: 'Error al cargar las solicitudes.',
    EMPTY: 'No hay solicitudes para mostrar.',
    STOCK_INSUFFICIENT: 'No hay suficiente stock disponible.',
  },
  PERFIL: {
    SUCCESS_UPDATE: 'Perfil actualizado correctamente',
    ERROR_UPDATE: 'Error al actualizar el perfil',
    ERROR_LOAD: 'Error al cargar los datos del perfil',
    NOT_FOUND: 'No se encontró el perfil del usuario',
  },
  VALIDATION: {
    REQUIRED_FIELDS: 'Por favor completa todos los campos requeridos.',
    CANTIDAD_INVALID: 'La cantidad debe ser mayor que cero.',
    TELEFONO_INVALID: 'El teléfono debe tener 10 dígitos',
    NOMBRE_REQUIRED: 'El nombre es obligatorio',
  },
  AUTH: {
    NOT_AUTHENTICATED: 'Usuario no autenticado',
  },
  UBICACION: {
    ERROR: 'No se pudo obtener la ubicación.',
  },
};

// ---------- Configuración de Formularios ----------
export const FORM_CONFIG = {
  COMENTARIOS_MAX_LENGTH: 500,
  TELEFONO_LENGTH: 10,
  CANTIDAD_MIN: 0.1,
  CANTIDAD_STEP: 0.1,
};

// ---------- Opciones de Mapa ----------
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  DEFAULT_CENTER: {
    lat: -0.1807,
    lng: -78.4678,
  },
};
