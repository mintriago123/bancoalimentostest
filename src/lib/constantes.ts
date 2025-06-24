// Constantes de la aplicación
export const RUTAS_PUBLICAS = [
  '/auth/iniciar-sesion',
  '/auth/registrar',
  '/auth/olvide-contrasena',
  '/auth/restablecer-contrasena',
  '/auth/verificar-email',
  '/api/consultar-identificacion',
  'perfil/completar'
] as const;

// Clases de estilo reutilizables
export const CLASES_ESTILO = {
  input: "block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/70 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200",
  label: "block mb-2 text-sm font-bold text-gray-700",
  boton: "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50",
  botonSecundario: "w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
} as const;

// Mensajes de la aplicación
export const MENSAJES = {
  ERRORES: {
    CONTRASENAS_NO_COINCIDEN: 'Las contraseñas no coinciden.',
    EMAIL_NO_VERIFICADO: 'Por favor, verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
    ERROR_INESPERADO: 'Ocurrió un error inesperado.',
    ERROR_REGISTRO: 'Error al crear el usuario',
    ERROR_CREAR_PERFIL: 'Error al crear el perfil del usuario',
    ENLACE_INVALIDO: 'El enlace de restablecimiento no es válido o ha expirado.',
    TOKEN_INVALIDO: 'El enlace de verificación no es válido o ha expirado.',
    ERROR_CONSULTA_IDENTIFICACION: 'Error al consultar la identificación.',
    ERROR_CONEXION: 'Error de conexión. Puedes ingresar los datos manualmente.',
    IDENTIFICACION_NO_ENCONTRADA: 'La identificación no fue encontrada.'
  },
  EXITO: {
    REGISTRO_EXITOSO: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico para activar tu cuenta.',
    EMAIL_ENVIADO: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico. Por favor, revisa tu bandeja de entrada.',
    CONTRASENA_ACTUALIZADA: 'Contraseña actualizada exitosamente. Serás redirigido al inicio de sesión.',
    EMAIL_VERIFICADO: '¡Email verificado exitosamente! Ya puedes iniciar sesión.',
    EMAIL_REENVIADO: 'Se ha reenviado el email de verificación. Por favor, revisa tu bandeja de entrada.',
    DATOS_OBTENIDOS: 'Datos obtenidos automáticamente. Puedes modificarlos si es necesario.'
  },
  INFORMACION: {
    CONSULTANDO_IDENTIFICACION: 'Consultando identificación...',
    INGRESO_MANUAL_PERMITIDO: 'No se pudieron obtener los datos automáticamente. Puedes ingresarlos manualmente.',
    AUTocompletado_DISPONIBLE: 'Los datos se completarán automáticamente si están disponibles en los servicios oficiales',
    IDENTIFICACION_VALIDADA: '✓ Identificación validada. Puedes continuar con el resto del formulario.',
    PRIMERO_IDENTIFICACION: 'Primero ingresa tu identificación para continuar'
  }
} as const;

// Configuración de la aplicación
export const CONFIGURACION = {
  TIEMPO_REDIRECCION: 3000,
  TIEMPO_REDIRECCION_CORTO: 2000,
  LONGITUD_MINIMA_CONTRASENA: 6,
  DELAY_CONSULTA_IDENTIFICACION: 1000,
  TIMEOUT_API: 5000
} as const;

// Utilidades para fechas
export const FECHAS = {
  ahora: () => new Date().toISOString(),
  ahoraFormateada: () => new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
} as const; 