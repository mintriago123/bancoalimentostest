/**
 * Constantes para el módulo de autenticación
 */

export const AUTH_CONSTANTS = {
  // Validaciones
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  
  // Mensajes
  MENSAJES: {
    REGISTRO_EXITOSO: '¡Registro exitoso! Ahora puedes iniciar sesión.',
    VERIFICACION_EXITOSA: '¡Correo verificado exitosamente! Ya puedes iniciar sesión.',
    VERIFICAR_EMAIL: 'Por favor, verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
    CUENTA_BLOQUEADA: 'Tu cuenta ha sido bloqueada. Contacta al administrador para más información.',
    CUENTA_DESACTIVADA: 'Tu cuenta ha sido desactivada. Contacta al administrador para reactivarla.',
    EMAIL_ENVIADO: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico. Por favor, revisa tu bandeja de entrada.',
    PASSWORD_ACTUALIZADO: 'Contraseña actualizada exitosamente. Serás redirigido al inicio de sesión.',
    PASSWORDS_NO_COINCIDEN: 'Las contraseñas no coinciden.',
    PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres.',
    ENLACE_INVALIDO: 'El enlace de restablecimiento no es válido o ha expirado.',
    ERROR_INESPERADO: 'Ocurrió un error inesperado.',
    ROL_REQUERIDO: 'Debes seleccionar un rol',
    EMAIL_VERIFICACION_ENVIADO: '¡Revisa tu correo y valida tu cuenta antes de continuar!',
  },
  
  // Rutas de redirección
  RUTAS: {
    INICIAR_SESION: '/auth/iniciar-sesion',
    REGISTRAR: '/auth/registrar',
    OLVIDE_CONTRASENA: '/auth/olvide-contrasena',
    RESTABLECER_CONTRASENA: '/auth/restablecer-contrasena',
    VERIFICAR_EMAIL: '/auth/verificar-email',
    COMPLETAR_PERFIL: '/perfil/completar',
    ADMIN_DASHBOARD: '/admin/dashboard',
    DONANTE_DASHBOARD: '/donante/dashboard',
    USER_DASHBOARD: '/user/dashboard',
    HOME: '/',
  },
  
  // Estados
  ESTADOS_USUARIO: {
    ACTIVO: 'activo' as const,
    BLOQUEADO: 'bloqueado' as const,
    DESACTIVADO: 'desactivado' as const,
  },
  
  // Roles
  ROLES: {
    DONANTE: 'DONANTE' as const,
    SOLICITANTE: 'SOLICITANTE' as const,
    ADMINISTRADOR: 'ADMINISTRADOR' as const,
    OPERADOR: 'OPERADOR' as const,
  },
} as const;

// Información de roles para el selector
export const ROLES_INFO = [
  {
    valor: AUTH_CONSTANTS.ROLES.DONANTE,
    titulo: 'Soy un Donante',
    descripcion: 'Quiero ofrecer productos y ayuda.',
  },
  {
    valor: AUTH_CONSTANTS.ROLES.SOLICITANTE,
    titulo: 'Soy un Solicitante',
    descripcion: 'Necesito recibir productos y ayuda.',
  },
] as const;
