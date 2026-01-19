// ============================================================================
// Component: SolicitudCard
// Tarjeta individual de solicitud con opciones de edición y eliminación
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Calendar,
  MapPin,
  MessageCircle,
  ShoppingBasket,
  Hash,
  Send,
  X,
  Package,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Solicitud, SolicitudEditData } from '../types';
import { useDateFormatter } from '@/modules/shared/hooks/useDateFormatter';
import { createClient } from '@/lib/supabase';
import { SolicitudDetalleModal } from './SolicitudDetalleModal';

interface SolicitudCardProps {
  solicitud: Solicitud;
  onDelete: (solicitud: Solicitud) => void;
  onEdit: (id: string, data: SolicitudEditData) => Promise<boolean>;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function SolicitudCard({
  solicitud,
  onDelete,
  onEdit,
  canEdit = true,
  canDelete = true,
}: SolicitudCardProps) {
  const { formatDateTime } = useDateFormatter();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [formEdit, setFormEdit] = useState<SolicitudEditData>({
    comentarios: solicitud.comentarios || '',
  });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [mostrarDetallesRechazo, setMostrarDetallesRechazo] = useState(false);
  const [mostrarDetallesAprobacion, setMostrarDetallesAprobacion] = useState(false);
  const [datosRechazo, setDatosRechazo] = useState<{
    nombreOperador: string;
    rolOperador: string;
  } | null>(null);
  const [datosAprobacion, setDatosAprobacion] = useState<{
    nombreOperador: string;
    rolOperador: string;
  } | null>(null);
  const [cargandoRechazo, setCargandoRechazo] = useState(false);
  const [cargandoAprobacion, setCargandoAprobacion] = useState(false);

  const getEstadoIcono = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return <Clock className="text-yellow-500 w-4 h-4" />;
      case 'aprobada':
        return <CheckCircle className="text-green-600 w-4 h-4" />;
      case 'rechazada':
        return <XCircle className="text-red-600 w-4 h-4" />;
      case 'entregada':
        return <Package className="text-blue-600 w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleEditar = () => {
    setEditandoId(solicitud.id);
    setFormEdit({
      comentarios: solicitud.comentarios || '',
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setFormEdit({ comentarios: '' });
  };

  const handleGuardar = async () => {
    setLoadingEdit(true);
    const success = await onEdit(solicitud.id, formEdit);

    if (success) {
      setEditandoId(null);
    }

    setLoadingEdit(false);
  };

  const puedeEditar =
    canEdit && solicitud.estado.toUpperCase() === 'PENDIENTE';
  const puedeEliminar =
    canDelete &&
    (solicitud.estado.toUpperCase() === 'RECHAZADA' ||
      solicitud.estado.toUpperCase() === 'PENDIENTE');
  
  const esRechazada = solicitud.estado.toUpperCase() === 'RECHAZADA';
  const esAprobada = solicitud.estado.toUpperCase() === 'APROBADA' || solicitud.estado.toUpperCase() === 'ENTREGADA';

  // Log de depuración para solicitudes rechazadas
  useEffect(() => {
    if (esRechazada) {
      console.log('🔍 Datos de solicitud rechazada:', {
        id: solicitud.id,
        motivo_rechazo: solicitud.motivo_rechazo,
        fecha_rechazo: solicitud.fecha_rechazo,
        operador_rechazo_id: solicitud.operador_rechazo_id,
        comentario_admin: solicitud.comentario_admin,
      });
    }
  }, [esRechazada, solicitud]);

  // Cargar datos del operador/admin que rechazó
  useEffect(() => {
    if (mostrarDetallesRechazo && solicitud.operador_rechazo_id && !datosRechazo) {
      const cargarDatosOperador = async () => {
        setCargandoRechazo(true);
        try {
          const supabase = createClient();
          
          const { data, error } = await supabase
            .from('usuarios')
            .select('nombre, rol')
            .eq('id', solicitud.operador_rechazo_id)
            .single();

          if (error) {
            // Si hay error (probablemente permisos RLS), mostrar info genérica
            console.warn('⚠️ No se pudieron cargar datos del operador (permisos):', error.message || 'Sin acceso');
            setDatosRechazo({
              nombreOperador: 'Personal Administrativo',
              rolOperador: 'STAFF',
            });
          } else if (data) {
            setDatosRechazo({
              nombreOperador: data.nombre || 'Sistema',
              rolOperador: data.rol || 'OPERADOR',
            });
          } else {
            setDatosRechazo({
              nombreOperador: 'Personal Administrativo',
              rolOperador: 'STAFF',
            });
          }
        } catch (error) {
          console.warn('⚠️ Excepción al cargar datos del operador');
          setDatosRechazo({
            nombreOperador: 'Personal Administrativo',
            rolOperador: 'STAFF',
          });
        } finally {
          setCargandoRechazo(false);
        }
      };

      void cargarDatosOperador();
    }
  }, [mostrarDetallesRechazo, solicitud.operador_rechazo_id, datosRechazo]);

  // Cargar datos del operador/admin que aprobó
  useEffect(() => {
    if (mostrarDetallesAprobacion && solicitud.operador_aprobacion_id && !datosAprobacion) {
      const cargarDatosAprobador = async () => {
        setCargandoAprobacion(true);
        try {
          const supabase = createClient();
          
          const { data, error } = await supabase
            .from('usuarios')
            .select('nombre, rol')
            .eq('id', solicitud.operador_aprobacion_id)
            .single();

          if (error) {
            console.warn('⚠️ No se pudieron cargar datos del aprobador (permisos):', error.message || 'Sin acceso');
            setDatosAprobacion({
              nombreOperador: 'Personal Administrativo',
              rolOperador: 'STAFF',
            });
          } else if (data) {
            setDatosAprobacion({
              nombreOperador: data.nombre || 'Sistema',
              rolOperador: data.rol || 'OPERADOR',
            });
          } else {
            setDatosAprobacion({
              nombreOperador: 'Personal Administrativo',
              rolOperador: 'STAFF',
            });
          }
        } catch (error) {
          console.warn('⚠️ Excepción al cargar datos del aprobador');
          setDatosAprobacion({
            nombreOperador: 'Personal Administrativo',
            rolOperador: 'STAFF',
          });
        } finally {
          setCargandoAprobacion(false);
        }
      };

      void cargarDatosAprobador();
    }
  }, [mostrarDetallesAprobacion, solicitud.operador_aprobacion_id, datosAprobacion]);

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
    <div className="border p-4 rounded-lg shadow-sm space-y-2 relative bg-white">
      {/* Modal de Detalle */}
      <SolicitudDetalleModal
        solicitud={solicitud}
        isOpen={showDetalle}
        onClose={() => setShowDetalle(false)}
      />

      {/* Botones de acción */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {/* Botón Ver Detalles */}
        <button
          onClick={() => setShowDetalle(true)}
          className="text-blue-500 hover:text-blue-700 transition"
          title="Ver detalles"
        >
          <Eye className="w-4 h-4" />
        </button>

        {puedeEliminar && (
          <button
            onClick={() => onDelete(solicitud)}
            className="text-red-500 hover:text-red-700 transition"
            title="Eliminar solicitud"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {puedeEditar && editandoId !== solicitud.id && (
          <button
            onClick={handleEditar}
            className="text-blue-500 hover:text-blue-700 transition"
            title="Editar solicitud"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Estado */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        {getEstadoIcono(solicitud.estado)}
        <p>
          <strong>Estado:</strong> {solicitud.estado}
        </p>
      </div>

      {/* Código de Comprobante - Solo si está aprobada */}
      {solicitud.codigo_comprobante && (
        <div className="bg-green-50 border border-green-200 p-2 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600 font-medium">Código:</span>
              <span className="font-mono font-bold text-green-700">
                {solicitud.codigo_comprobante}
              </span>
            </div>
            <button
              onClick={() => setShowDetalle(true)}
              className="text-xs text-green-600 hover:text-green-800 underline"
            >
              Ver comprobante
            </button>
          </div>
        </div>
      )}

      {/* Alimento */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <ShoppingBasket className="w-4 h-4" />
        <p>
          <strong>Alimento:</strong> {solicitud.tipo_alimento}
        </p>
      </div>

      {/* Cantidad */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Hash className="w-4 h-4" />
        <p>
          <strong>Cantidad:</strong> {solicitud.cantidad} {solicitud.unidad_simbolo || 'unidades'}
        </p>
      </div>

      {/* Comentarios */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <MessageCircle className="w-4 h-4" />
        {editandoId === solicitud.id ? (
          <textarea
            value={formEdit.comentarios}
            onChange={(e) =>
              setFormEdit((f) => ({ ...f, comentarios: e.target.value }))
            }
            rows={2}
            className="w-full p-1 border rounded resize-none"
            placeholder="Comentarios"
          />
        ) : (
          <p>
            <strong>Comentarios:</strong>{' '}
            {solicitud.comentarios || 'Sin comentarios'}
          </p>
        )}
      </div>

      {/* Fecha */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Calendar className="w-4 h-4" />
        <p>
          <strong>Fecha:</strong> {formatDateTime(solicitud.created_at)}
        </p>
      </div>

      {/* Ubicación */}
      {solicitud.latitud && solicitud.longitud && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <p>
              <strong>Ubicación:</strong> Lat {solicitud.latitud.toFixed(5)},
              Lng {solicitud.longitud.toFixed(5)}
            </p>
          </div>
          <iframe
            className="w-full h-48 mt-2 rounded-md border"
            src={`https://maps.google.com/maps?q=${solicitud.latitud},${solicitud.longitud}&z=15&output=embed`}
            title="Ubicación"
          ></iframe>
        </div>
      )}

      {/* Botón Ver Más para solicitudes rechazadas */}
      {esRechazada && (
        <div className="mt-3">
          <button
            onClick={() => setMostrarDetallesRechazo(!mostrarDetallesRechazo)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition"
          >
            <AlertCircle className="w-4 h-4" />
            {mostrarDetallesRechazo ? 'Ocultar detalles del rechazo' : 'Ver detalles del rechazo'}
          </button>
        </div>
      )}

      {/* Botón Ver Más para solicitudes aprobadas */}
      {esAprobada && solicitud.operador_aprobacion_id && (
        <div className="mt-3">
          <button
            onClick={() => setMostrarDetallesAprobacion(!mostrarDetallesAprobacion)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm transition"
          >
            <CheckCircle className="w-4 h-4" />
            {mostrarDetallesAprobacion ? 'Ocultar detalles de aprobación' : 'Ver detalles de aprobación'}
          </button>
        </div>
      )}

      {/* Botones de edición */}
      {editandoId === solicitud.id && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleGuardar}
            disabled={loadingEdit}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-400 transition"
          >
            <Send className="w-4 h-4" />
            Guardar
          </button>
          <button
            onClick={handleCancelarEdicion}
            disabled={loadingEdit}
            className="flex items-center gap-1 bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      )}

      {/* Modal de Detalles de Rechazo */}
      {mostrarDetallesRechazo && esRechazada && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Detalles del Rechazo
              </h3>
              <button
                onClick={() => setMostrarDetallesRechazo(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Motivo del Rechazo */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800 mb-1">Motivo del Rechazo</p>
                <p className="text-sm text-red-700">
                  {getMotivoRechazoLabel(solicitud.motivo_rechazo)}
                </p>
              </div>

              {/* Comentario del Administrador/Operador */}
              {solicitud.comentario_admin && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Comentario</p>
                  <p className="text-sm text-gray-700">{solicitud.comentario_admin}</p>
                </div>
              )}

              {/* Fecha y Hora del Rechazo */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-800 mb-1">Fecha y Hora del Rechazo</p>
                <p className="text-sm text-gray-700">
                  {solicitud.fecha_rechazo ? formatDateTime(solicitud.fecha_rechazo) : 'No registrada'}
                </p>
              </div>

              {/* Quién rechazó */}
              {solicitud.operador_rechazo_id && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Rechazado por</p>
                  {cargandoRechazo ? (
                    <p className="text-sm text-gray-600">Cargando...</p>
                  ) : datosRechazo ? (
                    <div className="text-sm text-gray-700">
                      <span
                        className={`inline-block px-3 py-1.5 rounded text-sm font-semibold ${
                          datosRechazo.rolOperador === 'ADMINISTRADOR' || datosRechazo.rolOperador === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : datosRechazo.rolOperador === 'OPERADOR'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {datosRechazo.rolOperador === 'ADMINISTRADOR' || datosRechazo.rolOperador === 'ADMIN'
                          ? 'Administrador' 
                          : datosRechazo.rolOperador === 'OPERADOR' 
                          ? 'Operador'
                          : datosRechazo.rolOperador === 'STAFF'
                          ? 'Personal Administrativo'
                          : datosRechazo.rolOperador}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No disponible</p>
                  )}
                </div>
              )}
            </div>

            {/* Botón Cerrar */}
            <div className="mt-6">
              <button
                onClick={() => setMostrarDetallesRechazo(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Aprobación */}
      {mostrarDetallesAprobacion && esAprobada && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Detalles de la Aprobación
              </h3>
              <button
                onClick={() => setMostrarDetallesAprobacion(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Comentario del Administrador/Operador */}
              {solicitud.comentario_admin && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-800 mb-1">Comentario</p>
                  <p className="text-sm text-green-700">{solicitud.comentario_admin}</p>
                </div>
              )}

              {/* Fecha y Hora de Aprobación */}
              {solicitud.fecha_aprobacion && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Fecha y Hora de Aprobación</p>
                  <p className="text-sm text-gray-700">{formatDateTime(solicitud.fecha_aprobacion)}</p>
                </div>
              )}

              {/* Quién aprobó */}
              {solicitud.operador_aprobacion_id && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Aprobado por</p>
                  {cargandoAprobacion ? (
                    <p className="text-sm text-gray-600">Cargando...</p>
                  ) : datosAprobacion ? (
                    <div className="text-sm text-gray-700">
                      <span
                        className={`inline-block px-3 py-1.5 rounded text-sm font-semibold ${
                          datosAprobacion.rolOperador === 'ADMINISTRADOR' || datosAprobacion.rolOperador === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : datosAprobacion.rolOperador === 'OPERADOR'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {datosAprobacion.rolOperador === 'ADMINISTRADOR' || datosAprobacion.rolOperador === 'ADMIN'
                          ? 'Administrador' 
                          : datosAprobacion.rolOperador === 'OPERADOR' 
                          ? 'Operador'
                          : datosAprobacion.rolOperador === 'STAFF'
                          ? 'Personal Administrativo'
                          : datosAprobacion.rolOperador}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No disponible</p>
                  )}
                </div>
              )}
            </div>

            {/* Botón Cerrar */}
            <div className="mt-6">
              <button
                onClick={() => setMostrarDetallesAprobacion(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
