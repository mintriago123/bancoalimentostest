import { useState } from 'react';

interface UseFormValidationReturn {
  mensajeValidacion: string | null;
  setMensajeValidacion: (mensaje: string | null) => void;
  limpiarMensajeValidacion: () => void;
}

export function useFormValidation(): UseFormValidationReturn {
  const [mensajeValidacion, setMensajeValidacion] = useState<string | null>(null);

  const limpiarMensajeValidacion = () => {
    setMensajeValidacion(null);
  };

  return {
    mensajeValidacion,
    setMensajeValidacion,
    limpiarMensajeValidacion,
  };
}
