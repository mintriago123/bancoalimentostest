/**
 * Configuración de seguridad de la aplicación
 */

export const CONFIGURACION_SEGURIDAD = {
  /**
   * Tiempo de inactividad antes de cerrar sesión automáticamente
   * Por defecto: 15 minutos (15 * 60 * 1000 milisegundos)
   * 
   * Ejemplos:
   * - 5 minutos: 5 * 60 * 1000
   * - 10 minutos: 10 * 60 * 1000
   * - 15 minutos: 15 * 60 * 1000
   * - 30 minutos: 30 * 60 * 1000
   */
  TIEMPO_INACTIVIDAD_MS: 10 * 60 * 1000,

  /**
   * Eventos que detectan actividad del usuario
   * Se excluye 'mousemove' para evitar falsos positivos por movimientos accidentales
   */
  EVENTOS_ACTIVIDAD: [
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click'
  ] as const,

  /**
   * Habilitar/deshabilitar el cierre de sesión automático
   * true: Activado (recomendado para producción)
   * false: Desactivado (solo para desarrollo si es necesario)
   */
  CIERRE_SESION_AUTOMATICO_HABILITADO: true,

  /**
   * Mostrar logs en la consola cuando se detecta inactividad
   * true: Mostrar logs (útil para desarrollo)
   * false: No mostrar logs (recomendado para producción)
   */
  LOGS_INACTIVIDAD: true,
} as const;
