"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search, X, Loader2 } from 'lucide-react';

// Configurar el token de acceso de Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';

interface LocationResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapboxLocationPickerProps {
  initialAddress?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (data: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function MapboxLocationPicker({
  initialAddress = '',
  initialLatitude = -2.1894, // Guayaquil por defecto
  initialLongitude = -79.8891,
  onLocationSelect,
  placeholder = 'Buscar dirección...',
  className = '',
}: MapboxLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState({
    lat: initialLatitude,
    lng: initialLongitude,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para hacer geocoding inverso (coordenadas -> dirección)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=es&country=ec`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setSelectedAddress(address);
        setSearchQuery(address);
        onLocationSelect({
          address,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (error) {
      console.error('Error en geocoding inverso:', error);
    }
  }, [onLocationSelect]);

  // Función para buscar direcciones
  const searchAddresses = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&language=es&country=ec&limit=5&types=address,poi,locality,place`
      );
      const data = await response.json();
      
      if (data.features) {
        setSearchResults(data.features);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Manejar cambio en el campo de búsqueda con debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Configurar nuevo timeout para búsqueda
    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };

  // Seleccionar una dirección de los resultados
  const handleSelectLocation = (result: LocationResult) => {
    const [lng, lat] = result.center;
    
    setSelectedAddress(result.place_name);
    setSearchQuery(result.place_name);
    setCoordinates({ lat, lng });
    setShowResults(false);
    setSearchResults([]);
    
    // Actualizar mapa y marcador
    if (map.current && marker.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1500,
      });
      marker.current.setLngLat([lng, lat]);
    }
    
    // Notificar al padre
    onLocationSelect({
      address: result.place_name,
      latitude: lat,
      longitude: lng,
    });
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Inicializar mapa
  useEffect(() => {
    if (map.current) return;
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [coordinates.lng, coordinates.lat],
        zoom: 14,
        attributionControl: false,
      });

      // Agregar controles de navegación
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        'top-right'
      );

      // Agregar control de geolocalización
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: false,
          showUserHeading: false,
        }),
        'top-right'
      );

      // Evento cuando el mapa termina de cargar
      map.current.on('load', () => {
        setMapLoaded(true);
        if (map.current) {
          map.current.resize();
        }
      });

      // Crear y agregar el marcador
      marker.current = new mapboxgl.Marker({
        color: '#3b82f6',
        draggable: true,
      })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map.current);

      // Manejar el evento de arrastrar
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
          reverseGeocode(lngLat.lat, lngLat.lng);
        }
      });

      // Agregar evento de clic en el mapa
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        // Mover el marcador a la nueva posición
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        }
        
        setCoordinates({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Redimensionar el mapa después de que se monte
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 100);
    }
  }, [coordinates.lat, coordinates.lng, reverseGeocode]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Campo de búsqueda */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Indicador de carga */}
        {isSearching && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}
        
        {/* Resultados de búsqueda */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelectLocation(result)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0"
              >
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {result.place_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dirección seleccionada */}
      {selectedAddress && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800">Dirección seleccionada:</p>
            <p className="text-sm text-blue-700 break-words">{selectedAddress}</p>
            <p className="text-xs text-blue-600 mt-1">
              Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="relative">
        <div
          ref={mapContainer}
          className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
          style={{ minHeight: '256px' }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando mapa...</span>
            </div>
          </div>
        )}
        
        {mapLoaded && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 text-xs text-blue-700 flex items-center justify-center shadow-sm border border-blue-200/50">
            <MapPin className="w-4 h-4 mr-1" />
            Haz clic en el mapa o arrastra el marcador para seleccionar tu ubicación
          </div>
        )}
      </div>
    </div>
  );
}
