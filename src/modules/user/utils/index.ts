// ============================================================================
// Utils - Validaciones y helpers
// ============================================================================

import { UserProfileFormData } from '../types';
import { FORM_CONFIG, MESSAGES } from '../constants';
import { formatLongDate } from '@/lib/dateUtils';

/**
 * Validar formulario de perfil de usuario
 */
export function validatePerfilForm(
  formData: UserProfileFormData
): string | null {
  if (!formData.nombre.trim()) {
    return MESSAGES.VALIDATION.NOMBRE_REQUIRED;
  }

  if (
    formData.telefono &&
    formData.telefono.replace(/\D/g, '').length !== FORM_CONFIG.TELEFONO_LENGTH
  ) {
    return MESSAGES.VALIDATION.TELEFONO_INVALID;
  }

  return null;
}

/**
 * Obtener iniciales del usuario
 */
export function getUserInitials(name: string): string {
  if (!name) return 'US';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Formatear fecha en formato largo
 */
export function formatDate(dateString?: string): string {
  return formatLongDate(dateString);
}

/**
 * Validar cantidad para solicitud
 */
export function validateCantidad(cantidad: number): boolean {
  return cantidad > 0;
}

/**
 * Validar stock disponible
 */
export function validateStock(
  cantidadSolicitada: number,
  stockDisponible: number
): boolean {
  return cantidadSolicitada <= stockDisponible;
}
