'use client';

import { useCallback, useMemo } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/modules/shared';
import InventoryHeader from '@/modules/admin/reportes/inventario/components/InventoryHeader';
import InventoryFilters from '@/modules/admin/reportes/inventario/components/InventoryFilters';
import InventoryTable from '@/modules/admin/reportes/inventario/components/InventoryTable';
import InventoryDepositSummary from '@/modules/admin/reportes/inventario/components/InventoryDepositSummary';
import InventoryErrorState from '@/modules/admin/reportes/inventario/components/InventoryErrorState';
import { useInventoryData } from '@/modules/admin/reportes/inventario/hooks/useInventoryData';
import { useInventoryActions } from '@/modules/admin/reportes/inventario/hooks/useInventoryActions';
import type { InventarioItem } from '@/modules/admin/reportes/inventario/types';

const LoadingState = () => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    <p className="mt-4 text-gray-600">Cargando inventario...</p>
  </div>
);

export default function InventoryReportPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const {
    inventario,
    filteredInventario,
    depositos,
    filters,
    loadingState,
    errorMessage,
    stats,
    hasActiveFilters,
    refetch,
    setSearch,
    setDeposito,
    setStockLevel,
    resetFilters,
    messages
  } = useInventoryData(supabase);

  const {
    processingId,
    updateCantidad
  } = useInventoryActions(supabase);

  const isLoading = loadingState === 'loading';
  const hasError = loadingState === 'error';

  const handleUpdateCantidad = useCallback(async (item: InventarioItem, nuevaCantidad: number) => {
    const result = await updateCantidad(item, nuevaCantidad);

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(result.message);
    await refetch();
  }, [updateCantidad, refetch, showError, showSuccess]);

  const handleDecrease = useCallback(async (item: InventarioItem) => {
    const nuevaCantidad = Math.max(0, item.cantidad_disponible - 1);
    await handleUpdateCantidad(item, nuevaCantidad);
  }, [handleUpdateCantidad]);

  const handleIncrease = useCallback(async (item: InventarioItem) => {
    const nuevaCantidad = item.cantidad_disponible + 1;
    await handleUpdateCantidad(item, nuevaCantidad);
  }, [handleUpdateCantidad]);

  const tableContent = useMemo(() => {
    if (isLoading) {
      return <LoadingState />;
    }

    return (
      <InventoryTable
        items={filteredInventario}
        totalItems={inventario.length}
        hasActiveFilters={hasActiveFilters}
        messages={{
          noData: messages.noData,
          noFilteredData: messages.noFilteredData
        }}
        onResetFilters={resetFilters}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
        processingId={processingId}
      />
    );
  }, [
    isLoading,
    filteredInventario,
    inventario.length,
    hasActiveFilters,
    messages.noData,
    messages.noFilteredData,
    resetFilters,
    handleDecrease,
    handleIncrease,
    processingId
  ]);

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Gestión de Inventario"
      description="Control y ajustes del stock disponible"
    >
      <div className="p-6 space-y-6">
        <InventoryHeader stats={stats} />

        {hasError && (
          <InventoryErrorState
            message={errorMessage ?? messages.loadError}
            onRetry={refetch}
          />
        )}

        <InventoryFilters
          filters={filters}
          depositos={depositos}
          onSearchChange={setSearch}
          onDepositoChange={setDeposito}
          onStockChange={setStockLevel}
          onRefresh={refetch}
          filteredCount={filteredInventario.length}
          totalCount={inventario.length}
        />

        {tableContent}

        <InventoryDepositSummary
          depositos={depositos}
          inventario={inventario}
        />
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
