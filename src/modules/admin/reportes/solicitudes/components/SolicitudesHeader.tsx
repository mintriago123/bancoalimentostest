/**
 * @fileoverview Encabezado con métricas principales de solicitudes.
 */

import { Ban, CheckCircle, Clock, Inbox } from 'lucide-react';
import StatCard from '@/modules/admin/shared/components/StatCard';
import type { SolicitudCounters } from '../types';

interface SolicitudesHeaderProps {
  counters: SolicitudCounters;
}

const SolicitudesHeader = ({ counters }: SolicitudesHeaderProps) => (
  <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,2fr)] lg:items-start">
    <div className="rounded-2xl border border-sky-100 bg-sky-500/10 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500">
          <Inbox className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-500">Visión general</p>
          <p className="text-sm text-slate-600">
            Atiende las solicitudes de alimentos y garantiza respuestas oportunas.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Solicitudes"
        value={counters.total}
        accent="blue"
        icon={<Inbox className="h-5 w-5" />}
        sublabel="Registros recibidos"
      />
      <StatCard
        label="Pendientes"
        value={counters.pendiente}
        accent="yellow"
        icon={<Clock className="h-5 w-5" />}
        sublabel="En revisión"
      />
      <StatCard
        label="Aprobadas"
        value={counters.aprobada}
        accent="green"
        icon={<CheckCircle className="h-5 w-5" />}
        sublabel="En proceso de entrega"
      />
      <StatCard
        label="Rechazadas"
        value={counters.rechazada}
        accent="red"
        icon={<Ban className="h-5 w-5" />}
        sublabel="No procedentes"
      />
    </div>
  </div>
);

export default SolicitudesHeader;
