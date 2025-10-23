/**
 * @fileoverview Controles de búsqueda y filtros para donaciones.
 */

import { Filter, RefreshCw, Search } from 'lucide-react';
import type { DonationEstadoFilter, DonationFilters, DonationPersonTypeFilter } from '../types';

interface DonationsFiltersProps {
  filters: DonationFilters;
  onSearchChange: (value: string) => void;
  onToggleEstado: (estado: keyof DonationEstadoFilter) => void;
  onTogglePersonType: (tipo: keyof DonationPersonTypeFilter) => void;
  onRefresh: () => void;
  filteredCount: number;
  totalCount: number;
}

const DonationsFilters = ({
  filters,
  onSearchChange,
  onToggleEstado,
  onTogglePersonType,
  onRefresh,
  filteredCount,
  totalCount
}: DonationsFiltersProps) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar donaciones..."
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-500 w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Estado:</span>
        </div>
        {Object.entries(filters.estado).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggleEstado(key as keyof DonationEstadoFilter)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              value ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {key === 'todos' ? 'Todos' : key}
          </button>
        ))}
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700">Tipo de persona:</span>
        {Object.entries(filters.tipoPersona).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onTogglePersonType(key as keyof DonationPersonTypeFilter)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {key === 'todos' ? 'Todos' : key}
          </button>
        ))}
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
      Mostrando {filteredCount} de {totalCount} donaciones
      {totalCount === 0 && (
        <span className="ml-2 text-red-600">(No hay donaciones registradas)</span>
      )}
    </div>
  </div>
);

export default DonationsFilters;
