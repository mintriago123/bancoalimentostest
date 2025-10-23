/**
 * @fileoverview Componente de filtros para reportes de movimientos
 * Proporciona una interfaz de usuario clara y accesible para filtrar datos
 * de movimientos por fecha, tipo y producto.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import React from 'react';
import { Filter } from 'lucide-react';
import type { ReportFilters } from '../types';

/**
 * Props para el componente MovementFilters
 */
interface MovementFiltersProps {
  /** Filtros actuales aplicados */
  filters: ReportFilters;
  
  /** Callback para cambiar un filtro específico */
  onFilterChange: (key: keyof ReportFilters, value: string) => void;
  
  /** Callback para limpiar todos los filtros */
  onClearFilters: () => void;
  
  /** Descripciones de filtros activos para mostrar al usuario */
  activeFilterDescriptions: string[];
  
  /** Indica si el componente está deshabilitado */
  disabled?: boolean;
}

/**
 * Componente de filtros para reportes de movimientos
 * Permite a los usuarios filtrar datos por múltiples criterios de manera intuitiva
 */
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

  const inputClassName = `
    w-full px-3 py-2 border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
  `.trim();

  const labelClassName = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      {/* Grid de campos de filtro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Filtro de fecha de inicio */}
        <div>
          <label htmlFor="fecha-inicio" className={labelClassName}>
            Fecha Inicio
          </label>
          <input
            id="fecha-inicio"
            type="date"
            value={filters.fecha_inicio}
            onChange={handleInputChange('fecha_inicio')}
            disabled={disabled}
            className={inputClassName}
            aria-describedby="fecha-inicio-help"
          />
          <div id="fecha-inicio-help" className="sr-only">
            Seleccione la fecha de inicio para filtrar movimientos
          </div>
        </div>

        {/* Filtro de fecha de fin */}
        <div>
          <label htmlFor="fecha-fin" className={labelClassName}>
            Fecha Fin
          </label>
          <input
            id="fecha-fin"
            type="date"
            value={filters.fecha_fin}
            onChange={handleInputChange('fecha_fin')}
            disabled={disabled}
            className={inputClassName}
            aria-describedby="fecha-fin-help"
          />
          <div id="fecha-fin-help" className="sr-only">
            Seleccione la fecha de fin para filtrar movimientos
          </div>
        </div>

        {/* Filtro de tipo de movimiento */}
        <div>
          <label htmlFor="tipo-movimiento" className={labelClassName}>
            Tipo de Movimiento
          </label>
          <select
            id="tipo-movimiento"
            value={filters.tipo_movimiento || ''}
            onChange={handleInputChange('tipo_movimiento')}
            disabled={disabled}
            className={inputClassName}
            aria-describedby="tipo-movimiento-help"
          >
            <option value="">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
          <div id="tipo-movimiento-help" className="sr-only">
            Seleccione el tipo de movimiento a mostrar
          </div>
        </div>

        {/* Filtro de producto */}
        <div>
          <label htmlFor="producto" className={labelClassName}>
            Producto
          </label>
          <input
            id="producto"
            type="text"
            placeholder="Buscar producto..."
            value={filters.producto}
            onChange={handleInputChange('producto')}
            disabled={disabled}
            className={inputClassName}
            aria-describedby="producto-help"
          />
          <div id="producto-help" className="sr-only">
            Escriba el nombre del producto para buscar
          </div>
        </div>
      </div>

      {/* Sección de filtros activos y acciones */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        {/* Indicador de filtros activos */}
        <div className="flex items-center text-sm text-gray-600">
          <Filter className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
          <span className="font-medium">Filtros activos:</span>
          <span className="ml-2">
            {activeFilterDescriptions.length > 0 ? (
              <span className="text-gray-800">
                {activeFilterDescriptions.join(' • ')}
              </span>
            ) : (
              <span className="text-gray-500">Ninguno</span>
            )}
          </span>
        </div>

        {/* Botón para limpiar filtros */}
        <button
          type="button"
          onClick={onClearFilters}
          disabled={disabled || activeFilterDescriptions.length === 0}
          className={`
            inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${disabled || activeFilterDescriptions.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
            }
          `.trim()}
          aria-label="Limpiar todos los filtros aplicados"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default MovementFilters;