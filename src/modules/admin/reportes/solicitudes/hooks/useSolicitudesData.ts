/**
 * @fileoverview Hook para manejo de datos y filtros de solicitudes.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  INITIAL_FILTERS,
  ESTADO_BADGE_STYLES,
  ESTADO_ICONS,
  ESTADO_LABELS,
  SYSTEM_MESSAGES
} from '../constants';
import type {
  LoadingState,
  Solicitud,
  SolicitudEstado,
  SolicitudFilters,
  SolicitudEstadoFilter,
  SolicitudCounters
} from '../types';
import { createSolicitudesActionService } from '../services/solicitudesActionService';

interface UseSolicitudesDataResult {
  solicitudes: Solicitud[];
  filteredSolicitudes: Solicitud[];
  loadingState: LoadingState;
  errorMessage?: string;
  filters: SolicitudFilters;
  counters: SolicitudCounters;
  badgeStyles: typeof ESTADO_BADGE_STYLES;
  estadoIcons: typeof ESTADO_ICONS;
  estadoLabels: typeof ESTADO_LABELS;
  messages: typeof SYSTEM_MESSAGES;
  setSearchFilter: (value: string) => void;
  toggleEstadoFilter: (estado: keyof SolicitudEstadoFilter) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
}

const cloneInitialFilters = (): SolicitudFilters => ({
  search: INITIAL_FILTERS.search,
  estados: { ...INITIAL_FILTERS.estados }
});

const applyFilters = (solicitudes: Solicitud[], filters: SolicitudFilters) => {
  const { search, estados } = filters;

  let result = [...solicitudes];

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    result = result.filter(solicitud => {
      const nombre = solicitud.usuarios?.nombre?.toLowerCase() ?? '';
      const cedula = solicitud.usuarios?.cedula ?? '';
      const telefono = solicitud.usuarios?.telefono ?? '';
      const tipoAlimento = solicitud.tipo_alimento.toLowerCase();

      return (
        nombre.includes(term) ||
        cedula.includes(term) ||
        telefono.includes(term) ||
        tipoAlimento.includes(term)
      );
    });
  }

  if (!estados.todos) {
    const estadosActivos = (['pendiente', 'aprobada', 'rechazada'] as SolicitudEstado[])
      .filter(estado => estados[estado]);

    if (estadosActivos.length > 0) {
      result = result.filter(solicitud => estadosActivos.includes(solicitud.estado));
    } else {
      result = [];
    }
  }

  return result;
};

const buildCounters = (solicitudes: Solicitud[]): SolicitudCounters => {
  return solicitudes.reduce<SolicitudCounters>((acc, solicitud) => {
    acc[solicitud.estado] += 1;
    acc.total += 1;
    return acc;
  }, {
    pendiente: 0,
    aprobada: 0,
    rechazada: 0,
    total: 0
  });
};

export const useSolicitudesData = (supabaseClient: SupabaseClient): UseSolicitudesDataResult => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [filters, setFilters] = useState<SolicitudFilters>(() => cloneInitialFilters());

  const service = useMemo(
    () => createSolicitudesActionService(supabaseClient),
    [supabaseClient]
  );

  const loadSolicitudes = useCallback(async () => {
    setLoadingState('loading');
    setErrorMessage(undefined);

    const result = await service.fetchSolicitudes();

    if (result.success && result.data) {
      setSolicitudes(result.data);
      setLoadingState('success');
    } else {
      setLoadingState('error');
      setErrorMessage(result.error ?? SYSTEM_MESSAGES.loadError);
    }
  }, [service]);

  useEffect(() => {
    loadSolicitudes();
  }, [loadSolicitudes]);

  const filteredSolicitudes = useMemo(
    () => applyFilters(solicitudes, filters),
    [solicitudes, filters]
  );

  const counters = useMemo(
    () => buildCounters(solicitudes),
    [solicitudes]
  );

  const setSearchFilter = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  }, []);

  const toggleEstadoFilter = useCallback((estado: keyof SolicitudEstadoFilter) => {
    setFilters(prev => {
      if (estado === 'todos') {
        return {
          ...prev,
          estados: { ...INITIAL_FILTERS.estados }
        };
      }

      const updatedEstados = {
        ...prev.estados,
        todos: false,
        [estado]: !prev.estados[estado]
      };

      const algunoActivo = (['pendiente', 'aprobada', 'rechazada'] as SolicitudEstado[])
        .some(key => updatedEstados[key]);

      if (!algunoActivo) {
        return {
          ...prev,
          estados: { ...INITIAL_FILTERS.estados }
        };
      }

      return {
        ...prev,
        estados: updatedEstados
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(cloneInitialFilters());
  }, []);

  const refetch = useCallback(async () => {
    await loadSolicitudes();
  }, [loadSolicitudes]);

  return {
    solicitudes,
    filteredSolicitudes,
    loadingState,
    errorMessage,
    filters,
    counters,
    badgeStyles: ESTADO_BADGE_STYLES,
    estadoIcons: ESTADO_ICONS,
    estadoLabels: ESTADO_LABELS,
    messages: SYSTEM_MESSAGES,
    setSearchFilter,
    toggleEstadoFilter,
    resetFilters,
    refetch
  };
};
