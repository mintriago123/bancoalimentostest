import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Módulo centralizado para la configuración del cliente Supabase en el cliente.
 * Exporta una instancia singleton `supabaseClient` para uso general y
 * una fábrica `createBrowserSupabaseClient` para entornos donde se quiera
 * crear un cliente por request (p. ej. SSR en el navegador).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // No hacer throw para no romper dev server; registrar para facilitar debugging.
  // En producción se recomienda fallar rápido si falta configuración.
  // eslint-disable-next-line no-console
  console.warn('[supabaseClient] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Instancia compartida (singleton) para evitar recrear el cliente en cada render
export const supabaseClient = createSupabaseClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

// Fábrica para crear un cliente en el navegador (compatible con @supabase/ssr)
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
}

export default supabaseClient;
