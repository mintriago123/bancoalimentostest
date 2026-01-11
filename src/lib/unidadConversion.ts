/**
 * @fileoverview Utilidad para convertir cantidades a unidades más legibles
 */

export interface ConversionData {
  unidad_origen: string;
  simbolo_origen: string;
  unidad_destino: string;
  simbolo_destino: string;
  factor_conversion: number;
}

export interface CantidadFormateada {
  cantidad: number;
  simbolo: string;
  unidad_nombre: string;
  cantidad_original: number;
  simbolo_original: string;
  fue_convertido: boolean;
}

/**
 * Redondea un número eliminando decimales innecesarios
 */
export const redondear = (num: number, decimales: number = 2): number => {
  if (Number.isInteger(num)) return num;
  
  const factor = Math.pow(10, decimales);
  const redondeado = Math.round(num * factor) / factor;
  
  return Number.isInteger(redondeado) ? redondeado : redondeado;
};

/**
 * Formatea un número para mostrar
 */
export const formatearNumero = (num: number, decimales: number = 2): string => {
  const redondeado = redondear(num, decimales);
  
  // Si es muy grande, usar notación con separadores de miles
  if (redondeado >= 10000) {
    return redondeado.toLocaleString('es-EC', {
      maximumFractionDigits: decimales
    });
  }
  
  return redondeado.toString();
};

/**
 * Cuenta los decimales significativos de un número
 */
const contarDecimalesSignificativos = (num: number): number => {
  const str = num.toString();
  const parts = str.split('.');
  if (parts.length < 2) return 0;
  
  const decimales = parts[1];
  // Contar solo los dígitos después del punto
  return decimales.length;
};

/**
 * Verifica si un número tiene muchos decimales innecesarios
 */
const tieneMuchosDecimales = (num: number): boolean => {
  const decimales = contarDecimalesSignificativos(num);
  // Más de 2 decimales se considera "mucho"
  return decimales > 2 && num < 10;
};

/**
 * Determina la mejor unidad para mostrar una cantidad
 * Reglas inteligentes:
 * - Convertir si hay muchos decimales y cantidad pequeña (ej: 0.11379 kg → 113.79 g)
 * - Convertir si la cantidad es muy grande (ej: 50000 ml → 50 L)
 * - NO convertir si la cantidad está en un rango legible (ej: 24 L se queda en L)
 */
const obtenerMejorConversion = (
  cantidad: number,
  simboloActual: string,
  conversiones: ConversionData[]
): ConversionData | null => {
  // Buscar conversiones disponibles desde la unidad actual
  const conversionesDisponibles = conversiones.filter(
    c => c.simbolo_origen === simboloActual
  );

  if (conversionesDisponibles.length === 0) {
    return null;
  }

  // Reglas de conversión más estrictas
  const reglasConversion: Record<string, { 
    minParaConvertir: number; 
    maxParaConvertir: number; 
    preferir: string[];
    soloCuandoMuchosDecimales?: boolean;
  }> = {
    // Masa
    'kg': { 
      minParaConvertir: 0, 
      maxParaConvertir: 0.5, 
      preferir: ['g'],
      soloCuandoMuchosDecimales: true // Solo convertir si tiene muchos decimales
    },
    'g': { 
      minParaConvertir: 1500, 
      maxParaConvertir: Infinity, 
      preferir: ['kg'] 
    },
    'mg': { 
      minParaConvertir: 1500, 
      maxParaConvertir: Infinity, 
      preferir: ['g'] 
    },
    't': { 
      minParaConvertir: 0, 
      maxParaConvertir: 0.5, 
      preferir: ['kg'] 
    },
    
    // Volumen
    'L': { 
      minParaConvertir: 0, 
      maxParaConvertir: 0.5, 
      preferir: ['ml'],
      soloCuandoMuchosDecimales: true // Solo convertir si tiene muchos decimales
    },
    'ml': { 
      minParaConvertir: 1500, 
      maxParaConvertir: Infinity, 
      preferir: ['L'] 
    },
    'gal': { 
      minParaConvertir: 0, 
      maxParaConvertir: 0.5, 
      preferir: ['L'] 
    },
    'm³': { 
      minParaConvertir: 0, 
      maxParaConvertir: 0.5, 
      preferir: ['L'] 
    },
    
    // Unidades contables
    'ud': { 
      minParaConvertir: 24, 
      maxParaConvertir: Infinity, 
      preferir: ['doc'] 
    },
    'doc': { 
      minParaConvertir: 0, 
      maxParaConvertir: 0.5, 
      preferir: ['ud'] 
    },
  };

  const regla = reglasConversion[simboloActual];
  
  if (!regla) {
    return null;
  }

  // Verificar si debe convertirse
  let debeConvertir = false;

  if (regla.soloCuandoMuchosDecimales) {
    // Solo convertir si la cantidad es pequeña Y tiene muchos decimales
    debeConvertir = cantidad >= regla.minParaConvertir && 
                    cantidad <= regla.maxParaConvertir && 
                    tieneMuchosDecimales(cantidad);
  } else {
    // Convertir si está fuera del rango
    debeConvertir = cantidad >= regla.minParaConvertir && cantidad <= regla.maxParaConvertir;
  }

  if (!debeConvertir) {
    return null;
  }

  // Buscar la conversión preferida
  for (const simboloPreferido of regla.preferir) {
    const conversion = conversionesDisponibles.find(
      c => c.simbolo_destino === simboloPreferido
    );
    
    if (conversion) {
      const cantidadConvertida = cantidad * conversion.factor_conversion;
      
      // Verificar que la conversión mejora la legibilidad
      // La cantidad convertida debe estar en un rango razonable (1 - 10000)
      if (cantidadConvertida >= 1 && cantidadConvertida < 100000) {
        return conversion;
      }
    }
  }

  return null;
};

