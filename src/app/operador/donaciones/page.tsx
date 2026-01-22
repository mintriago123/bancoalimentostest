'use client';

import { useCallback, useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/modules/shared';
import { useConfirm } from '@/modules/admin/shared/hooks/useConfirm';
import {
  DonationsHeader,
  DonationsFilters,
  DonationsTable,
  DonationsErrorState,
  DonationDetailModal,
  useDonationsData,
  useDonationActions,
  type Donation,
  type DonationEstado
} from '@/modules/shared/donaciones';
import CancelarDonacionModal from '@/modules/admin/reportes/donaciones/components/CancelarDonacionModal';
import type { MotivoCancelacion } from '@/modules/admin/reportes/donaciones/types';

const LoadingState = () => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    <p className="mt-4 text-gray-600">Cargando donaciones...</p>
  </div>
);

export default function OperadorDonationsPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, showWarning, hideToast } = useToast();
  const confirm = useConfirm();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelarModalOpen, setIsCancelarModalOpen] = useState(false);
  const [donationToCancelar, setDonationToCancelar] = useState<Donation | null>(null);

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
    // Si es cancelar, abrir el modal de cancelación
    if (estado === 'Cancelada') {
      setDonationToCancelar(donation);
      setIsCancelarModalOpen(true);
      return;
    }

    const prompts: Record<Exclude<DonationEstado, 'Cancelada'>, {
      title: string;
      description: string;
      confirmLabel: string;
      variant: 'default' | 'danger' | 'warning';
    }> = {
      Pendiente: {
        title: `Marcar donación de ${donation.nombre_donante || 'donante'} como pendiente`,
        description: `La donación de ${donation.cantidad} ${donation.unidad_simbolo} de ${donation.tipo_producto} volverá al estado pendiente.`,
        confirmLabel: 'Mover a pendiente',
        variant: 'warning'
      },
      Recogida: {
        title: `Confirmar recogida de ${donation.tipo_producto}`,
        description: `La donación de ${donation.nombre_donante || 'el donante'} se marcará como recogida.`,
        confirmLabel: 'Marcar como recogida',
        variant: 'warning'
      },
      Entregada: {
        title: `Confirmar entrega de ${donation.tipo_producto}`,
        description: 'La donación se marcará como entregada y el impacto quedará registrado.',
        confirmLabel: 'Marcar como entregada',
        variant: 'default'
      }
    };

    const prompt = prompts[estado as Exclude<DonationEstado, 'Cancelada'>];

    const confirmed = await confirm({
      title: prompt.title,
      description: prompt.description,
      confirmLabel: prompt.confirmLabel,
      cancelLabel: 'Cancelar',
      variant: prompt.variant
    });

    if (!confirmed) {
      return;
    }

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
  }, [updateEstado, showError, showSuccess, showWarning, refetch, confirm]);

  const handleViewDetails = useCallback((donation: Donation) => {
    setSelectedDonation(donation);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedDonation(null);
  }, []);

  const handleConfirmCancelacion = useCallback(async (
    motivo: MotivoCancelacion,
    observaciones?: string
  ) => {
    if (!donationToCancelar) return;

    const result = await updateEstado(donationToCancelar, 'Cancelada', {
      motivo,
      observaciones
    });

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(result.message);
    setIsCancelarModalOpen(false);
    setDonationToCancelar(null);
    await refetch();
  }, [donationToCancelar, updateEstado, showError, showSuccess, refetch]);

  const handleCloseCancelarModal = useCallback(() => {
    setIsCancelarModalOpen(false);
    setDonationToCancelar(null);
  }, []);

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
        onViewDetails={handleViewDetails}
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
      requiredRole="OPERADOR"
      title="Gestión de Donaciones"
      description="Seguimiento y actualización de estados de donaciones"
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

        {/* Nota informativa para operadores */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Nota para Operadores
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Puedes actualizar el estado de las donaciones (Pendiente → Recogida → Entregada) y cancelarlas cuando sea necesario. 
                El historial de cancelaciones solo es visible para administradores.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CancelarDonacionModal
        isOpen={isCancelarModalOpen}
        onClose={handleCloseCancelarModal}
        onConfirm={handleConfirmCancelacion}
        donacion={donationToCancelar}
        isProcessing={processingId === donationToCancelar?.id}
      />

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

      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />
    </DashboardLayout>
  );
}
