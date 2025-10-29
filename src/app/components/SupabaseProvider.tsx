'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { ConfirmProvider } from '@/modules/admin/shared/hooks/useConfirm';
import { CONFIGURACION_SEGURIDAD } from '@/lib/configuracion-seguridad';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const throttleRef = useRef<boolean>(false);

  // Función para cerrar sesión por inactividad
  const handleInactivityLogout = useCallback(async () => {
    if (user && CONFIGURACION_SEGURIDAD.CIERRE_SESION_AUTOMATICO_HABILITADO) {
      const minutosInactividad = CONFIGURACION_SEGURIDAD.TIEMPO_INACTIVIDAD_MS / 60000;
      
      if (CONFIGURACION_SEGURIDAD.LOGS_INACTIVIDAD) {
        console.log(`⏱️ Cerrando sesión por inactividad (${minutosInactividad} minuto${minutosInactividad !== 1 ? 's' : ''} sin actividad)`);
      }
      
      await supabase.auth.signOut();
      
      if (CONFIGURACION_SEGURIDAD.LOGS_INACTIVIDAD) {
        console.log('✅ Sesión cerrada. Redirigiendo a /auth/iniciar-sesion?timeout=true');
      }
      
      // Usar router.push en lugar de window.location.href para mejor manejo
      router.push('/auth/iniciar-sesion?timeout=true');
    }
  }, [user, supabase.auth, router]);

  // Función para reiniciar el temporizador de inactividad con throttling
  const resetInactivityTimer = useCallback(() => {
    // Solo procesar si la funcionalidad está habilitada y hay usuario
    if (!CONFIGURACION_SEGURIDAD.CIERRE_SESION_AUTOMATICO_HABILITADO || !user) {
      return;
    }

    // Throttling: Solo procesar una vez cada 5 segundos para evitar reinicios excesivos
    if (throttleRef.current) {
      return;
    }

    throttleRef.current = true;
    setTimeout(() => {
      throttleRef.current = false;
    }, 5000); // 5 segundos de throttle

    // Actualizar el tiempo de última actividad
    const ahora = Date.now();
    lastActivityRef.current = ahora;

    // Limpiar el temporizador anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo temporizador
    timeoutRef.current = setTimeout(handleInactivityLogout, CONFIGURACION_SEGURIDAD.TIEMPO_INACTIVIDAD_MS);
    
    if (CONFIGURACION_SEGURIDAD.LOGS_INACTIVIDAD) {
      const tiempoTranscurrido = Math.floor((ahora - lastActivityRef.current) / 1000);
      console.log(`🔄 Actividad detectada - Temporizador reiniciado (última actividad: hace ${tiempoTranscurrido}s)`);
    }
  }, [user, handleInactivityLogout]);

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error: any) {
        // Suprimir errores esperados de tokens inválidos
        if (error?.code !== 'refresh_token_not_found') {
          console.error('Error obteniendo sesión:', error);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Solo loggear en desarrollo si es necesario
      if (process.env.NODE_ENV === 'development' && event !== 'TOKEN_REFRESHED') {
        console.log('🔐 Auth:', event);
      }
      
      // Si es un evento de SIGNED_OUT, limpiar el estado inmediatamente
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        // Limpiar el temporizador
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Efecto para manejar el temporizador de inactividad
  useEffect(() => {
    // Si la funcionalidad está deshabilitada, no hacer nada
    if (!CONFIGURACION_SEGURIDAD.CIERRE_SESION_AUTOMATICO_HABILITADO) {
      return;
    }

    if (!user) {
      // Si no hay usuario, limpiar cualquier temporizador existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Iniciar el temporizador cuando el usuario se autentica
    resetInactivityTimer();

    // Agregar listeners para detectar actividad real del usuario
    // Usamos { passive: true } para mejorar el rendimiento
    const options = { passive: true };
    
    CONFIGURACION_SEGURIDAD.EVENTOS_ACTIVIDAD.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, options);
    });

    // Limpiar listeners cuando el componente se desmonta o el usuario cambia
    return () => {
      CONFIGURACION_SEGURIDAD.EVENTOS_ACTIVIDAD.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, resetInactivityTimer]);

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
