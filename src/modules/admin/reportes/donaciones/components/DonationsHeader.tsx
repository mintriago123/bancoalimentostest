/**
 * @fileoverview Encabezado con métricas principales de donaciones.
 */

import type { DonationCounters } from '../types';

interface DonationsHeaderProps {
  counters: DonationCounters;
}

const CARDS: Array<{
  key: keyof DonationCounters;
  label: string;
  color: string;
  bg: string;
}> = [
  { key: 'total', label: 'Total', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  { key: 'pendientes', label: 'Pendientes', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { key: 'recogidas', label: 'Recogidas', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { key: 'entregadas', label: 'Entregadas', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { key: 'canceladas', label: 'Canceladas', color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
];

const DonationsHeader = ({ counters }: DonationsHeaderProps) => (
  <div className="flex justify-between items-start">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Gestión de Donaciones</h1>
      <p className="text-sm text-gray-600 mt-1">
        Monitorea las donaciones recibidas y su integración con inventario.
      </p>
    </div>

    <div className="grid grid-cols-5 gap-4 text-center">
      {CARDS.map(card => (
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

export default DonationsHeader;
