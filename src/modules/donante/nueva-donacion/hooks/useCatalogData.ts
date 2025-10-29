import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface UnidadAlimento {
  unidad_id: number;
  nombre: string;
  simbolo: string;
  tipo_magnitud_id: number;
  tipo_magnitud_nombre: string;
  es_base: boolean;
  es_principal: boolean;
}

interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
  unidades?: UnidadAlimento[];
}

interface Unidad {
  id: number;
  nombre: string;
  simbolo: string;
}

interface UseCatalogDataReturn {
  alimentos: Alimento[];
  unidades: Unidad[];
  cargandoAlimentos: boolean;
  cargandoUnidades: boolean;
  categoriasUnicas: string[];
  obtenerUnidadesAlimento: (alimentoId: number) => UnidadAlimento[];
}

export function useCatalogData(supabase: SupabaseClient | null, authLoading: boolean): UseCatalogDataReturn {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargandoAlimentos, setCargandoAlimentos] = useState(true);
  const [cargandoUnidades, setCargandoUnidades] = useState(true);

  const cargarAlimentos = async () => {
    if (!supabase) return;
    
    try {
      setCargandoAlimentos(true);
      
      // Cargar alimentos
      const { data: alimentosData, error: alimentosError } = await supabase
        .from('alimentos')
        .select('id, nombre, categoria')
        .order('nombre');

      if (alimentosError) throw alimentosError;

      // Cargar unidades de cada alimento
      const alimentosConUnidades = await Promise.all(
        (alimentosData || []).map(async (alimento) => {
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
    } catch (error) {
      console.error('Error al cargar alimentos:', error);
    } finally {
      setCargandoAlimentos(false);
    }
  };

  const cargarUnidades = async () => {
    if (!supabase) return;
    
    try {
      setCargandoUnidades(true);
      const { data, error } = await supabase
        .from('unidades')
        .select('id, nombre, simbolo')
        .order('nombre');

      if (error) throw error;
      setUnidades(data || []);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
    } finally {
      setCargandoUnidades(false);
    }
  };

  useEffect(() => {
    if (!authLoading && supabase) {
      cargarAlimentos();
      cargarUnidades();
    }
  }, [supabase, authLoading]);

  // Obtener categorías únicas
  const categoriasUnicas = [...new Set(alimentos.map(a => a.categoria))].sort();

  // Función para obtener unidades de un alimento específico
  const obtenerUnidadesAlimento = (alimentoId: number): UnidadAlimento[] => {
    const alimento = alimentos.find(a => a.id === alimentoId);
    return alimento?.unidades || [];
  };

  return {
    alimentos,
    unidades,
    cargandoAlimentos,
    cargandoUnidades,
    categoriasUnicas,
    obtenerUnidadesAlimento,
  };
}
