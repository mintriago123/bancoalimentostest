'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { RefreshCw } from 'lucide-react';

import { useDashboardData } from '@/modules/admin/dashboard/hooks/useDashboardData';
import DashboardHeader from '@/modules/admin/dashboard/components/DashboardHeader';
import DashboardSummaryCards from '@/modules/admin/dashboard/components/DashboardSummaryCards';
import RoleDistribution from '@/modules/admin/dashboard/components/RoleDistribution';
import RequestStatus from '@/modules/admin/dashboard/components/RequestStatus';
import UserTypeDistribution from '@/modules/admin/dashboard/components/UserTypeDistribution';

export default function AdminDashboardPage() {
  const { supabase } = useSupabase();
  const { data, loading, error, refresh } = useDashboardData(supabase);

  const hasData = useMemo(() => Boolean(data), [data]);

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Panel administrativo"
      description="Resumen ejecutivo del Banco de Alimentos"
    >
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <DashboardHeader description="Indicadores clave del ecosistema de usuarios y solicitudes." />

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading
                ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                : 'bg-slate-900 text-white shadow-sm hover:bg-slate-700 focus:ring-slate-500'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar datos
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {loading && !hasData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((id) => (
                <div
                  key={`skeleton-${id}`}
                  className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white/60"
                />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
            </div>
            <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
          </div>
        )}

        {hasData && data && (
          <>
            <DashboardSummaryCards counts={data.counts} />

            <div className="grid gap-6 lg:grid-cols-2">
              <RoleDistribution items={data.roleDistribution} />
              <RequestStatus items={data.requestStatus} />
            </div>

            <UserTypeDistribution items={data.userTypes} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
