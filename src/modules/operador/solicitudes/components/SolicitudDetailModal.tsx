/**
 * @fileoverview Modal con detalle y acciones de una solicitud para operadores.
 */

import {
  CheckCircle,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
  X,
  XCircle,
  QrCode,
  ExternalLink
} from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';
import type {
  InventarioDisponible,
  Solicitud,
  SolicitudEstado
} from '../types';
import { MOTIVOS_RECHAZO } from '../constants';

/**
 * Formatea una cantidad numérica con máximo 2 decimales.
 */
const formatQuantity = (cantidad: number): string => {
  if (Number.isInteger(cantidad)) {
    return cantidad.toString();
  }
  return cantidad.toFixed(2).replace(/\.?0+$/, '');
};

interface SolicitudDetailModalProps {
  solicitud: Solicitud;
  comentarioAdmin: string;
  inventario: InventarioDisponible[];
  inventarioLoading: boolean;
  inventarioError?: string;
  formatDate: (value?: string | null) => string;
  badgeStyles: Record<SolicitudEstado, string>;
  estadoIcons: Record<SolicitudEstado, JSX.Element>;
  onClose: () => void;
  onComentarioChange: (value: string) => void;
  onAprobar: () => void;
  onRechazar: () => void;
  isProcessing: boolean;
  motivoRechazo?: string;
  onMotivoRechazoChange?: (value: string) => void;
}

const SolicitudDetailModal = ({
  solicitud,
  comentarioAdmin,
  inventario,
  inventarioLoading,
  inventarioError,
  formatDate,
  badgeStyles,
  estadoIcons,
  onClose,
  onComentarioChange,
  onAprobar,
  onRechazar,
  isProcessing,
  motivoRechazo = '',
  onMotivoRechazoChange
}: SolicitudDetailModalProps) => {
  const [modoRechazo, setModoRechazo] = useState(false);
  const totalDisponible = inventario.reduce(
    (total, item) => total + (item.cantidad_disponible ?? 0),
    0
  );

  // Validación para rechazos
  const puedeRechazar = motivoRechazo?.trim().length > 0 && comentarioAdmin?.trim().length > 0;

  const handleToggleModoRechazo = () => {
    setModoRechazo(!modoRechazo);
  };

  const handleRechazarConMotivo = async () => {
    if (!puedeRechazar) {
      return;
    }
    await onRechazar();
    setModoRechazo(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Detalles de la Solicitud</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información del Solicitante
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Nombre:</strong> {solicitud.usuarios?.nombre ?? 'N/A'}</div>
                <div><strong>Cédula:</strong> {solicitud.usuarios?.cedula ?? 'N/A'}</div>
                <div><strong>Tipo:</strong> {solicitud.usuarios?.tipo_persona ?? 'N/A'}</div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {solicitud.usuarios?.telefono ?? 'N/A'}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {solicitud.usuarios?.email ?? 'N/A'}
                </div>
                {solicitud.usuarios?.direccion && (
                  <div><strong>Dirección:</strong> {solicitud.usuarios.direccion}</div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Detalles de la Solicitud
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Alimento solicitado:</strong> {solicitud.tipo_alimento}</div>
                <div><strong>Cantidad:</strong> {solicitud.cantidad} {solicitud.unidades?.simbolo ?? 'unidades'}</div>
                <div><strong>Fecha de solicitud:</strong> {formatDate(solicitud.created_at)}</div>
                <div className="flex items-center space-x-2">
                  {estadoIcons[solicitud.estado]}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${badgeStyles[solicitud.estado]}`}>
                    {solicitud.estado}
                  </span>
                </div>
                {solicitud.fecha_respuesta && (
                  <div><strong>Fecha de respuesta:</strong> {formatDate(solicitud.fecha_respuesta)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Código de Verificación */}
          {solicitud.codigo_comprobante && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <QrCode className="w-5 h-5 mr-2 text-red-600" />
                Código de Verificación
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Código de Comprobante</p>
                  <p className="font-mono font-bold text-lg text-red-700">{solicitud.codigo_comprobante}</p>
                </div>
                <a
                  href={`/operador/comprobante/${solicitud.codigo_comprobante}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Comprobante
                </a>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {solicitud.comentarios && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comentarios del Solicitante
                </h4>
                <p className="text-sm text-gray-700">{solicitud.comentarios}</p>
              </div>
            )}

            {/* Solo mostrar inventario disponible si la solicitud está pendiente */}
            {solicitud.estado === 'pendiente' && (
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">
                Inventario disponible para "{solicitud.tipo_alimento}"
              </h4>

              {inventarioLoading && (
                <div className="text-center py-6 text-sm text-gray-500">
                  Cargando inventario...
                </div>
              )}

              {!inventarioLoading && inventarioError && (
                <div className="text-center py-6 text-sm text-red-600">
                  {inventarioError}
                </div>
              )}

              {!inventarioLoading && !inventarioError && inventario.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inventario.map(item => {
                      const unidad = item.unidad_simbolo || item.unidad_nombre || 'unidades';
                      return (
                        <div key={item.id} className="border rounded-lg p-3">
                          <div className="font-semibold text-gray-900">
                            {item.tipo_alimento}
                          </div>
                          <div className="text-sm text-gray-600">
                            Depósito: {item.deposito}
                          </div>
                          <div className="text-sm text-gray-600">
                            Disponible: <span className="font-medium">{formatQuantity(item.cantidad_disponible)} {unidad}</span>
                          </div>
                          {item.fecha_vencimiento && (
                            <div className="text-xs text-gray-500">
                              Actualizado: {formatDate(item.fecha_vencimiento)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3 bg-white rounded border">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Resumen</div>
                      <div className="mt-1">
                        <span className="text-gray-600">Cantidad solicitada: </span>
                        <span className="font-semibold">{solicitud.cantidad} {solicitud.unidades?.simbolo ?? 'unidades'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total disponible: </span>
                        <span className={`font-semibold ${totalDisponible >= solicitud.cantidad ? 'text-green-600' : 'text-red-600'}`}>
                          {formatQuantity(totalDisponible)} {solicitud.unidades?.simbolo ?? 'unidades'}
                        </span>
                      </div>
                      <div className="mt-2">
                        {totalDisponible >= solicitud.cantidad ? (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Suficiente stock disponible
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 text-sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            Stock insuficiente ({formatQuantity(totalDisponible)} de {solicitud.cantidad} disponibles)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!inventarioLoading && !inventarioError && inventario.length === 0 && (
                <div className="text-center py-4">
                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No hay stock disponible de "{solicitud.tipo_alimento}" en el inventario
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    La solicitud no puede ser satisfecha en este momento
                  </p>
                </div>
              )}
            </div>
            )}
          </div>

          {solicitud.latitud && solicitud.longitud && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Ubicación
              </h4>
              <div className="text-sm text-gray-700 mb-3">
                Coordenadas: {solicitud.latitud.toFixed(6)}, {solicitud.longitud.toFixed(6)}
              </div>
              <iframe
                title="Ubicación del solicitante"
                className="w-full h-64 rounded border"
                src={`https://maps.google.com/maps?q=${solicitud.latitud},${solicitud.longitud}&z=15&output=embed`}
              />
            </div>
          )}

          {solicitud.estado === 'pendiente' && (
            <div className="space-y-4">
              {/* Sección de Aprobación */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar Solicitud
                </h4>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="comentario-admin-aprobacion" className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario administrativo (opcional)
                    </label>
                    <textarea
                      id="comentario-admin-aprobacion"
                      value={modoRechazo ? '' : comentarioAdmin}
                      onChange={(event) => !modoRechazo && onComentarioChange(event.target.value)}
                      placeholder="Agregar comentarios sobre la aprobación..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={2}
                      disabled={isProcessing || modoRechazo}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onAprobar}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed w-full justify-center"
                    disabled={isProcessing || inventarioLoading || totalDisponible < solicitud.cantidad || modoRechazo}
                    title={totalDisponible < solicitud.cantidad ? 'Stock insuficiente para aprobar esta solicitud' : ''}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Aprobar Solicitud</span>
                  </button>
                </div>
              </div>

              {/* Sección de Rechazo */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-red-900 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar Solicitud
                  </h4>
                  {!modoRechazo && (
                    <button
                      type="button"
                      onClick={handleToggleModoRechazo}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Mostrar opciones
                    </button>
                  )}
                </div>

                {modoRechazo ? (
                  <div className="space-y-3">
                    {/* Motivo de Rechazo - Obligatorio */}
                    <div>
                      <label htmlFor="motivo-rechazo" className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo del Rechazo <span className="text-red-600">*</span> (Obligatorio)
                      </label>
                      <select
                        id="motivo-rechazo"
                        value={motivoRechazo || ''}
                        onChange={(event) => onMotivoRechazoChange?.(event.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        disabled={isProcessing}
                      >
                        <option value="">-- Selecciona un motivo --</option>
                        {MOTIVOS_RECHAZO.map(motivo => (
                          <option key={motivo.id} value={motivo.id}>
                            {motivo.label}
                          </option>
                        ))}
                      </select>
                      {motivoRechazo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {MOTIVOS_RECHAZO.find(m => m.id === motivoRechazo)?.descripcion}
                        </p>
                      )}
                      {!motivoRechazo && modoRechazo && (
                        <p className="text-xs text-red-600 mt-1">Este campo es obligatorio</p>
                      )}
                    </div>

                    {/* Comentario - Obligatorio para rechazos */}
                    <div>
                      <label htmlFor="comentario-rechazo" className="block text-sm font-medium text-gray-700 mb-2">
                        Comentario Detallado <span className="text-red-600">*</span> (Obligatorio)
                      </label>
                      <textarea
                        id="comentario-rechazo"
                        value={comentarioAdmin}
                        onChange={(event) => onComentarioChange(event.target.value)}
                        placeholder="Explica en detalle el motivo del rechazo. Este mensaje será enviado al solicitante..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={3}
                        disabled={isProcessing}
                        minLength={10}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 10 caracteres. El solicitante recibirá este comentario.
                      </p>
                      {comentarioAdmin.length < 10 && modoRechazo && (
                        <p className="text-xs text-red-600 mt-1">
                          Este campo es obligatorio (mínimo 10 caracteres)
                        </p>
                      )}
                    </div>

                    {/* Información importante */}
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <p className="text-xs text-orange-800">
                        <strong>Nota:</strong> El solicitante recibirá una notificación con:
                        <ul className="list-disc ml-4 mt-1">
                          <li>Motivo del rechazo</li>
                          <li>Fecha y hora del rechazo</li>
                          <li>Tu comentario detallado</li>
                        </ul>
                      </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleRechazarConMotivo}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!puedeRechazar || isProcessing}
                        title={!puedeRechazar ? 'Completa todos los campos obligatorios' : 'Rechazar solicitud'}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Confirmar Rechazo</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleModoRechazo}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                        disabled={isProcessing}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Haz clic en "Mostrar opciones" para rechazar esta solicitud.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitudDetailModal;
