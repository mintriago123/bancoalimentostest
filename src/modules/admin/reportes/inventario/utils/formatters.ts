/**
 * @fileoverview Utilidades de formato y cálculos para inventario.
 */

import { STOCK_THRESHOLDS } from '../constants';
import type { InventarioItem, InventarioStats, StockLevel } from '../types';
import { formatShortDate } from '@/lib/dateUtils';

export const formatDate = (value?: string | null) => {
  return formatShortDate(value);
};

/**
 * Formatea una cantidad numérica con máximo 2 decimales.
 * Si es un número entero, lo muestra sin decimales.
 * Si es decimal, muestra máximo 2 decimales.
 */
export const formatQuantity = (cantidad: number): string => {
  // Si es un número entero, retornarlo sin decimales
  if (Number.isInteger(cantidad)) {
    return cantidad.toString();
  }
  // Si es decimal, mostrar máximo 2 decimales
  return cantidad.toFixed(2).replace(/\.?0+$/, '');
};

export const determineStockLevel = (cantidad: number): StockLevel => {
  if (cantidad <= STOCK_THRESHOLDS.bajo) return 'bajo';
  if (cantidad <= STOCK_THRESHOLDS.normal) return 'normal';
  return 'alto';
};

export const buildStats = (items: InventarioItem[]): InventarioStats => {
  return items.reduce<InventarioStats>((stats, item) => {
    const level = determineStockLevel(item.cantidad_disponible);
    stats.totalProductos += 1;
    stats.totalUnidades += item.cantidad_disponible;

    if (level === 'bajo') stats.stockBajo += 1;
    else if (level === 'normal') stats.stockNormal += 1;
    else stats.stockAlto += 1;

    return stats;
  }, {
    totalProductos: 0,
    stockBajo: 0,
    stockNormal: 0,
    stockAlto: 0,
    totalUnidades: 0
  });
};
