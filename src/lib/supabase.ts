import { createBrowserClient } from '@supabase/ssr';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente para el navegador (con SSR)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
} 