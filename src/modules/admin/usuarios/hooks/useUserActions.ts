import { useCallback, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createUserDataService } from '../services/userDataService';
import type { ServiceResult, UserRole, UserStatus } from '../types';

interface UpdateResult {
  success: boolean;
  message: string;
}

interface UseUserActionsResult {
  updateRole: (userId: string, newRole: UserRole) => Promise<UpdateResult>;
  updateStatus: (userId: string, newStatus: UserStatus, fechaFinBloqueo?: string | null, motivoBloqueo?: string | null) => Promise<UpdateResult>;
  processingId?: string;
}

export const useUserActions = (supabaseClient: SupabaseClient): UseUserActionsResult => {
  const [processingId, setProcessingId] = useState<string | undefined>();
  const service = useMemo(() => createUserDataService(supabaseClient), [supabaseClient]);

  const updateRole = useCallback(async (userId: string, newRole: UserRole) => {
    setProcessingId(userId);

    let result: ServiceResult<void>;

    try {
      result = await service.updateUserRole(userId, newRole);
    } finally {
      setProcessingId(undefined);
    }

    if (!result.success) {
      return {
        success: false,
        message: result.error ?? 'No fue posible actualizar el rol'
      };
    }

    return {
      success: true,
      message: 'Rol actualizado correctamente'
    };
  }, [service]);

  const updateStatus = useCallback(async (
    userId: string, 
    newStatus: UserStatus, 
    fechaFinBloqueo?: string | null,
    motivoBloqueo?: string | null
  ) => {
    setProcessingId(userId);

    let result: ServiceResult<void>;

    try {
      result = await service.updateUserStatus(userId, newStatus ?? null, fechaFinBloqueo, motivoBloqueo);
    } finally {
      setProcessingId(undefined);
    }

    if (!result.success) {
      return {
        success: false,
        message: result.error ?? 'No fue posible actualizar el estado'
      };
    }

    const successMessages: Record<NonNullable<UserStatus>, string> = {
      activo: 'Usuario activado correctamente',
      bloqueado: fechaFinBloqueo 
        ? 'Usuario bloqueado temporalmente' 
        : 'Usuario bloqueado correctamente',
      desactivado: 'Usuario desactivado permanentemente'
    };

    return {
      success: true,
      message: newStatus == null ? 'Estado actualizado' : successMessages[newStatus]
    };
  }, [service]);

  return {
    updateRole,
    updateStatus,
    processingId
  };
};
