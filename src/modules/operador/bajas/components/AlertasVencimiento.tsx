/**
 * @fileoverview Componente de alertas de productos próximos a vencer o vencidos
 * Muestra notificaciones y permite acciones rápidas
 */

'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, Package, TrendingDown, X, RefreshCw } from 'lucide-react';
import type { AlertaVencimiento, AlertasVencimientoResponse } from '@/modules/operador/bajas/types';

interface AlertasVencimientoProps {
  diasUmbral?: number;
  onProductoSeleccionado?: (alerta: AlertaVencimiento) => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // en minutos
}

const prioridadColors = {
  vencido: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
    icon: 'text-red-600'
  },
  alta: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800',
    icon: 'text-orange-600'
  },
  media: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: 'text-yellow-600'
  },
  baja: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
    icon: 'text-blue-600'
  }
};

const prioridadLabels = {
  vencido: 'VENCIDO',
  alta: 'URGENTE',
  media: 'PRÓXIMO',
  baja: 'ALERTA'
};

export default function AlertasVencimiento({
  diasUmbral = 7,
  onProductoSeleccionado,
  autoRefresh = true,
  refreshInterval = 30
}: AlertasVencimientoProps) {
  const [data, setData] = useState<AlertasVencimientoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'vencidos' | 'proximos'>('todos');
  const [alertasCerradas, setAlertasCerradas] = useState<Set<string>>(new Set());

  const cargarAlertas = async () => {
    try {
      const response = await fetch(`/api/operador/alertas-vencimiento?dias=${diasUmbral}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar alertas');
      }

      const result: AlertasVencimientoResponse = await response.json();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar alertas');
      console.error('Error cargando alertas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarAlertas();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(cargarAlertas, refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [diasUmbral, autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    setIsLoading(true);
    cargarAlertas();
  };

  const handleCerrarAlerta = (idInventario: string) => {
    setAlertasCerradas(prev => new Set(prev).add(idInventario));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center space-x-3 text-gray-500">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span>Cargando alertas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error al cargar alertas</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.alertas.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3 text-green-700">
          <Package className="w-6 h-6" />
          <span className="font-medium">No hay productos próximos a vencer</span>
        </div>
      </div>
    );
  }

  // Filtrar alertas
  const alertasFiltradas = data.alertas.filter(alerta => {
    if (alertasCerradas.has(alerta.id_inventario)) return false;
    
    if (filtroActivo === 'vencidos') return alerta.prioridad === 'vencido';
    if (filtroActivo === 'proximos') return alerta.prioridad !== 'vencido';
    return true;
  });

  const stats = data.estadisticas;

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Alertas de Vencimiento</h2>
              <p className="text-sm text-gray-500">
                Productos próximos a vencer en {diasUmbral} días
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Estadísticas resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">Vencidos</div>
            <div className="text-2xl font-bold text-red-700 mt-1">{stats.total_vencidos}</div>
            <div className="text-xs text-red-600 mt-1">
              {stats.cantidad_total_vencidos.toFixed(1)} unidades
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">Próximos</div>
            <div className="text-2xl font-bold text-orange-700 mt-1">{stats.total_proximos}</div>
            <div className="text-xs text-orange-600 mt-1">
              {stats.cantidad_total_proximos.toFixed(1)} unidades
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium">Total Alertas</div>
            <div className="text-2xl font-bold text-yellow-700 mt-1">{stats.total}</div>
            <div className="text-xs text-yellow-600 mt-1">Productos afectados</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Alta Prioridad</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              {stats.por_prioridad.vencidos + stats.por_prioridad.alta}
            </div>
            <div className="text-xs text-blue-600 mt-1">Requieren atención inmediata</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
          <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          <button
            onClick={() => setFiltroActivo('todos')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filtroActivo === 'todos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFiltroActivo('vencidos')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filtroActivo === 'vencidos'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vencidos ({stats.total_vencidos})
          </button>
          <button
            onClick={() => setFiltroActivo('proximos')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filtroActivo === 'proximos'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Próximos a Vencer ({stats.total_proximos})
          </button>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-3">
        {alertasFiltradas.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
            No hay alertas para mostrar con el filtro seleccionado
          </div>
        ) : (
          alertasFiltradas.map((alerta) => {
            const colors = prioridadColors[alerta.prioridad];
            return (
              <div
                key={alerta.id_inventario}
                className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 bg-white rounded-lg ${colors.border} border`}>
                      <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${colors.text}`}>
                          {alerta.nombre_producto}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                          {prioridadLabels[alerta.prioridad]}
                        </span>
                      </div>
                      <div className={`mt-2 space-y-1 text-sm ${colors.text}`}>
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>
                            {alerta.cantidad_disponible} {alerta.unidad_simbolo || 'unidades'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Vence: {new Date(alerta.fecha_caducidad).toLocaleDateString('es-ES')}
                            {alerta.prioridad !== 'vencido' && ` (${alerta.dias_para_vencer} días)`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-4 h-4" />
                          <span>Depósito: {alerta.deposito.nombre}</span>
                        </div>
                      </div>
                      {onProductoSeleccionado && (
                        <button
                          onClick={() => onProductoSeleccionado(alerta)}
                          className={`mt-3 px-4 py-2 bg-white ${colors.border} border rounded-lg text-sm font-medium ${colors.text} hover:bg-opacity-80 transition-colors`}
                        >
                          Dar de Baja
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCerrarAlerta(alerta.id_inventario)}
                    className={`ml-2 ${colors.text} hover:opacity-70 transition-opacity`}
                    title="Cerrar alerta"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
