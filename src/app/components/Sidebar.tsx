'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import NotificacionesDropdown from '@/app/components/NotificacionesDropdown';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  PowerIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  readonly userRole?: string;
  readonly userName?: string;
  readonly isCollapsed?: boolean;
  readonly setIsCollapsed?: (collapsed: boolean) => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  adminOnly?: boolean;
  donanteOnly?: boolean;
  solicitanteOnly?: boolean;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  name: string;
  href: string;
  description?: string;
}

const menuItems: MenuItem[] = [
  // Items para Administradores
  {
    name: 'Dashboard Admin',
    href: '/admin/dashboard',
    icon: HomeIcon,
    description: 'Panel principal de administración',
    adminOnly: true
  },
  {
    name: 'Usuarios',
    href: '/admin/usuarios',
    icon: UserGroupIcon,
    description: 'Gestionar usuarios del sistema',
    adminOnly: true
  },
  {
    name: 'Catálogo de Alimentos', 
    href: '/admin/catalogo',
    icon: ClipboardDocumentListIcon,
    description: 'Ver y gestionar el catálogo de alimentos',
    adminOnly: true
  },
  // {
  //   name: 'Solicitudes',
  //   href: '/admin/solicitudes',
  //   icon: DocumentTextIcon,
  //   description: 'Ver todas las solicitudes',
  //   adminOnly: true
  // },
  // {
  //   name: 'Donaciones',
  //   href: '/admin/donaciones',
  //   icon: ClipboardDocumentListIcon,
  //   description: 'Gestionar donaciones',
  //   adminOnly: true
  // },
  // {
  //   name: 'Inventario',
  //   href: '/admin/inventario',
  //   icon: ChartBarIcon,
  //   description: 'Gestionar inventario y depósitos',
  //   adminOnly: true
  // },
  {
    name: 'Reportes',
    href: '/admin/reportes',
    icon: ChartBarIcon,
    description: 'Estadísticas y análisis',
    adminOnly: true,
    subItems: [
      // {
      //   name: 'Dashboard de Reportes',
      //   href: '/admin/reportes',
      //   description: 'Panel principal de estadísticas'
      // },
      {
        name: 'Inventario',
        href: '/admin/reportes/inventario',
        description: 'Estado actual del inventario'
      },
      {
        name: 'Movimientos',
        href: '/admin/reportes/movimientos',
        description: 'Historial de entradas y salidas'
      },
           {
        name: 'Solicitudes',
        href: '/admin/reportes/solicitudes',
        description: 'Análisis de solicitudes recibidas'
      }, 
     {
        name: 'Donaciones',
        href: '/admin/reportes/donaciones',
        description: 'Análisis de donaciones recibidas'
      }, 
      // {
      //   name: 'Historial de Reportes',
      //   href: '/admin/reportes/historial',
      //   description: 'Reportes generados anteriormente'
      // }
    ]
  },
  
  // Items para Donantes
  {
    name: 'Dashboard',
    href: '/donante/dashboard',
    icon: HomeIcon,
    description: 'Panel principal',
    donanteOnly: true
  },
  {
    name: 'Mis Donaciones',
    href: '/donante/donaciones',
    icon: ClipboardDocumentListIcon,
    description: 'Ver mis donaciones realizadas',
    donanteOnly: true
  },
  {
    name: 'Nueva Donación',
    href: '/donante/nueva-donacion',
    icon: PlusCircleIcon,
    description: 'Registrar nueva donación',
    donanteOnly: true
  },
  // {
  //   name: 'Solicitudes Activas',
  //   href: '/donante/solicitudes',
  //   icon: DocumentTextIcon,
  //   description: 'Ver solicitudes de ayuda',
  //   donanteOnly: true
  // },
  
  // Items para Solicitantes
  {
    name: 'Inicio',
    href: '/user/dashboard',
    icon: HomeIcon,
    description: 'Panel principal',
    solicitanteOnly: true
  },
  {
    name: 'Mis Solicitudes',
    href: '/user/solicitudes',
    icon: ClipboardDocumentListIcon,
    description: 'Ver mis solicitudes',
    solicitanteOnly: true
  },
  {
    name: 'Nueva Solicitud',
    href: '/user/formulario',
    icon: PlusCircleIcon,
    description: 'Crear nueva solicitud',
    solicitanteOnly: true
  },
  // {
  //   name: 'Configuración',
  //   href: '/user/configuracion',
  //   icon: Cog6ToothIcon,
  //   description: 'Ajustes de la cuenta',
  //   solicitanteOnly: true
  // }
];

