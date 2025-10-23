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
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar donaciones..."
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="text-slate-500 w-5 h-5" />
          <span className="text-sm font-medium text-slate-600">Estado:</span>
        </div>
        {Object.entries(filters.estado).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggleEstado(key as keyof DonationEstadoFilter)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {key === 'todos' ? 'Todos' : key}
          </button>
        ))}
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm font-medium text-slate-600">Tipo de persona:</span>
        {Object.entries(filters.tipoPersona).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onTogglePersonType(key as keyof DonationPersonTypeFilter)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {key === 'todos' ? 'Todos' : key}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Actualizar
      </button>
    </div>

    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
      Mostrando {filteredCount} de {totalCount} donaciones
      {totalCount === 0 && (
        <span className="ml-2 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-500">
          Sin registros
        </span>
      )}
    </div>
  </div>
);

export default DonationsFilters;
