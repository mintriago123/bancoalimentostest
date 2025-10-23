/**
 * @fileoverview Componente de resumen estadístico para reportes de movimientos
 * Muestra métricas clave y estadísticas de los movimientos de inventario
 * en un formato visual atractivo y fácil de entender.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import React from 'react';
import { TrendingUp, TrendingDown, Package, BarChart3 } from 'lucide-react';
import StatCard from '@/modules/admin/shared/components/StatCard';
import type { MovementSummary as MovementSummaryData } from '../types';
import { formatNumber } from '../utils/formatters';

type Accent = 'blue' | 'green' | 'red' | 'yellow';

/**
 * Props para el componente MovementSummaryCard
 */
interface MovementSummaryCardProps {
  /** Título de la métrica */
  title: string;
  
  /** Valor principal a mostrar */
  value: string | number;
  
  /** Descripción o contexto adicional */
  description?: string;
  
  /** Icono a mostrar */
  icon: React.ReactNode;
  
  /** Color del tema (success, danger, info, warning) */
  variant?: 'success' | 'danger' | 'info' | 'warning';
  
}

/**
 * Componente de tarjeta individual para métricas
 */
const MovementSummaryCard: React.FC<MovementSummaryCardProps> = ({
  title,
  value,
  description,
  icon,
  variant = 'info',
}) => {
  let accent: Accent = 'blue';
  if (variant === 'success') {
    accent = 'green';
  } else if (variant === 'danger') {
    accent = 'red';
  } else if (variant === 'warning') {
    accent = 'yellow';
  }

  return (
    <StatCard
      label={title}
      value={typeof value === 'number' ? formatNumber(value) : value}
      accent={accent}
      icon={icon}
      sublabel={description}
    />
  );
};

/**
 * Props para el componente principal MovementSummary
 */
interface MovementSummaryProps {
  /** Datos del resumen estadístico */
  summary: MovementSummaryData;
  
  /** Indica si está cargando */
  loading?: boolean;
  
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente principal de resumen de movimientos
 * Muestra las estadísticas clave en tarjetas organizadas
 */
export const MovementSummary: React.FC<MovementSummaryProps> = ({
  summary,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm ${className}`}>
        {/* Primera fila - 4 métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MovementSummaryCard
            title="Total Movimientos"
            value={formatNumber(summary.totalRecords)}
            description="Registros totales"
            icon={<BarChart3 className="h-6 w-6" />}
            variant="info"
          />
          <MovementSummaryCard
            title="Total Ingresos"
            value={formatNumber(summary.totalIngresosCount)}
            description={`${summary.ingresosPercentage.toFixed(1)}% del total`}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
          />
          <MovementSummaryCard
            title="Total Egresos"
            value={formatNumber(summary.totalEgresosCount)}
            description={`${summary.egresosPercentage.toFixed(1)}% del total`}
            icon={<TrendingDown className="h-6 w-6" />}
            variant="danger"
          />
          <MovementSummaryCard
            title="Productos Únicos"
            value={formatNumber(summary.uniqueProducts)}
            description="Variedad de productos"
            icon={<Package className="h-6 w-6" />}
            variant="info"
          />
        </div>      {/* Producto más movido */}
      {summary.topProduct && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">
              Producto con Mayor Movimiento
            </h5>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">
                {summary.topProduct.name}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatNumber(summary.topProduct.quantity)} unidades
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementSummary;
