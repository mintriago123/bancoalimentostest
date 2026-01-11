// ============================================================================
// Component: CantidadUnidadInputs
// Inputs de cantidad y unidad de medida
// ============================================================================

import React from 'react';
import { Unidad, StockInfo } from '../types';
import { FORM_CONFIG } from '../constants';

interface CantidadUnidadInputsProps {
  cantidad: string;
  unidadId: string;
  unidades: Unidad[];
  loadingUnidades: boolean;
  stockInfo: StockInfo | null;
  isStockSufficient: (cantidad: number) => boolean;
  onCantidadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUnidadChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onUseMaxStock: () => void;
}

export function CantidadUnidadInputs({
  cantidad,
  unidadId,
  unidades,
  loadingUnidades,
  stockInfo,
  isStockSufficient,
  onCantidadChange,
  onUnidadChange,
  onUseMaxStock,
}: CantidadUnidadInputsProps) {
  const cantidadNum = parseFloat(cantidad) || 0;
  const hasSufficientStock =
    !stockInfo ||
    !stockInfo.producto_encontrado ||
    isStockSufficient(cantidadNum);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Cantidad */}
      <div>
        <label
          htmlFor="cantidad"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Cantidad Solicitada *
        </label>
        <input
          type="number"
          id="cantidad"
          value={cantidad}
          onChange={onCantidadChange}
          required
          min={FORM_CONFIG.CANTIDAD_MIN}
          step={FORM_CONFIG.CANTIDAD_STEP}
          max={
            stockInfo && stockInfo.producto_encontrado
              ? stockInfo.total_disponible
              : undefined
          }
          className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition-colors ${
            cantidadNum > 0 &&
            stockInfo &&
            stockInfo.producto_encontrado
              ? hasSufficientStock
                ? 'border-green-500 focus:border-green-600'
                : 'border-red-500 focus:border-red-600'
              : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder="0"
        />
        <div className="mt-1 space-y-1">
          <p className="text-xs text-gray-500">Ingresa la cantidad necesaria</p>
          {cantidadNum > 0 &&
            stockInfo &&
            stockInfo.producto_encontrado && (
              <p
                className={`text-xs font-medium ${
                  hasSufficientStock ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {hasSufficientStock
                  ? '✓ Cantidad disponible en inventario'
                  : `⚠️ Excede el stock disponible (${
                      stockInfo.total_formateado 
                        ? `${stockInfo.total_formateado.cantidad} ${stockInfo.total_formateado.simbolo}`
                        : `${stockInfo.total_disponible} ${stockInfo.unidad_simbolo || stockInfo.unidad_nombre || 'unidades'}`
                    } máximo)`}
              </p>
            )}
        </div>
      </div>

      {/* Unidad */}
      <div>
        <label
          htmlFor="unidad"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Unidad de Medida *
        </label>
        <select
          id="unidad"
          value={unidadId}
          onChange={onUnidadChange}
          required
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
        >
          <option value="">Selecciona una unidad</option>
          {loadingUnidades ? (
            <option disabled>Cargando unidades...</option>
          ) : (
            unidades.map((unidad) => (
              <option key={unidad.id} value={unidad.id}>
                {unidad.nombre} ({unidad.simbolo})
              </option>
            ))
          )}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Selecciona la unidad de medida
        </p>
      </div>
    </div>
  );
}
