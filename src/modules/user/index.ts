// ============================================================================
// Index - Módulo User
// Exportaciones centralizadas
// ============================================================================

// Types
export * from './types';

// Constants
export * from './constants';

// Services
export * from './services/solicitudesService';
export * from './services/perfilService';
export * from './services/alimentosService';
export * from './services/unidadesService';

// Hooks
export * from './hooks/useSolicitudes';
export * from './hooks/usePerfilUsuario';
export * from './hooks/useAlimentos';
export * from './hooks/useUnidades';
export * from './hooks/useUbicacion';
export * from './hooks/useDatosBasicosUsuario';

// Components
export { SolicitudCard } from './components/SolicitudCard';
export { SolicitudesList } from './components/SolicitudesList';
export { DashboardUserCards } from './components/DashboardUserCards';
export { UserInfoCard } from './components/UserInfoCard';
export { UbicacionCard } from './components/UbicacionCard';
export { AlimentoSelector } from './components/AlimentoSelector';
export { InventarioInfo } from './components/InventarioInfo';
export { CantidadUnidadInputs } from './components/CantidadUnidadInputs';
export { ComentariosInput } from './components/ComentariosInput';

// Utils
export * from './utils';
