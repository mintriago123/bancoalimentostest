/**
 * @fileoverview Componente de encabezado para reportes de movimientos
 * Proporciona navegación, acciones principales y información contextual
 * del reporte de movimientos de inventario.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Download, TrendingUp } from 'lucide-react';
import { NAVIGATION_ROUTES } from '../constants';
import { formatDate } from '../utils/formatters';

/**
 * Props para el componente ReportHeader
 */
interface ReportHeaderProps {
  /** Título del reporte */
  title?: string;
  
  /** Descripción del reporte */
  description?: string;
  
  /** Indica si está cargando */
  loading?: boolean;
  
  /** Timestamp de última actualización */
  lastUpdate?: string;
  
  /** Callback para actualizar datos */
  onRefresh?: () => void;
  
  /** Callback para exportar datos */
  onExport?: () => void;
  
  /** Indica si la exportación está disponible */
  canExport?: boolean;
  
  /** URL de navegación hacia atrás */
  backUrl?: string;
  
  /** Texto del enlace de navegación hacia atrás */
  backText?: string;
}

/**
 * Componente de encabezado para reportes
 * Incluye navegación, título, acciones y metadatos
 */
export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title = 'Reporte de Movimientos',
  description = 'Historial de ingresos y egresos de productos',
  loading = false,
  lastUpdate,
  onRefresh,
  onExport,
  canExport = false,
  backUrl = NAVIGATION_ROUTES.inicio,
  backText = 'Volver al Inicio'
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Sección principal del encabezado */}
      <div className="flex items-center justify-between mb-6">
        {/* Lado izquierdo: Navegación y título */}
        <div className="flex items-center space-x-4">
          {/* Enlace de navegación hacia atrás */}
          <Link
            href={backUrl}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md p-1"
            aria-label={backText}
          >
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            {backText}
          </Link>

          {/* Título y descripción */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>
              <p className="text-gray-600 text-sm">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho: Acciones */}
        <div className="flex items-center space-x-3">
          {/* Botón de actualizar */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className={`
                inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }
              `.trim()}
              aria-label="Actualizar datos del reporte"
            >
              <RefreshCw 
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                aria-hidden="true" 
              />
              Actualizar
            </button>
          )}

          {/* Botón de exportar */}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={loading || !canExport}
              className={`
                inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${loading || !canExport
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                }
              `.trim()}
              aria-label="Exportar reporte a Excel"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Exportar Excel
            </button>
          )}
        </div>
      </div>

      {/* Información de última actualización */}
      {lastUpdate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Última actualización:</span>{' '}
            <time dateTime={lastUpdate} className="font-mono">
              {formatDate(lastUpdate)}
            </time>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHeader;