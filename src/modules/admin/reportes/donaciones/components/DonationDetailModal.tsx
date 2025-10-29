/**
 * @fileoverview Modal de detalles completos de una donación
 */

import {
  Calendar,
  Package,
  User,
  Phone,
  MapPin,
  Building,
  Gift,
  TrendingUp,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';
import type { Donation, DonationEstado } from '../types';
import { isExpired, isNearExpiration } from '../utils/formatters';
import { formatShortDate } from '@/lib/dateUtils';
import { DONATION_STATE_COLORS } from '../constants';

interface DonationDetailModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
}

const ESTADO_INFO = {
  Pendiente: {
    icon: <Clock className="w-5 h-5" />,
    label: 'Pendiente',
    description: 'Esperando recolección'
  },
  Recogida: {
    icon: <Truck className="w-5 h-5" />,
    label: 'Recogida',
    description: 'En proceso de transporte'
  },
  Entregada: {
    icon: <CheckCircle className="w-5 h-5" />,
    label: 'Entregada',
    description: 'Completada exitosamente'
  },
  Cancelada: {
    icon: <XCircle className="w-5 h-5" />,
    label: 'Cancelada',
    description: 'Donación cancelada'
  }
} as const;

const DonationDetailModal = ({ donation, isOpen, onClose }: DonationDetailModalProps) => {
  if (!isOpen || !donation) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const estadoInfo = ESTADO_INFO[donation.estado];
  
  let expiryStatus = 'normal';
  if (donation.fecha_vencimiento) {
    if (isExpired(donation.fecha_vencimiento)) {
      expiryStatus = 'expired';
    } else if (isNearExpiration(donation.fecha_vencimiento)) {
      expiryStatus = 'warning';
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Gift className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Detalles de la Donación</h2>
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
          {/* Estado */}
          <div className={`mb-6 p-4 rounded-xl border-2 ${DONATION_STATE_COLORS[donation.estado]}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {estadoInfo.icon}
                <div>
                  <h3 className="font-bold text-lg">{estadoInfo.label}</h3>
                  <p className="text-sm">{estadoInfo.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Donante */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              {donation.tipo_persona_donante === 'Juridica' ? (
                <Building className="w-5 h-5 mr-2 text-red-600" />
              ) : (
                <User className="w-5 h-5 mr-2 text-red-600" />
              )}
              Información del Donante
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-900 font-medium">
                    {donation.nombre_donante || 'Sin nombre'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {donation.tipo_persona_donante === 'Juridica' ? 'RUC' : 'Cédula'}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {donation.tipo_persona_donante === 'Juridica'
                      ? donation.ruc_donante
                      : donation.cedula_donante}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Teléfono
                  </label>
                  <p className="text-gray-900 font-medium">{donation.telefono}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo de Persona</label>
                  <p className="text-gray-900 font-medium">
                    {donation.tipo_persona_donante}
                  </p>
                </div>
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
                  <label className="text-sm font-medium text-gray-600">Producto</label>
                  <p className="text-gray-900 font-medium">
                    {donation.alimento?.nombre || donation.tipo_producto}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Categoría</label>
                  <p className="text-gray-900 font-medium">{donation.categoria_comida}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cantidad</label>
                  <p className="text-gray-900 font-medium text-lg">
                    {donation.cantidad} {donation.unidad_simbolo}
                  </p>
                  <p className="text-sm text-gray-500">{donation.unidad_nombre}</p>
                </div>
                {donation.es_producto_personalizado && (
                  <div>
                    <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <FileText className="w-4 h-4 mr-2" />
                      Producto Personalizado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-red-600" />
              Fechas
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Disponible Desde</label>
                  <p className="text-gray-900 font-medium">
                    {formatShortDate(donation.fecha_disponible)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Registro</label>
                  <p className="text-gray-900 font-medium">
                    {formatShortDate(donation.creado_en)}
                  </p>
                </div>
              </div>
              {donation.fecha_vencimiento && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Fecha de Vencimiento
                  </label>
                  <p className={`font-medium ${
                    expiryStatus === 'expired' ? 'text-red-600' : 
                    expiryStatus === 'warning' ? 'text-yellow-600' : 
                    'text-gray-900'
                  }`}>
                    {formatShortDate(donation.fecha_vencimiento)}
                    {expiryStatus === 'expired' && ' (Vencido)'}
                    {expiryStatus === 'warning' && ' (Próximo a vencer)'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Impacto */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
              Impacto Estimado
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-600">Personas Beneficiadas</label>
                  <p className="text-3xl font-bold text-red-600">
                    {donation.impacto_estimado_personas || 'No estimado'}
                  </p>
                </div>
                {donation.impacto_equivalente && (
                  <div className="text-right">
                    <label className="text-sm font-medium text-gray-600">Equivalente</label>
                    <p className="text-gray-900 font-medium">{donation.impacto_equivalente}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              Información Adicional
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID Donación</label>
                  <p className="text-gray-900 font-mono text-sm">{donation.id}</p>
                </div>
                {donation.user_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID Usuario</label>
                    <p className="text-gray-900 font-mono text-sm">{donation.user_id}</p>
                  </div>
                )}
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

export default DonationDetailModal;
