/**
 * @fileoverview Tabla de solicitudes para operadores (sin capacidad de revertir).
 */

import type { JSX } from 'react';
import {
  Calendar,
  CheckCircle,
  FileText,
  MapPin,
  User,
  XCircle
} from 'lucide-react';
import type { Solicitud, SolicitudEstado } from '../types';

interface SolicitudesTableProps {
  solicitudes: Solicitud[];
  totalSolicitudes: number;
  onVerDetalle: (solicitud: Solicitud) => void;
  onActualizarEstado: (solicitud: Solicitud, nuevoEstado: 'aprobada' | 'rechazada') => void;
  estadoIcons: Record<SolicitudEstado, JSX.Element>;
  badgeStyles: Record<SolicitudEstado, string>;
  formatDate: (value?: string | null) => string;
  processingId?: string;
  emptyMessage: string;
  filteredMessage: string;
  onClearSearch?: () => void;
  showClearSearchButton?: boolean;
}

const SolicitudesTable = ({
  solicitudes,
  totalSolicitudes,
  onVerDetalle,
  onActualizarEstado,
  estadoIcons,
  badgeStyles,
  formatDate,
  processingId,
  emptyMessage,
  filteredMessage,
  onClearSearch,
  showClearSearchButton
}: SolicitudesTableProps) => {
  const renderAcciones = (solicitud: Solicitud) => {
    const isProcessing = processingId === solicitud.id;

    const baseButtonClasses = 'text-white p-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

    // Solo solicitudes pendientes tienen botones de acción
    if (solicitud.estado === 'pendiente') {
      return (
        <>
          <button
            type="button"
            onClick={() => onVerDetalle(solicitud)}
            className={`bg-blue-600 hover:bg-blue-700 ${baseButtonClasses}`}
            title="Ver detalles"
            disabled={isProcessing}
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onActualizarEstado(solicitud, 'aprobada')}
            className={`bg-green-600 hover:bg-green-700 ${baseButtonClasses}`}
            title="Aprobar (se descontará del inventario)"
            disabled={isProcessing}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onActualizarEstado(solicitud, 'rechazada')}
            className={`bg-red-600 hover:bg-red-700 ${baseButtonClasses}`}
            title="Rechazar"
            disabled={isProcessing}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </>
      );
    }

    // Para solicitudes aprobadas, solo mostrar detalle y estado
    if (solicitud.estado === 'aprobada') {
      return (
        <>
          <button
            type="button"
            onClick={() => onVerDetalle(solicitud)}
            className={`bg-blue-600 hover:bg-blue-700 ${baseButtonClasses}`}
            title="Ver detalles"
            disabled={isProcessing}
          >
            <FileText className="w-4 h-4" />
          </button>
          <span className="text-green-600 px-2 py-1 rounded border border-green-200 bg-green-50 text-xs">
            ✓ Descontado de inventario
          </span>
        </>
      );
    }

    // Para solicitudes rechazadas, solo mostrar detalle
    return (
      <button
        type="button"
        onClick={() => onVerDetalle(solicitud)}
        className={`bg-blue-600 hover:bg-blue-700 ${baseButtonClasses}`}
        title="Ver detalles"
        disabled={isProcessing}
      >
        <FileText className="w-4 h-4" />
      </button>
    );
  };

  if (solicitudes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">
            {totalSolicitudes === 0 ? emptyMessage : filteredMessage}
          </p>
          {showClearSearchButton && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
            >
              Limpiar búsqueda
            </button>
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
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitudes.map(solicitud => (
                <tr key={solicitud.id} className="transition-colors duration-150 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {solicitud.usuarios?.nombre ?? 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <span>{solicitud.usuarios?.cedula ?? 'Sin cédula'}</span>
                          {solicitud.usuarios?.tipo_persona && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {solicitud.usuarios.tipo_persona}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {solicitud.tipo_alimento}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cantidad: {solicitud.cantidad} {solicitud.unidades?.simbolo ?? 'unidades'}
                      </div>
                      {solicitud.latitud && solicitud.longitud && (
                        <div className="flex items-center text-xs text-blue-600 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          Ubicación disponible
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(solicitud.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {estadoIcons[solicitud.estado]}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${badgeStyles[solicitud.estado]}`}>
                        {solicitud.estado}
                      </span>
                    </div>
                    {solicitud.fecha_respuesta && (
                      <div className="text-xs text-gray-500 mt-1">
                        Respuesta: {formatDate(solicitud.fecha_respuesta)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {renderAcciones(solicitud)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SolicitudesTable;
