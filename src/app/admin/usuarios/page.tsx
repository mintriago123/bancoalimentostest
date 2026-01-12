'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { useToast } from '@/modules/shared';
import { useConfirm } from '@/modules/admin/shared/hooks/useConfirm';
import UsersHeader from '@/modules/admin/usuarios/components/UsersHeader';
import UsersFilters from '@/modules/admin/usuarios/components/UsersFilters';
import UsersTable from '@/modules/admin/usuarios/components/UsersTable';
import BloqueoTemporalModal from '@/modules/admin/usuarios/components/BloqueoTemporalModal';
import DesactivarUsuarioModal from '@/modules/admin/usuarios/components/DesactivarUsuarioModal';
import { useUsersData } from '@/modules/admin/usuarios/hooks/useUsersData';
import { useUserActions } from '@/modules/admin/usuarios/hooks/useUserActions';
import type { UserRecord, UserStatus } from '@/modules/admin/usuarios/types';

export default function AdminUsuariosPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, hideToast } = useToast();
  const confirm = useConfirm();
  const [modalBloqueo, setModalBloqueo] = useState<{ isOpen: boolean; user: UserRecord | null }>({
    isOpen: false,
    user: null
  });
  const [modalDesactivar, setModalDesactivar] = useState<{ isOpen: boolean; user: UserRecord | null }>({
    isOpen: false,
    user: null
  });

  const {
    users,
    filteredUsers,
    stats,
    filters,
    loading,
    error,
    refresh,
    setSearch,
    toggleRoleFilter,
    togglePersonTypeFilter,
    resetFilters
  } = useUsersData(supabase);

  const { updateRole, updateStatus, processingId } = useUserActions(supabase);

  const handleRoleChange = async (userId: string, newRole: 'ADMINISTRADOR' | 'DONANTE' | 'SOLICITANTE' | 'OPERADOR') => {
    const result = await updateRole(userId, newRole);

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(result.message);
    await refresh();
  };

  const handleStatusChange = async (user: UserRecord, newStatus: UserStatus) => {
    // Si es un bloqueo, abrir el modal para seleccionar tiempo
    if (newStatus === 'bloqueado') {
      setModalBloqueo({ isOpen: true, user });
      return;
    }

    // Para desactivar (permanente), abrir modal para solicitar motivo
    if (newStatus === 'desactivado') {
      setModalDesactivar({ isOpen: true, user });
      return;
    }

    // Para activar
    const prompts: Record<'activo', { title: string; description: string; variant: 'default'; confirmLabel: string }> = {
      activo: {
        title: `Activar a ${user.nombre}`,
        description: 'El usuario podrá iniciar sesión nuevamente en el sistema.',
        variant: 'default',
        confirmLabel: 'Activar'
      }
    };

    const prompt = newStatus ? prompts[newStatus] : {
      title: `Actualizar estado de ${user.nombre}`,
      description: '¿Deseas continuar con la actualización?',
      variant: 'default' as const,
      confirmLabel: 'Confirmar'
    };

    const confirmed = await confirm({
      title: prompt.title,
      description: prompt.description,
      confirmLabel: prompt.confirmLabel,
      cancelLabel: 'Cancelar',
      variant: prompt.variant
    });

    if (!confirmed) return;

    const result = await updateStatus(user.id, newStatus);

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(result.message);
    await refresh();
  };

  const handleConfirmarBloqueo = async (duracion: number, unidad: 'horas' | 'dias', motivo: string) => {
    if (!modalBloqueo.user) return;

    // Calcular la fecha de fin del bloqueo
    const now = new Date();
    const milisegundos = unidad === 'horas' 
      ? duracion * 60 * 60 * 1000 
      : duracion * 24 * 60 * 60 * 1000;
    
    const fechaFin = new Date(now.getTime() + milisegundos);
    const fechaFinISO = fechaFin.toISOString();

    const result = await updateStatus(modalBloqueo.user.id, 'bloqueado', fechaFinISO, motivo);

    setModalBloqueo({ isOpen: false, user: null });

    if (!result.success) {
      showError(result.message);
      return;
    }

    const mensaje = `Usuario bloqueado por ${duracion} ${unidad}`;
    showSuccess(mensaje);
    await refresh();
  };

  const handleConfirmarDesactivar = async (motivo: string) => {
    if (!modalDesactivar.user) return;

    const result = await updateStatus(modalDesactivar.user.id, 'desactivado', null, motivo);

    setModalDesactivar({ isOpen: false, user: null });

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(result.message);
    await refresh();
  };

  return (
    <DashboardLayout
      requiredRole="ADMINISTRADOR"
      title="Gestión de usuarios"
      description="Controla los roles, estados y contactos de todos los usuarios del sistema"
    >
      <div className="p-6 space-y-6">
        <UsersHeader stats={stats} />

        <UsersFilters
          search={filters.search}
          roles={filters.roles}
          personTypes={filters.personTypes}
          onSearchChange={setSearch}
          onToggleRole={toggleRoleFilter}
          onTogglePersonType={togglePersonTypeFilter}
          onResetFilters={resetFilters}
        />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {loading && !users.length ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="space-y-2">
              {['s1', 's2', 's3', 's4', 's5', 's6'].map(id => (
                <div key={id} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : (
          <UsersTable
            users={filteredUsers}
            processingId={processingId}
            onChangeRole={handleRoleChange}
            onChangeStatus={handleStatusChange}
          />
        )}
      </div>

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => {
          let variantClass = 'border-slate-200 bg-white/90 text-slate-600';
          if (toast.type === 'error') {
            variantClass = 'border-rose-200 bg-rose-50 text-rose-600';
          } else if (toast.type === 'success') {
            variantClass = 'border-emerald-200 bg-emerald-50 text-emerald-600';
          }

          return (
            <div
              key={toast.id}
              className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${variantClass}`}
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

      {/* Modal de bloqueo temporal */}
      <BloqueoTemporalModal
        isOpen={modalBloqueo.isOpen}
        userName={modalBloqueo.user?.nombre || ''}
        onConfirm={handleConfirmarBloqueo}
        onCancel={() => setModalBloqueo({ isOpen: false, user: null })}
      />

      {/* Modal de desactivación permanente */}
      <DesactivarUsuarioModal
        isOpen={modalDesactivar.isOpen}
        userName={modalDesactivar.user?.nombre || ''}
        onConfirm={handleConfirmarDesactivar}
        onCancel={() => setModalDesactivar({ isOpen: false, user: null })}
      />
    </DashboardLayout>
  );
}
