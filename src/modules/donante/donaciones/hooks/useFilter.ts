import { useState, useMemo } from 'react';

interface UseFilterReturn<T> {
  filtro: string;
  setFiltro: (filtro: string) => void;
  datosFiltrados: T[];
}

export function useFilter<T>(
  datos: T[],
  filterFn: (item: T, filtro: string) => boolean,
  initialFilter: string = 'todos'
): UseFilterReturn<T> {
  const [filtro, setFiltro] = useState(initialFilter);

  const datosFiltrados = useMemo(() => {
    if (filtro === 'todos') return datos;
    return datos.filter(item => filterFn(item, filtro));
  }, [datos, filtro, filterFn]);

  return {
    filtro,
    setFiltro,
    datosFiltrados,
  };
}
