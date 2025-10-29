/**
 * @fileoverview Tabla de inventario específica para operadores con alertas y funcionalidades avanzadas.
 */

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Eye,
  Minus,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Clock,
  XCircle
} from 'lucide-react';
import type { InventarioItem } from '../types';
import { formatShortDate } from '@/lib/dateUtils';

interface OperadorInventoryTableProps {
  items: InventarioItem[];
  totalItems: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onDecrease: (item: InventarioItem) => void;
  onIncrease: (item: InventarioItem) => void;
  onViewDetails: (item: InventarioItem) => void;
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

const ESTADO_CADUCIDAD_STYLES = {
  vigente: 'text-green-600 bg-green-50 border-green-200',
  proximo: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  vencido: 'text-red-600 bg-red-50 border-red-200'
} as const;

const ESTADO_CADUCIDAD_ICONS = {
  vigente: <CheckCircle className="w-4 h-4" />,
  proximo: <Clock className="w-4 h-4" />,
  vencido: <XCircle className="w-4 h-4" />
} as const;

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No disponible';
  return formatShortDate(dateString);
};

const formatDiasParaVencer = (dias: number | undefined): string => {
  if (dias === undefined) return 'Sin fecha';
  if (dias < 0) return `Vencido hace ${Math.abs(dias)} días`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `${dias} días`;
};

const getEstadoCaducidadText = (estado: string | undefined, dias: number | undefined): string => {
  switch (estado) {
    case 'vencido': return 'VENCIDO';
    case 'proximo': return 'PRÓXIMO A VENCER';
    case 'vigente': 
    default: return 'VIGENTE';
  }
};

const OperadorInventoryTable = ({
  items,
  totalItems,
  hasActiveFilters,
  onResetFilters,
  onDecrease,
  onIncrease,
  onViewDetails,
  processingId
}: OperadorInventoryTableProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="p-8 text-center">
          {totalItems === 0 ? (
            <>
              <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No hay productos en el inventario</p>
              <p className="text-sm text-gray-400 mt-1">Los productos aparecerán cuando las donaciones sean procesadas</p>
            </>
          ) : (
            <>
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No se encontraron productos con los filtros aplicados</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depósito
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Caducidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => {
                const stockLevel = item.stock_status || 'normal';
                const estadoCaducidad = item.producto.estado_caducidad || 'vigente';
                const isProcessing = processingId === item.id_inventario;
                const necesitaAtencion = item.necesita_atencion;

                return (
                  <tr 
                    key={item.id_inventario} 
                    className={`transition-colors duration-150 hover:bg-slate-50 ${
                      necesitaAtencion ? 'bg-red-25 border-l-4 border-l-red-400' : ''
                    }`}
                  >
                    {/* Producto */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <Package className="w-10 h-10 text-gray-400 mr-3" />
                          {necesitaAtencion && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.producto.nombre_producto || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {item.producto.descripcion || 'Sin descripción'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Unidad: {item.producto.unidad_medida || 'No especificada'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Depósito */}
                    <td className="px-4 py-4 whitespace-nowrap">
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

                    {/* Stock */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${STOCK_LEVEL_STYLES[stockLevel]}`}>
                        {STOCK_LEVEL_ICONS[stockLevel]}
                        <span>{item.cantidad_disponible} unidades</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Estado: {stockLevel.toUpperCase()}
                      </div>
                    </td>

                    {/* Estado Caducidad */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${ESTADO_CADUCIDAD_STYLES[estadoCaducidad]}`}>
                        {ESTADO_CADUCIDAD_ICONS[estadoCaducidad]}
                        <span>{getEstadoCaducidadText(estadoCaducidad, item.producto.dias_para_vencer)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDiasParaVencer(item.producto.dias_para_vencer)}
                      </div>
                    </td>

                    {/* Fechas */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-start">
                        <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium">Donación:</span> {formatDate(item.producto.fecha_donacion)}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Actualización:</span> {formatDate(item.fecha_actualizacion)}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Vencimiento:</span> {formatDate(item.producto.fecha_caducidad)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
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
                          onClick={() => onViewDetails(item)}
                          className="text-blue-600 hover:text-blue-500 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 text-xs transition-colors"
                          title="Ver detalles"
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

export default OperadorInventoryTable;