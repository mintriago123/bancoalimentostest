'use client';

import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';

interface EstadisticasNotificacionesProps {
  readonly total: number;
  readonly noLeidas: number;
  readonly leidas: number;
}

export function EstadisticasNotificaciones({ 
  total, 
  noLeidas, 
  leidas 
}: EstadisticasNotificacionesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BellIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <BellIcon className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Sin leer</p>
            <p className="text-2xl font-bold text-gray-900">{noLeidas}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Leídas</p>
            <p className="text-2xl font-bold text-gray-900">{leidas}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
