"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';

// Configurar el token de acceso de Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';

interface MapboxStaticMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  className?: string;
  zoom?: number;
  height?: string;
}

export default function MapboxStaticMap({
  latitude,
  longitude,
  address,
  className = '',
  zoom = 15,
  height = '200px',
}: MapboxStaticMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: zoom,
        attributionControl: false,
        interactive: false, // Deshabilitar interacción
      });

      // Evento cuando el mapa termina de cargar
      map.current.on('load', () => {
        setMapLoaded(true);
        if (map.current) {
          map.current.resize();
        }
      });

      // Crear y agregar el marcador
      new mapboxgl.Marker({
        color: '#3b82f6',
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Redimensionar después de montar
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 100);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
      />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando mapa...</span>
          </div>
        </div>
      )}
    </div>
  );
}
