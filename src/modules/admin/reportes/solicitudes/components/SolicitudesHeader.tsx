/**
 * @fileoverview Encabezado con métricas principales de solicitudes.
 */

import type { SolicitudCounters } from '../types';

interface SolicitudesHeaderProps {
  counters: SolicitudCounters;
}

const cards: Array<{ key: keyof SolicitudCounters; label: string; color: string; bg: string }> = [
  { key: 'total', label: 'Total', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { key: 'pendiente', label: 'Pendientes', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { key: 'aprobada', label: 'Aprobadas', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { key: 'rechazada', label: 'Rechazadas', color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
];

const SolicitudesHeader = ({ counters }: SolicitudesHeaderProps) => (
  <div className="flex justify-between items-start">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Gestión de Solicitudes</h1>
      <p className="text-sm text-gray-600 mt-1">
        Administra y gestiona las solicitudes de alimentos recibidas.
      </p>
    </div>

    <div className="grid grid-cols-4 gap-4 text-center">
      {cards.map(card => (
        <div key={card.key} className={`${card.bg} p-3 rounded-lg border`}>
          <div className={`text-2xl font-bold ${card.color}`}>
            {counters[card.key]}
          </div>
          <div className={`text-xs ${card.color}`}>{card.label}</div>
        </div>
      ))}
    </div>
  </div>
);

export default SolicitudesHeader;
