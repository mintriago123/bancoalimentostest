// ============================================================================
// Hook: useSolicitudes
// Manejo de solicitudes del usuario
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Solicitud,
  SolicitudFormData,
  SolicitudEditData,
  FiltroEstadoSolicitud,
  LoadingState,
} from '../types';
import { SolicitudesService } from '../services/solicitudesService';
import { MESSAGES } from '../constants';

interface UseSolicitudesResult {
  solicitudes: Solicitud[];
  loading: LoadingState;
  error: string | null;
  createSolicitud: (data: SolicitudFormData) => Promise<boolean>;
  updateSolicitud: (id: number, data: SolicitudEditData) => Promise<boolean>;
  deleteSolicitud: (id: number) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSolicitudes(
  supabase: SupabaseClient,
  usuarioId: string | undefined,
  filtroEstado: FiltroEstadoSolicitud = 'TODOS'
): UseSolicitudesResult {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const service = new SolicitudesService(supabase);

  const fetchSolicitudes = useCallback(async () => {
    if (!usuarioId) return;

    setLoading('loading');
    setError(null);

    const { data, error: fetchError } = await service.getSolicitudesByUsuario(
      usuarioId,
      filtroEstado
    );

    if (fetchError) {
      setError(MESSAGES.SOLICITUD.ERROR_LOAD);
      setLoading('error');
    } else {
      setSolicitudes(data || []);
      setLoading('success');
    }
  }, [usuarioId, filtroEstado]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const createSolicitud = async (data: SolicitudFormData): Promise<boolean> => {
    if (!usuarioId) return false;

    const { error: createError } = await service.createSolicitud(usuarioId, data);

    if (createError) {
      setError(MESSAGES.SOLICITUD.ERROR_CREATE);
      return false;
    }

    await fetchSolicitudes();
    return true;
  };

  const updateSolicitud = async (
    id: number,
    data: SolicitudEditData
  ): Promise<boolean> => {
    const { error: updateError } = await service.updateSolicitud(id, data);

    if (updateError) {
      setError(MESSAGES.SOLICITUD.ERROR_UPDATE);
      return false;
    }

    // Actualizar la solicitud en el estado local
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );

    return true;
  };

  const deleteSolicitud = async (id: number): Promise<boolean> => {
    const { error: deleteError } = await service.deleteSolicitud(id);

    if (deleteError) {
      setError(MESSAGES.SOLICITUD.ERROR_DELETE);
      return false;
    }

    // Eliminar la solicitud del estado local
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  return {
    solicitudes,
    loading,
    error,
    createSolicitud,
    updateSolicitud,
    deleteSolicitud,
    refetch: fetchSolicitudes,
  };
}
