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
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar productos, depósitos..."
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Warehouse className="text-slate-500 w-5 h-5" />
        <span className="text-sm font-medium text-slate-600">Depósito:</span>
        <select
          value={filters.depositoId}
          onChange={(event) => onDepositoChange(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
        <Filter className="text-slate-500 w-5 h-5" />
        <span className="text-sm font-medium text-slate-600">Stock:</span>
        <select
          value={filters.stockLevel}
          onChange={(event) => onStockChange(event.target.value as InventarioFilters['stockLevel'])}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
        className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Actualizar
      </button>
    </div>

    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
      Mostrando {filteredCount} de {totalCount} productos
      {totalCount === 0 && (
        <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
          Sin registros
        </span>
      )}
    </div>
  </div>
);

export default InventoryFilters;
