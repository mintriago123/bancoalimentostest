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
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerInstance = useRef<mapboxgl.Marker | null>(null);
  const isInitialized = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Evitar doble inicialización
    if (isInitialized.current || !mapContainer.current) return;
    isInitialized.current = true;

    const container = mapContainer.current;

    const newMap = new mapboxgl.Map({
      container: container,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: zoom,
      attributionControl: false,
      interactive: false, // Deshabilitar interacción
    });

    mapInstance.current = newMap;

    // Evento cuando el mapa termina de cargar
    newMap.on('load', () => {
      setMapLoaded(true);
      newMap.resize();
    });

    // Crear y agregar el marcador
    const newMarker = new mapboxgl.Marker({
      color: '#3b82f6',
    })
      .setLngLat([longitude, latitude])
      .addTo(newMap);

    markerInstance.current = newMarker;

    // Redimensionar después de montar
    const resizeTimeout = setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    }, 100);

    return () => {
      clearTimeout(resizeTimeout);
      
      if (markerInstance.current) {
        markerInstance.current.remove();
        markerInstance.current = null;
      }
      
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      
      isInitialized.current = false;
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
