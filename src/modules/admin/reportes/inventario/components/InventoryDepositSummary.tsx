/**
 * @fileoverview Tarjetas resumen por depósito.
 */

import { Warehouse } from 'lucide-react';
import type { Deposito, InventarioItem } from '../types';
import { formatQuantity } from '../utils/formatters';

interface InventoryDepositSummaryProps {
  depositos: Deposito[];
  inventario: InventarioItem[];
}

const InventoryDepositSummary = ({
  depositos,
  inventario
}: InventoryDepositSummaryProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {depositos.map(deposito => {
      const productos = inventario.filter(item => item.id_deposito === deposito.id_deposito);
      const totalProductos = productos.length;
      const totalUnidades = productos.reduce((sum, item) => sum + item.cantidad_disponible, 0);
      const stockBajo = productos.filter(item => item.cantidad_disponible <= 10).length;

      return (
        <div key={deposito.id_deposito} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{deposito.nombre}</h3>
            <Warehouse className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Productos únicos</span>
              <span className="text-sm font-medium text-gray-900">{totalProductos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total unidades</span>
              <span className="text-sm font-medium text-gray-900">{formatQuantity(totalUnidades)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock bajo</span>
              <span className={`text-sm font-medium ${stockBajo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stockBajo}
              </span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default InventoryDepositSummary;
