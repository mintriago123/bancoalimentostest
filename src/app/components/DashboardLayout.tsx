'use client';

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Sidebar from '@/app/components/Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
  readonly requiredRole?: 'ADMINISTRADOR' | 'OPERADOR' | 'DONANTE' | 'SOLICITANTE' | 'ANY';
  readonly title?: string;
  readonly description?: string;
}

interface UserProfile {
  rol: string;
  nombre: string;
  cedula?: string;
  ruc?: string;
}

// Context para manejar el estado del sidebar
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
  readonly requiredRole?: 'ADMINISTRADOR' | 'OPERADOR' | 'DONANTE' | 'SOLICITANTE' | 'ANY';
  readonly title?: string;
  readonly description?: string;
}

interface UserProfile {
  rol: string;
  nombre: string;
  cedula?: string;
  ruc?: string;
}

export default function DashboardLayout({ 
  children, 
  requiredRole = 'ANY',
  title = 'Dashboard',
  description 
}: DashboardLayoutProps) {
  const router = useRouter();
  const { supabase, user, isLoading: authLoading } = useSupabase();
  const [perfil, setPerfil] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarContextValue = useMemo(() => ({
    isCollapsed,
    setIsCollapsed
  }), [isCollapsed, setIsCollapsed]);

  const getRedirectUrl = (userRole: string) => {
    switch (userRole) {
      case 'ADMINISTRADOR': return '/admin/dashboard';
      case 'OPERADOR': return '/operador/dashboard';
      case 'DONANTE': return '/donante/dashboard';
      default: return '/user/dashboard';
    }
  };

  const checkRoleAccess = (userRole: string, requiredRole: string) => {
    if (requiredRole === 'ANY') return true;
    return userRole === requiredRole;
  };

  useEffect(() => {
    if (authLoading) {
      return; // Esperar a que termine la carga de autenticación
    }

    if (!user) {
      // No hay usuario, redirigir a login
      window.location.href = '/auth/iniciar-sesion';
      return;
    }

    const loadUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol, nombre, cedula, ruc')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error cargando perfil:', error);
          // Si hay error al cargar el perfil, cerrar sesión y redirigir
          await supabase.auth.signOut();
          window.location.href = '/auth/iniciar-sesion';
          return;
        }

        // Verificar acceso según rol
        if (!checkRoleAccess(data.rol, requiredRole)) {
          router.push(getRedirectUrl(data.rol));
          return;
        }

        setPerfil(data);
      } catch (error) {
        console.error('Error:', error);
        await supabase.auth.signOut();
        window.location.href = '/auth/iniciar-sesion';
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, router, supabase, requiredRole, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !perfil) {
    return null;
  }

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar fijo */}
        <Sidebar 
          userRole={perfil.rol} 
          userName={perfil.nombre}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        
        {/* Contenido principal con margen dinámico */}
        <div className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'}`}>
          {/* Header opcional */}
          {(title || description) && (
            <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 sticky top-0 z-30">
              <div className="max-w-7xl flex items-center justify-between">
                {/* Botón para mostrar sidebar en móvil */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
                
                <div className="flex-1 md:flex-none">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
                  {description && (
                    <p className="mt-1 text-xs sm:text-sm text-gray-600">{description}</p>
                  )}
                </div>
              </div>
            </header>
          )}
          
          {/* Contenido */}
          <main className="p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
