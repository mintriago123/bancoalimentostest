/**
 * @fileoverview Exportaciones principales del módulo de solicitudes del operador.
 */

// Componentes
export { default as SolicitudesHeader } from './components/SolicitudesHeader';
export { default as SolicitudesFilters } from './components/SolicitudesFilters';
export { default as SolicitudesTable } from './components/SolicitudesTable';
export { default as SolicitudDetailModal } from './components/SolicitudDetailModal';

// Hooks (re-exportados de admin)
export {
  useSolicitudesData,
  useSolicitudActions,
  useInventarioDisponible
} from './hooks';

// Utils (re-exportados de admin)
export { formatDateTime } from './utils';

// Constantes
export {
  INITIAL_FILTERS,
  ESTADO_BADGE_STYLES,
  ESTADO_ICONS,
  ESTADO_LABELS,
  SYSTEM_MESSAGES
} from './constants';

// Tipos
export type {
  Solicitud,
  SolicitudEstado,
  SolicitudFilters,
  SolicitudEstadoFilter,
  SolicitudCounters,
  InventarioDisponible,
  LoadingState
} from './types';
