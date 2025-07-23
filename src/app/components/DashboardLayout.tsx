'use client';

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import Sidebar from '@/app/components/Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
  readonly requiredRole?: 'ADMINISTRADOR' | 'DONANTE' | 'SOLICITANTE' | 'ANY';
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
  readonly requiredRole?: 'ADMINISTRADOR' | 'DONANTE' | 'SOLICITANTE' | 'ANY';
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
      router.push('/auth/iniciar-sesion');
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
          router.push('/auth/iniciar-sesion');
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
        router.push('/auth/iniciar-sesion');
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
        <div className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-0 md:ml-64'}`}>
          {/* Header opcional */}
          {(title || description) && (
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
              <div className="max-w-7xl flex items-center justify-between">
                {/* Botón para mostrar sidebar en móvil */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <Bars3Icon className="w-6 h-6 text-gray-600" />
                </button>
                
                <div className="flex-1 md:flex-none">
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {description && (
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  )}
                </div>
              </div>
            </header>
          )}
          
          {/* Contenido */}
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
