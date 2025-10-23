/**
 * @fileoverview Utilidades de formato para solicitudes.
 */

export const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';

  try {
    return new Date(value).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return value;
  }
};
