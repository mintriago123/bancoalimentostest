import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('[supabaseServer] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Crea un cliente Supabase para uso en servidor (Server Components / middleware)
 * Encapsula la lógica de cookies para mantener compatibilidad con la API de Supabase.
 */
export async function createServerSupabaseClient() {
  return createServerClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
    cookies: {
      async getAll() {
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        try {
          const cookieStore = await cookies();
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Si fallamos al setear cookies desde un Server Component, lo omitimos.
        }
      },
    },
  });
}

export default createServerSupabaseClient;
