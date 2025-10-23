import type { UserTypeItem } from '../types';

interface UserTypeDistributionProps {
  items: UserTypeItem[];
}

const UserTypeDistribution = ({ items }: UserTypeDistributionProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-800">Tipos de usuarios</h2>
    <p className="text-sm text-slate-500">Participación según su naturaleza jurídica.</p>

    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        let accentClass = 'from-slate-500 to-slate-400';
        if (item.accent === 'blue') {
          accentClass = 'from-sky-500 to-sky-400';
        } else if (item.accent === 'purple') {
          accentClass = 'from-violet-500 to-violet-400';
        }

        return (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>{item.label}</span>
              <span className="text-slate-500">{item.count}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${accentClass}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">{item.percentage}% de los usuarios</p>
          </div>
        );
      })}
    </div>
  </div>
);

export default UserTypeDistribution;
