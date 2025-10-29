export type UserRole = 'ADMINISTRADOR' | 'DONANTE' | 'SOLICITANTE' | 'OPERADOR';
export type UserStatus = 'activo' | 'bloqueado' | 'desactivado' | null;
export type UserPersonType = 'Natural' | 'Juridica' | string | null;

export interface UserRecord {
  id: string;
  nombre: string;
  cedula?: string | null;
  ruc?: string | null;
  rol: UserRole;
  tipo_persona: UserPersonType;
  telefono?: string | null;
  direccion?: string | null;
  representante?: string | null;
  email?: string | null;
  created_at?: string | null;
  estado?: UserStatus;
}

export interface UsersStats {
  total: number;
  administradores: number;
  donantes: number;
  solicitantes: number;
  operadores: number;
  activos: number;
  bloqueados: number;
}

export interface RoleFilterState {
  todos: boolean;
  ADMINISTRADOR: boolean;
  DONANTE: boolean;
  SOLICITANTE: boolean;
  OPERADOR: boolean;
}

export interface PersonTypeFilterState {
  todos: boolean;
  Natural: boolean;
  Juridica: boolean;
}

export interface UsersFilters {
  search: string;
  roles: RoleFilterState;
  personTypes: PersonTypeFilterState;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: unknown;
}