/**
 * Convierte una cantidad a la unidad más apropiada para mostrar
 */
export const convertirCantidad = (
  cantidad: number,
  simboloActual: string,
  nombreUnidadActual: string,
  conversiones: ConversionData[]
): CantidadFormateada => {
  // Caso base: no hay cantidad o no hay conversiones
  if (cantidad === 0 || !conversiones || conversiones.length === 0) {
    return {
      cantidad: redondear(cantidad),
      simbolo: simboloActual,
      unidad_nombre: nombreUnidadActual,
      cantidad_original: cantidad,
      simbolo_original: simboloActual,
      fue_convertido: false
    };
  }

  // Buscar la mejor conversión
  const mejorConversion = obtenerMejorConversion(cantidad, simboloActual, conversiones);

  if (!mejorConversion) {
    // No hay mejor conversión, retornar la cantidad original
    return {
      cantidad: redondear(cantidad),
      simbolo: simboloActual,
      unidad_nombre: nombreUnidadActual,
      cantidad_original: cantidad,
      simbolo_original: simboloActual,
      fue_convertido: false
    };
  }

  // Aplicar la conversión
  const cantidadConvertida = cantidad * mejorConversion.factor_conversion;

  return {
    cantidad: redondear(cantidadConvertida),
    simbolo: mejorConversion.simbolo_destino,
    unidad_nombre: mejorConversion.unidad_destino,
    cantidad_original: cantidad,
    simbolo_original: simboloActual,
    fue_convertido: true
  };
};

/**
 * Obtiene el texto formateado de una cantidad con su unidad
 */
export const obtenerTextoFormateado = (cantidadFormateada: CantidadFormateada): string => {
  const cantidad = formatearNumero(cantidadFormateada.cantidad);
  return `${cantidad} ${cantidadFormateada.simbolo}`;
};

/**
 * Obtiene el texto con la conversión original entre paréntesis si fue convertido
 */
export const obtenerTextoConOriginal = (cantidadFormateada: CantidadFormateada): string => {
  const textoFormateado = obtenerTextoFormateado(cantidadFormateada);
  
  if (cantidadFormateada.fue_convertido) {
    const cantidadOriginal = formatearNumero(cantidadFormateada.cantidad_original);
    return `${textoFormateado} (${cantidadOriginal} ${cantidadFormateada.simbolo_original})`;
  }
  
  return textoFormateado;
};

/**
 * Convierte una cantidad de una unidad específica a otra unidad específica
 * Si no hay conversión directa, intenta encontrar una conversión inversa
 * @param cantidad - La cantidad a convertir
 * @param simboloOrigen - El símbolo de la unidad origen (ej: "lb", "kg")
 * @param simboloDestino - El símbolo de la unidad destino
 * @param conversiones - Array de conversiones disponibles
 * @returns La cantidad convertida, o null si no se puede convertir
 */
export const convertirEntreUnidades = (
  cantidad: number,
  simboloOrigen: string,
  simboloDestino: string,
  conversiones: ConversionData[]
): number | null => {
  // Si las unidades son iguales, no hay conversión
  if (simboloOrigen === simboloDestino) {
    return cantidad;
  }

  // Buscar conversión directa
  const conversionDirecta = conversiones.find(
    c => c.simbolo_origen === simboloOrigen && c.simbolo_destino === simboloDestino
  );

  if (conversionDirecta) {
    return cantidad * conversionDirecta.factor_conversion;
  }

  // Buscar conversión inversa
  const conversionInversa = conversiones.find(
    c => c.simbolo_origen === simboloDestino && c.simbolo_destino === simboloOrigen
  );

  if (conversionInversa) {
    return cantidad / conversionInversa.factor_conversion;
  }

  // No se encontró conversión
  return null;
};
