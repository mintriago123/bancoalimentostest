/**
 * @fileoverview Componente de estadísticas específico para operadores de inventario.
 */

import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  XCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import type { OperadorInventarioStats } from '../types';

interface OperadorInventoryStatsProps {
  stats: OperadorInventarioStats;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'red' | 'yellow' | 'green' | 'blue' | 'orange';
  subtitle?: string;
  trend?: 'up' | 'down';
}

const COLOR_STYLES = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    icon: 'text-red-500'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200', 
    text: 'text-yellow-600',
    icon: 'text-yellow-500'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    icon: 'text-green-500'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    icon: 'text-blue-500'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    icon: 'text-orange-500'
  }
} as const;

const StatCard = ({ title, value, icon, color, subtitle, trend }: StatCardProps) => {
  const styles = COLOR_STYLES[color];
  
  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-4 transition-all hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center space-x-2">
            <p className={`text-2xl font-bold ${styles.text}`}>
              {value.toLocaleString()}
            </p>
            {trend && (
              <div className={`${styles.text}`}>
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${styles.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const OperadorInventoryStats = ({ stats, isLoading = false }: OperadorInventoryStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Calcular porcentajes para mostrar distribución
  const totalProductos = stats.totalProductos;
  const porcentajeStockBajo = totalProductos > 0 ? ((stats.stockBajo / totalProductos) * 100).toFixed(1) : '0';
  const porcentajeVencidos = totalProductos > 0 ? ((stats.productosVencidos / totalProductos) * 100).toFixed(1) : '0';
  const porcentajeProximosVencer = totalProductos > 0 ? ((stats.productosProximosVencer / totalProductos) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
          Resumen General del Inventario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Productos"
            value={stats.totalProductos}
            icon={<Package className="w-6 h-6" />}
            color="blue"
            subtitle="Productos en inventario"
          />
          
          <StatCard
            title="Total de Unidades"
            value={stats.totalUnidades}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            subtitle="Unidades disponibles"
          />

          <StatCard
            title="Alertas Activas"
            value={stats.alertasActivas}
            icon={<AlertTriangle className="w-6 h-6" />}
            color={stats.alertasActivas > 10 ? 'red' : stats.alertasActivas > 5 ? 'yellow' : 'green'}
            subtitle="Requieren atención"
          />

          <StatCard
            title="Productos con Stock Bajo"
            value={stats.stockBajo}
            icon={<TrendingDown className="w-6 h-6" />}
            color="red"
            subtitle={`${porcentajeStockBajo}% del total`}
          />
        </div>
      </div>

      {/* Estadísticas de stock */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Nivel de Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Stock Alto"
            value={stats.stockAlto}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
            subtitle="50+ unidades"
          />

          <StatCard
            title="Stock Normal"
            value={stats.stockNormal}
            icon={<Package className="w-6 h-6" />}
            color="yellow"
            subtitle="10-50 unidades"
          />

          <StatCard
            title="Stock Bajo"
            value={stats.stockBajo}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            subtitle="Menos de 10 unidades"
          />
        </div>
      </div>

      {/* Estadísticas de caducidad */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Control de Caducidad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Próximos a Vencer"
            value={stats.productosProximosVencer}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            subtitle={`${porcentajeProximosVencer}% - Próximos 30 días`}
          />

          <StatCard
            title="Productos Vencidos"
            value={stats.productosVencidos}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            subtitle={`${porcentajeVencidos}% - Requieren acción inmediata`}
          />
        </div>
      </div>

      {/* Indicadores de salud del inventario */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estado del Inventario
        </h3>
        
        <div className="space-y-4">
          {/* Barra de progreso para productos en buen estado */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Productos en Buen Estado</span>
              <span className="text-gray-600">
                {totalProductos > 0 
                  ? `${((totalProductos - stats.productosVencidos) / totalProductos * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: totalProductos > 0 
                    ? `${(totalProductos - stats.productosVencidos) / totalProductos * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>

          {/* Barra de progreso para stock adecuado */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Stock Adecuado</span>
              <span className="text-gray-600">
                {totalProductos > 0 
                  ? `${((totalProductos - stats.stockBajo) / totalProductos * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: totalProductos > 0 
                    ? `${(totalProductos - stats.stockBajo) / totalProductos * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">
            {stats.alertasActivas === 0 ? (
              <span className="text-green-600 font-medium">✅ Inventario en excelente estado</span>
            ) : stats.alertasActivas <= 5 ? (
              <span className="text-yellow-600 font-medium">⚠️ Pocas alertas - Monitoreo normal</span>
            ) : (
              <span className="text-red-600 font-medium">🚨 Múltiples alertas - Atención requerida</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperadorInventoryStats;