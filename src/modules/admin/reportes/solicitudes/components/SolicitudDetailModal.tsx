/**
 * @fileoverview Modal con detalle y acciones de una solicitud.
 */

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
  X,
  XCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { JSX } from 'react';
import type {
  InventarioDisponible,
  Solicitud,
  SolicitudEstado
} from '../types';

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
  motivoRechazo,
  onMotivoRechazoChange
}: SolicitudDetailModalProps) => {
  const [nombreOperador, setNombreOperador] = useState<string>('');
  const [rolOperador, setRolOperador] = useState<string>('');
  const [cargandoOperador, setCargandoOperador] = useState(false);
  const [nombreAprobador, setNombreAprobador] = useState<string>('');
  const [rolAprobador, setRolAprobador] = useState<string>('');
  const [cargandoAprobador, setCargandoAprobador] = useState(false);

  const totalDisponible = inventario.reduce(
    (total, item) => total + (item.cantidad_disponible ?? 0),
    0
  );

  // Cargar datos del operador/admin que rechazó
  useEffect(() => {
    if (solicitud.estado === 'rechazada' && solicitud.operador_rechazo_id) {
      const cargarDatosOperador = async () => {
        setCargandoOperador(true);
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('usuarios')
            .select('nombre, rol')
            .eq('id', solicitud.operador_rechazo_id)
            .single();

          if (!error && data) {
            setNombreOperador(data.nombre || 'No disponible');
            setRolOperador(data.rol || 'No disponible');
          }
        } catch (error) {
          console.error('Error al cargar datos del operador:', error);
        } finally {
          setCargandoOperador(false);
        }
      };

      void cargarDatosOperador();
    }
  }, [solicitud.estado, solicitud.operador_rechazo_id]);

  // Cargar datos del operador/admin que aprobó
  useEffect(() => {
    if ((solicitud.estado === 'aprobada' || solicitud.estado === 'entregada') && solicitud.operador_aprobacion_id) {
      const cargarDatosAprobador = async () => {
        setCargandoAprobador(true);
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('usuarios')
            .select('nombre, rol')
            .eq('id', solicitud.operador_aprobacion_id)
            .single();

          if (!error && data) {
            setNombreAprobador(data.nombre || 'No disponible');
            setRolAprobador(data.rol || 'No disponible');
          }
        } catch (error) {
          console.error('Error al cargar datos del aprobador:', error);
        } finally {
          setCargandoAprobador(false);
        }
      };

      void cargarDatosAprobador();
    }
  }, [solicitud.estado, solicitud.operador_aprobacion_id]);

  const getMotivoRechazoLabel = (motivo: string | null | undefined) => {
    const motivos: Record<string, string> = {
      stock_insuficiente: 'Stock insuficiente',
      producto_no_disponible: 'Producto no disponible',
      datos_incompletos: 'Datos incompletos',
      solicitante_ineligible: 'Solicitante inelegible',
      duplicada: 'Solicitud duplicada',
      vencimiento_proximo: 'Productos próximos a vencer',
      otro: 'Otro motivo',
    };
    return motivos[motivo || ''] || 'No especificado';
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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

              {/* Mostrar quién aprobó la solicitud */}
              {(solicitud.estado === 'aprobada' || solicitud.estado === 'entregada') && solicitud.operador_aprobacion_id && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">APROBADO POR:</p>
                  {cargandoAprobador ? (
                    <p className="text-sm text-gray-600">Cargando...</p>
                  ) : (
                    <div className="text-sm text-gray-700">
                      <p className="mb-1">
                        <strong>Nombre:</strong> {nombreAprobador}
                      </p>
                      <div>
                        <strong>Rol:</strong>{' '}
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ml-1 ${
                            rolAprobador === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rolAprobador === 'ADMIN' ? 'Administrador' : 'Operador'}
                        </span>
                      </div>
                      {solicitud.fecha_aprobacion && (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(solicitud.fecha_aprobacion)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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

            {solicitud.estado === 'rechazada' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Detalles del Rechazo
                </h4>
                <div className="space-y-3">
                  {/* Motivo del Rechazo */}
                  {solicitud.motivo_rechazo && (
                    <div className="bg-white p-3 rounded border border-red-200">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Motivo</p>
                      <p className="text-sm text-gray-700">
                        {getMotivoRechazoLabel(solicitud.motivo_rechazo)}
                      </p>
                    </div>
                  )}

                  {/* Comentario del Rechazo */}
                  {solicitud.comentario_admin && (
                    <div className="bg-white p-3 rounded border border-red-200">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Comentario</p>
                      <p className="text-sm text-gray-700">{solicitud.comentario_admin}</p>
                    </div>
                  )}

                  {/* Fecha y Hora del Rechazo */}
                  {solicitud.fecha_rechazo && (
                    <div className="bg-white p-3 rounded border border-red-200">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Fecha y Hora</p>
                      <p className="text-sm text-gray-700">{formatDate(solicitud.fecha_rechazo)}</p>
                    </div>
                  )}

                  {/* Quién Rechazó */}
                  {solicitud.operador_rechazo_id && (
                    <div className="bg-white p-3 rounded border border-red-200">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Rechazado por</p>
                      {cargandoOperador ? (
                        <p className="text-sm text-gray-600">Cargando...</p>
                      ) : (
                        <div className="text-sm text-gray-700">
                          <p className="mb-1">
                            <strong>Nombre:</strong> {nombreOperador}
                          </p>
                          <div>
                            <strong>Rol:</strong>{' '}
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ml-1 ${
                                rolOperador === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {rolOperador === 'ADMIN' ? 'Administrador' : 'Operador'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">
                Inventario disponible para “{solicitud.tipo_alimento}”
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
                            Disponible: <span className="font-medium">{item.cantidad_disponible} {unidad}</span>
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
                          {totalDisponible} {solicitud.unidades?.simbolo ?? 'unidades'}
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
                            Stock insuficiente ({totalDisponible} de {solicitud.cantidad} disponibles)
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
                    No hay stock disponible de “{solicitud.tipo_alimento}” en el inventario
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    La solicitud no puede ser satisfecha en este momento
                  </p>
                </div>
              )}
            </div>
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Gestionar Solicitud</h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="comentario-admin" className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario administrativo (opcional)
                  </label>
                  <textarea
                    id="comentario-admin"
                    value={comentarioAdmin}
                    onChange={(event) => onComentarioChange(event.target.value)}
                    placeholder="Agregar comentarios sobre la decisión..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onAprobar}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isProcessing || inventarioLoading || totalDisponible < solicitud.cantidad}
                    title={totalDisponible < solicitud.cantidad ? 'Stock insuficiente para aprobar esta solicitud' : ''}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Aprobar Solicitud</span>
                  </button>
                  <button
                    type="button"
                    onClick={onRechazar}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar Solicitud</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitudDetailModal;
