/**
 * @fileoverview Componente de alertas específico para operadores de inventario.
 */

import { AlertTriangle, Clock, XCircle, Package, TrendingDown } from 'lucide-react';
import type { AlertaInventario } from '../types';
import { formatShortDate } from '@/lib/dateUtils';

interface OperadorInventoryAlertsProps {
  alertas: AlertaInventario[];
  onAlertaClick?: (alerta: AlertaInventario) => void;
}

const ALERTA_STYLES = {
  stock_bajo: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: <TrendingDown className="w-5 h-5 text-red-500" />,
    title: 'Stock Bajo'
  },
  proximo_vencer: {
    bg: 'bg-yellow-50 border-yellow-200', 
    text: 'text-yellow-800',
    icon: <Clock className="w-5 h-5 text-yellow-500" />,
    title: 'Próximo a Vencer'
  },
  vencido: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    title: 'Vencido'
  }
} as const;

const PRIORIDAD_STYLES = {
  alta: 'border-l-4 border-l-red-500',
  media: 'border-l-4 border-l-yellow-500',
  baja: 'border-l-4 border-l-blue-500'
} as const;

const getAlertaMessage = (alerta: AlertaInventario): string => {
  switch (alerta.tipo) {
    case 'stock_bajo':
      return `Solo quedan ${alerta.cantidad_actual} unidades en ${alerta.deposito.nombre}`;
    case 'proximo_vencer':
      return `Vence el ${formatShortDate(alerta.producto.fecha_caducidad)} en ${alerta.deposito.nombre}`;
    case 'vencido':
      return `Producto vencido desde ${formatShortDate(alerta.producto.fecha_caducidad)} en ${alerta.deposito.nombre}`;
    default:
      return 'Requiere atención';
  }
};

const OperadorInventoryAlerts = ({ alertas, onAlertaClick }: OperadorInventoryAlertsProps) => {
  if (alertas.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Package className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              ¡Excelente trabajo! 
            </h3>
            <p className="text-sm text-green-600 mt-1">
              No hay alertas activas en el inventario. Todos los productos están en buen estado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Agrupar alertas por prioridad
  const alertasPorPrioridad = alertas.reduce((acc, alerta) => {
    if (!acc[alerta.prioridad]) {
      acc[alerta.prioridad] = [];
    }
    acc[alerta.prioridad].push(alerta);
    return acc;
  }, {} as Record<string, AlertaInventario[]>);

  return (
    <div className="space-y-4">
      {/* Header con resumen */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Alertas de Inventario
            </h3>
            <p className="text-sm text-gray-600">
              {alertas.length} {alertas.length === 1 ? 'producto requiere' : 'productos requieren'} atención
            </p>
          </div>
        </div>

        {/* Resumen por tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {Object.entries(alertasPorPrioridad).map(([prioridad, alertasGrupo]) => (
            <div 
              key={prioridad}
              className={`p-3 rounded-lg border ${
                prioridad === 'alta' ? 'bg-red-50 border-red-200' :
                prioridad === 'media' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  prioridad === 'alta' ? 'text-red-800' :
                  prioridad === 'media' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  Prioridad {prioridad.toUpperCase()}
                </span>
                <span className={`text-lg font-bold ${
                  prioridad === 'alta' ? 'text-red-600' :
                  prioridad === 'media' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  {alertasGrupo.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-3">
        {alertas.map((alerta, index) => {
          const styles = ALERTA_STYLES[alerta.tipo];
          const prioridadStyle = PRIORIDAD_STYLES[alerta.prioridad];
          
          return (
            <div
              key={`${alerta.producto.id_producto}-${alerta.tipo}-${index}`}
              className={`${styles.bg} border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${prioridadStyle}`}
              onClick={() => onAlertaClick?.(alerta)}
            >
              <div className="flex items-start space-x-4">
                {/* Icono */}
                <div className="flex-shrink-0">
                  {styles.icon}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-semibold ${styles.text}`}>
                        {styles.title}: {alerta.producto.nombre_producto}
                      </h4>
                      <p className={`text-sm ${styles.text} mt-1`}>
                        {getAlertaMessage(alerta)}
                      </p>
                    </div>
                    
                    {/* Prioridad badge */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      alerta.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                      alerta.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alerta.prioridad.toUpperCase()}
                    </span>
                  </div>

                  {/* Detalles adicionales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Cantidad actual:</span> {alerta.cantidad_actual} unidades
                    </div>
                    <div>
                      <span className="font-medium">Unidad:</span> {alerta.producto.unidad_medida || 'No especificada'}
                    </div>
                    <div>
                      <span className="font-medium">Depósito:</span> {alerta.deposito.nombre}
                    </div>
                  </div>

                  {/* Descripción del producto si existe */}
                  {alerta.producto.descripcion && (
                    <p className="text-xs text-gray-500 mt-2">
                      {alerta.producto.descripcion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con acciones */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Haz clic en una alerta para ver más detalles y tomar acciones.
          </span>
          <span>
            Actualizado: {new Date().toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OperadorInventoryAlerts;