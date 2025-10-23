/**
 * @fileoverview Constantes para el módulo de inventario.
 */

import type { InventarioFilters, StockLevelFilter } from '../types';

export const STOCK_THRESHOLDS = {
  bajo: 10,
  normal: 50
} as const;

export const INITIAL_FILTERS: InventarioFilters = {
  search: '',
  depositoId: 'todos',
  stockLevel: 'todos'
};

export const STOCK_FILTER_OPTIONS: Array<{ value: StockLevelFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'bajo', label: 'Bajo (≤10)' },
  { value: 'normal', label: 'Normal (11-50)' },
  { value: 'alto', label: 'Alto (>50)' }
];

export const SYSTEM_MESSAGES = {
  loadError: 'No fue posible obtener el inventario. Intenta nuevamente.',
  noData: 'No hay productos en el inventario.',
  noFilteredData: 'No se encontraron productos con los filtros aplicados.'
};
