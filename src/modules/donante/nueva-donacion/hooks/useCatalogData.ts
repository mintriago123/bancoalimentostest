import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
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
      const { data, error } = await supabase
        .from('alimentos')
        .select('id, nombre, categoria')
        .order('nombre');

      if (error) throw error;
      setAlimentos(data || []);
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

  return {
    alimentos,
    unidades,
    cargandoAlimentos,
    cargandoUnidades,
    categoriasUnicas,
  };
}
