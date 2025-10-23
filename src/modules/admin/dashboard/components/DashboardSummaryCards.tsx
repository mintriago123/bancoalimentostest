import { Gauge, Hourglass, Users, ClipboardCheck } from 'lucide-react';
import StatCard from '@/modules/admin/shared/components/StatCard';
import type { DashboardCounts } from '../types';

interface DashboardSummaryCardsProps {
  counts: DashboardCounts;
}

const DashboardSummaryCards = ({ counts }: DashboardSummaryCardsProps) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      label="Usuarios registrados"
      value={counts.totalUsuarios}
      accent="purple"
      icon={<Users className="h-5 w-5" />}
      sublabel="Activos en la plataforma"
    />
    <StatCard
      label="Solicitudes"
      value={counts.totalSolicitudes}
      accent="blue"
      icon={<ClipboardCheck className="h-5 w-5" />}
      sublabel="Historial acumulado"
    />
    <StatCard
      label="Tasa de aprobación"
      value={`${counts.tasaAprobacion}%`}
      accent="green"
      icon={<Gauge className="h-5 w-5" />}
      sublabel="vs. solicitudes rechazadas"
    />
    <StatCard
      label="Pendientes"
      value={counts.pendientes}
      accent="yellow"
      icon={<Hourglass className="h-5 w-5" />}
      sublabel="En revisión por el equipo"
    />
  </div>
);

export default DashboardSummaryCards;
