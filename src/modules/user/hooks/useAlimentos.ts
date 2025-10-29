// ============================================================================
// Hook: useAlimentos
// Manejo de alimentos con búsqueda y filtros
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Alimento, LoadingState, UnidadAlimento } from '../types';
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
  obtenerUnidadesAlimento: (alimentoId: number) => UnidadAlimento[];
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

      // Obtener alimentos con stock disponible
      const { data: alimentosData, error: alimentosError } =
        await service.getAlimentosConStock();

      if (alimentosError || !alimentosData) {
        setError('Error al cargar los alimentos disponibles');
        setLoading('error');
        return;
      }

      // Cargar unidades de cada alimento
      const alimentosConUnidades = await Promise.all(
        alimentosData.map(async (alimento) => {
          const { data: unidadesData, error: unidadesError } = await supabase
            .rpc('obtener_unidades_alimento', { p_alimento_id: alimento.id });

          if (unidadesError) {
            console.error(`Error al cargar unidades para alimento ${alimento.id}:`, unidadesError);
            return {
              ...alimento,
              unidades: []
            };
          }

          return {
            ...alimento,
            unidades: (unidadesData || []) as UnidadAlimento[]
          };
        })
      );

      setAlimentos(alimentosConUnidades);
      setAlimentosFiltrados(alimentosConUnidades);

      // Obtener categorías solo de productos con stock
      const { data: categoriasData, error: categoriasError } =
        await service.getCategoriasConStock();

      if (categoriasError || !categoriasData) {
        // Si falla, extraer categorías de los alimentos obtenidos
        const categoriasUnicas = [
          ...new Set(alimentosConUnidades.map((a) => a.categoria)),
        ].sort();
        setCategorias(categoriasUnicas);
      } else {
        setCategorias(categoriasData);
      }

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

  const obtenerUnidadesAlimento = useCallback(
    (alimentoId: number): UnidadAlimento[] => {
      const alimento = alimentos.find((a) => a.id === alimentoId);
      return alimento?.unidades || [];
    },
    [alimentos]
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
    obtenerUnidadesAlimento,
  };
}
