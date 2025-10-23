/**
 * @fileoverview Utilidades de formato y filtrado para donaciones.
 */

import type {
  Donation,
  DonationCounters,
  DonationFilters,
  DonationEstado,
  DonationEstadoFilter,
  DonationPersonTypeFilter
} from '../types';

export const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';

  try {
    return new Date(value).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return value;
  }
};

export const isNearExpiration = (fechaVencimiento?: string | null, days = 7) => {
  if (!fechaVencimiento) return false;

  const today = new Date();
  const expiration = new Date(fechaVencimiento);
  if (Number.isNaN(expiration.getTime())) return false;

  const diffDays = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays >= 0;
};

export const isExpired = (fechaVencimiento?: string | null) => {
  if (!fechaVencimiento) return false;
  const expiration = new Date(fechaVencimiento);
  if (Number.isNaN(expiration.getTime())) return false;
  return expiration < new Date();
};

const passesEstadoFilter = (donation: Donation, filter: DonationEstadoFilter) => {
  if (filter.todos) return true;
  return filter[donation.estado];
};

const passesPersonTypeFilter = (donation: Donation, filter: DonationPersonTypeFilter) => {
  if (filter.todos) return true;
  return filter[donation.tipo_persona_donante];
};

const passesSearchFilter = (donation: Donation, term: string) => {
  if (!term.trim()) return true;
  const query = term.trim().toLowerCase();

  const fields = [
    donation.nombre_donante,
    donation.cedula_donante,
    donation.ruc_donante,
    donation.telefono,
    donation.email,
    donation.tipo_producto,
    donation.categoria_comida,
    donation.alimento?.nombre
  ];

  return fields.some(field => field?.toLowerCase().includes(query));
};

export const applyDonationFilters = (donations: Donation[], filters: DonationFilters) => {
  if (!Array.isArray(donations)) return [];

  return donations.filter(donation =>
    passesSearchFilter(donation, filters.search) &&
    passesEstadoFilter(donation, filters.estado) &&
    passesPersonTypeFilter(donation, filters.tipoPersona)
  );
};

export const buildDonationCounters = (donations: Donation[]): DonationCounters => {
  return donations.reduce<DonationCounters>((acc, donation) => {
    acc.total += 1;
    switch (donation.estado) {
      case 'Pendiente':
        acc.pendientes += 1;
        break;
      case 'Recogida':
        acc.recogidas += 1;
        break;
      case 'Entregada':
        acc.entregadas += 1;
        break;
      case 'Cancelada':
        acc.canceladas += 1;
        break;
      default:
        break;
    }
    return acc;
  }, {
    total: 0,
    pendientes: 0,
    recogidas: 0,
    entregadas: 0,
    canceladas: 0
  });
};

export const hasActiveFilters = (filters: DonationFilters) => {
  const estadoActive = !filters.estado.todos;
  const tipoPersonaActive = !filters.tipoPersona.todos;
  const searchActive = filters.search.trim() !== '';
  return estadoActive || tipoPersonaActive || searchActive;
};

export const toReadableEstado = (estado: DonationEstado) => estado;
