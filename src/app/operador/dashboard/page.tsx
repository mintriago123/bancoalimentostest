'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { RefreshCw } from 'lucide-react';

import { useDashboardData, RequestStatus } from '@/modules/shared/dashboard';

export default function OperadorDashboardPage() {
  const { supabase } = useSupabase();
  const { data, loading, error, refresh } = useDashboardData(supabase);

  const hasData = useMemo(() => Boolean(data), [data]);

  // Estadísticas relevantes para operadores
  const operadorStats = useMemo(() => {
    if (!data) return null;
    
    // Calcular estadísticas desde requestStatus
    const pendientes = data.requestStatus?.find(s => s.label === 'Pendiente')?.count || 0;
    const aprobadas = data.requestStatus?.find(s => s.label === 'Aprobada')?.count || 0;
    const rechazadas = data.requestStatus?.find(s => s.label === 'Rechazada')?.count || 0;
    
    return {
      solicitudesPendientes: pendientes,
      solicitudesAprobadas: aprobadas,
      solicitudesRechazadas: rechazadas,
      totalSolicitudes: data.counts?.totalSolicitudes || 0,
      totalUsuarios: data.counts?.totalUsuarios || 0
    };
  }, [data]);

  return (
    <DashboardLayout
      requiredRole="OPERADOR"
      title="Panel de Operador"
      description="Gestión diaria de solicitudes, donaciones e inventario"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header con botón de actualizar */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="hidden lg:block">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Panel de Operador</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Vista general de las operaciones del día
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading
                ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                : 'bg-orange-600 text-white shadow-sm hover:bg-orange-700 focus:ring-orange-500'
            }`}
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar datos
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !hasData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5].map((id) => (
                <div
                  key={`skeleton-${id}`}
                  className="h-32 animate-pulse rounded-2xl border border-orange-200 bg-orange-50/60"
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl border border-orange-200 bg-orange-50/60" />
          </div>
        )}

        {/* Dashboard content */}
        {hasData && operadorStats && (
          <>
            {/* Tarjetas de resumen para operadores */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Solicitudes Pendientes */}
              <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {operadorStats.solicitudesPendientes}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Requieren atención</p>
              </div>

              {/* Solicitudes Aprobadas */}
              <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Solicitudes Aprobadas</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {operadorStats.solicitudesAprobadas}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Procesadas exitosamente</p>
              </div>

              {/* Solicitudes Rechazadas */}
              <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Solicitudes Rechazadas</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {operadorStats.solicitudesRechazadas}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">No procesadas</p>
              </div>

              {/* Total Solicitudes */}
              <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {operadorStats.totalSolicitudes}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">En el sistema</p>
              </div>
            </div>

            {/* Gráfico de estado de solicitudes */}
            {data?.requestStatus && (
              <RequestStatus items={data.requestStatus} />
            )}

            {/* Acciones rápidas */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="/operador/solicitudes"
                  className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Gestionar Solicitudes</span>
                </a>

                <a
                  href="/operador/donaciones"
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Gestionar Donaciones</span>
                </a>

                <a
                  href="/operador/inventario"
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Ajustar Inventario</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
