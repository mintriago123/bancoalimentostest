import type { RoleDistributionItem } from '../types';

interface RoleDistributionProps {
  items: RoleDistributionItem[];
}

const ROLE_LABELS: Record<RoleDistributionItem['role'], string> = {
  ADMINISTRADOR: 'Administradores',
  DONANTE: 'Donantes',
  SOLICITANTE: 'Solicitantes'
};

const RoleDistribution = ({ items }: RoleDistributionProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-800">Distribución de usuarios por rol</h2>
    <p className="text-sm text-slate-500">Balance del equipo operativo y participantes activos.</p>

    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.role}
          className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner"
        >
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>{ROLE_LABELS[item.role]}</span>
            <span className="text-slate-500">{item.count}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">{item.percentage}% del total</p>
        </div>
      ))}
    </div>
  </div>
);

export default RoleDistribution;