export default function Sidebar({ 
  userRole = 'SOLICITANTE', 
  userName = 'Usuario',
  isCollapsed: externalIsCollapsed,
  setIsCollapsed: externalSetIsCollapsed
}: SidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { supabase } = useSupabase();

  // Usar el estado externo si está disponible, sino usar el interno
  const isCollapsed = externalIsCollapsed ?? internalIsCollapsed;
  const setIsCollapsed = externalSetIsCollapsed || setInternalIsCollapsed;

  // En dispositivos móviles, empezar contraído
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !externalSetIsCollapsed) {
        setInternalIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [externalSetIsCollapsed]);

  const isAdmin = userRole === 'ADMINISTRADOR';
  const isDonante = userRole === 'DONANTE';
  const isSolicitante = userRole === 'SOLICITANTE';

  // Filtrar items según el rol
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.donanteOnly && !isDonante) return false;
    if (item.solicitanteOnly && !isSolicitante) return false;
    return true;
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/auth/iniciar-sesion');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/user/dashboard' && pathname === '/user/dashboard') return true;
    if (href === '/admin/dashboard' && pathname === '/admin/dashboard') return true;
    if (href === '/donante/dashboard' && pathname === '/donante/dashboard') return true;
    return pathname.startsWith(href) && 
           href !== '/user/dashboard' && 
           href !== '/admin/dashboard' && 
           href !== '/donante/dashboard';
  };

  const toggleSubMenu = (itemName: string) => {
    setOpenSubMenus(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isSubMenuOpen = (itemName: string) => {
    return openSubMenus.includes(itemName);
  };

  const hasActiveSubItem = (subItems?: SubMenuItem[]) => {
    if (!subItems) return false;
    return subItems.some(subItem => isActiveRoute(subItem.href));
  };

  const getActiveStyles = (isActive: boolean) => {
    if (!isActive) return 'text-gray-700 hover:bg-gray-50 hover:text-gray-900';
    
    if (isAdmin) return 'bg-red-50 text-red-700 border border-red-200';
    if (isDonante) return 'bg-green-50 text-green-700 border border-green-200';
    return 'bg-blue-50 text-blue-700 border border-blue-200'; // Solicitante
  };

  const getIconStyles = (isActive: boolean) => {
    if (!isActive) return 'text-gray-500 group-hover:text-gray-700';
    
    if (isAdmin) return 'text-red-600';
    if (isDonante) return 'text-green-600';
    return 'text-blue-600'; // Solicitante
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin Panel';
    if (isDonante) return 'Panel Donante';
    return 'Banco Alimentos'; // Solicitante
  };

  const getAvatarColor = () => {
    if (isAdmin) return 'bg-red-500 text-white';
    if (isDonante) return 'bg-green-500 text-white';
    return 'bg-blue-500 text-white'; // Solicitante
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <>
      {/* Overlay para dispositivos móviles cuando está expandido */}
      {!isCollapsed && (
        <button 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden cursor-default"
          onClick={() => setIsCollapsed(true)}
          aria-label="Cerrar sidebar"
          type="button"
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 transition-all duration-300 flex flex-col z-40 ${
        isCollapsed ? 'w-16' : 'w-64 md:w-64'
      } ${!isCollapsed ? 'translate-x-0' : 'md:translate-x-0'}`}>
      {/* Header del Sidebar con Avatar */}
      <div className="p-4 border-b border-gray-100 bg-white">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Avatar con iniciales */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${getAvatarColor()}`}>
                  {getUserInitials(userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 truncate">
                    {userName}
                  </h2>
                  <p className={`text-xs font-medium ${
                    isAdmin ? 'text-red-600' : isDonante ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {getRoleLabel()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Contraer sidebar"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${getAvatarColor()}`}
              title={`Expandir sidebar - ${userName}`}
            >
              {getUserInitials(userName)}
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Expandir sidebar"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
        
        {/* Menú de perfil expandible cuando no está colapsado */}
        {!isCollapsed && (
          <div className="mt-3">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <span className="text-xs text-gray-600 font-medium">Opciones de cuenta</span>
              {isProfileMenuOpen ? (
                <ChevronUpIcon className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-3 h-3 text-gray-500" />
              )}
            </button>
            
            {isProfileMenuOpen && (
              <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
                <button
                  onClick={() => {
                    if (isAdmin) {
                      router.push('/admin/perfil');
                    } else if (isDonante) {
                      router.push('/donante/perfil');
                    } else {
                      router.push('/user/perfil');
                    }
                  }}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-xs text-gray-700 font-medium">Mi Perfil</span>
                </button>
                <button
                  onClick={() => {
                    if (isAdmin) {
                      router.push('/admin/configuracion');
                    } else if (isDonante) {
                      router.push('/donante/configuracion');
                    } else {
                      router.push('/user/configuracion');
                    }
                  }}
                  className="w-full flex items-center px-3 py-2 text-left rounded-md hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-xs text-gray-700 font-medium">Configuración</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Notificaciones */}
      <div className="px-4 py-2 border-b border-gray-100 bg-white">
  <NotificacionesDropdown isCollapsed={isCollapsed} roleColor={
    isAdmin ? 'red' : isDonante ? 'green' : 'blue'
  } />
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubMenuOpenState = isSubMenuOpen(item.name);
            const hasActiveSubItemState = hasActiveSubItem(item.subItems);
            const isItemActive = isActive || hasActiveSubItemState;
            
            return (
              <li key={item.name}>
                {/* Item principal */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (hasSubItems && !isCollapsed) {
                        toggleSubMenu(item.name);
                      } else {
                        router.push(item.href);
                      }
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 group ${
                      getActiveStyles(isItemActive)
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                      getIconStyles(isItemActive)
                    }`} />
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{item.name}</span>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {hasSubItems && (
                          <div className="ml-2 transition-transform duration-200">
                            {isSubMenuOpenState ? (
                              <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </button>

                  {/* Submenú */}
                  {hasSubItems && !isCollapsed && isSubMenuOpenState && (
                    <div className="mt-1 ml-8 space-y-1 border-l-2 border-gray-100 pl-3">
                      {item.subItems!.map((subItem) => {
                        const isSubActive = isActiveRoute(subItem.href);
                        
                        return (
                          <button
                            key={subItem.name}
                            onClick={() => router.push(subItem.href)}
                            className={`w-full flex items-start px-3 py-2 text-left rounded-md transition-all duration-200 group ${
                              isSubActive 
                                ? 'bg-gray-100 text-gray-900 border border-gray-200' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{subItem.name}</span>
                              {subItem.description && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {subItem.description}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer con logout moderno */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 text-gray-600 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-200 hover:shadow-sm disabled:opacity-50 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Cerrar sesión' : undefined}
        >
          <PowerIcon className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'} transition-colors`} />
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </span>
          )}
        </button>
      </div>
      </div>
    </>
  );
}