'use client';

import { useCallback, useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/modules/shared';
import { useOperadorInventoryData } from '@/modules/operador/inventario/hooks/useInventoryData';
import OperadorInventoryTable from '@/modules/operador/inventario/components/OperadorInventoryTable';
import OperadorInventoryFilters from '@/modules/operador/inventario/components/OperadorInventoryFilters';
import OperadorInventoryStats from '@/modules/operador/inventario/components/OperadorInventoryStats';
import OperadorInventoryAlerts from '@/modules/operador/inventario/components/OperadorInventoryAlerts';
import OperadorInventoryDetailModal from '@/modules/operador/inventario/components/OperadorInventoryDetailModal';
import type { InventarioItem, AlertaInventario } from '@/modules/operador/inventario/types';
import { Package2, AlertTriangle, BarChart3 } from 'lucide-react';

const LoadingState = () => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    <p className="mt-4 text-gray-600">Cargando inventario...</p>
  </div>
);

export default function OperadorInventarioPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, hideToast } = useToast();
  const [currentView, setCurrentView] = useState<'inventario' | 'alertas' | 'estadisticas'>('inventario');
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaInventario | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    inventario,
    filteredInventario,
    depositos,
    alertas,
    filters,
    loadingState,
    errorMessage,
    stats,
    hasActiveFilters,
    refetch,
    refetchAlertas,
    updateCantidad,
    setSearch,
    setDeposito,
    setStockLevel,
    setAlertasOnly,
    setProximosVencer,
    resetFilters
  } = useOperadorInventoryData(supabase);

  const isLoading = loadingState === 'loading';
  const hasError = loadingState === 'error';

  // Simulamos acciones de inventario (sin implementar backend aún)
  const [processingId, setProcessingId] = useState<string>();

  const handleUpdateCantidad = useCallback(async (item: InventarioItem, nuevaCantidad: number) => {
    setProcessingId(item.id_inventario);
    
    try {
      const success = await updateCantidad(item.id_inventario, nuevaCantidad);
      
      if (success) {
        showSuccess(`Cantidad actualizada: ${item.producto.nombre_producto} - ${nuevaCantidad} unidades`);
      } else {
        showError('Error al actualizar la cantidad');
      }
    } catch (error) {
      showError('Error al actualizar la cantidad');
    } finally {
      setProcessingId(undefined);
    }
  }, [updateCantidad, showError, showSuccess]);

  const handleDecrease = useCallback(async (item: InventarioItem) => {
    const nuevaCantidad = Math.max(0, item.cantidad_disponible - 1);
    await handleUpdateCantidad(item, nuevaCantidad);
  }, [handleUpdateCantidad]);

  const handleIncrease = useCallback(async (item: InventarioItem) => {
    const nuevaCantidad = item.cantidad_disponible + 1;
    await handleUpdateCantidad(item, nuevaCantidad);
  }, [handleUpdateCantidad]);

  const handleViewDetails = useCallback((item: InventarioItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleAlertaClick = useCallback((alerta: AlertaInventario) => {
    setSelectedAlerta(alerta);
    showSuccess(`Alerta seleccionada: ${alerta.producto.nombre_producto}`);
  }, [showSuccess]);

  const renderMainContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (hasError) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar inventario</h3>
          <p className="text-red-600 mb-4">{errorMessage || 'Error desconocido'}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'alertas':
        return (
          <OperadorInventoryAlerts
            alertas={alertas}
            onAlertaClick={handleAlertaClick}
          />
        );
      
      case 'estadisticas':
        return <OperadorInventoryStats stats={stats} />;
      
      default:
        return (
          <div className="space-y-6">
            <OperadorInventoryFilters
              filters={filters}
              depositos={depositos}
              onSearchChange={setSearch}
              onDepositoChange={setDeposito}
              onStockLevelChange={setStockLevel}
              onAlertasOnlyChange={setAlertasOnly}
              onProximosVencerChange={setProximosVencer}
              onReset={resetFilters}
              totalItems={inventario.length}
              filteredItems={filteredInventario.length}
            />

            <OperadorInventoryTable
              items={filteredInventario}
              totalItems={inventario.length}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
              onDecrease={handleDecrease}
              onIncrease={handleIncrease}
              onViewDetails={handleViewDetails}
              processingId={processingId}
            />
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      requiredRole="OPERADOR"
      title="Control de Inventario"
      description="Gestión y monitoreo del stock disponible"
    >
      <div className="p-6 space-y-6">
        {/* Header con navegación */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Control de Inventario</h1>
              <p className="text-gray-600 mt-1">
                Monitorea el stock, gestiona alertas y mantén el inventario actualizado
              </p>
            </div>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Actualizar
            </button>
          </div>

          {/* Navegación por pestañas */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setCurrentView('inventario')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'inventario'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package2 className="w-4 h-4" />
              <span>Inventario</span>
            </button>
            
            <button
              onClick={() => setCurrentView('alertas')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'alertas'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Alertas</span>
              {alertas.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {alertas.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setCurrentView('estadisticas')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'estadisticas'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Estadísticas</span>
            </button>
          </div>
        </div>

        {/* Resumen rápido de estadísticas */}
        {currentView !== 'estadisticas' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Productos</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalProductos}</p>
                </div>
                <Package2 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Stock Bajo</p>
                  <p className="text-2xl font-bold text-red-700">{stats.stockBajo}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Próx. Vencer</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.productosProximosVencer}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Alertas Activas</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.alertasActivas}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {renderMainContent()}
      </div>

      {/* Toasts */}
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

      {/* Modal de Detalles */}
      <OperadorInventoryDetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />
    </DashboardLayout>
  );
}
