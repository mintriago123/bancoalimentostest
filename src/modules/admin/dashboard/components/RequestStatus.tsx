import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
import type { RequestStatusItem } from '../types';

interface RequestStatusProps {
  items: RequestStatusItem[];
}

const ICON_MAP = {
  yellow: Clock,
  green: CheckCircle,
  red: AlertTriangle,
  blue: Package
};

const RequestStatus = ({ items }: RequestStatusProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-800">Estado de solicitudes</h2>
    <p className="text-sm text-slate-500">Seguimiento del flujo de aprobación y entregas.</p>

    <div className="mt-5 space-y-4">
      {items.map((item) => {
        const Icon = ICON_MAP[item.accent];
        let accentColor: string;
        if (item.accent === 'yellow') {
          accentColor = 'text-amber-500';
        } else if (item.accent === 'green') {
          accentColor = 'text-emerald-500';
        } else if (item.accent === 'blue') {
          accentColor = 'text-blue-500';
        } else {
          accentColor = 'text-rose-500';
        }

        let barColor: string;
        if (item.accent === 'yellow') {
          barColor = 'from-amber-400 to-amber-300';
        } else if (item.accent === 'green') {
          barColor = 'from-emerald-500 to-emerald-400';
        } else if (item.accent === 'blue') {
          barColor = 'from-blue-500 to-blue-400';
        } else {
          barColor = 'from-rose-500 to-rose-400';
        }

        return (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg bg-white p-1.5 shadow ${accentColor}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </div>
              <span className="text-slate-500">{item.count}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">{item.percentage}% del total</p>
          </div>
        );
      })}
    </div>
  </div>
);

export default RequestStatus;
