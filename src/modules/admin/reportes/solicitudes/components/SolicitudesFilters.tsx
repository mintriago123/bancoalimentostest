/**
 * @fileoverview Controles de búsqueda y filtrado para solicitudes.
 */

import { Filter, Search } from 'lucide-react';
import type { SolicitudEstadoFilter } from '../types';

interface SolicitudesFiltersProps {
  search: string;
  estados: SolicitudEstadoFilter;
  onSearchChange: (value: string) => void;
  onToggleEstado: (estado: keyof SolicitudEstadoFilter) => void;
}

const SolicitudesFilters = ({
  search,
  estados,
  onSearchChange,
  onToggleEstado
}: SolicitudesFiltersProps) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre, cédula, alimento o teléfono..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-500 w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Filtrar:</span>
        </div>
        {Object.entries(estados).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggleEstado(key as keyof SolicitudEstadoFilter)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              value
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default SolicitudesFilters;
