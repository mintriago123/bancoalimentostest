/**
 * @fileoverview Constantes para el módulo de reportes de donaciones.
 */

import type { DonationEstado, DonationFilters } from '../types';

export const INITIAL_FILTERS: DonationFilters = {
  search: '',
  estado: {
    todos: true,
    Pendiente: false,
    Recogida: false,
    Entregada: false,
    Cancelada: false
  },
  tipoPersona: {
    todos: true,
    Natural: false,
    Juridica: false
  }
};

export const DONATION_STATE_COLORS: Record<DonationEstado, string> = {
  Pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Recogida: 'bg-blue-100 text-blue-800 border-blue-200',
  Entregada: 'bg-green-100 text-green-800 border-green-200',
  Cancelada: 'bg-red-100 text-red-800 border-red-200'
};

export const SYSTEM_MESSAGES = {
  loadError: 'No fue posible obtener las donaciones. Intenta nuevamente.',
  noData: 'No hay donaciones registradas.',
  noFilteredData: 'No se encontraron donaciones con los filtros aplicados.',
  integrationWarning: 'Donación marcada como entregada, pero hubo un error al actualizar el inventario.',
  stateUpdateSuccess: (estado: string) => `Donación ${estado.toLowerCase()} exitosamente.`,
  inventoryIncrement: (cantidad: number, unidad: string, producto: string) =>
    `Se agregaron ${cantidad} ${unidad} de ${producto} al inventario.`,
  inventoryCreate: (cantidad: number, unidad: string, producto: string) =>
    `Se registró un nuevo producto en inventario con ${cantidad} ${unidad} de ${producto}.`
};

export const PERSON_TYPE_LABELS = {
  Natural: 'Persona Natural',
  Juridica: 'Persona Jurídica'
};
