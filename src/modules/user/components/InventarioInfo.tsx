// ============================================================================
// Component: InventarioInfo
// Información del inventario disponible
// ============================================================================

import React from 'react';
import { Package, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { LoadingSpinner } from '@/app/components';
import { StockInfo, LoadingState } from '../types';

interface InventarioInfoProps {
  stockInfo: StockInfo | null;
  loadingState: LoadingState;
  errorMessage: string | null;
  cantidad: number;
  isStockSufficient: (cantidad: number) => boolean;
  getStockMessage: (cantidad?: number) => string;
  onUseMaxStock: () => void;
}

export function InventarioInfo({
  stockInfo,
  loadingState,
  errorMessage,
  cantidad,
  isStockSufficient,
  getStockMessage,
  onUseMaxStock,
}: InventarioInfoProps) {
  if (!stockInfo && loadingState === 'idle') return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
        <Package className="w-4 h-4 mr-2" />
        Inventario Disponible
      </h4>

      {loadingState === 'loading' && (
        <div className="flex items-center text-blue-600 text-sm">
          <div className="inline-block mr-2">
            <LoadingSpinner size="sm" color="blue" />
          </div>
          Consultando inventario...
        </div>
      )}

      {loadingState === 'error' && errorMessage && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-2" />
          {errorMessage}
        </div>
      )}

      {loadingState === 'success' && stockInfo && (
        <div className="space-y-2">
          {stockInfo.producto_encontrado ? (
            <>
              <div
                className={`flex items-center text-sm font-medium ${
                  stockInfo.total_disponible > 0
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {stockInfo.total_disponible > 0 ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                {getStockMessage(cantidad || undefined)}
              </div>

              {stockInfo.depositos.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    Distribución por depósito:
                  </p>
                  <div className="space-y-1">
                    {stockInfo.depositos.map((deposito, index) => {
                      const unidad = stockInfo.unidad_simbolo || stockInfo.unidad_nombre || 'unidades';
                      return (
                        <div
                          key={index}
                          className="flex justify-between text-xs text-gray-600 bg-white px-2 py-1 rounded"
                        >
                          <span>{deposito.deposito}</span>
                          <span className="font-medium">
                            {deposito.cantidad_disponible} {unidad}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {cantidad > 0 && stockInfo.total_disponible > 0 && (
                <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-400">
                  <p className="text-xs text-blue-700">
                    💡{' '}
                    {isStockSufficient(cantidad)
                      ? 'Hay suficiente stock para tu solicitud'
                      : `Cantidad disponible insuficiente. Considera reducir a máximo ${stockInfo.total_disponible} ${stockInfo.unidad_simbolo || stockInfo.unidad_nombre || 'unidades'}`}
                  </p>
                </div>
              )}

              {stockInfo.total_disponible > 0 && (
                <button
                  type="button"
                  onClick={onUseMaxStock}
                  className="text-xs text-blue-600 hover:text-blue-700 underline mt-2"
                >
                  Usar máximo disponible ({stockInfo.total_disponible} {stockInfo.unidad_simbolo || stockInfo.unidad_nombre || 'unidades'})
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center text-amber-600 text-sm">
              <Info className="w-4 h-4 mr-2" />
              Este producto no está disponible en el inventario actual
            </div>
          )}
        </div>
      )}
    </div>
  );
}
