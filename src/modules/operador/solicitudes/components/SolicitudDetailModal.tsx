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
  ExternalLink,
  Package,
  TrendingUp,
  History
} from 'lucide-react';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import type {
  InventarioDisponible,
  Solicitud,
  SolicitudEstado
} from '../types';
import { MOTIVOS_RECHAZO } from '../constants';
import type { HistorialDonacion } from '../services/historialDonacionesService';
import { obtenerHistorialDonaciones } from '../services/historialDonacionesService';
import { useSupabase } from '@/app/components/SupabaseProvider';

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
  onDonar?: (cantidad: number, porcentaje: number, comentario: string) => void;
  abrirEnModoDonacion?: boolean;
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
  onMotivoRechazoChange,
  onDonar,
  abrirEnModoDonacion = false
}: SolicitudDetailModalProps) => {
  const { supabase } = useSupabase();
  const [cantidadDonar, setCantidadDonar] = useState<number>(solicitud.cantidad);
  const [comentarioDonacion, setComentarioDonacion] = useState<string>('');
  const [modoDonacion, setModoDonacion] = useState(abrirEnModoDonacion);
  const [historial, setHistorial] = useState<HistorialDonacion[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Cargar historial cuando el modal se abre
  useEffect(() => {
    const cargarHistorial = async () => {
      if (solicitud.tiene_entregas_parciales || (solicitud.cantidad_entregada && solicitud.cantidad_entregada > 0)) {
        setCargandoHistorial(true);
        const datos = await obtenerHistorialDonaciones(supabase, solicitud.id);
        setHistorial(datos);
        setCargandoHistorial(false);
      }
    };
    void cargarHistorial();
  }, [solicitud.id, solicitud.tiene_entregas_parciales, solicitud.cantidad_entregada, supabase]);

  const totalDisponible = inventario.reduce(
    (total, item) => total + (item.cantidad_disponible ?? 0),
    0
  );

  const porcentajeDonacion = solicitud.cantidad > 0 
    ? Math.round((cantidadDonar / solicitud.cantidad) * 100) 
    : 0;

  const handleDonacionSubmit = () => {
    if (onDonar && cantidadDonar > 0 && cantidadDonar <= solicitud.cantidad) {
      onDonar(cantidadDonar, porcentajeDonacion, comentarioDonacion);
    }
  };

  const handleCantidadChange = (value: string) => {
    const cantidad = parseFloat(value) || 0;
    const maxDisponible = Math.min(solicitud.cantidad, totalDisponible);
    setCantidadDonar(Math.min(Math.max(0, cantidad), maxDisponible));
  };

  const setearPorcentaje = (porcentaje: number) => {
    const cantidad = (solicitud.cantidad * porcentaje) / 100;
    const maxDisponible = Math.min(solicitud.cantidad, totalDisponible);
    setCantidadDonar(Math.min(cantidad, maxDisponible));
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

          {/* Historial de Donaciones */}
          {(historial.length > 0 || cargandoHistorial) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                <History className="w-6 h-6 mr-2 text-blue-600" />
                Historial de Entregas
              </h3>

              {cargandoHistorial ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <p className="mt-2 text-sm text-gray-600">Cargando historial...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Resumen total */}
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Total Solicitado</p>
                        <p className="text-lg font-bold text-gray-900">{solicitud.cantidad} {solicitud.unidades?.simbolo ?? 'unidades'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">Total Entregado</p>
                        <p className="text-lg font-bold text-green-600">{solicitud.cantidad_entregada || 0} {solicitud.unidades?.simbolo ?? 'unidades'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase">% Completado</p>
                        <p className="text-lg font-bold text-blue-600">
                          {Math.round(((solicitud.cantidad_entregada || 0) / solicitud.cantidad) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de entregas */}
                  <div className="space-y-2">
                    {historial.map((entrega, index) => (
                      <div key={entrega.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                {historial.length - index}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {entrega.cantidad_entregada} {solicitud.unidades?.simbolo ?? 'unidades'}
                              </span>
                              <span className="text-sm text-gray-600">
                                ({entrega.porcentaje_entregado}% del total)
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>
                                <strong>Fecha:</strong> {formatDate(entrega.created_at)}
                              </p>
                              {entrega.operador && (
                                <p>
                                  <strong>Por:</strong> {entrega.operador.nombre} ({entrega.operador.rol})
                                </p>
                              )}
                              {entrega.comentario && (
                                <p className="mt-2 text-gray-700">
                                  <strong>Comentario:</strong> {entrega.comentario}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              entrega.porcentaje_entregado === 100 ? 'bg-green-100 text-green-700' :
                              entrega.porcentaje_entregado >= 75 ? 'bg-blue-100 text-blue-700' :
                              entrega.porcentaje_entregado >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {entrega.porcentaje_entregado}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sección de Donación */}
          {solicitud.estado === 'pendiente' && onDonar && abrirEnModoDonacion && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                <Package className="w-6 h-6 mr-2 text-green-600" />
                Gestionar Donación
              </h3>

              {!modoDonacion ? (
                <button
                  type="button"
                  onClick={() => setModoDonacion(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Procesar Donación
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Resumen de la solicitud */}
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cantidad solicitada:</span>
                        <p className="font-semibold text-lg">{solicitud.cantidad} {solicitud.unidades?.simbolo ?? 'unidades'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Disponible en stock:</span>
                        <p className={`font-semibold text-lg ${totalDisponible >= solicitud.cantidad ? 'text-green-600' : 'text-orange-600'}`}>
                          {formatQuantity(totalDisponible)} {solicitud.unidades?.simbolo ?? 'unidades'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cantidad a donar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad a donar
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={Math.min(solicitud.cantidad, totalDisponible)}
                        step="0.01"
                        value={cantidadDonar}
                        onChange={(e) => handleCantidadChange(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        disabled={isProcessing}
                      />
                      <span className="text-gray-600">{solicitud.unidades?.simbolo ?? 'unidades'}</span>
                    </div>
                  </div>

                  {/* Botones de porcentaje rápido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porcentajes rápidos
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[25, 50, 75, 100].map((porcentaje) => {
                        const cantidadCalculada = (solicitud.cantidad * porcentaje) / 100;
                        const puedeDonar = cantidadCalculada <= totalDisponible;
                        return (
                          <button
                            key={porcentaje}
                            type="button"
                            onClick={() => setearPorcentaje(porcentaje)}
                            disabled={!puedeDonar || isProcessing}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                              puedeDonar
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            } ${Math.abs(porcentajeDonacion - porcentaje) < 1 ? 'ring-2 ring-green-500' : ''}`}
                          >
                            {porcentaje}%
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setCantidadDonar(Math.min(solicitud.cantidad, totalDisponible))}
                        disabled={isProcessing}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Máximo
                      </button>
                    </div>
                  </div>

                  {/* Control deslizante de porcentaje */}
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Porcentaje de entrega</span>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">{porcentajeDonacion}%</span>
                      </div>
                    </div>

                    {/* Barra deslizante con indicador visual */}
                    <div className="relative mb-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={porcentajeDonacion}
                        onChange={(e) => {
                          const porcentaje = parseInt(e.target.value);
                          const cantidadCalculada = (solicitud.cantidad * porcentaje) / 100;
                          const maxDisponible = Math.min(solicitud.cantidad, totalDisponible);
                          setCantidadDonar(Math.min(cantidadCalculada, maxDisponible));
                        }}
                        disabled={isProcessing}
                        className="w-full h-5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                        style={{
                          background: `linear-gradient(to right, ${
                            porcentajeDonacion === 100 ? '#16a34a' : 
                            porcentajeDonacion >= 75 ? '#22c55e' : 
                            porcentajeDonacion >= 50 ? '#eab308' : 
                            '#f97316'
                          } 0%, ${
                            porcentajeDonacion === 100 ? '#16a34a' : 
                            porcentajeDonacion >= 75 ? '#22c55e' : 
                            porcentajeDonacion >= 50 ? '#eab308' : 
                            '#f97316'
                          } ${porcentajeDonacion}%, #e5e7eb ${porcentajeDonacion}%, #e5e7eb 100%)`
                        }}
                      />
                      {/* Marcadores de porcentaje */}
                      <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center text-xs font-medium">
                      {porcentajeDonacion === 100 && (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Entrega completa
                        </span>
                      )}
                      {porcentajeDonacion < 100 && porcentajeDonacion > 0 && (
                        <span className="flex items-center text-orange-600">
                          ⚠️ Entrega parcial
                        </span>
                      )}
                      {porcentajeDonacion === 0 && (
                        <span className="flex items-center text-red-600">
                          ⚠️ No se donará ninguna cantidad
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comentario de donación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentarios (opcional)
                    </label>
                    <textarea
                      value={comentarioDonacion}
                      onChange={(e) => setComentarioDonacion(e.target.value)}
                      rows={3}
                      placeholder="Ej: Entrega parcial por disponibilidad de stock..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      disabled={isProcessing}
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleDonacionSubmit}
                      disabled={isProcessing || cantidadDonar <= 0 || cantidadDonar > Math.min(solicitud.cantidad, totalDisponible)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isProcessing ? 'Procesando...' : `Confirmar Donación (${formatQuantity(cantidadDonar)} ${solicitud.unidades?.simbolo ?? 'unidades'})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModoDonacion(false);
                        setCantidadDonar(solicitud.cantidad);
                        setComentarioDonacion('');
                      }}
                      disabled={isProcessing}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitudDetailModal;
