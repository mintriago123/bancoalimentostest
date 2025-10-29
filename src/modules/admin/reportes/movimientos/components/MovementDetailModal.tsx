/**
 * @fileoverview Modal de detalles completos de un movimiento de inventario
 */

import {
  Calendar,
  User,
  FileText,
  TrendingUp,
  TrendingDown,
  X,
  Clock,
  Tag,
  Hash,
  Package
} from 'lucide-react';
import type { MovementItem } from '../types';
import { MOVEMENT_TYPE_LABELS, MOVEMENT_BADGE_STYLES } from '../constants';
import { formatNumber } from '../utils/formatters';
import { formatDateTime } from '@/lib/dateUtils';

interface MovementDetailModalProps {
  movement: MovementItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const MOVEMENT_ICONS = {
  ingreso: <TrendingUp className="w-5 h-5" />,
  egreso: <TrendingDown className="w-5 h-5" />
} as const;

const MovementDetailModal = ({ movement, isOpen, onClose }: MovementDetailModalProps) => {
  if (!isOpen || !movement) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const MovementIcon = MOVEMENT_ICONS[movement.tipo_movimiento] || <Package className="w-5 h-5" />;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {MovementIcon}
            <h2 className="text-xl font-bold text-white">Detalles del Movimiento</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-red-800 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Tipo de Movimiento */}
          <div className={`mb-6 p-4 rounded-xl border-2 ${MOVEMENT_BADGE_STYLES[movement.tipo_movimiento]}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {MovementIcon}
                <div>
                  <h3 className="font-bold text-lg">
                    {MOVEMENT_TYPE_LABELS[movement.tipo_movimiento]}
                  </h3>
                  <p className="text-sm">
                    {movement.tipo_movimiento === 'ingreso' && 'Ingreso de productos al inventario'}
                    {movement.tipo_movimiento === 'egreso' && 'Salida de productos del inventario'}
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {formatNumber(movement.cantidad)}
              </div>
            </div>
          </div>

          {/* Información del Producto */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-red-600" />
              Información del Producto
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-900 font-medium">{movement.nombre_producto}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Unidad de Medida</label>
                  <p className="text-gray-900 font-medium">{movement.unidad_medida}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Cantidad
                </label>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(movement.cantidad)} {movement.unidad_medida}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-red-600" />
              Usuario Responsable
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-900 font-medium">{movement.usuario_responsable}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rol</label>
                  <p className="text-gray-900 font-medium">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {movement.rol_usuario}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del Movimiento */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              Detalles del Movimiento
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Fecha del Movimiento
                </label>
                <p className="text-gray-900 font-medium text-lg">
                  {formatDateTime(movement.fecha_movimiento)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Origen del Movimiento</label>
                <p className="text-gray-900 font-medium">{movement.origen_movimiento}</p>
              </div>
              {movement.observaciones && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Observaciones</label>
                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                    {movement.observaciones}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información Técnica */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Hash className="w-5 h-5 mr-2 text-red-600" />
              Información Técnica
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-600">ID Movimiento</label>
                <p className="text-gray-900 font-mono text-sm">{movement.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovementDetailModal;
