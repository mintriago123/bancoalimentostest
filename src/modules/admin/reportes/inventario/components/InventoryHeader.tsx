/**
 * @fileoverview Encabezado y métricas principales del inventario.
 */

import type { InventarioStats } from '../types';

interface InventoryHeaderProps {
  stats: InventarioStats;
}

const CARDS: Array<{
  key: keyof InventarioStats;
  label: string;
  color: string;
  bg: string;
}> = [
  { key: 'totalProductos', label: 'Productos', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  { key: 'stockBajo', label: 'Stock Bajo', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { key: 'stockNormal', label: 'Stock Normal', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { key: 'stockAlto', label: 'Stock Alto', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { key: 'totalUnidades', label: 'Total Unidades', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' }
];

const InventoryHeader = ({ stats }: InventoryHeaderProps) => (
  <div className="flex justify-between items-start">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
      <p className="text-sm text-gray-600 mt-1">
        Administra el stock de productos en todos los depósitos
      </p>
    </div>

    <div className="grid grid-cols-5 gap-4 text-center">
      {CARDS.map(card => (
        <div key={card.label} className={`${card.bg} p-3 rounded-lg border`}>
          <div className={`text-2xl font-bold ${card.color}`}>
            {stats[card.key]}
          </div>
          <div className={`text-xs ${card.color}`}>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default InventoryHeader;
