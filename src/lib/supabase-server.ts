import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente para el servidor (con manejo de cookies)
export async function createServerSupabaseClient() {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        // Devuelve un array de cookies en el formato esperado por Supabase
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        try {
          const cookieStore = await cookies();
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // El método `setAll` fue llamado desde un Server Component.
          // Esto puede ser ignorado si tienes middleware refrescando
          // las sesiones de usuario.
        }
      },
    },
  });
} 