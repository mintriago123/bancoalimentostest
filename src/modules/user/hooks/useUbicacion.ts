// ============================================================================
// Hook: useUbicacion
// Manejo de ubicación geográfica
// ============================================================================

import { useState, useEffect } from 'react';
import { Ubicacion } from '../types';
import { MESSAGES } from '../constants';

interface UseUbicacionResult {
  ubicacion: Ubicacion | null;
  error: string | null;
  setUbicacion: (ubicacion: Ubicacion) => void;
}

export function useUbicacion(): UseUbicacionResult {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
          });
          setError(null);
        },
        () => {
          setError(MESSAGES.UBICACION.ERROR);
        }
      );
    } else {
      setError('La geolocalización no está disponible en este navegador');
    }
  }, []);

  return {
    ubicacion,
    error,
    setUbicacion,
  };
}
