// ============================================================================
// Hook: useAlimentos
// Manejo de alimentos con búsqueda y filtros
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Alimento, LoadingState } from '../types';
import { AlimentosService } from '../services/alimentosService';

interface UseAlimentosResult {
  alimentos: Alimento[];
  alimentosFiltrados: Alimento[];
  categorias: string[];
  loading: LoadingState;
  error: string | null;
  busqueda: string;
  filtroCategoria: string;
  setBusqueda: (busqueda: string) => void;
  setFiltroCategoria: (categoria: string) => void;
  filtrarAlimentos: (termino: string, categoria?: string) => void;
}

export function useAlimentos(
  supabase: SupabaseClient
): UseAlimentosResult {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [alimentosFiltrados, setAlimentosFiltrados] = useState<Alimento[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const service = new AlimentosService(supabase);

  useEffect(() => {
    const fetchData = async () => {
      setLoading('loading');
      setError(null);

      // Obtener alimentos
      const { data: alimentosData, error: alimentosError } =
        await service.getAlimentos();

      if (alimentosError || !alimentosData) {
        setError('Error al cargar los alimentos');
        setLoading('error');
        return;
      }

      setAlimentos(alimentosData);
      setAlimentosFiltrados(alimentosData);

      // Extraer categorías únicas
      const categoriasUnicas = [
        ...new Set(alimentosData.map((a) => a.categoria)),
      ].sort();
      setCategorias(categoriasUnicas);

      setLoading('success');
    };

    fetchData();
  }, [supabase]);

  const filtrarAlimentos = useCallback(
    (termino: string, categoria: string = filtroCategoria) => {
      let filtrados = alimentos;

      // Filtrar por término de búsqueda
      if (termino.trim()) {
        const terminoLower = termino.toLowerCase();
        filtrados = filtrados.filter(
          (alimento) =>
            alimento.nombre.toLowerCase().includes(terminoLower) ||
            alimento.categoria.toLowerCase().includes(terminoLower)
        );
      }

      // Filtrar por categoría
      if (categoria) {
        filtrados = filtrados.filter(
          (alimento) =>
            alimento.categoria.toLowerCase() === categoria.toLowerCase()
        );
      }

      setAlimentosFiltrados(filtrados);
    },
    [alimentos, filtroCategoria]
  );

  return {
    alimentos,
    alimentosFiltrados,
    categorias,
    loading,
    error,
    busqueda,
    filtroCategoria,
    setBusqueda,
    setFiltroCategoria,
    filtrarAlimentos,
  };
}
