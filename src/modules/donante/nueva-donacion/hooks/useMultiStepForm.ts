import { useState } from 'react';

interface UseMultiStepFormReturn {
  pasoActual: number;
  siguientePaso: () => void;
  pasoAnterior: () => void;
  irAPaso: (paso: number) => void;
  resetearPaso: () => void;
}

export function useMultiStepForm(totalPasos: number): UseMultiStepFormReturn {
  const [pasoActual, setPasoActual] = useState(1);

  const siguientePaso = () => {
    setPasoActual(prev => Math.min(prev + 1, totalPasos));
  };

  const pasoAnterior = () => {
    setPasoActual(prev => Math.max(prev - 1, 1));
  };

  const irAPaso = (paso: number) => {
    if (paso >= 1 && paso <= totalPasos) {
      setPasoActual(paso);
    }
  };

  const resetearPaso = () => {
    setPasoActual(1);
  };

  return {
    pasoActual,
    siguientePaso,
    pasoAnterior,
    irAPaso,
    resetearPaso,
  };
}
