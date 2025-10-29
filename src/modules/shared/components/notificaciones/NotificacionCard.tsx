'use client';

import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useDateFormatter } from '@/modules/shared/hooks/useDateFormatter';

interface NotificacionCardProps {
  readonly notificacion: {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    categoria: string;
    leida: boolean;
    fecha_creacion: string;
    url_accion?: string;
  };
  readonly seleccionada?: boolean;
  readonly onSeleccionar?: (id: string) => void;
  readonly onClick: (notificacion: NotificacionCardProps['notificacion']) => void;
  readonly onMarcarLeida: (id: string) => void;
  readonly onEliminar: (id: string) => void;
}

export function NotificacionCard({
  notificacion,
  seleccionada = false,
  onSeleccionar,
  onClick,
  onMarcarLeida,
  onEliminar
}: NotificacionCardProps) {
  const { formatDateTime } = useDateFormatter();

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

  return (
    <div
      className={`flex items-start px-6 py-4 hover:bg-gray-50 transition-colors ${
        !notificacion.leida ? 'bg-blue-25' : ''
      }`}
    >
      {/* Checkbox */}
      {onSeleccionar && (
        <input
          type="checkbox"
          checked={seleccionada}
          onChange={() => onSeleccionar(notificacion.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
        />
      )}

      {/* Icono de tipo */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        onSeleccionar ? 'ml-4' : ''
      } ${obtenerColorTipo(notificacion.tipo)}`}>
        {obtenerIconoTipo(notificacion.tipo)}
      </div>

      {/* Contenido */}
      <div 
        className="flex-1 ml-4 cursor-pointer"
        onClick={() => onClick(notificacion)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className={`text-sm font-medium ${
              !notificacion.leida ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {notificacion.titulo}
            </h4>
            {!notificacion.leida && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {formatDateTime(notificacion.fecha_creacion)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mt-1">
          {notificacion.mensaje}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
            {notificacion.categoria}
          </span>
          
          <div className="flex items-center space-x-2">
            {!notificacion.leida && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarcarLeida(notificacion.id);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                title="Marcar como leída"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEliminar(notificacion.id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Eliminar notificación"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
