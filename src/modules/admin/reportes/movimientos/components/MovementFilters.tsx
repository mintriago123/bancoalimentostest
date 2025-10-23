/**
 * @fileoverview Componente de filtros para reportes de movimientos con estilo renovado.
 */

import React from 'react';
import { Filter, Search } from 'lucide-react';
import type { ReportFilters } from '../types';

interface MovementFiltersProps {
  filters: ReportFilters;
  onFilterChange: (key: keyof ReportFilters, value: string) => void;
  onClearFilters: () => void;
  activeFilterDescriptions: string[];
  disabled?: boolean;
}

export const MovementFilters: React.FC<MovementFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterDescriptions,
  disabled = false
}) => {
  const handleInputChange = (key: keyof ReportFilters) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onFilterChange(key, event.target.value);
  };

  const labelClassName = 'mb-1 block text-sm font-medium text-slate-600';
  const baseInputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 transition-colors';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        <div>
          <label htmlFor="fecha-inicio" className={labelClassName}>
            Fecha inicio
          </label>
          <input
            id="fecha-inicio"
            type="date"
            value={filters.fecha_inicio}
            onChange={handleInputChange('fecha_inicio')}
            disabled={disabled}
            className={baseInputClass}
            aria-describedby="fecha-inicio-help"
          />
          <div id="fecha-inicio-help" className="sr-only">
            Seleccione la fecha de inicio para filtrar movimientos.
          </div>
        </div>

        <div>
          <label htmlFor="fecha-fin" className={labelClassName}>
            Fecha fin
          </label>
          <input
            id="fecha-fin"
            type="date"
            value={filters.fecha_fin}
            onChange={handleInputChange('fecha_fin')}
            disabled={disabled}
            className={baseInputClass}
            aria-describedby="fecha-fin-help"
          />
          <div id="fecha-fin-help" className="sr-only">
            Seleccione la fecha final del rango.
          </div>
        </div>

        <div>
          <label htmlFor="tipo-movimiento" className={labelClassName}>
            Tipo de movimiento
          </label>
          <select
            id="tipo-movimiento"
            value={filters.tipo_movimiento || ''}
            onChange={handleInputChange('tipo_movimiento')}
            disabled={disabled}
            className={baseInputClass}
            aria-describedby="tipo-movimiento-help"
          >
            <option value="">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
          <div id="tipo-movimiento-help" className="sr-only">
            Seleccione el tipo de movimiento a mostrar.
          </div>
        </div>

        <div>
          <label htmlFor="producto" className={labelClassName}>
            Producto
          </label>
          <div className="relative">
            <input
              id="producto"
              type="text"
              placeholder="Buscar producto..."
              value={filters.producto}
              onChange={handleInputChange('producto')}
              disabled={disabled}
              className={`${baseInputClass} pl-10`}
              aria-describedby="producto-help"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          </div>
          <div id="producto-help" className="sr-only">
            Escriba el nombre del producto a filtrar.
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center text-sm text-slate-500">
          <Filter className="mr-2 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
          <span className="font-medium text-slate-600">Filtros activos:</span>
          <span className="ml-2">
            {activeFilterDescriptions.length > 0 ? (
              <span className="text-slate-700">
                {activeFilterDescriptions.join(' • ')}
              </span>
            ) : (
              <span className="text-slate-400">Ninguno</span>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          disabled={disabled || activeFilterDescriptions.length === 0}
          className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            disabled || activeFilterDescriptions.length === 0
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : 'bg-slate-900 text-white shadow-sm hover:bg-slate-700 focus:ring-slate-500'
          }`}
          aria-label="Limpiar todos los filtros aplicados"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default MovementFilters;
