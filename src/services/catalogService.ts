/**
 * Servicios para cargar catálogos reutilizables (alimentos, unidades, etc.)
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type Alimento = { id: number; nombre: string; categoria: string };
export type Unidad = { id: number; nombre: string; simbolo: string };

export async function fetchAlimentos(supabase: SupabaseClient): Promise<Alimento[]> {
  const { data, error } = await supabase
    .from('alimentos')
    .select('id, nombre, categoria')
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

export async function fetchUnidades(supabase: SupabaseClient): Promise<Unidad[]> {
  const { data, error } = await supabase
    .from('unidades')
    .select('id, nombre, simbolo')
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}
