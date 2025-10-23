'use client';

import { useCallback, useMemo } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import DonationsHeader from '@/modules/admin/reportes/donaciones/components/DonationsHeader';
import DonationsFilters from '@/modules/admin/reportes/donaciones/components/DonationsFilters';
import DonationsTable from '@/modules/admin/reportes/donaciones/components/DonationsTable';
import DonationsErrorState from '@/modules/admin/reportes/donaciones/components/DonationsErrorState';
import { useDonationsData } from '@/modules/admin/reportes/donaciones/hooks/useDonationsData';
import { useDonationActions } from '@/modules/admin/reportes/donaciones/hooks/useDonationActions';
import type { Donation, DonationEstado } from '@/modules/admin/reportes/donaciones/types';

const LoadingState = () => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    <p className="mt-4 text-gray-600">Cargando donaciones...</p>
  </div>
);

export default function DonationsReportPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, showWarning, hideToast } = useToast();

  const {
    donations,
    filteredDonations,
    filters,
    counters,
    loadingState,
    errorMessage,
    hasFiltersApplied,
    refetch,
    setSearch,
    toggleEstado,
    togglePersonType,
    resetFilters,
    messages
  } = useDonationsData(supabase);

  const { processingId, updateEstado } = useDonationActions(supabase);

  const isLoading = loadingState === 'loading';
  const hasError = loadingState === 'error';

  const handleChangeEstado = useCallback(async (donation: Donation, estado: DonationEstado) => {
    const result = await updateEstado(donation, estado);

    if (!result.success) {
      showError(result.message);
      return;
    }

    if (result.warning) {
      showWarning(result.message);
    } else {
      showSuccess(result.message);
    }

    await refetch();
  }, [updateEstado, showError, showSuccess, showWarning, refetch]);

  const tableContent = useMemo(() => {
    if (isLoading) {
      return <LoadingState />;
    }

    return (
      <DonationsTable
        donations={filteredDonations}
        totalCount={donations.length}
        hasActiveFilters={hasFiltersApplied}
        onResetFilters={resetFilters}
        onChangeEstado={handleChangeEstado}
        processingId={processingId}
        messages={{
          noData: messages.noData,
          noFilteredData: messages.noFilteredData
        }}
      />
    );
  }, [isLoading, filteredDonations, donations.length, hasFiltersApplied, resetFilters, handleChangeEstado, processingId, messages.noData, messages.noFilteredData]);

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Gestión de Donaciones"
      description="Seguimiento de donaciones y su impacto en el inventario"
    >
      <div className="p-6 space-y-6">
        <DonationsHeader counters={counters} />

        {hasError && (
          <DonationsErrorState
            message={errorMessage ?? messages.loadError}
            onRetry={refetch}
          />
        )}

        <DonationsFilters
          filters={filters}
          onSearchChange={setSearch}
          onToggleEstado={toggleEstado}
          onTogglePersonType={togglePersonType}
          onRefresh={refetch}
          filteredCount={filteredDonations.length}
          totalCount={donations.length}
        />

        {tableContent}
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
