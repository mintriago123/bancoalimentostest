/**
 * @fileoverview Controles de búsqueda y filtrado para solicitudes del operador.
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
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre, cédula, alimento o teléfono..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="text-slate-500 w-5 h-5" />
          <span className="text-sm font-medium text-slate-600">Filtrar:</span>
        </div>
        {Object.entries(estados).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggleEstado(key as keyof SolicitudEstadoFilter)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
