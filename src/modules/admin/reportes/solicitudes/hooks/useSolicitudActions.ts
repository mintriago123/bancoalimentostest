/**
 * @fileoverview Hook para ejecutar acciones sobre solicitudes.
 */

import { useCallback, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Solicitud, SolicitudActionResponse } from '../types';
import { createSolicitudesActionService } from '../services/solicitudesActionService';
import { SYSTEM_MESSAGES } from '../constants';

interface UseSolicitudActionsResult {
  processingId?: string;
  lastError?: string;
  updateEstado: (solicitud: Solicitud, nuevoEstado: 'aprobada' | 'rechazada', comentario?: string) => Promise<SolicitudActionResponse>;
  revertir: (solicitudId: string) => Promise<SolicitudActionResponse>;
}

export const useSolicitudActions = (supabaseClient: SupabaseClient): UseSolicitudActionsResult => {
  const [processingId, setProcessingId] = useState<string | undefined>();
  const [lastError, setLastError] = useState<string | undefined>();

  const service = useMemo(
    () => createSolicitudesActionService(supabaseClient),
    [supabaseClient]
  );

  const updateEstado = useCallback(async (solicitud: Solicitud, nuevoEstado: 'aprobada' | 'rechazada', comentario?: string) => {
    setProcessingId(solicitud.id);
    setLastError(undefined);

    try {
      const result = await service.updateSolicitudEstado(solicitud, nuevoEstado, comentario);

      if (result.success && result.data) {
        return result.data;
      }

      const message = result.error ?? SYSTEM_MESSAGES.actionError;
      setLastError(message);
      return {
        success: false,
        message,
        warning: false
      };
    } finally {
      setProcessingId(undefined);
    }
  }, [service]);

  const revertir = useCallback(async (solicitudId: string) => {
    setProcessingId(solicitudId);
    setLastError(undefined);

    try {
      const result = await service.revertirSolicitud(solicitudId);

      if (result.success && result.data) {
        return result.data;
      }

      const message = result.error ?? SYSTEM_MESSAGES.actionError;
      setLastError(message);
      return {
        success: false,
        message
      };
    } finally {
      setProcessingId(undefined);
    }
  }, [service]);

  return {
    processingId,
    lastError,
    updateEstado,
    revertir
  };
};
