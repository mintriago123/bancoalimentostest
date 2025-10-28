'use client';

import { BellIcon } from '@heroicons/react/24/outline';

interface EmptyStateNotificacionesProps {
  readonly hayNotificaciones: boolean;
}

export function EmptyStateNotificaciones({ hayNotificaciones }: EmptyStateNotificacionesProps) {
  return (
    <div className="text-center py-12">
      <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
      <p className="text-gray-500">
        {hayNotificaciones
          ? 'No hay notificaciones que coincidan con los filtros aplicados.'
          : 'No tienes notificaciones en este momento.'
        }
      </p>
    </div>
  );
}
