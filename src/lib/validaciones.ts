/**
 * Utilidades de validación para documentos ecuatorianos
 */

/**
 * Valida una cédula ecuatoriana usando el algoritmo oficial
 * @param cedula - Número de cédula a validar
 * @returns true si la cédula es válida, false en caso contrario
 */
export function validarCedulaEcuatoriana(cedula: string): boolean {
  // Verificar que sea exactamente 10 dígitos y solo números
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  // Extraer los dígitos
  const digitos = cedula.split('').map(Number);
  
  // Verificar que el primer dígito sea válido (0-2)
  if (digitos[0] > 2) {
    return false;
  }

  // Algoritmo de validación de cédula ecuatoriana
  let suma = 0;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  
  // Calcular suma ponderada
  for (let i = 0; i < 9; i++) {
    let producto = digitos[i] * coeficientes[i];
    if (producto >= 10) {
      producto = Math.floor(producto / 10) + (producto % 10);
    }
    suma += producto;
  }
  
  // Calcular dígito verificador
  const residuo = suma % 10;
  const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;
  
  // Comparar con el último dígito
  return digitos[9] === digitoVerificador;
}

/**
 * Valida un RUC ecuatoriano
 * @param ruc - Número de RUC a validar
 * @returns true si el RUC es válido, false en caso contrario
 */
export function validarRucEcuatoriano(ruc: string): boolean {
  // Solo números, 13 dígitos
  if (!/^\d{13}$/.test(ruc)) return false;

  const tercerDigito = parseInt(ruc[2]);
  // Persona natural (0-5)
  if (tercerDigito >= 0 && tercerDigito <= 5) {
    // Los primeros 10 dígitos deben ser una cédula válida
    // Puedes usar tu función validarCedulaEcuatoriana aquí si quieres ser estricto
    // y los últimos 3 dígitos deben ser '001'
    return ruc.slice(10) === '001';
  }
  // Sociedad pública (6)
  if (tercerDigito === 6) {
    // Debe terminar en '0001'
    return ruc.slice(9) === '0001';
  }
  // Sociedad privada (9)
  if (tercerDigito === 9) {
    // Debe terminar en '001'
    return ruc.slice(10) === '001';
  }
  // Si no coincide con ningún tipo válido
  return false;
}

/**
 * Formatea una cédula o RUC para mejor legibilidad
 * @param numero - Número a formatear
 * @param tipo - Tipo de documento ('CEDULA' o 'RUC')
 * @returns Número formateado
 */
export function formatearDocumento(numero: string, tipo: 'CEDULA' | 'RUC'): string {
  const numeroLimpio = numero.replace(/\D/g, '');
  
  if (tipo === 'CEDULA' && numeroLimpio.length === 10) {
    return `${numeroLimpio.substring(0, 2)}-${numeroLimpio.substring(2, 9)}-${numeroLimpio.substring(9)}`;
  }
  
  if (tipo === 'RUC' && numeroLimpio.length === 13) {
    return `${numeroLimpio.substring(0, 2)}-${numeroLimpio.substring(2, 9)}-${numeroLimpio.substring(9, 12)}-${numeroLimpio.substring(12)}`;
  }
  
  return numeroLimpio;
}

/**
 * Obtiene el tipo de persona basado en el RUC
 * @param ruc - Número de RUC
 * @returns Tipo de persona o null si no es válido
 */
export function obtenerTipoPersonaPorRuc(ruc: string): 'Natural' | 'Juridica' | null {
  if (!validarRucEcuatoriano(ruc)) {
    return null;
  }
  
  const tipoContribuyente = ruc.substring(10, 13);
  
  switch (tipoContribuyente) {
    case '001':
    case '003':
      return 'Natural';
    case '002':
      return 'Juridica';
    default:
      return null;
  }
} 