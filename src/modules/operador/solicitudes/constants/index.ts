/**
 * @fileoverview Constantes para el módulo de solicitudes del operador.
 */

import React from 'react';
import { CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { SolicitudEstado, SolicitudFilters } from '../types';

export const INITIAL_FILTERS: SolicitudFilters = {
  search: '',
  estados: {
    todos: true,
    pendiente: false,
    aprobada: false,
    rechazada: false,
    entregada: false
  }
};

export const ESTADO_BADGE_STYLES: Record<SolicitudEstado, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aprobada: 'bg-green-100 text-green-800 border-green-200',
  rechazada: 'bg-red-100 text-red-800 border-red-200',
  entregada: 'bg-blue-100 text-blue-800 border-blue-200'
};

export const ESTADO_ICONS: Record<SolicitudEstado, React.ReactElement> = {
  pendiente: React.createElement(Clock, { className: 'w-4 h-4' }),
  aprobada: React.createElement(CheckCircle, { className: 'w-4 h-4' }),
  rechazada: React.createElement(XCircle, { className: 'w-4 h-4' }),
  entregada: React.createElement(Package, { className: 'w-4 h-4' })
};

export const ESTADO_LABELS: Record<SolicitudEstado, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  entregada: 'Entregada'
};

export const SYSTEM_MESSAGES = {
  noData: 'No hay solicitudes registradas',
  noFilteredData: 'No se encontraron solicitudes con los filtros aplicados',
  loadError: 'Error al cargar las solicitudes, intenta de nuevo.',
  actionError: 'Error al procesar la solicitud, intenta nuevamente.'
};

export const MOTIVOS_RECHAZO = [
  {
    id: 'stock_insuficiente',
    label: 'Stock insuficiente',
    descripcion: 'No hay cantidad suficiente disponible'
  },
  {
    id: 'producto_no_disponible',
    label: 'Producto no disponible',
    descripcion: 'El producto solicitado no está en inventario'
  },
  {
    id: 'datos_incompletos',
    label: 'Datos incompletos',
    descripcion: 'La solicitud carece de información requerida'
  },
  {
    id: 'solicitante_ineligible',
    label: 'Solicitante ineligible',
    descripcion: 'El solicitante no cumple con los requisitos'
  },
  {
    id: 'duplicada',
    label: 'Solicitud duplicada',
    descripcion: 'Ya existe una solicitud similar en proceso'
  },
  {
    id: 'vencimiento_proximo',
    label: 'Próximos a vencer',
    descripcion: 'Los productos disponibles están próximos a vencer'
  },
  {
    id: 'otro',
    label: 'Otro motivo',
    descripcion: 'Especificar en los comentarios'
  }
];
