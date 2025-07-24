'use client';

import { useState, useRef, useEffect } from 'react';
import { BellIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useNotificaciones } from '@/app/hooks/useNotificaciones';
import { useRouter } from 'next/navigation';

interface NotificacionesDropdownProps {
  readonly isCollapsed?: boolean;
}

export default function NotificacionesDropdown({ isCollapsed = false }: NotificacionesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const {
    notificaciones,
    conteoNoLeidas,
    loading,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
  } = useNotificaciones();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificacionClick = async (notificacion: {
    id: string;
    leida: boolean;
    url_accion?: string;
  }) => {
    // Marcar como leída si no lo está
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id);
    }

    // Redireccionar si tiene URL de acción
    if (notificacion.url_accion) {
      router.push(notificacion.url_accion);
    }

    setIsOpen(false);
  };

  const handleMarcarTodasLeidas = async () => {
    await marcarTodasComoLeidas();
  };

  const handleEliminarNotificacion = async (e: React.MouseEvent, notificacionId: string) => {
    e.stopPropagation();
    await eliminarNotificacion(notificacionId);
  };

  const obtenerIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const obtenerColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatearFecha = (fecha: string) => {
    const ahora = new Date();
    const fechaNotificacion = new Date(fecha);
    const diferencia = ahora.getTime() - fechaNotificacion.getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos}m`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    
    return fechaNotificacion.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const renderNotificaciones = () => {
    if (notificaciones.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No tienes notificaciones</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-100">
        {notificaciones.slice(0, 10).map((notificacion) => (
          <button
            key={notificacion.id}
            onClick={() => handleNotificacionClick(notificacion)}
            className={`w-full p-4 hover:bg-gray-50 text-left transition-colors ${
              !notificacion.leida ? 'bg-blue-25' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Icono de tipo */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                obtenerColorTipo(notificacion.tipo)
              }`}>
                {obtenerIconoTipo(notificacion.tipo)}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    !notificacion.leida ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notificacion.titulo}
                  </p>
                  
                  {/* Indicador de no leída */}
                  {!notificacion.leida && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notificacion.mensaje}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatearFecha(notificacion.fecha_creacion)}
                  </span>
                  
                  {/* Acciones */}
                  <div className="flex items-center space-x-1">
                    {!notificacion.leida && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          marcarComoLeida(notificacion.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Marcar como leída"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => handleEliminarNotificacion(e, notificacion.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Eliminar notificación"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors duration-200 ${
          isOpen
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${isCollapsed ? 'w-10 h-10' : 'w-full'}`}
        aria-label="Notificaciones"
      >
        <div className="flex items-center">
          {conteoNoLeidas > 0 ? (
            <BellSolidIcon className="h-5 w-5" />
          ) : (
            <BellIcon className="h-5 w-5" />
          )}
          
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium">Notificaciones</span>
          )}
          
          {/* Badge de conteo */}
          {conteoNoLeidas > 0 && (
            <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full ${
              isCollapsed ? 'min-w-[1.25rem] h-5' : 'min-w-[1.5rem] h-6'
            }`}>
              {conteoNoLeidas > 99 ? '99+' : conteoNoLeidas}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click fuera en móviles */}
          <button
            type="button"
            className="fixed inset-0 z-40 md:hidden bg-transparent"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            aria-label="Cerrar notificaciones"
          />
          
          <div className={`absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 ${
            isCollapsed 
              ? 'left-full ml-2 w-80 md:w-96' 
              : 'left-0 w-80 md:w-96'
          } max-h-[80vh] md:max-h-96`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificaciones
              </h3>
              {conteoNoLeidas > 0 && (
                <button
                  onClick={handleMarcarTodasLeidas}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
            {conteoNoLeidas > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {conteoNoLeidas} sin leer
              </p>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Cargando...</span>
              </div>
            ) : (
              renderNotificaciones()
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 10 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  router.push('/notificaciones');
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
}
