/**
 * @fileoverview Encabezado con métricas principales de donaciones.
 */

import { PackageSearch, Package, PackageCheck, PackageMinus, PackageX } from 'lucide-react';
import StatCard from '@/modules/admin/shared/components/StatCard';
import type { DonationCounters } from '../types';

interface DonationsHeaderProps {
  counters: DonationCounters;
}

const DonationsHeader = ({ counters }: DonationsHeaderProps) => (
  <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,3fr)] lg:items-start">
    <div className="rounded-2xl border border-rose-100 bg-rose-500/10 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
          <PackageSearch className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Visión general</p>
          <p className="text-sm text-slate-600">
            Monitorea las donaciones recibidas y su impacto sobre el inventario disponible.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Donaciones"
        value={counters.total}
        accent="purple"
        icon={<Package className="h-5 w-5" />}
        sublabel="Registros totales"
      />
      <StatCard
        label="Pendientes"
        value={counters.pendientes}
        accent="yellow"
        icon={<PackageMinus className="h-5 w-5" />}
        sublabel="Programadas para recoger"
      />
      <StatCard
        label="Recogidas"
        value={counters.recogidas}
        accent="blue"
        icon={<PackageSearch className="h-5 w-5" />}
        sublabel="En tránsito"
      />
      <StatCard
        label="Entregadas"
        value={counters.entregadas}
        accent="green"
        icon={<PackageCheck className="h-5 w-5" />}
        sublabel="Sumadas al inventario"
      />
      <StatCard
        label="Canceladas"
        value={counters.canceladas}
        accent="red"
        icon={<PackageX className="h-5 w-5" />}
        sublabel="No completadas"
      />
    </div>
  </div>
);

export default DonationsHeader;
