'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';

interface Estadisticas {
  totalUsuarios: number;
  solicitudesPendientes: number;
  solicitudesAprobadas: number;
  solicitudesRechazadas: number;
}

export default function AdminDashboard() {
  const { supabase } = useSupabase();
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalUsuarios: 0,
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    solicitudesRechazadas: 0,
  });
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);

  const cargarEstadisticas = useCallback(async () => {
    setCargandoEstadisticas(true);
    
    try {
      // Contar usuarios
      const { count: totalUsuarios } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      // Contar solicitudes por estado
      const { count: solicitudesPendientes } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'PENDIENTE');

      const { count: solicitudesAprobadas } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'APROBADA');

      const { count: solicitudesRechazadas } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'RECHAZADA');

      setEstadisticas({
        totalUsuarios: totalUsuarios || 0,
        solicitudesPendientes: solicitudesPendientes || 0,
        solicitudesAprobadas: solicitudesAprobadas || 0,
        solicitudesRechazadas: solicitudesRechazadas || 0,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargandoEstadisticas(false);
    }
  }, [supabase]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  return (
    <DashboardLayout 
      requiredRole="ADMINISTRADOR"
      title="Panel de Administración"
      description="Panel de control del sistema de gestión del Banco de Alimentos"
    >
      {cargandoEstadisticas ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas del sistema...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Usuarios Registrados</h3>
                  <p className="text-3xl font-bold text-blue-600">{estadisticas.totalUsuarios}</p>
                  <p className="text-sm text-gray-500">Total en el sistema</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Solicitudes Pendientes</h3>
                  <p className="text-3xl font-bold text-yellow-600">{estadisticas.solicitudesPendientes}</p>
                  <p className="text-sm text-gray-500">Esperando revisión</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Solicitudes Aprobadas</h3>
                  <p className="text-3xl font-bold text-green-600">{estadisticas.solicitudesAprobadas}</p>
                  <p className="text-sm text-gray-500">Aprobadas exitosamente</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Solicitudes Rechazadas</h3>
                  <p className="text-3xl font-bold text-red-600">{estadisticas.solicitudesRechazadas}</p>
                  <p className="text-sm text-gray-500">No aprobadas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de resumen */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Resumen del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Estado de Solicitudes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de solicitudes:</span>
                    <span className="text-sm font-medium">
                      {estadisticas.solicitudesPendientes + estadisticas.solicitudesAprobadas + estadisticas.solicitudesRechazadas}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Procesadas:</span>
                    <span className="text-sm font-medium">
                      {estadisticas.solicitudesAprobadas + estadisticas.solicitudesRechazadas}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tasa de aprobación:</span>
                    <span className="text-sm font-medium">
                      {estadisticas.solicitudesAprobadas + estadisticas.solicitudesRechazadas > 0
                        ? Math.round((estadisticas.solicitudesAprobadas / (estadisticas.solicitudesAprobadas + estadisticas.solicitudesRechazadas)) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Acciones Recomendadas</h4>
                <div className="space-y-2">
                  {estadisticas.solicitudesPendientes > 0 && (
                    <div className="flex items-center text-sm text-orange-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Revisar {estadisticas.solicitudesPendientes} solicitudes pendientes
                    </div>
                  )}
                  {estadisticas.solicitudesPendientes === 0 && (
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Todas las solicitudes están procesadas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
