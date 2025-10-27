/**
 * @fileoverview Filtros específicos de inventario para operadores con alertas y funcionalidades avanzadas.
 */

import { Search, AlertTriangle, Clock, Filter, X } from 'lucide-react';
import type { OperadorInventarioFilters, Deposito, StockLevelFilter } from '../types';

interface OperadorInventoryFiltersProps {
  filters: OperadorInventarioFilters;
  depositos: Deposito[];
  onSearchChange: (value: string) => void;
  onDepositoChange: (value: string) => void;
  onStockLevelChange: (value: StockLevelFilter) => void;
  onAlertasOnlyChange: (value: boolean) => void;
  onProximosVencerChange: (value: boolean) => void;
  onReset: () => void;
  totalItems: number;
  filteredItems: number;
}

const STOCK_LEVEL_OPTIONS = [
  { value: 'todos', label: 'Todos los niveles', color: 'text-gray-600' },
  { value: 'bajo', label: 'Stock Bajo', color: 'text-red-600' },
  { value: 'normal', label: 'Stock Normal', color: 'text-yellow-600' },
  { value: 'alto', label: 'Stock Alto', color: 'text-green-600' }
] as const;

const OperadorInventoryFilters = ({
  filters,
  depositos,
  onSearchChange,
  onDepositoChange,
  onStockLevelChange,
  onAlertasOnlyChange,
  onProximosVencerChange,
  onReset,
  totalItems,
  filteredItems
}: OperadorInventoryFiltersProps) => {
  const hasActiveFilters = filters.search.trim() !== '' || 
    filters.depositoId !== 'todos' || 
    filters.stockLevel !== 'todos' ||
    filters.alertasOnly ||
    filters.proximosVencer;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Inventario</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Resultados */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-semibold text-gray-900">{filteredItems}</span> de{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> productos
          {hasActiveFilters && (
            <span className="ml-1 text-orange-600">(filtrado)</span>
          )}
        </div>
      </div>

      {/* Filtros principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Buscar producto
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nombre, descripción..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Depósito */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Depósito
          </label>
          <select
            value={filters.depositoId}
            onChange={(e) => onDepositoChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="todos">Todos los depósitos</option>
            {depositos.map(deposito => (
              <option key={deposito.id_deposito} value={deposito.id_deposito}>
                {deposito.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Nivel de Stock */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nivel de Stock
          </label>
          <select
            value={filters.stockLevel}
            onChange={(e) => onStockLevelChange(e.target.value as StockLevelFilter)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {STOCK_LEVEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value} className={option.color}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros especiales del operador */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Filtros Especiales</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Solo alertas */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <input
                id="alertas-only"
                type="checkbox"
                checked={filters.alertasOnly}
                onChange={(e) => onAlertasOnlyChange(e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor="alertas-only" className="ml-2 text-sm text-gray-700 cursor-pointer">
                Solo productos que necesitan atención
              </label>
            </div>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>

          {/* Próximos a vencer */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <input
                id="proximos-vencer"
                type="checkbox"
                checked={filters.proximosVencer}
                onChange={(e) => onProximosVencerChange(e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor="proximos-vencer" className="ml-2 text-sm text-gray-700 cursor-pointer">
                Próximos a vencer (30 días)
              </label>
            </div>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600">Filtros activos:</span>
            
            {filters.search.trim() && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Búsqueda: "{filters.search.trim()}"
              </span>
            )}
            
            {filters.depositoId !== 'todos' && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Depósito: {depositos.find(d => d.id_deposito === filters.depositoId)?.nombre || 'Desconocido'}
              </span>
            )}
            
            {filters.stockLevel !== 'todos' && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Stock: {STOCK_LEVEL_OPTIONS.find(o => o.value === filters.stockLevel)?.label}
              </span>
            )}
            
            {filters.alertasOnly && (
              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Solo alertas
              </span>
            )}
            
            {filters.proximosVencer && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                <Clock className="w-3 h-3 mr-1" />
                Próximos a vencer
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperadorInventoryFilters;