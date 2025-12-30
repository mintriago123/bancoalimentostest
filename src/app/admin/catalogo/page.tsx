'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { useToast } from '@/modules/shared';
import CatalogHeader from '@/modules/admin/catalogo/components/CatalogHeader';
import CatalogFilters from '@/modules/admin/catalogo/components/CatalogFilters';
import CatalogTable from '@/modules/admin/catalogo/components/CatalogTable';
import CategoriesSection from '@/modules/admin/catalogo/components/CategoriesSection';
import FoodModal from '@/modules/admin/catalogo/components/FoodModal';
import DeleteConfirmModal from '@/modules/admin/catalogo/components/DeleteConfirmModal';
import CategoryDeleteModal from '@/modules/admin/catalogo/components/CategoryDeleteModal';
import { useCatalogData } from '@/modules/admin/catalogo/hooks/useCatalogData';
import type { FoodFormValues, FoodRecord } from '@/modules/admin/catalogo/types';
import { Plus } from 'lucide-react';

export default function AdminCatalogPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const {
    filteredFoods,
    stats,
    filters,
    categories,
    categoriesWithCount,
    unidades,
    loading,
    loadingUnidades,
    error,
    setSearch,
    setCategory,
    resetFilters,
    createFood,
    updateFood,
    deleteFood,
    checkFoodUsage,
    deleteCategory
  } = useCatalogData(supabase);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedFood, setSelectedFood] = useState<FoodRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ totalDonaciones: number; totalProductos: number } | null>(null);
  const [categoryDeleteOpen, setCategoryDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ nombre: string; cantidad: number } | null>(null);

  const openCreateModal = () => {
    setSelectedFood(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const openEditModal = (food: FoodRecord) => {
    setSelectedFood(food);
    setFormMode('edit');
    setFormOpen(true);
  };

  const openDeleteModal = async (food: FoodRecord) => {
    setSelectedFood(food);
    
    // Verificar el uso del alimento
    const result = await checkFoodUsage(food.id);
    if (result.success && result.data) {
      setUsageInfo(result.data);
    } else {
      setUsageInfo(null);
    }
    
    setDeleteOpen(true);
  };

  const handleSubmit = async (values: FoodFormValues) => {
    let action: Promise<{ success: boolean; error?: string }>;
    if (formMode === 'create') {
      action = createFood(values);
    } else if (selectedFood) {
      action = updateFood(selectedFood.id, values);
    } else {
      action = Promise.resolve({ success: false, error: 'Elemento no encontrado' });
    }

    const result = await action;

    if (result.success) {
      showSuccess(formMode === 'create' ? 'Alimento registrado' : 'Alimento actualizado');
      setFormOpen(false);
    } else {
      showError(result.error ?? 'No fue posible completar la acción');
    }
  };

  const handleDelete = async (cascade: boolean, password?: string) => {
    if (!selectedFood) return;

    // Si es eliminación en cascada, validar la contraseña del usuario
    if (cascade) {
      if (!password) {
        showError('Debes ingresar tu contraseña para confirmar la eliminación');
        return;
      }

      // Validar la contraseña usando Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        showError('No se pudo verificar tu identidad');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (signInError) {
        showError('Contraseña incorrecta. Verifica e intenta nuevamente.');
        return;
      }
    }

    const result = await deleteFood(selectedFood.id, cascade);

    if (result.success) {
      showSuccess('Alimento eliminado correctamente');
      setDeleteOpen(false);
      setUsageInfo(null);
    } else {
      showError(result.error ?? 'No fue posible eliminar el alimento');
    }
  };

  const openCategoryDeleteModal = (categoryName: string) => {
    const categoryData = categoriesWithCount.find(cat => cat.nombre === categoryName);
    if (categoryData) {
      setSelectedCategory(categoryData);
      setCategoryDeleteOpen(true);
    }
  };

  const handleCategoryDelete = async () => {
    if (!selectedCategory) return;

    const result = await deleteCategory(selectedCategory.nombre);

    if (result.success) {
      showSuccess('Categoría eliminada correctamente');
      setCategoryDeleteOpen(false);
      setSelectedCategory(null);
    } else {
      showError(result.error ?? 'No fue posible eliminar la categoría');
    }
  };

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Catálogo de alimentos"
      description="Gestiona los productos disponibles para donaciones y entregas"
    >
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CatalogHeader stats={stats} />
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 self-end rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" /> Registrar alimento
          </button>
        </div>

        <CatalogFilters
          filters={filters}
          categories={categories}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onReset={resetFilters}
        />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {loading && !filteredFoods.length ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            {Array.from({ length: 6 }).map(() => {
              const id =
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                  ? crypto.randomUUID()
                  : Math.random().toString(36).slice(2);
              return <div key={id} className="h-12 animate-pulse rounded-xl bg-slate-100" />;
            })}
          </div>
        ) : (
          <>
            <CatalogTable
              foods={filteredFoods}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
            
            <CategoriesSection
              categories={categoriesWithCount}
              onDeleteCategory={openCategoryDeleteModal}
            />
          </>
        )}
      </div>

      <FoodModal
        open={formOpen}
        mode={formMode}
        initialData={selectedFood}
        unidadesDisponibles={unidades}
        loadingUnidades={loadingUnidades}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        food={selectedFood}
        usageInfo={usageInfo}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <CategoryDeleteModal
        open={categoryDeleteOpen}
        categoryName={selectedCategory?.nombre}
        foodCount={selectedCategory?.cantidad}
        onClose={() => {
          setCategoryDeleteOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleCategoryDelete}
      />

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => {
          let toastClass = 'border-slate-200 bg-white/90 text-slate-600';
          if (toast.type === 'error') {
            toastClass = 'border-rose-200 bg-rose-50 text-rose-600';
          } else if (toast.type === 'success') {
            toastClass = 'border-emerald-200 bg-emerald-50 text-emerald-600';
          }

          return (
            <div
              key={toast.id}
              className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${toastClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span>{toast.message}</span>
                <button onClick={() => hideToast(toast.id)} className="text-xs text-slate-400 hover:text-slate-600">
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
