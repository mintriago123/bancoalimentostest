/**
 * @fileoverview Página para consultar el historial de cancelaciones de donaciones
 * Muestra el registro completo de cancelaciones con filtros y estadísticas
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/modules/shared';
import { 
  XCircle,
  Calendar, 
  FileText, 
  Package, 
  RefreshCw, 
  TrendingDown, 
  User,
  Filter,
  AlertTriangle
} from 'lucide-react';
import type { DonacionCanceladaDetalle, EstadisticasCancelaciones } from '@/modules/admin/reportes/cancelaciones/types';
import type { MotivoCancelacion } from '@/modules/admin/reportes/donaciones/types';

const motivosLabels: Record<MotivoCancelacion, string> = {
  error_donante: 'Error del Donante',
  no_disponible: 'Producto No Disponible',
  calidad_inadecuada: 'Calidad Inadecuada',
  logistica_imposible: 'Logística Imposible',
  duplicado: 'Donación Duplicada',
  solicitud_donante: 'Solicitud del Donante',
  otro: 'Otro Motivo'
};

const motivosColors: Record<MotivoCancelacion, string> = {
  error_donante: 'bg-orange-100 text-orange-800 border-orange-300',
  no_disponible: 'bg-red-100 text-red-800 border-red-300',
  calidad_inadecuada: 'bg-purple-100 text-purple-800 border-purple-300',
  logistica_imposible: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  duplicado: 'bg-blue-100 text-blue-800 border-blue-300',
  solicitud_donante: 'bg-gray-100 text-gray-800 border-gray-300',
  otro: 'bg-slate-100 text-slate-800 border-slate-300'
};

export default function HistorialCancelacionesPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, hideToast } = useToast();
  
  const [cancelaciones, setCancelaciones] = useState<DonacionCanceladaDetalle[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCancelaciones | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [motivoFilter, setMotivoFilter] = useState<MotivoCancelacion | 'todos'>('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const cargarCancelaciones = useCallback(async (incluirStats = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        estadisticas: incluirStats.toString()
      });

      if (motivoFilter !== 'todos') {
        params.append('motivo', motivoFilter);
      }
      if (fechaInicio) {
        params.append('fecha_inicio', fechaInicio);
      }
      if (fechaFin) {
        params.append('fecha_fin', fechaFin);
      }

      const response = await fetch(`/api/admin/cancelaciones-donaciones?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar el historial de cancelaciones');
      }

      const data = await response.json();
      
      if (data.success) {
        setCancelaciones(data.data);
        setTotal(data.pagination.total);
        setHasMore(data.pagination.has_more);
        if (data.estadisticas) {
          setEstadisticas(data.estadisticas);
        }
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar cancelaciones';
      setError(errorMsg);
      showError(errorMsg);
      console.error('Error detallado:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, motivoFilter, fechaInicio, fechaFin]); // Removido showError para evitar loop

  useEffect(() => {
    cargarCancelaciones(offset === 0); // Cargar estadísticas solo en la primera página
  }, [cargarCancelaciones]);

  const handleRefresh = () => {
    setOffset(0);
    cargarCancelaciones(true);
  };

  const handleResetFilters = () => {
    setMotivoFilter('todos');
    setFechaInicio('');
    setFechaFin('');
    setSearchTerm('');
    setOffset(0);
  };

  const cancelacionesFiltradas = cancelaciones.filter(cancelacion => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      cancelacion.nombre_donante.toLowerCase().includes(searchLower) ||
      cancelacion.tipo_producto.toLowerCase().includes(searchLower) ||
      cancelacion.usuario_cancelacion_nombre.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Historial de Cancelaciones"
      description="Registro completo de donaciones canceladas"
    >
      <div className="p-6 space-y-6">
        {/* Alerta informativa si no hay datos de cancelación configurados */}
        {!isLoading && !error && cancelaciones.length === 0 && total === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Sistema de Cancelaciones</p>
                <p className="text-sm text-blue-700 mt-1">
                  No se encontraron donaciones canceladas. Si acabas de implementar este sistema, 
                  asegúrate de que los campos de cancelación existan en la base de datos.
                </p>
                <details className="mt-3">
                  <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                    Ver instrucciones de configuración
                  </summary>
                  <div className="mt-2 p-3 bg-white border border-blue-200 rounded text-xs space-y-2">
                    <p className="font-medium">1. Abre Supabase Dashboard → SQL Editor</p>
                    <p className="font-medium">2. Ejecuta este script:</p>
                    <code className="block bg-gray-900 text-green-400 p-2 rounded font-mono">
                      database/agregar-campos-cancelacion-donaciones.sql
                    </code>
                    <p className="font-medium">3. Recarga esta página</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cancelaciones</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.total.cancelaciones}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cantidad Total</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.total.cantidad_total.toFixed(0)}</p>
                </div>
                <TrendingDown className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Solicitud Donante</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.por_motivo.solicitud_donante.cancelaciones}</p>
                </div>
                <User className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">No Disponible</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.por_motivo.no_disponible.cancelaciones}</p>
                </div>
                <Package className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Donante, producto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo
              </label>
              <select
                value={motivoFilter}
                onChange={(e) => setMotivoFilter(e.target.value as MotivoCancelacion | 'todos')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos los motivos</option>
                {Object.entries(motivosLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {(motivoFilter !== 'todos' || fechaInicio || fechaFin) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleResetFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error al cargar datos</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {error.includes('script SQL') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-medium text-yellow-800 mb-2">📋 Acción requerida:</p>
                    <p className="text-xs text-yellow-700 mb-2">
                      Los campos de cancelación no existen en la base de datos. Debes ejecutar el script SQL:
                    </p>
                    <code className="block text-xs bg-gray-900 text-green-400 p-2 rounded font-mono">
                      database/agregar-campos-cancelacion-donaciones.sql
                    </code>
                    <p className="text-xs text-yellow-700 mt-2">
                      Copia el contenido del archivo y ejecútalo en el SQL Editor de Supabase.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabla de cancelaciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Cancelaciones
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({cancelacionesFiltradas.length} {motivoFilter !== 'todos' || searchTerm ? 'filtrado(s)' : ''} de {total} total)
              </span>
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4" />
                <p className="text-gray-600">Cargando cancelaciones...</p>
              </div>
            </div>
          ) : cancelacionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No se encontraron cancelaciones</p>
              <p className="text-sm text-gray-500 mt-1">
                {motivoFilter !== 'todos' || fechaInicio || fechaFin || searchTerm
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay donaciones canceladas registradas'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cancelado por
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cancelacionesFiltradas.map((cancelacion) => (
                    <tr key={cancelacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {cancelacion.cantidad} {cancelacion.unidad_simbolo} de {cancelacion.tipo_producto}
                            </div>
                            <div className="text-xs text-gray-500">
                              {cancelacion.categoria_comida}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{cancelacion.nombre_donante}</div>
                          <div className="text-xs text-gray-500">{cancelacion.telefono}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${motivosColors[cancelacion.motivo_cancelacion]}`}>
                          {motivosLabels[cancelacion.motivo_cancelacion]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">{cancelacion.usuario_cancelacion_nombre}</div>
                            <div className="text-xs text-gray-500">{cancelacion.usuario_cancelacion_rol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(cancelacion.fecha_cancelacion).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(cancelacion.fecha_cancelacion).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cancelacion.observaciones_cancelacion ? (
                          <div className="flex items-start space-x-2 max-w-xs">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {cancelacion.observaciones_cancelacion}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin observaciones</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {!isLoading && cancelacionesFiltradas.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{offset + 1}</span> a{' '}
                <span className="font-medium">{Math.min(offset + limit, total)}</span> de{' '}
                <span className="font-medium">{total}</span> cancelaciones
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={!hasMore}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
            duration={5000}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
