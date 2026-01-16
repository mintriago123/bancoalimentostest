/**
 * @fileoverview Utilidad para obtener la URL base del proyecto
 * Funciona tanto en desarrollo como en producción (Vercel)
 */

/**
 * Obtiene la URL base de la aplicación.
 * Prioridad:
 * 1. NEXT_PUBLIC_APP_URL (configurada manualmente)
 * 2. VERCEL_URL (proporcionada automáticamente por Vercel en producción)
 * 3. localhost:3000 (desarrollo local)
 */
export function getBaseUrl(): string {
  // Si hay una URL configurada manualmente, usarla
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''); // Remover trailing slash
  }

  // En producción de Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // En preview de Vercel (también usa VERCEL_URL)
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // En producción de Vercel con dominio personalizado
  if (process.env.VERCEL_ENV === 'production') {
    // Si no hay NEXT_PUBLIC_APP_URL pero estamos en producción,
    // intentar usar VERCEL_PROJECT_PRODUCTION_URL
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
  }

  // Fallback para desarrollo local
  return 'http://localhost:3000';
}

/**
 * Versión del lado del cliente (solo usa variables NEXT_PUBLIC_*)
 */
export function getBaseUrlClient(): string {
  if (typeof window !== 'undefined') {
    // En el cliente, usar la URL actual del navegador
    return window.location.origin;
  }
  
  // En el servidor pero renderizado del cliente
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}
