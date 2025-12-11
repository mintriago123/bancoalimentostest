/**
 * @fileoverview Encabezado y métricas principales del inventario.
 */

import { AlertTriangle, Gauge, Layers, PackageCheck, PackageMinus, PackagePlus } from 'lucide-react';
import StatCard from '@/modules/admin/shared/components/StatCard';
import type { InventarioStats } from '../types';
import { formatQuantity } from '../utils/formatters';

interface InventoryHeaderProps {
  stats: InventarioStats;
}

const InventoryHeader = ({ stats }: InventoryHeaderProps) => (
  <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,3fr)] lg:items-start">
    <div className="rounded-2xl border border-emerald-100 bg-emerald-500/10 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
          <PackagePlus className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Visión general</p>
          <p className="text-sm text-slate-600">
            Administra el stock disponible y anticipa necesidades de reabastecimiento.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Productos únicos"
        value={stats.totalProductos}
        accent="slate"
        icon={<Layers className="h-5 w-5" />}
        sublabel="P. gestionados"
      />
      <StatCard
        label="Stock bajo"
        value={stats.stockBajo}
        accent="red"
        icon={<AlertTriangle className="h-5 w-5" />}
        sublabel="Reponer cuanto antes"
      />
      <StatCard
        label="Stock óptimo"
        value={stats.stockNormal}
        accent="yellow"
        icon={<Gauge className="h-5 w-5" />}
        sublabel="Niveles saludables"
      />
      <StatCard
        label="Stock alto"
        value={stats.stockAlto}
        accent="green"
        icon={<PackageCheck className="h-5 w-5" />}
        sublabel="Capacidad disponible"
      />
      <StatCard
        label="Unidades totales"
        value={formatQuantity(stats.totalUnidades)}
        accent="blue"
        icon={<PackageMinus className="h-5 w-5" />}
        sublabel="Inventario acumulado"
      />
    </div>
  </div>
);

export default InventoryHeader;
