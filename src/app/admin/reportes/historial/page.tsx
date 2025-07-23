'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { History, FileText, Download, Eye, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ReportHistory {
  id_reporte: string;
  fecha_generacion: string;
  tipo_reporte: 'inventario' | 'movimientos' | 'donaciones';
  usuario_generador: string;
  total_registros: number;
  formato_exportacion?: string;
  parametros_filtro: any;
  archivo_exportado?: boolean;
  observaciones?: string;
}

interface HistoryFilters {
  tipo_reporte: string;
  limit: number;
  offset: number;
}

export default function ReportsHistory() {
  const { supabase } = useSupabase();
  const [data, setData] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [filters, setFilters] = useState<HistoryFilters>({
    tipo_reporte: '',
    limit: 50,
    offset: 0
  });

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Intentar obtener historial real desde una tabla de auditoría
      const { data: historialReal, error } = await supabase
        .from('reportes_historial')
        .select('*')
        .order('fecha_generacion', { ascending: false });

      if (error) {
        console.error('Error obteniendo historial de reportes:', error);
        // Si no existe la tabla de historial, mostrar tabla vacía (sin simulación)
        setData([]);
      } else {
        // Aplicar filtros a los datos reales
        let filteredData = historialReal || [];
        
        if (filters.tipo_reporte) {
          filteredData = filteredData.filter((item: any) => item.tipo_reporte === filters.tipo_reporte);
        }
        
        // Aplicar límite
        filteredData = filteredData.slice(filters.offset, filters.offset + filters.limit);
        
        setData(filteredData);
      }
      
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Error cargando historial:', error);
      // En caso de error, mostrar tabla vacía (sin datos simulados)
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof HistoryFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? (key === 'limit' ? 50 : 0) : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      tipo_reporte: '',
      limit: 50,
      offset: 0
    });
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getReportTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'inventario': 'Inventario',
      'movimientos': 'Movimientos',
      'donaciones': 'Donaciones'
    };
    return types[type] || type;
  };

  const getFormatLabel = (format?: string) => {
    if (!format) return 'Vista web';
    return format.toUpperCase();
  };

  const formatFilters = (parametros: any) => {
    if (!parametros || Object.keys(parametros).length === 0) {
      return 'Sin filtros';
    }
    
    const filterLabels: string[] = [];
    
    if (parametros.fecha_inicio) {
      filterLabels.push(`Desde: ${new Date(parametros.fecha_inicio).toLocaleDateString('es-ES')}`);
    }
    
    if (parametros.fecha_fin) {
      filterLabels.push(`Hasta: ${new Date(parametros.fecha_fin).toLocaleDateString('es-ES')}`);
    }
    
    if (parametros.tipo_movimiento) {
      filterLabels.push(`Tipo: ${parametros.tipo_movimiento}`);
    }
    
    if (parametros.producto) {
      filterLabels.push(`Producto: ${parametros.producto}`);
    }
    
    if (parametros.id_usuario) {
      filterLabels.push(`Usuario específico`);
    }
    
    return filterLabels.length > 0 ? filterLabels.join(', ') : 'Sin filtros';
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'inventario': return 'bg-blue-100 text-blue-800';
      case 'movimientos': return 'bg-green-100 text-green-800';
      case 'donaciones': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatColor = (format?: string) => {
    return format ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Historial de Reportes"
      description="Registro de todos los reportes generados"
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
                <History className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Historial de Reportes</h1>
                  <p className="text-gray-600">Registro de todos los reportes generados</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={loadHistory} 
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                <select
                  value={filters.tipo_reporte}
                  onChange={(e) => handleFilterChange('tipo_reporte', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="inventario">Inventario</option>
                  <option value="movimientos">Movimientos</option>
                  <option value="donaciones">Donaciones</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Registros</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={loadHistory} 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
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
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">Cargando historial...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Generación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filtros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item.id_reporte} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        #{item.id_reporte}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.fecha_generacion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReportTypeColor(item.tipo_reporte)}`}>
                          {getReportTypeLabel(item.tipo_reporte)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.usuario_generador || 'Sistema'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.total_registros}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFormatColor(item.formato_exportacion)}`}>
                          {getFormatLabel(item.formato_exportacion)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={formatFilters(item.parametros_filtro)}>
                          {formatFilters(item.parametros_filtro)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.archivo_exportado && (
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            title="Descargar archivo"
                            onClick={() => console.log('Descargar archivo:', item.id_reporte)}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {data.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historial</h3>
                  <p className="mt-1 text-sm text-gray-500">No se encontraron reportes generados</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Estadísticas del historial */}
        {data.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Historial</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{data.length}</div>
                <div className="text-sm text-gray-500">Total reportes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.filter(item => item.tipo_reporte === 'inventario').length}
                </div>
                <div className="text-sm text-gray-500">Inventario</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.filter(item => item.tipo_reporte === 'movimientos').length}
                </div>
                <div className="text-sm text-gray-500">Movimientos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.filter(item => item.tipo_reporte === 'donaciones').length}
                </div>
                <div className="text-sm text-gray-500">Donaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {data.filter(item => item.archivo_exportado).length}
                </div>
                <div className="text-sm text-gray-500">Archivos exportados</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
