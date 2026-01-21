/**
 * @fileoverview Página para consultar el historial de bajas de productos
 * Muestra el registro completo de bajas con filtros y detalles
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/modules/shared';
import { 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Package, 
  RefreshCw, 
  TrendingDown, 
  User,
  Filter,
  Download
} from 'lucide-react';
import type { BajaProductoDetalle, MotivoBaja } from '@/modules/operador/bajas/types';

const motivosLabels: Record<MotivoBaja, string> = {
  vencido: 'Producto Vencido',
  dañado: 'Producto Dañado',
  contaminado: 'Producto Contaminado',
  rechazado: 'Producto Rechazado',
  otro: 'Otro Motivo'
};

const motivosColors: Record<MotivoBaja, string> = {
  vencido: 'bg-red-100 text-red-800 border-red-300',
  dañado: 'bg-orange-100 text-orange-800 border-orange-300',
  contaminado: 'bg-purple-100 text-purple-800 border-purple-300',
  rechazado: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  otro: 'bg-gray-100 text-gray-800 border-gray-300'
};

export default function HistorialBajasPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, hideToast } = useToast();
  
  const [bajas, setBajas] = useState<BajaProductoDetalle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [motivoFilter, setMotivoFilter] = useState<MotivoBaja | 'todos'>('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const cargarBajas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
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

      const response = await fetch(`/api/operador/bajas?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial de bajas');
      }

      const data = await response.json();
      
      if (data.success) {
        setBajas(data.data);
        setTotal(data.pagination.total);
        setHasMore(data.pagination.has_more);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [offset, limit, motivoFilter, fechaInicio, fechaFin]);

  useEffect(() => {
    cargarBajas();
  }, [cargarBajas]);

  const handleRefresh = () => {
    setOffset(0);
    cargarBajas();
  };

  const handleResetFilters = () => {
    setMotivoFilter('todos');
    setFechaInicio('');
    setFechaFin('');
    setSearchTerm('');
    setOffset(0);
  };

  const handleNextPage = () => {
    if (hasMore) {
      setOffset(prev => prev + limit);
    }
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(prev => Math.max(0, prev - limit));
    }
  };

  // Filtrar por término de búsqueda en el frontend
  const bajasFiltradas = bajas.filter(baja => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      baja.nombre_producto?.toLowerCase().includes(term) ||
      baja.usuario_nombre?.toLowerCase().includes(term) ||
      baja.deposito_nombre?.toLowerCase().includes(term) ||
      baja.observaciones?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout
      requiredRole="OPERADOR"
      title="Historial de Bajas"
      description="Consulta el registro completo de productos dados de baja"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historial de Bajas</h1>
              <p className="text-gray-600 mt-1">
                Registro completo de productos dados de baja del inventario
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filtros</h3>
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
                  placeholder="Producto, usuario..."
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
                  onChange={(e) => setMotivoFilter(e.target.value as MotivoBaja | 'todos')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="vencido">Vencido</option>
                  <option value="dañado">Dañado</option>
                  <option value="contaminado">Contaminado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="otro">Otro</option>
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

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleResetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar filtros
              </button>
              <div className="text-sm text-gray-600">
                Mostrando {bajasFiltradas.length} de {total} bajas
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error al cargar historial</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        ) : bajasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay bajas registradas
            </h3>
            <p className="text-gray-600">
              {bajas.length > 0 
                ? 'No se encontraron bajas con los filtros aplicados'
                : 'Las bajas de productos aparecerán aquí cuando se registren'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsable
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
                  {bajasFiltradas.map((baja) => (
                    <tr key={baja.id_baja} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {baja.nombre_producto || 'Sin nombre'}
                            </div>
                            {baja.deposito_nombre && (
                              <div className="text-sm text-gray-500">
                                {baja.deposito_nombre}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-gray-900">
                            {baja.cantidad_baja}
                          </span>
                          <span className="text-sm text-gray-500">
                            {baja.unidad_simbolo || ''}
                          </span>
                        </div>
                        {baja.cantidad_disponible_antes && (
                          <div className="text-xs text-gray-400 mt-1">
                            Antes: {baja.cantidad_disponible_antes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${motivosColors[baja.motivo_baja]}`}>
                          {motivosLabels[baja.motivo_baja]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {baja.usuario_nombre || 'No especificado'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {baja.usuario_rol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(baja.fecha_baja).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(baja.fecha_baja).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {baja.observaciones ? (
                          <div className="flex items-start space-x-2 max-w-xs">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {baja.observaciones}
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

            {/* Paginación */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {Math.floor(offset / limit) + 1} de {Math.ceil(total / limit)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toasts */}
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
