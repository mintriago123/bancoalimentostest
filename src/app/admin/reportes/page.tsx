'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';

interface ReportData {
  totalUsuarios: number;
  usuariosPorRol: {
    ADMINISTRADOR: number;
    DONANTE: number;
    SOLICITANTE: number;
  };
  solicitudesPorEstado: {
    PENDIENTE: number;
    APROBADA: number;
    RECHAZADA: number;
  };
  usuariosPorTipo: {
    NATURAL: number;
    JURIDICA: number;
  };
}

export default function AdminReportes() {
  const { supabase } = useSupabase();
  const [reportData, setReportData] = useState<ReportData>({
    totalUsuarios: 0,
    usuariosPorRol: { ADMINISTRADOR: 0, DONANTE: 0, SOLICITANTE: 0 },
    solicitudesPorEstado: { PENDIENTE: 0, APROBADA: 0, RECHAZADA: 0 },
    usuariosPorTipo: { NATURAL: 0, JURIDICA: 0 }
  });
  const [cargando, setCargando] = useState(true);

  const cargarReportes = useCallback(async () => {
    setCargando(true);
    
    try {
      // Obtener datos de usuarios
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('rol, tipo_persona');

      // Obtener datos de solicitudes
      const { data: solicitudes } = await supabase
        .from('solicitudes')
        .select('estado');

      if (usuarios) {
        const usuariosPorRol = usuarios.reduce((acc, usuario) => {
          acc[usuario.rol as keyof typeof acc] = (acc[usuario.rol as keyof typeof acc] || 0) + 1;
          return acc;
        }, { ADMINISTRADOR: 0, DONANTE: 0, SOLICITANTE: 0 });

        const usuariosPorTipo = usuarios.reduce((acc, usuario) => {
          acc[usuario.tipo_persona as keyof typeof acc] = (acc[usuario.tipo_persona as keyof typeof acc] || 0) + 1;
          return acc;
        }, { NATURAL: 0, JURIDICA: 0 });

        const solicitudesPorEstado = solicitudes?.reduce((acc, solicitud) => {
          acc[solicitud.estado as keyof typeof acc] = (acc[solicitud.estado as keyof typeof acc] || 0) + 1;
          return acc;
        }, { PENDIENTE: 0, APROBADA: 0, RECHAZADA: 0 }) || { PENDIENTE: 0, APROBADA: 0, RECHAZADA: 0 };

        setReportData({
          totalUsuarios: usuarios.length,
          usuariosPorRol,
          solicitudesPorEstado,
          usuariosPorTipo
        });
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setCargando(false);
    }
  }, [supabase]);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <DashboardLayout 
      requiredRole="ADMINISTRADOR"
      title="Reportes del Sistema"
      description="Análisis estadístico completo del Banco de Alimentos"
    >
      {cargando ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando reportes...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumen General */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Usuarios</h3>
              <p className="text-3xl font-bold text-blue-600">{reportData.totalUsuarios}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Solicitudes Total</h3>
              <p className="text-3xl font-bold text-purple-600">
                {Object.values(reportData.solicitudesPorEstado).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasa Aprobación</h3>
              <p className="text-3xl font-bold text-green-600">
                {getPercentage(
                  reportData.solicitudesPorEstado.APROBADA,
                  reportData.solicitudesPorEstado.APROBADA + reportData.solicitudesPorEstado.RECHAZADA
                )}%
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pendientes</h3>
              <p className="text-3xl font-bold text-yellow-600">{reportData.solicitudesPorEstado.PENDIENTE}</p>
            </div>
          </div>

          {/* Distribución por Roles */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Distribución de Usuarios por Rol</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600">{reportData.usuariosPorRol.ADMINISTRADOR}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Administradores</p>
                <p className="text-xs text-gray-500">
                  {getPercentage(reportData.usuariosPorRol.ADMINISTRADOR, reportData.totalUsuarios)}% del total
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">{reportData.usuariosPorRol.DONANTE}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Donantes</p>
                <p className="text-xs text-gray-500">
                  {getPercentage(reportData.usuariosPorRol.DONANTE, reportData.totalUsuarios)}% del total
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{reportData.usuariosPorRol.SOLICITANTE}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Solicitantes</p>
                <p className="text-xs text-gray-500">
                  {getPercentage(reportData.usuariosPorRol.SOLICITANTE, reportData.totalUsuarios)}% del total
                </p>
              </div>
            </div>
          </div>

          {/* Estados de Solicitudes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Estado de Solicitudes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Pendientes</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ 
                          width: `${getPercentage(
                            reportData.solicitudesPorEstado.PENDIENTE,
                            Object.values(reportData.solicitudesPorEstado).reduce((a, b) => a + b, 0)
                          )}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">{reportData.solicitudesPorEstado.PENDIENTE}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Aprobadas</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ 
                          width: `${getPercentage(
                            reportData.solicitudesPorEstado.APROBADA,
                            Object.values(reportData.solicitudesPorEstado).reduce((a, b) => a + b, 0)
                          )}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-green-600">{reportData.solicitudesPorEstado.APROBADA}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Rechazadas</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full"
                        style={{ 
                          width: `${getPercentage(
                            reportData.solicitudesPorEstado.RECHAZADA,
                            Object.values(reportData.solicitudesPorEstado).reduce((a, b) => a + b, 0)
                          )}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-red-600">{reportData.solicitudesPorEstado.RECHAZADA}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tipo de Persona</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Personas Naturales</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${getPercentage(reportData.usuariosPorTipo.NATURAL, reportData.totalUsuarios)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{reportData.usuariosPorTipo.NATURAL}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Personas Jurídicas</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ 
                          width: `${getPercentage(reportData.usuariosPorTipo.JURIDICA, reportData.totalUsuarios)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{reportData.usuariosPorTipo.JURIDICA}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
