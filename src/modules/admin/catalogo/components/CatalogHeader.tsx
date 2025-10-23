import { PackageOpen, Layers } from 'lucide-react';
import StatCard from '@/modules/admin/shared/components/StatCard';
import type { CatalogStats } from '../types';

interface CatalogHeaderProps {
  stats: CatalogStats;
}

const CatalogHeader = ({ stats }: CatalogHeaderProps) => (
  <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,2fr)] lg:items-start">
    <div className="rounded-2xl border border-slate-200 bg-slate-900/5 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/10 text-slate-700">
          <PackageOpen className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Catálogo de alimentos</p>
          <p className="text-sm text-slate-500">
            Administra los productos disponibles para donaciones y solicitudes.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <StatCard
        label="Alimentos registrados"
        value={stats.totalAlimentos}
        accent="blue"
        icon={<PackageOpen className="h-5 w-5" />}
        sublabel="En catálogo"
      />
      <StatCard
        label="Categorías únicas"
        value={stats.totalCategorias}
        accent="yellow"
        icon={<Layers className="h-5 w-5" />}
        sublabel="Clasificación disponible"
      />
    </div>
  </div>
);

export default CatalogHeader;
