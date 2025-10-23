import { BarChart3 } from 'lucide-react';

interface DashboardHeaderProps {
  description: string;
}

const DashboardHeader = ({ description }: DashboardHeaderProps) => (
  <div className="rounded-2xl border border-indigo-100 bg-indigo-500/10 p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
        <BarChart3 className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Resumen ejecutivo</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  </div>
);

export default DashboardHeader;
