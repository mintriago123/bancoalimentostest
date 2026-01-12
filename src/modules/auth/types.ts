/**
 * Tipos para el módulo de autenticación
 */

export type Rol = 'DONANTE' | 'SOLICITANTE' | 'ADMINISTRADOR' | 'OPERADOR';

export type EstadoUsuario = 'activo' | 'bloqueado' | 'desactivado';

export interface DatosLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  email: string;
  password: string;
  confirmPassword: string;
  rol: Rol;
}

export interface DatosRecuperacion {
  email: string;
}

export interface DatosRestablecimiento {
  password: string;
  confirmPassword: string;
}

export interface PerfilUsuario {
  id: string;
  nombre?: string | null;
  cedula?: string | null;
  ruc?: string | null;
  rol: Rol;
  estado: EstadoUsuario;
  email?: string | null;
  tipo_persona?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  representante?: string | null;
  created_at?: string;
  updated_at?: string;
  fecha_fin_bloqueo?: string | null;
  motivo_bloqueo?: string | null;
}

export interface ResultadoAuth {
  success: boolean;
  error?: string;
  mensaje?: string;
  redirect?: string;
}

export interface SesionAuth {
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
  } | null;
  session: unknown | null;
}

export interface MensajeAuth {
  tipo: 'error' | 'exito' | 'info';
  texto: string;
}
