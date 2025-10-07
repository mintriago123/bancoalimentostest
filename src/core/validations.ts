/**
 * Utilidades de validación (módulo central). Mantiene las mismas funciones
 * que `src/lib/validaciones.ts` pero con nombres en inglés y documentación
 * más clara para facilitar su reuso en otros módulos.
 */

export function validarCedulaEcuatoriana(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  const digitos = cedula.split('').map(Number);
  if (digitos[0] > 2) return false;
  let suma = 0;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  for (let i = 0; i < 9; i++) {
    let producto = digitos[i] * coeficientes[i];
    if (producto >= 10) producto = Math.floor(producto / 10) + (producto % 10);
    suma += producto;
  }
  const residuo = suma % 10;
  const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;
  return digitos[9] === digitoVerificador;
}

export function validarRucEcuatoriano(ruc: string): boolean {
  if (!/^\d{13}$/.test(ruc)) return false;
  const tercerDigito = Number(ruc[2]);
  if (tercerDigito >= 0 && tercerDigito <= 5) return ruc.slice(10) === '001';
  if (tercerDigito === 6) return ruc.slice(9) === '0001';
  if (tercerDigito === 9) return ruc.slice(10) === '001';
  return false;
}

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

export function obtenerTipoPersonaPorRuc(ruc: string): 'Natural' | 'Juridica' | null {
  if (!validarRucEcuatoriano(ruc)) return null;
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
