/**
 * @fileoverview Encabezado estilizado para el reporte de movimientos.
 */

import React from 'react';
import { Download, RefreshCw, TrendingUp } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface ReportHeaderProps {
  description?: string;
  loading?: boolean;
  lastUpdate?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  canExport?: boolean;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  description = 'Historial de ingresos y egresos de productos',
  loading = false,
  lastUpdate,
  onRefresh,
  onExport,
  canExport = false
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-500/10 px-4 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15">
              <TrendingUp className="h-6 w-6 text-indigo-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Visión general</p>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                  ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                  : 'bg-slate-900 text-white shadow-sm hover:bg-slate-700 focus:ring-slate-500'
              }`}
              aria-label="Actualizar datos del reporte"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Actualizar
            </button>
          )}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={loading || !canExport}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading || !canExport
                  ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                  : 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm hover:from-indigo-600 hover:to-sky-600 focus:ring-indigo-500'
              }`}
              aria-label="Exportar reporte a Excel"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Exportar Excel
            </button>
          )}
        </div>
      </div>

      {lastUpdate && (
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
          <span className="font-medium text-slate-600">Última actualización:</span>{' '}
          <time dateTime={lastUpdate} className="font-mono text-slate-700">
            {formatDate(lastUpdate)}
          </time>
        </div>
      )}
    </div>
  );
};

export default ReportHeader;
