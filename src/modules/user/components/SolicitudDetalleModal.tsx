// ============================================================================
// Component: SolicitudDetalleModal
// Modal con detalles completos de una solicitud del usuario
// ============================================================================

import React from 'react';
import {
  X,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ShoppingBasket,
  Hash,
  Calendar,
  MapPin,
  MessageCircle,
  QrCode,
  ExternalLink,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Solicitud } from '../types';
import { useDateFormatter } from '@/modules/shared/hooks/useDateFormatter';

interface SolicitudDetalleModalProps {
  solicitud: Solicitud;
  isOpen: boolean;
  onClose: () => void;
}

export function SolicitudDetalleModal({
  solicitud,
  isOpen,
  onClose,
}: SolicitudDetalleModalProps) {
  const { formatDateTime, formatDate } = useDateFormatter();

  if (!isOpen) return null;

  const getEstadoBadge = (estado: string) => {
    const base = 'px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-2 ';
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return base + 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'aprobada':
        return base + 'bg-green-100 text-green-800 border border-green-300';
      case 'rechazada':
        return base + 'bg-red-100 text-red-800 border border-red-300';
      case 'entregada':
        return base + 'bg-blue-100 text-blue-800 border border-blue-300';
      default:
        return base + 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'aprobada':
        return <CheckCircle className="w-4 h-4" />;
      case 'rechazada':
        return <XCircle className="w-4 h-4" />;
      case 'entregada':
        return <Package className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Detalles de la Solicitud</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Estado actual:</span>
            <span className={getEstadoBadge(solicitud.estado)}>
              {getEstadoIcon(solicitud.estado)}
              {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
            </span>
          </div>

          {/* Código de Verificación */}
          {solicitud.codigo_comprobante && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <QrCode className="w-5 h-5 mr-2 text-green-600" />
                Código de Verificación
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Código de Comprobante
                  </p>
                  <p className="font-mono font-bold text-xl text-green-700">
                    {solicitud.codigo_comprobante}
                  </p>
                </div>
                <a
                  href={`/comprobante/${solicitud.codigo_comprobante}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Comprobante
                </a>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Presenta este código al momento de retirar los alimentos
              </p>
            </div>
          )}

          {/* Información del Alimento */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <ShoppingBasket className="w-5 h-5 mr-2 text-blue-600" />
              Información del Alimento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Alimento</p>
                <p className="font-medium text-gray-900">{solicitud.tipo_alimento}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cantidad Solicitada</p>
                <p className="font-medium text-gray-900">
                  {solicitud.cantidad} {solicitud.unidad_simbolo || 'unidades'}
                </p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Fechas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Fecha de Solicitud</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(solicitud.created_at)}
                </p>
              </div>
              {solicitud.fecha_respuesta && (
                <div>
                  <p className="text-sm text-gray-500">Fecha de Respuesta</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(solicitud.fecha_respuesta)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Comentarios del Solicitante */}
          {solicitud.comentarios && (
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Tus Comentarios
              </h3>
              <p className="text-gray-700">{solicitud.comentarios}</p>
            </div>
          )}

          {/* Comentario Administrativo */}
          {solicitud.comentario_admin && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                Respuesta del Banco de Alimentos
              </h3>
              <p className="text-gray-700">{solicitud.comentario_admin}</p>
            </div>
          )}

          {/* Ubicación */}
          {solicitud.latitud && solicitud.longitud && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Ubicación Registrada
              </h3>
              <div className="text-sm text-gray-600 mb-2">
                Lat: {solicitud.latitud.toFixed(6)}, Lng: {solicitud.longitud.toFixed(6)}
              </div>
              <iframe
                className="w-full h-48 rounded-lg border"
                src={`https://maps.google.com/maps?q=${solicitud.latitud},${solicitud.longitud}&z=15&output=embed`}
                title="Ubicación de la solicitud"
              />
            </div>
          )}

          {/* ID de Solicitud */}
          <div className="text-center text-sm text-gray-400">
            ID de Solicitud: #{solicitud.id}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
