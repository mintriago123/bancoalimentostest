"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configurar el token de acceso de Mapbox
// IMPORTANTE: Token configurado desde variables de entorno
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY 

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
}

export default function MapboxMap({ 
  latitude, 
  longitude, 
  onLocationChange, 
  className = "w-full h-48 rounded-lg border border-green-200" 
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [lng] = useState(longitude);
  const [lat] = useState(latitude);
  const [zoom] = useState(15);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom,
        attributionControl: false // Ocultar atribución para mejor apariencia
      });

      // Agregar controles de navegación
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: false, // Ocultar brújula para interfaz más limpia
        showZoom: true
      }), 'top-right');

      // Evento cuando el mapa termina de cargar
      map.current.on('load', () => {
        if (map.current) {
          map.current.resize();
        }
      });

      // Crear y agregar el marcador
      marker.current = new mapboxgl.Marker({
        color: '#3b82f6', // Azul para coincidir con el tema
        draggable: !!onLocationChange
      })
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Si es draggable, manejar el evento de arrastrar
      if (onLocationChange && marker.current) {
        marker.current.on('dragend', () => {
          if (marker.current) {
            const lngLat = marker.current.getLngLat();
            onLocationChange(lngLat.lat, lngLat.lng);
          }
        });
      }

      // Agregar evento de clic en el mapa si es editable
      if (onLocationChange) {
        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          
          // Mover el marcador a la nueva posición
          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          }
          
          // Notificar el cambio
          onLocationChange(lat, lng);
        });
      }

      // Redimensionar el mapa después de que se monte completamente
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 100);
    }
  }, [lat, lng, zoom, onLocationChange]);

  // Actualizar la posición del marcador cuando cambien las coordenadas
  useEffect(() => {
    if (marker.current && map.current) {
      marker.current.setLngLat([longitude, latitude]);
      map.current.setCenter([longitude, latitude]);
    }
  }, [latitude, longitude]);

  return (
    <div className={`${className} relative`}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ 
          minHeight: '192px', // 48 en rem = 192px
        }}
      />
      {onLocationChange && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-md px-3 py-1 text-xs text-green-700 flex items-center justify-center shadow-sm border border-green-200/50">
          💡 Haz clic en el mapa o arrastra el marcador para cambiar la ubicación
        </div>
      )}
    </div>
  );
}
