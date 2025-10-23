'use client';

import { useCallback, useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import { useConfirm } from '@/modules/admin/shared/hooks/useConfirm';
import SolicitudesHeader from '@/modules/admin/reportes/solicitudes/components/SolicitudesHeader';
import SolicitudesFilters from '@/modules/admin/reportes/solicitudes/components/SolicitudesFilters';
import SolicitudesTable from '@/modules/admin/reportes/solicitudes/components/SolicitudesTable';
import SolicitudDetailModal from '@/modules/admin/reportes/solicitudes/components/SolicitudDetailModal';
import { useSolicitudesData } from '@/modules/admin/reportes/solicitudes/hooks/useSolicitudesData';
import { useSolicitudActions } from '@/modules/admin/reportes/solicitudes/hooks/useSolicitudActions';
import { useInventarioDisponible } from '@/modules/admin/reportes/solicitudes/hooks/useInventarioDisponible';
import { formatDateTime } from '@/modules/admin/reportes/solicitudes/utils/formatters';
import type { Solicitud } from '@/modules/admin/reportes/solicitudes/types';

const ErrorState = ({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
    <div>
      <h3 className="text-sm font-semibold text-red-800">Error al cargar las solicitudes</h3>
      <p className="text-sm text-red-700 mt-1">{message}</p>
    </div>
    <button
      type="button"
      onClick={onRetry}
      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      Reintentar
    </button>
  </div>
);

export default function SolicitudesPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, showWarning, hideToast } = useToast();
  const confirm = useConfirm();

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comentarioAdmin, setComentarioAdmin] = useState('');

  const {
    solicitudes,
    filteredSolicitudes,
    loadingState,
    errorMessage,
    filters,
    counters,
    badgeStyles,
    estadoIcons,
    messages,
    setSearchFilter,
    toggleEstadoFilter,
    resetFilters,
    refetch
  } = useSolicitudesData(supabase);

  const { processingId, updateEstado, revertir } = useSolicitudActions(supabase);

  const {
    inventario,
    loadingState: inventarioLoadingState,
    errorMessage: inventarioError,
    loadInventario,
    resetInventario
  } = useInventarioDisponible(supabase);

  const isLoading = loadingState === 'loading';
  const hasError = loadingState === 'error';
  const totalSolicitudes = solicitudes.length;
  const hasActiveFilters = filters.search.trim() !== '' || !filters.estados.todos;
  const showClearSearchButton = filters.search.trim() !== '';
  const isInventarioLoading = inventarioLoadingState === 'loading';
  const noDataMessage = messages.noData;
  const noFilteredDataMessage = messages.noFilteredData;

  const closeModal = useCallback(() => {
    setMostrarModal(false);
    setSolicitudSeleccionada(null);
    setComentarioAdmin('');
    resetInventario();
  }, [resetInventario]);

  const handleEstadoChange = useCallback(async (solicitud: Solicitud, estado: 'aprobada' | 'rechazada', comentario?: string) => {
    const prompts: Record<'aprobada' | 'rechazada', {
      title: string;
      description: string;
      confirmLabel: string;
      variant: 'default' | 'danger' | 'warning';
    }> = {
      aprobada: {
        title: `Aprobar solicitud de ${solicitud.usuarios?.nombre ?? 'solicitante'}`,
        description: `Se descontarán ${solicitud.cantidad} unidades de ${solicitud.tipo_alimento} del inventario disponible.`,
        confirmLabel: 'Aprobar y descontar',
        variant: 'warning'
      },
      rechazada: {
        title: `Rechazar solicitud de ${solicitud.usuarios?.nombre ?? 'solicitante'}`,
        description: 'El solicitante será notificado del rechazo y la solicitud no se atenderá.',
        confirmLabel: 'Rechazar',
        variant: 'danger'
      }
    };

    const prompt = prompts[estado];

    const confirmed = await confirm({
      title: prompt.title,
      description: prompt.description,
      confirmLabel: prompt.confirmLabel,
      cancelLabel: 'Cancelar',
      variant: prompt.variant
    });

    if (!confirmed) {
      return false;
    }

    const result = await updateEstado(solicitud, estado, comentario);

    if (!result.success) {
      showError(result.message);
      return false;
    }

    if (result.warning) {
      showWarning(result.message);
    } else {
      showSuccess(result.message);
    }

    await refetch();
    return true;
  }, [updateEstado, refetch, showError, showSuccess, showWarning, confirm]);

  const handleOpenModal = useCallback((solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setComentarioAdmin(solicitud.comentario_admin ?? '');
    setMostrarModal(true);
    void loadInventario(solicitud.tipo_alimento);
  }, [loadInventario]);

  const handleRevertir = useCallback(async (solicitud: Solicitud) => {
    const confirmed = await confirm({
      title: `Revertir solicitud de ${solicitud.usuarios?.nombre ?? 'solicitante'}`,
      description: 'La solicitud volverá al estado pendiente y el solicitante podrá ser notificado para un nuevo seguimiento.',
      confirmLabel: 'Revertir',
      cancelLabel: 'Cancelar',
      variant: 'warning'
    });

    if (!confirmed) {
      return;
    }

    const result = await revertir(solicitud.id);

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(result.message);
    await refetch();
  }, [revertir, refetch, showError, showSuccess, confirm]);

  const handleModalAprobar = useCallback(async () => {
    if (!solicitudSeleccionada) return;
    const success = await handleEstadoChange(solicitudSeleccionada, 'aprobada', comentarioAdmin);
    if (success) closeModal();
  }, [solicitudSeleccionada, comentarioAdmin, handleEstadoChange, closeModal]);

  const handleModalRechazar = useCallback(async () => {
    if (!solicitudSeleccionada) return;
    const success = await handleEstadoChange(solicitudSeleccionada, 'rechazada', comentarioAdmin);
    if (success) closeModal();
  }, [solicitudSeleccionada, comentarioAdmin, handleEstadoChange, closeModal]);

  const handleToggleEstado = useCallback((estado: keyof typeof filters.estados) => {
    toggleEstadoFilter(estado);
  }, [toggleEstadoFilter, filters]);

  const handleClearSearch = useCallback(() => {
    setSearchFilter('');
  }, [setSearchFilter]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const tableContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
          <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
        </div>
      );
    }

    return (
      <SolicitudesTable
        solicitudes={filteredSolicitudes}
        totalSolicitudes={totalSolicitudes}
        onVerDetalle={handleOpenModal}
        onActualizarEstado={(solicitud, estado) => handleEstadoChange(solicitud, estado)}
        onRevertir={handleRevertir}
        estadoIcons={estadoIcons}
        badgeStyles={badgeStyles}
        formatDate={formatDateTime}
        processingId={processingId}
        emptyMessage={noDataMessage}
        filteredMessage={noFilteredDataMessage}
        onClearSearch={showClearSearchButton ? handleClearSearch : undefined}
        showClearSearchButton={showClearSearchButton}
      />
    );
  }, [
    isLoading,
    filteredSolicitudes,
    totalSolicitudes,
    handleOpenModal,
    handleEstadoChange,
    handleRevertir,
    estadoIcons,
    badgeStyles,
    processingId,
    noDataMessage,
    noFilteredDataMessage,
    showClearSearchButton,
    handleClearSearch
  ]);

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Gestión de Solicitudes"
      description="Administra las solicitudes de entrega de alimentos"
    >
      <div className="p-6 space-y-6">
        <SolicitudesHeader counters={counters} />

        {hasError && (
          <ErrorState
            message={errorMessage ?? messages.loadError}
            onRetry={refetch}
          />
        )}

        <div className="space-y-4">
          <SolicitudesFilters
            search={filters.search}
            estados={filters.estados}
            onSearchChange={setSearchFilter}
            onToggleEstado={handleToggleEstado}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {tableContent}
      </div>

      {mostrarModal && solicitudSeleccionada && (
        <SolicitudDetailModal
          solicitud={solicitudSeleccionada}
          comentarioAdmin={comentarioAdmin}
          inventario={inventario}
          inventarioLoading={isInventarioLoading}
          inventarioError={inventarioError}
          formatDate={formatDateTime}
          badgeStyles={badgeStyles}
          estadoIcons={estadoIcons}
          onClose={closeModal}
          onComentarioChange={setComentarioAdmin}
          onAprobar={handleModalAprobar}
          onRechazar={handleModalRechazar}
          isProcessing={processingId === solicitudSeleccionada.id}
        />
      )}

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
