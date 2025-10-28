// ============================================================================
// Component: UbicacionCard
// Tarjeta de ubicación con mapa
// ============================================================================

import React from 'react';
import { MapPin } from 'lucide-react';
import MapboxMap from './MapboxMap';
import { Ubicacion } from '../types';

interface UbicacionCardProps {
  ubicacion: Ubicacion;
  onUbicacionChange: (lat: number, lng: number) => void;
}

export function UbicacionCard({
  ubicacion,
  onUbicacionChange,
}: UbicacionCardProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-green-800 mb-3 flex items-center">
        <MapPin className="w-5 h-5 mr-2" />
        Ubicación de Entrega
      </h3>
      <div className="text-sm text-green-700 mb-3">
        <p>
          <strong>Coordenadas:</strong> Lat {ubicacion.latitud.toFixed(5)}, Lng{' '}
          {ubicacion.longitud.toFixed(5)}
        </p>
        <p className="text-xs mt-1 text-green-600">
          💡 Puedes ajustar la ubicación haciendo clic en el mapa o arrastrando
          el marcador
        </p>
      </div>
      <MapboxMap
        latitude={ubicacion.latitud}
        longitude={ubicacion.longitud}
        onLocationChange={onUbicacionChange}
        className="w-full h-48 rounded-lg border border-green-200"
      />
    </div>
  );
}
