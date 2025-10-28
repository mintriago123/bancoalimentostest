// ============================================================================
// Component: AlimentoSelector
// Selector de alimentos con búsqueda y filtros
// ============================================================================

import React from 'react';
import { ShoppingBasket, X, Search, AlertCircle } from 'lucide-react';
import { Alimento } from '../types';
import { MESSAGES } from '../constants';

interface AlimentoSelectorProps {
  alimentos: Alimento[];
  alimentosFiltrados: Alimento[];
  alimentoSeleccionado: Alimento | null;
  busqueda: string;
  filtroCategoria: string;
  categorias: string[];
  mostrarDropdown: boolean;
  onBusquedaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoriaChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAlimentoSelect: (alimento: Alimento) => void;
  onLimpiarSeleccion: () => void;
  onFocus: () => void;
  onBlur: (e: React.FocusEvent) => void;
}

export function AlimentoSelector({
  alimentosFiltrados,
  alimentoSeleccionado,
  busqueda,
  filtroCategoria,
  categorias,
  mostrarDropdown,
  onBusquedaChange,
  onCategoriaChange,
  onAlimentoSelect,
  onLimpiarSeleccion,
  onFocus,
  onBlur,
}: AlimentoSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Filtro de Categoría */}
      <div>
        <label
          htmlFor="filtroCategoria"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Categoría de Alimentos
        </label>
        {categorias.length === 0 ? (
          <div className="w-full border-2 border-amber-300 bg-amber-50 rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="text-sm text-amber-700">
              {MESSAGES.SOLICITUD.NO_CATEGORY_AVAILABLE}
            </span>
          </div>
        ) : (
          <>
            <select
              id="filtroCategoria"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
              value={filtroCategoria}
              onChange={onCategoriaChange}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Filtra por categoría para encontrar alimentos más fácilmente
            </p>
          </>
        )}
      </div>

      {/* Buscador de Productos */}
      <div>
        <label
          htmlFor="tipoAlimento"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Productos *
        </label>
        <div className="relative" onBlur={onBlur}>
          <input
            type="text"
            id="tipoAlimento"
            placeholder="Buscar o seleccionar producto..."
            className="w-full border-2 border-gray-300 rounded-lg pl-11 pr-12 py-3 focus:border-blue-500 focus:outline-none transition-colors"
            value={busqueda}
            onChange={onBusquedaChange}
            onFocus={onFocus}
            required
          />
          <ShoppingBasket className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />

          {alimentoSeleccionado && (
            <button
              type="button"
              onClick={onLimpiarSeleccion}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors"
              title="Limpiar selección"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Dropdown con los alimentos filtrados */}
          {mostrarDropdown && !alimentoSeleccionado && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {alimentosFiltrados.length > 0 ? (
                alimentosFiltrados.map((alimento) => (
                  <div
                    key={alimento.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => onAlimentoSelect(alimento)}
                  >
                    <div className="font-medium text-gray-900">
                      {alimento.nombre}
                    </div>
                    <div className="text-sm text-gray-500">
                      {alimento.categoria}
                    </div>
                  </div>
                ))
              ) : busqueda || filtroCategoria ? (
                <div className="p-3 text-gray-500 text-center">
                  No se encontraron productos que coincidan con tu búsqueda
                  {filtroCategoria && ` en la categoría "${filtroCategoria}"`}
                </div>
              ) : (
                <div className="p-3 text-amber-600 text-center flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {filtroCategoria 
                      ? `Escribe para buscar productos en "${filtroCategoria}"...` 
                      : MESSAGES.SOLICITUD.NO_STOCK_AVAILABLE}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mostrar contador de resultados */}
          {(busqueda || filtroCategoria) && !alimentoSeleccionado && (
            <p className="text-sm text-gray-500 mt-1">
              {alimentosFiltrados.length} producto
              {alimentosFiltrados.length !== 1 ? 's' : ''} disponible
              {alimentosFiltrados.length !== 1 ? 's' : ''}
              {filtroCategoria && ` en "${filtroCategoria}"`}
            </p>
          )}
          
          {/* Mensaje cuando no hay productos en absoluto */}
          {!busqueda && !filtroCategoria && alimentosFiltrados.length === 0 && !mostrarDropdown && (
            <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {MESSAGES.SOLICITUD.NO_STOCK_AVAILABLE}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
