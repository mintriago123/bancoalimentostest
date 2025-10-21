import { useMemo } from 'react';

interface Donacion {
  estado: 'Pendiente' | 'Recogida' | 'Entregada' | 'Cancelada';
  impacto_estimado_personas?: number;
}

interface DonationStats {
  total: number;
  pendientes: number;
  recogidas: number;
  entregadas: number;
  canceladas: number;
  impactoTotal: number;
}

export function useDonationStats(donaciones: Donacion[]): DonationStats {
  const estadisticas = useMemo(() => {
    return {
      total: donaciones.length,
      pendientes: donaciones.filter(d => d.estado === 'Pendiente').length,
      recogidas: donaciones.filter(d => d.estado === 'Recogida').length,
      entregadas: donaciones.filter(d => d.estado === 'Entregada').length,
      canceladas: donaciones.filter(d => d.estado === 'Cancelada').length,
      impactoTotal: donaciones.reduce((acc, d) => acc + (d.impacto_estimado_personas || 0), 0)
    };
  }, [donaciones]);

  return estadisticas;
}
