/**
 * @fileoverview Tarjeta reutilizable para métricas rápidas en reportes.
 */

import type { ReactNode } from 'react';

type Accent = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate';

const ACCENT_STYLES: Record<Accent, { container: string; label: string; value: string; icon: string }> = {
  blue: {
    container: 'border-sky-200/70 bg-gradient-to-br from-sky-500/10 to-sky-500/5',
    label: 'text-sky-600',
    value: 'text-sky-700',
    icon: 'bg-sky-500/15 text-sky-600'
  },
  green: {
    container: 'border-emerald-200/70 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5',
    label: 'text-emerald-600',
    value: 'text-emerald-700',
    icon: 'bg-emerald-500/15 text-emerald-600'
  },
  yellow: {
    container: 'border-amber-200/70 bg-gradient-to-br from-amber-400/10 to-amber-400/5',
    label: 'text-amber-600',
    value: 'text-amber-700',
    icon: 'bg-amber-400/15 text-amber-600'
  },
  red: {
    container: 'border-rose-200/70 bg-gradient-to-br from-rose-500/10 to-rose-500/5',
    label: 'text-rose-600',
    value: 'text-rose-700',
    icon: 'bg-rose-500/15 text-rose-600'
  },
  purple: {
    container: 'border-violet-200/70 bg-gradient-to-br from-violet-500/10 to-violet-500/5',
    label: 'text-violet-600',
    value: 'text-violet-700',
    icon: 'bg-violet-500/15 text-violet-600'
  },
  slate: {
    container: 'border-slate-200/70 bg-gradient-to-br from-slate-500/10 to-slate-500/5',
    label: 'text-slate-600',
    value: 'text-slate-700',
    icon: 'bg-slate-500/15 text-slate-600'
  }
};

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: Accent;
  icon?: ReactNode;
  sublabel?: string;
}

const StatCard = ({
  label,
  value,
  accent = 'slate',
  icon,
  sublabel
}: StatCardProps) => {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-white/80 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md ${styles.container}`}>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${styles.label}`}>
            {label}
          </p>
          <p className={`mt-2 text-3xl font-semibold leading-tight ${styles.value}`}>
            {value}
          </p>
          {sublabel && (
            <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
          )}
        </div>
        {icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
