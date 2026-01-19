'use client';

import { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/modules/shared';
import { useConfirm } from '@/modules/admin/shared/hooks/useConfirm';
import {
  SolicitudesHeader,
  SolicitudesFilters,
  SolicitudesTable,
  SolicitudDetailModal,
  useSolicitudesData,
  useSolicitudActions,
  useInventarioDisponible,
  formatDateTime
} from '@/modules/operador/solicitudes';
import type { Solicitud } from '@/modules/operador/solicitudes';

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

export default function OperadorSolicitudesPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, showWarning, hideToast } = useToast();
  const confirm = useConfirm();

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comentarioAdmin, setComentarioAdmin] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [mostrarDialogoRechazo, setMostrarDialogoRechazo] = useState(false);
  const [solicitudParaRechazar, setSolicitudParaRechazar] = useState<Solicitud | null>(null);
  const [abrirEnModoDonacion, setAbrirEnModoDonacion] = useState(false);

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

  const { processingId, updateEstado, procesarDonacion } = useSolicitudActions(supabase);

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
    setMotivoRechazo('');
    setAbrirEnModoDonacion(false);
    resetInventario();
  }, [resetInventario]);

  const handleEstadoChange = useCallback(async (solicitud: Solicitud, estado: 'aprobada' | 'rechazada', comentario?: string, motivo?: string) => {
    // Si es rechazo y no tiene motivo, abrir el diálogo de rechazo
    if (estado === 'rechazada' && !motivo) {
      setSolicitudParaRechazar(solicitud);
      setComentarioAdmin('');
      setMotivoRechazo('');
      setMostrarDialogoRechazo(true);
      return false;
    }

    // Si se va a aprobar, verificar stock disponible primero
    if (estado === 'aprobada') {
      await loadInventario(solicitud.tipo_alimento);
      // Esperar un momento para que se cargue el inventario
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const prompts: Record<'aprobada' | 'rechazada', {
      title: string;
      description: string;
      confirmLabel: string;
      variant: 'default' | 'danger' | 'warning';
    }> = {
      aprobada: {
        title: `Aprobar solicitud de ${solicitud.usuarios?.nombre ?? 'solicitante'}`,
        description: `Se descontarán ${solicitud.cantidad} ${solicitud.unidades?.simbolo ?? 'unidades'} de ${solicitud.tipo_alimento} del inventario disponible.`,
        confirmLabel: 'Aprobar y descontar',
        variant: 'warning'
      },
      rechazada: {
        title: `Rechazar solicitud de ${solicitud.usuarios?.nombre ?? 'solicitante'}`,
        description: 'El solicitante será notificado del rechazo con el motivo, fecha, hora y detalles.',
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
      resetInventario();
      return false;
    }

    // Obtener el ID del usuario actual para registrar quién rechazó
    const { data: { user } } = await supabase.auth.getUser();
    const operadorId = user?.id;

    console.log('🔍 COMPONENTE - Llamando updateEstado con:', {
      estado,
      comentario,
      motivo,
      operadorId,
      solicitudId: solicitud.id
    });

    const result = await updateEstado(solicitud, estado, comentario, motivo, operadorId);

    if (!result.success) {
      showError(result.message);
      resetInventario();
      return false;
    }

    if (result.warning) {
      showWarning(result.message);
    } else {
      showSuccess(result.message);
    }

    resetInventario();
    await refetch();
    return true;
  }, [updateEstado, refetch, showError, showSuccess, showWarning, confirm, loadInventario, resetInventario, supabase]);

  const handleMarcarEntregada = useCallback(async (solicitud: Solicitud) => {
    const confirmed = await confirm({
      title: `Marcar como entregada`,
      description: `¿Estás seguro de marcar esta solicitud como entregada? Esta acción NO se puede revertir.`,
      confirmLabel: 'Marcar como entregada',
      cancelLabel: 'Cancelar',
      variant: 'warning'
    });

    if (!confirmed) {
      return;
    }

    const result = await updateEstado(solicitud, 'entregada');

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess('Solicitud marcada como entregada exitosamente');
    await refetch();
  }, [updateEstado, refetch, showError, showSuccess, confirm]);

  const handleOpenModal = useCallback((solicitud: Solicitud, abrirModoDonacion = false) => {
    setSolicitudSeleccionada(solicitud);
    setComentarioAdmin(solicitud.comentario_admin ?? '');
    setMotivoRechazo('');
    setAbrirEnModoDonacion(abrirModoDonacion);
    setMostrarModal(true);
    void loadInventario(solicitud.tipo_alimento);
  }, [loadInventario]);

  const handleModalAprobar = useCallback(async () => {
    if (!solicitudSeleccionada) return;
    const success = await handleEstadoChange(solicitudSeleccionada, 'aprobada', comentarioAdmin);
    if (success) closeModal();
  }, [solicitudSeleccionada, comentarioAdmin, handleEstadoChange, closeModal]);

  const handleModalRechazar = useCallback(async () => {
    if (!solicitudSeleccionada) return;
    const success = await handleEstadoChange(solicitudSeleccionada, 'rechazada', comentarioAdmin, motivoRechazo);
    if (success) closeModal();
  }, [solicitudSeleccionada, comentarioAdmin, motivoRechazo, handleEstadoChange, closeModal]);

  const handleDonacion = useCallback(async (cantidad: number, porcentaje: number, comentario: string) => {
    if (!solicitudSeleccionada) return;

    // Obtener el ID del usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    const operadorId = user?.id;

    const confirmed = await confirm({
      title: 'Confirmar Donación',
      description: `Se entregará ${cantidad} ${solicitudSeleccionada.unidades?.simbolo ?? 'unidades'} (${porcentaje}% de lo solicitado). Esta acción descuenta del inventario.`,
      confirmLabel: 'Confirmar Donación',
      cancelLabel: 'Cancelar',
      variant: 'warning'
    });

    if (!confirmed) return;

    const result = await procesarDonacion(solicitudSeleccionada, cantidad, porcentaje, comentario, operadorId);

    if (!result.success) {
      showError(result.message);
      return;
    }

    if (result.warning) {
      showWarning(result.message);
    } else {
      showSuccess(result.message);
    }

    closeModal();
    await refetch();
  }, [solicitudSeleccionada, procesarDonacion, showError, showSuccess, showWarning, closeModal, refetch, confirm, supabase]);

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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
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
        onMarcarEntregada={handleMarcarEntregada}
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
    handleMarcarEntregada,
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
      requiredRole="OPERADOR"
      title="Gestión de Solicitudes"
      description="Aprobar y rechazar solicitudes de alimentos"
    >
      <div className="p-6 space-y-6">
        <SolicitudesHeader counters={counters} />

        <SolicitudesFilters
          search={filters.search}
          estados={filters.estados}
          onSearchChange={setSearchFilter}
          onToggleEstado={handleToggleEstado}
        />

        {hasError && errorMessage && (
          <ErrorState 
            message={errorMessage}
            onRetry={refetch}
          />
        )}

        {tableContent}

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-sm text-orange-600 hover:text-orange-700 underline"
          >
            Limpiar filtros
          </button>
        )}

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
            motivoRechazo={motivoRechazo}
            onMotivoRechazoChange={setMotivoRechazo}
            onDonar={handleDonacion}
            abrirEnModoDonacion={abrirEnModoDonacion}
          />
        )}

        {/* Diálogo de Rechazo */}
        {mostrarDialogoRechazo && solicitudParaRechazar && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Rechazar Solicitud
              </h3>
              
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Solicitante:</strong> {solicitudParaRechazar.usuarios?.nombre ?? 'N/A'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Alimento:</strong> {solicitudParaRechazar.tipo_alimento}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Cantidad:</strong> {solicitudParaRechazar.cantidad} {solicitudParaRechazar.unidades?.simbolo ?? 'unidades'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Motivo de Rechazo */}
                <div>
                  <label htmlFor="motivo-rechazo-dialog" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo del Rechazo <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="motivo-rechazo-dialog"
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">-- Selecciona un motivo --</option>
                    <option value="stock_insuficiente">Stock insuficiente</option>
                    <option value="producto_no_disponible">Producto no disponible</option>
                    <option value="datos_incompletos">Datos incompletos</option>
                    <option value="solicitante_ineligible">Solicitante ineligible</option>
                    <option value="duplicada">Solicitud duplicada</option>
                    <option value="vencimiento_proximo">Próximos a vencer</option>
                    <option value="otro">Otro motivo</option>
                  </select>
                  {!motivoRechazo && (
                    <p className="text-xs text-red-600 mt-1">Este campo es obligatorio</p>
                  )}
                </div>

                {/* Comentario */}
                <div>
                  <label htmlFor="comentario-rechazo-dialog" className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario Detallado <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="comentario-rechazo-dialog"
                    value={comentarioAdmin}
                    onChange={(e) => setComentarioAdmin(e.target.value)}
                    placeholder="Explica en detalle el motivo del rechazo. El solicitante recibirá este mensaje..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    minLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 10 caracteres. El solicitante recibirá este comentario.
                  </p>
                  {comentarioAdmin.length < 10 && (
                    <p className="text-xs text-red-600 mt-1">
                      Debes escribir al menos 10 caracteres
                    </p>
                  )}
                </div>

                {/* Información */}
                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <p className="text-xs text-orange-800">
                    <strong>Nota:</strong> El solicitante recibirá una notificación con el motivo, fecha, hora y tu comentario.
                  </p>
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!motivoRechazo || comentarioAdmin.length < 10) {
                        showError('Debes completar el motivo y el comentario (mínimo 10 caracteres)');
                        return;
                      }
                      setMostrarDialogoRechazo(false);
                      await handleEstadoChange(solicitudParaRechazar, 'rechazada', comentarioAdmin, motivoRechazo);
                      setSolicitudParaRechazar(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!motivoRechazo || comentarioAdmin.length < 10}
                  >
                    Confirmar Rechazo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarDialogoRechazo(false);
                      setSolicitudParaRechazar(null);
                      setComentarioAdmin('');
                      setMotivoRechazo('');
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nota informativa para operadores */}
        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Nota para Operadores
              </h3>
              <p className="mt-1 text-sm text-orange-700">
                Como operador, puedes aprobar y rechazar solicitudes, pero <strong>NO puedes revertir</strong> solicitudes ya procesadas. 
                Para revertir una solicitud, contacta a un administrador.
              </p>
            </div>
          </div>
        </div>
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
