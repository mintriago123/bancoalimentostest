/**
 * @fileoverview Controles de búsqueda y filtrado para inventario.
 */

import { Filter, RefreshCw, Search, Warehouse } from 'lucide-react';
import type { Deposito, InventarioFilters } from '../types';
import { STOCK_FILTER_OPTIONS } from '../constants';

interface InventoryFiltersProps {
  filters: InventarioFilters;
  depositos: Deposito[];
  onSearchChange: (value: string) => void;
  onDepositoChange: (value: string) => void;
  onStockChange: (value: InventarioFilters['stockLevel']) => void;
  onRefresh: () => void;
  filteredCount: number;
  totalCount: number;
}

const InventoryFilters = ({
  filters,
  depositos,
  onSearchChange,
  onDepositoChange,
  onStockChange,
  onRefresh,
  filteredCount,
  totalCount
}: InventoryFiltersProps) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar productos, depósitos..."
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Warehouse className="text-gray-500 w-5 h-5" />
        <span className="text-sm font-medium text-gray-700">Depósito:</span>
        <select
          value={filters.depositoId}
          onChange={(event) => onDepositoChange(event.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
        >
          <option value="todos">Todos</option>
          {depositos.map(deposito => (
            <option key={deposito.id_deposito} value={deposito.id_deposito}>
              {deposito.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <Filter className="text-gray-500 w-5 h-5" />
        <span className="text-sm font-medium text-gray-700">Stock:</span>
        <select
          value={filters.stockLevel}
          onChange={(event) => onStockChange(event.target.value as InventarioFilters['stockLevel'])}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
        >
          {STOCK_FILTER_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Actualizar
      </button>
    </div>

    <div className="mt-2 text-sm text-gray-600">
      Mostrando {filteredCount} de {totalCount} productos
    </div>
  </div>
);

export default InventoryFilters;
