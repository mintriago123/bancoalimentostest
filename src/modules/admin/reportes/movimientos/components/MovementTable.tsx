/**
 * @fileoverview Componente de tabla para mostrar datos de movimientos
 * Proporciona una tabla accesible y responsiva para visualizar los movimientos
 * de inventario con formato profesional.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { MovementItem } from '../types';
import { MOVEMENT_TYPE_LABELS, MOVEMENT_BADGE_STYLES } from '../constants';
import { formatDate, formatNumber } from '../utils/formatters';

/**
 * Props para el componente MovementTable
 */
interface MovementTableProps {
  /** Array de movimientos a mostrar */
  data: MovementItem[];
  
  /** Indica si la tabla está en estado de carga */
  loading?: boolean;
  
  /** Mensaje personalizado cuando no hay datos */
  emptyMessage?: string;
  
  /** Callback cuando se hace clic en una fila (opcional) */
  onRowClick?: (movement: MovementItem) => void;
}

/**
 * Componente de fila de movimiento individual
 */
const MovementRow: React.FC<{
  movement: MovementItem;
  onClick?: (movement: MovementItem) => void;
}> = ({ movement, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(movement);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(movement);
    }
  };

  const rowClassName = `
    transition-colors duration-150 hover:bg-slate-50
    ${onClick ? 'cursor-pointer focus:bg-slate-100' : ''}
  `.trim();

  const badgeClassName = `
    inline-flex px-2 py-1 text-xs font-semibold rounded-full border
    ${MOVEMENT_BADGE_STYLES[movement.tipo_movimiento]}
  `.trim();

  return (
    <tr
      className={rowClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Ver detalles del movimiento ${movement.id}` : undefined}
    >
      {/* Fecha */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <time dateTime={movement.fecha_movimiento}>
          {formatDate(movement.fecha_movimiento)}
        </time>
      </td>

      {/* Tipo de movimiento */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={badgeClassName}>
          {MOVEMENT_TYPE_LABELS[movement.tipo_movimiento]}
        </span>
      </td>

      {/* Producto */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900" title={movement.nombre_producto}>
          {movement.nombre_producto}
        </div>
      </td>

      {/* Unidad de medida */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {movement.unidad_medida}
      </td>

      {/* Cantidad */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
        {formatNumber(movement.cantidad)}
      </td>

      {/* Usuario responsable */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="text-gray-900 font-medium" title={movement.usuario_responsable}>
          {movement.usuario_responsable}
        </div>
        <div className="text-gray-500 text-xs">
          ({movement.rol_usuario})
        </div>
      </td>

      {/* Origen del movimiento */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <span title={movement.origen_movimiento}>
          {movement.origen_movimiento}
        </span>
      </td>

      {/* Observaciones */}
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
        <div 
          className="truncate" 
          title={movement.observaciones}
        >
          {movement.observaciones}
        </div>
      </td>
    </tr>
  );
};

/**
 * Componente principal de tabla de movimientos
 */
export const MovementTable: React.FC<MovementTableProps> = ({
  data,
  loading = false,
  emptyMessage = 'No se encontraron movimientos con los filtros aplicados',
  onRowClick
}) => {
  // Estado de carga
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="text-gray-600">Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  // Estado sin datos
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay movimientos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  // Tabla con datos
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="overflow-x-auto">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Producto
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Unidad
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cantidad
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usuario
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Origen
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Observaciones
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
            {data.map((movement) => (
              <MovementRow
                key={movement.id}
                movement={movement}
                onClick={onRowClick}
              />
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información de conteo */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{data.length}</span>
            {' '}movimiento{data.length === 1 ? '' : 's'}
          </div>
      </div>
    </div>
  );
};

export default MovementTable;
