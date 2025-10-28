/**
 * Utilidades de validación para autenticación
 */

import { AUTH_CONSTANTS } from '../constants';
import type { DatosRegistro, DatosRestablecimiento } from '../types';

/**
 * Validar formato de email
 */
export const validarEmail = (email: string): { valido: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valido: false, error: 'El email es requerido' };
  }
  
  if (!emailRegex.test(email)) {
    return { valido: false, error: 'El formato del email no es válido' };
  }
  
  return { valido: true };
};

/**
 * Validar contraseña
 */
export const validarPassword = (password: string): { valido: boolean; error?: string } => {
  if (!password) {
    return { valido: false, error: 'La contraseña es requerida' };
  }
  
  if (password.length < AUTH_CONSTANTS.MIN_PASSWORD_LENGTH) {
    return {
      valido: false,
      error: AUTH_CONSTANTS.MENSAJES.PASSWORD_MIN_LENGTH,
    };
  }
  
  if (password.length > AUTH_CONSTANTS.MAX_PASSWORD_LENGTH) {
    return {
      valido: false,
      error: `La contraseña no debe exceder ${AUTH_CONSTANTS.MAX_PASSWORD_LENGTH} caracteres`,
    };
  }
  
  return { valido: true };
};

/**
 * Validar que las contraseñas coincidan
 */
export const validarPasswordsCoinciden = (
  password: string,
  confirmPassword: string
): { valido: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return {
      valido: false,
      error: AUTH_CONSTANTS.MENSAJES.PASSWORDS_NO_COINCIDEN,
    };
  }
  
  return { valido: true };
};

/**
 * Validar datos de registro completos
 */
export const validarDatosRegistro = (
  datos: DatosRegistro
): { valido: boolean; error?: string } => {
  // Validar email
  const validacionEmail = validarEmail(datos.email);
  if (!validacionEmail.valido) {
    return validacionEmail;
  }
  
  // Validar contraseña
  const validacionPassword = validarPassword(datos.password);
  if (!validacionPassword.valido) {
    return validacionPassword;
  }
  
  // Validar que coincidan
  const validacionCoincidencia = validarPasswordsCoinciden(
    datos.password,
    datos.confirmPassword
  );
  if (!validacionCoincidencia.valido) {
    return validacionCoincidencia;
  }
  
  // Validar rol
  if (!datos.rol) {
    return { valido: false, error: AUTH_CONSTANTS.MENSAJES.ROL_REQUERIDO };
  }
  
  return { valido: true };
};

/**
 * Validar datos de restablecimiento de contraseña
 */
export const validarDatosRestablecimiento = (
  datos: DatosRestablecimiento
): { valido: boolean; error?: string } => {
  // Validar contraseña
  const validacionPassword = validarPassword(datos.password);
  if (!validacionPassword.valido) {
    return validacionPassword;
  }
  
  // Validar que coincidan
  const validacionCoincidencia = validarPasswordsCoinciden(
    datos.password,
    datos.confirmPassword
  );
  if (!validacionCoincidencia.valido) {
    return validacionCoincidencia;
  }
  
  return { valido: true };
};
