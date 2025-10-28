'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { ConfirmProvider } from '@/modules/admin/shared/hooks/useConfirm';

type SupabaseContext = {
  supabase: SupabaseClient;
  user: User | null;
  isLoading: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getInitialSession();

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      
      // Si es un evento de SIGNED_OUT, limpiar el estado inmediatamente
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Mostrar loading mientras se verifica el estado de autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Context.Provider value={{ supabase, user, isLoading }}>
      <ConfirmProvider>
        {children}
      </ConfirmProvider>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase debe ser usado dentro de SupabaseProvider');
  }
  return context;
};
