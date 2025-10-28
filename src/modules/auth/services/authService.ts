/**
 * Servicio de autenticación
 * Maneja todas las operaciones relacionadas con la autenticación de usuarios
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  DatosLogin,
  DatosRegistro,
  DatosRecuperacion,
  DatosRestablecimiento,
  PerfilUsuario,
  ResultadoAuth,
  SesionAuth,
  Rol,
} from '../types';
import { AUTH_CONSTANTS } from '../constants';

export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Iniciar sesión con email y contraseña
   */
  async login(datos: DatosLogin): Promise<ResultadoAuth> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: datos.email,
        password: datos.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar si el email está confirmado
      if (!data.user.email_confirmed_at) {
        await this.supabase.auth.signOut();
        return {
          success: false,
          error: AUTH_CONSTANTS.MENSAJES.VERIFICAR_EMAIL,
        };
      }

      // Obtener perfil del usuario
      const perfil = await this.obtenerPerfil(data.user.id);

      console.log('🔍 Perfil obtenido:', perfil);

      // Si no hay perfil o no tiene rol, crear/completar perfil
      if (!perfil || !perfil.rol) {
        console.log('❌ Perfil incompleto (sin rol)');
        return {
          success: true,
          redirect: AUTH_CONSTANTS.RUTAS.COMPLETAR_PERFIL,
        };
      }

      // Verificar estado del usuario
      const validacionEstado = this.validarEstadoUsuario(perfil);
      if (!validacionEstado.success) {
        console.log('❌ Estado de usuario inválido:', perfil.estado);
        await this.supabase.auth.signOut();
        return validacionEstado;
      }

      // Validar que el perfil esté completo (necesita nombre Y (cedula O ruc))
      const perfilCompleto = perfil.nombre && (perfil.cedula || perfil.ruc);
      
      console.log('📋 Validación de perfil:', {
        nombre: perfil.nombre,
        cedula: perfil.cedula,
        ruc: perfil.ruc,
        perfilCompleto,
      });

      if (!perfilCompleto) {
        console.log('❌ Perfil incompleto (faltan datos)');
        return {
          success: true,
          redirect: AUTH_CONSTANTS.RUTAS.COMPLETAR_PERFIL,
        };
      }

      // Redirigir según el rol
      const redirect = this.obtenerRutaPorRol(perfil.rol);
      console.log('✅ Login exitoso, redirigiendo a:', redirect);
      return { success: true, redirect };
    } catch (error) {
      return {
        success: false,
        error: AUTH_CONSTANTS.MENSAJES.ERROR_INESPERADO,
      };
    }
  }

  /**
   * Registrar un nuevo usuario
   */
  async registrar(datos: DatosRegistro): Promise<ResultadoAuth> {
    try {
      // El perfil se creará automáticamente mediante un trigger de base de datos
      const { data, error } = await this.supabase.auth.signUp({
        email: datos.email,
        password: datos.password,
        options: {
          data: { 
            rol: datos.rol,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        mensaje: AUTH_CONSTANTS.MENSAJES.EMAIL_VERIFICACION_ENVIADO,
      };
    } catch (error) {
      return {
        success: false,
        error: AUTH_CONSTANTS.MENSAJES.ERROR_INESPERADO,
      };
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async recuperarContrasena(
    datos: DatosRecuperacion,
    redirectUrl: string
  ): Promise<ResultadoAuth> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(
        datos.email,
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        mensaje: AUTH_CONSTANTS.MENSAJES.EMAIL_ENVIADO,
      };
    } catch (error) {
      return {
        success: false,
        error: AUTH_CONSTANTS.MENSAJES.ERROR_INESPERADO,
      };
    }
  }

  /**
   * Restablecer contraseña
   */
  async restablecerContrasena(
    datos: DatosRestablecimiento
  ): Promise<ResultadoAuth> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: datos.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        mensaje: AUTH_CONSTANTS.MENSAJES.PASSWORD_ACTUALIZADO,
        redirect: AUTH_CONSTANTS.RUTAS.INICIAR_SESION,
      };
    } catch (error) {
      return {
        success: false,
        error: AUTH_CONSTANTS.MENSAJES.ERROR_INESPERADO,
      };
    }
  }

  /**
   * Verificar sesión actual
   */
  async verificarSesion(): Promise<SesionAuth> {
    try {
      const { data } = await this.supabase.auth.getSession();
      const user = data.session?.user;
      return {
        user: user ? {
          id: user.id,
          email: user.email || '',
          email_confirmed_at: user.email_confirmed_at,
        } : null,
        session: data.session,
      };
    } catch (error) {
      return { user: null, session: null };
    }
  }

  /**
   * Reenviar email de verificación
   */
  async reenviarVerificacion(email: string): Promise<ResultadoAuth> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        mensaje:
          'Se ha reenviado el email de verificación. Por favor, revisa tu bandeja de entrada.',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ocurrió un error al reenviar el email.',
      };
    }
  }

  /**
   * Actualizar timestamp de verificación en la tabla usuarios
   */
  async actualizarVerificacionEmail(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('usuarios')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error actualizando verificación:', error);
    }
  }

  /**
   * Cerrar sesión
   */
  async cerrarSesion(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  /**
   * Obtener perfil del usuario
   */
  private async obtenerPerfil(
    userId: string
  ): Promise<PerfilUsuario | null> {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error obteniendo perfil:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: userId,
        nombre: data.nombre,
        cedula: data.cedula,
        ruc: data.ruc,
        rol: data.rol,
        estado: data.estado || 'activo',
        email: data.email,
        tipo_persona: data.tipo_persona,
        direccion: data.direccion,
        telefono: data.telefono,
        representante: data.representante,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as PerfilUsuario;
    } catch (error) {
      console.error('Error en obtenerPerfil:', error);
      return null;
    }
  }

  /**
   * Validar estado del usuario
   */
  private validarEstadoUsuario(perfil: PerfilUsuario): ResultadoAuth {
    const estadoUsuario = perfil.estado || AUTH_CONSTANTS.ESTADOS_USUARIO.ACTIVO;

    if (estadoUsuario === AUTH_CONSTANTS.ESTADOS_USUARIO.BLOQUEADO) {
      return {
        success: false,
        error: AUTH_CONSTANTS.MENSAJES.CUENTA_BLOQUEADA,
      };
    }

    if (estadoUsuario === AUTH_CONSTANTS.ESTADOS_USUARIO.DESACTIVADO) {
      return {
        success: false,
        error: AUTH_CONSTANTS.MENSAJES.CUENTA_DESACTIVADA,
      };
    }

    return { success: true };
  }

  /**
   * Obtener ruta de redirección según el rol del usuario
   */
  private obtenerRutaPorRol(rol: Rol): string {
    switch (rol) {
      case AUTH_CONSTANTS.ROLES.ADMINISTRADOR:
        return AUTH_CONSTANTS.RUTAS.ADMIN_DASHBOARD;
      case AUTH_CONSTANTS.ROLES.DONANTE:
        return AUTH_CONSTANTS.RUTAS.DONANTE_DASHBOARD;
      case AUTH_CONSTANTS.ROLES.SOLICITANTE:
        return AUTH_CONSTANTS.RUTAS.USER_DASHBOARD;
      case AUTH_CONSTANTS.ROLES.OPERADOR:
        return '/operador/dashboard';
      default:
        return AUTH_CONSTANTS.RUTAS.USER_DASHBOARD;
    }
  }
}

/**
 * Factory function para crear instancia del servicio
 */
export const createAuthService = (supabase: SupabaseClient) => {
  return new AuthService(supabase);
};
