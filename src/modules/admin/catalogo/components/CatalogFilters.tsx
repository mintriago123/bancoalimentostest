import { Filter, RefreshCw, Search } from 'lucide-react';
import type { CatalogFilters } from '../types';

interface CatalogFiltersProps {
  filters: CatalogFilters;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
}

const CatalogFiltersComponent = ({
  filters,
  categories,
  onSearchChange,
  onCategoryChange,
  onReset
}: CatalogFiltersProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o categoría"
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="flex flex-1 items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-600">Categoría:</span>
        <select
          value={filters.category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'todos' ? 'Todas las categorías' : category}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Limpiar filtros
      </button>
    </div>
  </div>
);

export default CatalogFiltersComponent;
