'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Download, RefreshCw, TrendingUp, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MovementItem {
  id: string;
  fecha_movimiento: string;
  tipo_movimiento: 'ingreso' | 'egreso';
  nombre_producto: string;
  unidad_medida: string;
  cantidad: number;
  usuario_responsable: string;
  rol_usuario: string;
  origen_movimiento: string;
  observaciones: string;
}

interface ReportFilters {
  fecha_inicio: string;
  fecha_fin: string;
  tipo_movimiento?: 'ingreso' | 'egreso';
  producto: string;
}

export default function MovementsReport() {
  const { supabase } = useSupabase();
  const [data, setData] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [filters, setFilters] = useState<ReportFilters>({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_movimiento: undefined,
    producto: ''
  });

  const loadReport = async () => {
    setLoading(true);
    try {
      // Obtener datos reales de donaciones (ingresos) y solicitudes aprobadas (egresos)
      const movementsData: MovementItem[] = [];

      // 1. Obtener donaciones como movimientos de ingreso
      const { data: donaciones, error: errorDonaciones } = await supabase
        .from('donaciones')
        .select(`
          id,
          creado_en,
          nombre_producto,
          unidad_medida,
          cantidad,
          observaciones,
          estado,
          usuarios!inner(nombre, rol)
        `)
        .order('creado_en', { ascending: false });

      if (!errorDonaciones && donaciones) {
        const ingresos: MovementItem[] = donaciones.map((donacion: any) => ({
          id: `d-${donacion.id}`,
          fecha_movimiento: donacion.creado_en,
          tipo_movimiento: 'ingreso' as const,
          nombre_producto: donacion.nombre_producto || 'Producto sin nombre',
          unidad_medida: donacion.unidad_medida || 'unidad',
          cantidad: donacion.cantidad || 0,
          usuario_responsable: donacion.usuarios?.nombre || 'Usuario desconocido',
          rol_usuario: donacion.usuarios?.rol || 'DONANTE',
          origen_movimiento: 'Donación',
          observaciones: donacion.observaciones || `Donación - Estado: ${donacion.estado}`
        }));
        movementsData.push(...ingresos);
      }

      // 2. Obtener solicitudes aprobadas como movimientos de egreso
      const { data: solicitudes, error: errorSolicitudes } = await supabase
        .from('solicitudes')
        .select(`
          id,
          created_at,
          productos_solicitados,
          estado,
          observaciones,
          usuarios!inner(nombre, rol)
        `)
        .eq('estado', 'aprobada')
        .order('created_at', { ascending: false });

      if (!errorSolicitudes && solicitudes) {
        const egresos: MovementItem[] = [];
        
        solicitudes.forEach((solicitud: any) => {
          try {
            const productos = JSON.parse(solicitud.productos_solicitados || '[]');
            productos.forEach((producto: any, index: number) => {
              egresos.push({
                id: `s-${solicitud.id}-${index}`,
                fecha_movimiento: solicitud.created_at,
                tipo_movimiento: 'egreso' as const,
                nombre_producto: producto.nombre || 'Producto sin nombre',
                unidad_medida: producto.unidad || 'unidad',
                cantidad: producto.cantidad || 0,
                usuario_responsable: solicitud.usuarios?.nombre || 'Usuario desconocido',
                rol_usuario: solicitud.usuarios?.rol || 'SOLICITANTE',
                origen_movimiento: 'Solicitud Aprobada',
                observaciones: solicitud.observaciones || 'Entrega de solicitud aprobada'
              });
            });
          } catch (error) {
            console.error('Error procesando productos de solicitud:', error);
          }
        });
        
        movementsData.push(...egresos);
      }

      // Ordenar todos los movimientos por fecha (más recientes primero)
      movementsData.sort((a, b) => new Date(b.fecha_movimiento).getTime() - new Date(a.fecha_movimiento).getTime());

      // Aplicar filtros y establecer datos
      setData(applyFilters(movementsData));
      
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Error cargando reporte:', error);
      // En caso de error, mostrar tabla vacía (sin datos de ejemplo)
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (rawData: MovementItem[]) => {
    let filtered = rawData;

    if (filters.fecha_inicio) {
      filtered = filtered.filter(item => 
        new Date(item.fecha_movimiento) >= new Date(filters.fecha_inicio)
      );
    }

    if (filters.fecha_fin) {
      filtered = filtered.filter(item => 
        new Date(item.fecha_movimiento) <= new Date(filters.fecha_fin + 'T23:59:59')
      );
    }

    if (filters.tipo_movimiento) {
      filtered = filtered.filter(item => item.tipo_movimiento === filters.tipo_movimiento);
    }

    if (filters.producto) {
      filtered = filtered.filter(item => 
        item.nombre_producto.toLowerCase().includes(filters.producto.toLowerCase())
      );
    }

    return filtered;
  };

  const exportReport = async (format: 'excel' | 'csv') => {
    try {
      const csvContent = [
        ['Fecha', 'Tipo', 'Producto', 'Unidad', 'Cantidad', 'Usuario', 'Origen', 'Observaciones'],
        ...data.map(item => [
          formatDate(item.fecha_movimiento),
          item.tipo_movimiento === 'ingreso' ? 'Ingreso' : 'Egreso',
          item.nombre_producto,
          item.unidad_medida,
          item.cantidad.toString(),
          `${item.usuario_responsable} (${item.rol_usuario})`,
          item.origen_movimiento,
          item.observaciones
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_movimientos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Reporte exportado como ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exportando reporte:', error);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      fecha_inicio: '',
      fecha_fin: '',
      tipo_movimiento: undefined,
      producto: ''
    });
  };

  useEffect(() => {
    loadReport();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getMovementTypeColor = (type: string) => {
    return type === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Reporte de Movimientos"
      description="Historial de ingresos y egresos de productos"
    >
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/reportes" 
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Reportes
              </Link>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Reporte de Movimientos</h1>
                  <p className="text-gray-600">Historial de ingresos y egresos de productos</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={loadReport} 
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              
              <button 
                onClick={() => exportReport('csv')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={filters.fecha_inicio || ''}
                  onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={filters.fecha_fin || ''}
                  onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
                <select
                  value={filters.tipo_movimiento || ''}
                  onChange={(e) => handleFilterChange('tipo_movimiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={filters.producto || ''}
                  onChange={(e) => handleFilterChange('producto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={loadReport} 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </button>
              <button 
                onClick={clearFilters} 
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Limpiar
              </button>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="mt-4 text-sm text-gray-500">
              Última actualización: {formatDate(lastUpdate)}
            </div>
          )}
        </div>

        {/* Contenido del reporte */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-3 text-gray-600">Cargando reporte...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.fecha_movimiento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(item.tipo_movimiento)}`}>
                          {item.tipo_movimiento === 'ingreso' ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.nombre_producto}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.unidad_medida}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(item.cantidad)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{item.usuario_responsable}</div>
                        <div className="text-gray-500">({item.rol_usuario})</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.origen_movimiento}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {item.observaciones}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {data.length === 0 && !loading && (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay movimientos</h3>
                  <p className="mt-1 text-sm text-gray-500">No se encontraron movimientos con los filtros aplicados</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumen */}
        {data.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Movimientos</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{data.length}</div>
                <div className="text-sm text-gray-500">Total movimientos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.filter(item => item.tipo_movimiento === 'ingreso').length}
                </div>
                <div className="text-sm text-gray-500">Total ingresos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.filter(item => item.tipo_movimiento === 'egreso').length}
                </div>
                <div className="text-sm text-gray-500">Total egresos</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}