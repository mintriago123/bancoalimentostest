/**
 * @fileoverview Utilidades para formateo de datos, filtrado y transformaciones
 * Este módulo contiene funciones puras y reutilizables para el procesamiento
 * de datos en el sistema de reportes de movimientos.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import type { MovementItem, ReportFilters, MovementSummary } from '../types';
import { LOCALE_CONFIG, MOVEMENT_TYPE_LABELS, DEFAULT_VALUES } from '../constants';

/**
 * Formatea un número según la configuración regional española
 * 
 * @param num - Número a formatear
 * @returns Número formateado como string con separadores de miles y decimales
 * 
 * @example
 * formatNumber(1234.56) // "1.234,56"
 * formatNumber(1000) // "1.000"
 */
export const formatNumber = (num: number): string => {
  if (!Number.isFinite(num)) {
    return '0';
  }
  
  return num.toLocaleString(LOCALE_CONFIG.locale, LOCALE_CONFIG.numberFormat);
};

/**
 * Formatea una fecha según la configuración regional española
 * 
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha formateada legible o valor por defecto si es inválida
 * 
 * @example
 * formatDate("2023-12-25T10:30:00Z") // "25/12/2023, 10:30"
 * formatDate("") // "—"
 * formatDate(null) // "—"
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString?.trim()) {
    return DEFAULT_VALUES.emptyDate;
  }

  try {
    const date = new Date(dateString);
    
    if (Number.isNaN(date.getTime())) {
      return dateString; // Retorna el string original si no se puede parsear
    }

    return date.toLocaleString(LOCALE_CONFIG.locale, LOCALE_CONFIG.dateFormat);
  } catch {
    return dateString; // Retorna el string original en caso de error
  }
};

/**
 * Aplica filtros a un conjunto de datos de movimientos
 * 
 * @param data - Array de movimientos a filtrar
 * @param filters - Filtros a aplicar
 * @returns Array filtrado de movimientos
 * 
 * @example
 * const filtered = applyMovementFilters(movements, {
 *   fecha_inicio: '2023-01-01',
 *   fecha_fin: '2023-12-31',
 *   tipo_movimiento: 'ingreso',
 *   producto: 'arroz'
 * });
 */
export const applyMovementFilters = (
  data: MovementItem[], 
  filters: ReportFilters
): MovementItem[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(item => {
    return isValidItem(item) &&
           passesDateFilter(item, filters) &&
           passesTypeFilter(item, filters) &&
           passesProductFilter(item, filters);
  });
};

/**
 * Valida que un item tenga la estructura correcta
 */
const isValidItem = (item: unknown): item is MovementItem => {
  return item !== null && typeof item === 'object';
};

/**
 * Verifica si el item pasa los filtros de fecha
 */
