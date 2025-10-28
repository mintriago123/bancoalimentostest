/**
 * @fileoverview Tabla principal de inventario con acciones rápidas.
 */

import {
  AlertTriangle,
  Calendar,
  Eye,
  Minus,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
  Warehouse
} from 'lucide-react';
import type { InventarioItem } from '../types';
import { determineStockLevel, formatDate } from '../utils/formatters';

interface InventoryTableProps {
  items: InventarioItem[];
  totalItems: number;
  hasActiveFilters: boolean;
  messages: {
    noData: string;
    noFilteredData: string;
  };
  onResetFilters: () => void;
  onDecrease: (item: InventarioItem) => void;
  onIncrease: (item: InventarioItem) => void;
  onViewDetails?: (item: InventarioItem) => void;
  processingId?: string;
}

const STOCK_LEVEL_STYLES = {
  bajo: 'text-red-600 bg-red-50 border-red-200',
  normal: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  alto: 'text-green-600 bg-green-50 border-green-200'
} as const;

const STOCK_LEVEL_ICONS = {
  bajo: <AlertTriangle className="w-4 h-4" />,
  normal: <TrendingDown className="w-4 h-4" />,
  alto: <TrendingUp className="w-4 h-4" />
} as const;

const InventoryTable = ({
  items,
  totalItems,
  hasActiveFilters,
  messages,
  onResetFilters,
  onDecrease,
  onIncrease,
  onViewDetails,
  processingId
}: InventoryTableProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="p-8 text-center">
          {totalItems === 0 ? (
            <>
              <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{messages.noData}</p>
            </>
          ) : (
            <>
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{messages.noFilteredData}</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="overflow-x-auto">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Depósito
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => {
              const stockLevel = determineStockLevel(item.cantidad_disponible);
              const isProcessing = processingId === item.id_inventario;

              return (
                <tr key={item.id_inventario} className="transition-colors duration-150 hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-10 h-10 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.producto.nombre_producto || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.producto.descripcion || 'Sin descripción'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Unidad: {item.producto.unidad_medida || 'No especificada'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Warehouse className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.deposito.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.deposito.descripcion || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${STOCK_LEVEL_STYLES[stockLevel]}`}>
                      {STOCK_LEVEL_ICONS[stockLevel]}
                      <span>{item.cantidad_disponible} unidades</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <div className="space-y-1">
                        <div>Actualización: {formatDate(item.fecha_actualizacion)}</div>
                        <div>Donación: {formatDate(item.producto.fecha_donacion)}</div>
                        <div>Vencimiento: {formatDate(item.producto.fecha_caducidad)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => onDecrease(item)}
                        disabled={item.cantidad_disponible <= 0 || isProcessing}
                        className="text-red-600 hover:text-red-500 px-2 py-1 rounded border border-red-200 hover:bg-red-50 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reducir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onIncrease(item)}
                        disabled={isProcessing}
                        className="text-green-600 hover:text-green-500 px-2 py-1 rounded border border-green-200 hover:bg-green-50 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={onViewDetails ? () => onViewDetails(item) : undefined}
                        disabled={!onViewDetails}
                        className="text-gray-600 hover:text-gray-500 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={onViewDetails ? 'Ver detalles' : 'Detalles no disponibles'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
