// ============================================================================
// Hook: useUnidades
// Manejo de unidades de medida
// ============================================================================

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Unidad, LoadingState } from '../types';
import { UnidadesService } from '../services/unidadesService';

interface UseUnidadesResult {
  unidades: Unidad[];
  loading: LoadingState;
  error: string | null;
  getUnidadById: (id: number) => Unidad | null;
}

export function useUnidades(supabase: SupabaseClient): UseUnidadesResult {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const service = new UnidadesService(supabase);

  useEffect(() => {
    const fetchUnidades = async () => {
      setLoading('loading');
      setError(null);

      const { data, error: fetchError } = await service.getUnidades();

      if (fetchError || !data) {
        setError('Error al cargar las unidades');
        setLoading('error');
      } else {
        setUnidades(data);
        setLoading('success');
      }
    };

    fetchUnidades();
  }, [supabase]);

  const getUnidadById = (id: number): Unidad | null => {
    return unidades.find((u) => u.id === id) || null;
  };

  return {
    unidades,
    loading,
    error,
    getUnidadById,
  };
}