const passesDateFilter = (item: MovementItem, filters: ReportFilters): boolean => {
  if (!filters.fecha_inicio && !filters.fecha_fin) {
    return true;
  }

  try {
    const movementDate = new Date(item.fecha_movimiento);
    
    if (Number.isNaN(movementDate.getTime())) {
      return false;
    }

    // Verificar fecha de inicio
    if (filters.fecha_inicio) {
      const startDate = new Date(filters.fecha_inicio);
      if (Number.isNaN(startDate.getTime()) || movementDate < startDate) {
        return false;
      }
    }

    // Verificar fecha de fin
    if (filters.fecha_fin) {
      const endDate = new Date(filters.fecha_fin);
      if (Number.isNaN(endDate.getTime())) {
        return false;
      }
      
      /* Configurar para incluir todo el día final (hasta 23:59:59.999) */
      endDate.setHours(23, 59, 59, 999);
      
      if (movementDate > endDate) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Verifica si el item pasa el filtro de tipo de movimiento
 */
const passesTypeFilter = (item: MovementItem, filters: ReportFilters): boolean => {
  return !filters.tipo_movimiento || item.tipo_movimiento === filters.tipo_movimiento;
};

/**
 * Verifica si el item pasa el filtro de producto
 */
const passesProductFilter = (item: MovementItem, filters: ReportFilters): boolean => {
  if (!filters.producto?.trim()) {
    return true;
  }

  const productName = (item.nombre_producto || '').toLowerCase();
  const searchTerm = filters.producto.toLowerCase().trim();
  
  return productName.includes(searchTerm);
};

/**
 * Construye descripciones legibles de los filtros activos
 * 
 * @param filters - Filtros aplicados
 * @returns Array de descripciones de filtros
 * 
 * @example
 * buildFilterDescriptions({
 *   fecha_inicio: '2023-01-01',
 *   tipo_movimiento: 'ingreso',
 *   producto: 'arroz'
 * }) // ['Fecha inicio: 2023-01-01', 'Tipo: Ingreso', 'Producto contiene: arroz']
 */
export const buildFilterDescriptions = (filters: ReportFilters): string[] => {
  const descriptions: string[] = [];

  if (filters.fecha_inicio?.trim()) {
    descriptions.push(`Fecha inicio: ${filters.fecha_inicio}`);
  }

  if (filters.fecha_fin?.trim()) {
    descriptions.push(`Fecha fin: ${filters.fecha_fin}`);
  }

  if (filters.tipo_movimiento) {
    const label = MOVEMENT_TYPE_LABELS[filters.tipo_movimiento];
    descriptions.push(`Tipo: ${label}`);
  }

  if (filters.producto?.trim()) {
    descriptions.push(`Producto contiene: ${filters.producto.trim()}`);
  }

  return descriptions;
};

/**
 * Construye un resumen estadístico completo de los movimientos
 * 
 * @param data - Array de movimientos a analizar
 * @returns Objeto con estadísticas resumidas
 * 
 * @example
 * const summary = buildMovementSummary(movements);
 * console.log(summary.totalRecords); // 150
 * console.log(summary.ingresosPercentage); // 65.5
 */
export const buildMovementSummary = (data: MovementItem[]): MovementSummary => {
  // Validar entrada
  if (!Array.isArray(data) || data.length === 0) {
    return {
      totalRecords: 0,
      totalIngresosCount: 0,
      totalEgresosCount: 0,
      totalQuantity: 0,
      totalIngresosQuantity: 0,
      totalEgresosQuantity: 0,
      averageQuantity: 0,
      balanceCount: 0,
      balanceQuantity: 0,
      ingresosPercentage: 0,
      egresosPercentage: 0,
      uniqueProducts: 0
    };
  }

  // Contadores y acumuladores
  const productTotals = new Map<string, number>();
  let totalQuantity = 0;
  let totalIngresosCount = 0;
  let totalEgresosCount = 0;
  let totalIngresosQuantity = 0;
  let totalEgresosQuantity = 0;
  
  // Procesar cada movimiento
  data.forEach(item => {
    // Validar estructura del item
    if (!item || typeof item !== 'object') {
      return;
    }

    const cantidad = Number(item.cantidad) || 0;
    
    // Acumular cantidades totales
    totalQuantity += cantidad;

    // Clasificar por tipo de movimiento
    if (item.tipo_movimiento === 'ingreso') {
      totalIngresosCount += 1;
      totalIngresosQuantity += cantidad;
    } else if (item.tipo_movimiento === 'egreso') {
      totalEgresosCount += 1;
      totalEgresosQuantity += cantidad;
    }

    // Acumular por producto
    const productKey = (item.nombre_producto || DEFAULT_VALUES.unknownProduct).trim();
    if (productKey) {
      productTotals.set(productKey, (productTotals.get(productKey) || 0) + cantidad);
    }
  });

  // Calcular métricas derivadas
  const totalRecords = data.length;
  const balanceCount = totalIngresosCount - totalEgresosCount;
  const balanceQuantity = totalIngresosQuantity - totalEgresosQuantity;
  const uniqueProducts = productTotals.size;

  // Calcular promedios y porcentajes (evitar división por cero)
  const averageQuantity = totalRecords > 0 ? totalQuantity / totalRecords : 0;
  const ingresosPercentage = totalRecords > 0 ? (totalIngresosCount / totalRecords) * 100 : 0;
  const egresosPercentage = totalRecords > 0 ? (totalEgresosCount / totalRecords) * 100 : 0;

  // Encontrar producto con mayor movimiento
  let topProduct: { name: string; quantity: number } | undefined;
  if (productTotals.size > 0) {
    const sortedProducts = [...productTotals.entries()].sort((a, b) => b[1] - a[1]);
    const [name, quantity] = sortedProducts[0];
    topProduct = { name, quantity };
  }

  return {
    totalRecords,
    totalIngresosCount,
    totalEgresosCount,
    totalQuantity,
    totalIngresosQuantity,
    totalEgresosQuantity,
    averageQuantity,
    balanceCount,
    balanceQuantity,
    ingresosPercentage,
    egresosPercentage,
    uniqueProducts,
    topProduct
  };
};

/**
 * Valida si un rango de fechas es válido
 * 
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns true si el rango es válido, false en caso contrario
 * 
 * @example
 * validateDateRange('2023-01-01', '2023-12-31') // true
 * validateDateRange('2023-12-31', '2023-01-01') // false
 * validateDateRange('invalid', '2023-01-01') // false
 */
export const validateDateRange = (startDate?: string, endDate?: string): boolean => {
  if (!startDate && !endDate) {
    return true; // Sin fechas especificadas es válido
  }

  try {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return false;
      }
      
      return start <= end;
    }

    // Si solo hay una fecha, validar que sea válida
    if (startDate) {
      const start = new Date(startDate);
      return !Number.isNaN(start.getTime());
    }

    if (endDate) {
      const end = new Date(endDate);
      return !Number.isNaN(end.getTime());
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitiza texto para prevenir inyección XSS y normalizar entrada
 * 
 * @param text - Texto a sanitizar
 * @returns Texto sanitizado
 * 
 * @example
 * sanitizeText('<script>alert("xss")</script>') // 'alert("xss")'
 * sanitizeText('  producto   ') // 'producto'
 */
export const sanitizeText = (text: unknown): string => {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .trim() // Eliminar espacios al inicio y final
    .replace(/<[^>]*>/g, '') // Eliminar tags HTML
    .replace(/[<>'"&]/g, '') // Eliminar caracteres potencialmente peligrosos
    .substring(0, 500); // Limitar longitud para prevenir ataques
};

/**
 * Genera un nombre de archivo único para exportación
 * 
 * @param prefix - Prefijo del archivo
 * @param extension - Extensión del archivo
 * @returns Nombre de archivo único con timestamp
 * 
 * @example
 * generateExportFilename('reporte_movimientos', '.xlsx') 
 * // 'reporte_movimientos_2023-12-25.xlsx'
 */
export const generateExportFilename = (prefix: string, extension: string): string => {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  return `${sanitizeText(prefix)}_${dateString}${extension}`;
};

/**
 * Convierte un array de datos a formato para hoja de cálculo
 * Rellena con celdas vacías hasta alcanzar el número de columnas especificado
 * 
 * @param row - Fila de datos
 * @param columnCount - Número total de columnas deseado
 * @returns Fila con el número correcto de columnas
 * 
 * @example
 * padRowToColumnCount(['A', 'B'], 4) // ['A', 'B', '', '']
 */
export const padRowToColumnCount = (
  row: (string | number)[], 
  columnCount: number
): (string | number)[] => {
  if (!Array.isArray(row)) {
    return new Array(columnCount).fill('');
  }

  const paddedRow = [...row];
  
  while (paddedRow.length < columnCount) {
    paddedRow.push('');
  }

  return paddedRow.slice(0, columnCount); // Truncar si es más largo
};