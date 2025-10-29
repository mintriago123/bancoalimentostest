/**
 * @fileoverview Modal de detalles completos de un ítem de inventario para operadores
 */

import {
  Calendar,
  Package,
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  X,
  Clock,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { InventarioItem } from '../types';
import { formatLongDate } from '@/lib/dateUtils';

interface OperadorInventoryDetailModalProps {
  item: InventarioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const STOCK_LEVEL_INFO = {
  bajo: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Stock Bajo',
    description: 'Se requiere reabastecimiento urgente'
  },
  normal: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: <TrendingDown className="w-5 h-5" />,
    label: 'Stock Normal',
    description: 'Nivel de stock adecuado'
  },
  alto: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Stock Alto',
    description: 'Buen nivel de existencias'
  }
} as const;

const ESTADO_CADUCIDAD_INFO = {
  vigente: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <CheckCircle className="w-5 h-5" />,
    label: 'Vigente',
    description: 'Producto en buen estado'
  },
  proximo: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: <Clock className="w-5 h-5" />,
    label: 'Próximo a Vencer',
    description: 'Requiere atención prioritaria'
  },
  vencido: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <XCircle className="w-5 h-5" />,
    label: 'Vencido',
    description: 'Producto vencido - requiere acción inmediata'
  }
} as const;

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No disponible';
  return formatLongDate(dateString);
};

const formatDiasParaVencer = (dias: number | undefined): string => {
  if (dias === undefined) return 'Sin fecha de vencimiento';
  if (dias < 0) return `Vencido hace ${Math.abs(dias)} días`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `Vence en ${dias} días`;
};

const OperadorInventoryDetailModal = ({ item, isOpen, onClose }: OperadorInventoryDetailModalProps) => {
  if (!isOpen || !item) return null;

  const stockLevel = item.stock_status || 'normal';
  const stockInfo = STOCK_LEVEL_INFO[stockLevel];
  const estadoCaducidad = item.producto.estado_caducidad || 'vigente';
  const caducidadInfo = ESTADO_CADUCIDAD_INFO[estadoCaducidad];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Detalles del Producto</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-orange-800 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Alerta de Atención */}
          {item.necesita_atencion && (
            <div className="mb-6 p-4 rounded-xl border-2 border-red-400 bg-red-50">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-bold text-red-800">¡Requiere Atención Inmediata!</h3>
                  <p className="text-sm text-red-700">
                    Este producto tiene stock bajo o está próximo a vencer
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Nivel de Stock */}
          <div className={`mb-6 p-4 rounded-xl border-2 ${stockInfo.border} ${stockInfo.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={stockInfo.color}>
                  {stockInfo.icon}
                </div>
                <div>
                  <h3 className={`font-bold ${stockInfo.color}`}>{stockInfo.label}</h3>
                  <p className={`text-sm ${stockInfo.color}`}>{stockInfo.description}</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${stockInfo.color}`}>
                {item.cantidad_disponible}
              </div>
            </div>
          </div>

          {/* Estado de Caducidad */}
          <div className={`mb-6 p-4 rounded-xl border-2 ${caducidadInfo.border} ${caducidadInfo.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={caducidadInfo.color}>
                  {caducidadInfo.icon}
                </div>
                <div>
                  <h3 className={`font-bold ${caducidadInfo.color}`}>{caducidadInfo.label}</h3>
                  <p className={`text-sm ${caducidadInfo.color}`}>{caducidadInfo.description}</p>
                </div>
              </div>
              <div className={`text-right ${caducidadInfo.color}`}>
                <div className="text-lg font-bold">
                  {formatDiasParaVencer(item.producto.dias_para_vencer)}
                </div>
              </div>
            </div>
          </div>

          {/* Información del Producto */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-600" />
              Información del Producto
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-900 font-medium">
                    {item.producto.nombre_producto || 'Sin nombre'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Unidad de Medida</label>
                  <p className="text-gray-900 font-medium">
                    {item.producto.unidad_medida || 'No especificada'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Descripción</label>
                <p className="text-gray-900">
                  {item.producto.descripcion || 'Sin descripción'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Cantidad Disponible</label>
                <p className="text-2xl font-bold text-orange-600">
                  {item.cantidad_disponible} {item.producto.unidad_simbolo || item.producto.unidad_medida || 'unidades'}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Depósito */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Warehouse className="w-5 h-5 mr-2 text-orange-600" />
              Depósito
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium">{item.deposito.nombre}</p>
              </div>
              {item.deposito.descripcion && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-900">{item.deposito.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Fechas Importantes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Fechas Importantes
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Última Actualización
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatDate(item.fecha_actualizacion)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Fecha de Donación
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatDate(item.producto.fecha_donacion)}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Fecha de Caducidad
                </label>
                <p className={`font-medium ${
                  estadoCaducidad === 'vencido' ? 'text-red-600' : 
                  estadoCaducidad === 'proximo' ? 'text-yellow-600' : 
                  'text-gray-900'
                }`}>
                  {formatDate(item.producto.fecha_caducidad)}
                </p>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          {item.producto.id_producto && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                Información Adicional
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID Inventario</label>
                    <p className="text-gray-900 font-mono text-sm">{item.id_inventario}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID Producto</label>
                    <p className="text-gray-900 font-mono text-sm">{item.producto.id_producto}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperadorInventoryDetailModal;
