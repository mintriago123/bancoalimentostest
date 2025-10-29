/**
 * @fileoverview Tabla principal de donaciones con acciones contextuales.
 */

import type { JSX } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Package,
  Phone,
  Truck,
  User,
  XCircle,
  Building,
  Gift
} from 'lucide-react';
import { DONATION_STATE_COLORS } from '../constants';
import type { Donation, DonationEstado, DonationPersonType } from '../types';
import { isExpired, isNearExpiration } from '../utils/formatters';
import { formatShortDate } from '@/lib/dateUtils';

interface DonationsTableProps {
  donations: Donation[];
  totalCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onChangeEstado: (donation: Donation, nuevoEstado: DonationEstado) => void;
  processingId?: number;
  onViewDetails?: (donation: Donation) => void;
  messages: {
    noData: string;
    noFilteredData: string;
  };
}

const estadoIcons: Record<DonationEstado, JSX.Element> = {
  Pendiente: <Clock className="w-4 h-4" />,
  Recogida: <Truck className="w-4 h-4" />,
  Entregada: <CheckCircle className="w-4 h-4" />,
  Cancelada: <XCircle className="w-4 h-4" />
};

const personTypeIcon = (tipo: DonationPersonType) => (
  tipo === 'Juridica' ? <Building className="w-4 h-4 text-gray-600" /> : <User className="w-4 h-4 text-gray-600" />
);

const DonationsTable = ({
  donations,
  totalCount,
  hasActiveFilters,
  onResetFilters,
  onChangeEstado,
  processingId,
  onViewDetails,
  messages
}: DonationsTableProps) => {
  if (donations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="p-8 text-center">
          {totalCount === 0 ? (
            <>
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{messages.noData}</p>
            </>
          ) : (
            <>
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{messages.noFilteredData}</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="overflow-x-auto">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {donations.map(donation => {
              const isProcessing = processingId === donation.id;
              // Extract expiration color selection into a separate statement to avoid nested ternary
              let expiryColorClass = 'text-gray-500';
              if (donation.fecha_vencimiento) {
                if (isExpired(donation.fecha_vencimiento)) {
                  expiryColorClass = 'text-red-600';
                } else if (isNearExpiration(donation.fecha_vencimiento)) {
                  expiryColorClass = 'text-yellow-600';
                }
              }
              return (
                <tr key={donation.id} className="transition-colors duration-150 hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {personTypeIcon(donation.tipo_persona_donante)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {donation.nombre_donante || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.tipo_persona_donante === 'Juridica'
                            ? donation.ruc_donante
                            : donation.cedula_donante}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="text-xs text-gray-500">{donation.telefono}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {donation.alimento?.nombre || donation.tipo_producto}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.categoria_comida}
                        </div>
                        {donation.es_producto_personalizado && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Personalizado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {donation.cantidad} {donation.unidad_simbolo}
                    </div>
                    <div className="text-xs text-gray-500">
                      {donation.unidad_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <div className="space-y-1">
                        <div>Disponible: {formatShortDate(donation.fecha_disponible)}</div>
                        <div>Registro: {formatShortDate(donation.creado_en)}</div>
                        {donation.fecha_vencimiento && (
                          <div className={`${expiryColorClass} font-medium`}>
                            Vence: {formatShortDate(donation.fecha_vencimiento)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {estadoIcons[donation.estado] ?? <AlertCircle className="w-4 h-4" />}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${DONATION_STATE_COLORS[donation.estado]}`}>
                        {donation.estado}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {donation.impacto_estimado_personas
                        ? `${donation.impacto_estimado_personas} personas`
                        : 'Sin estimación'}
                    </div>
                    {donation.impacto_equivalente && (
                      <div className="text-xs text-gray-500">{donation.impacto_equivalente}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => onChangeEstado(donation, 'Pendiente')}
                        disabled={isProcessing || donation.estado === 'Pendiente'}
                        className="px-2 py-1 text-xs border border-yellow-200 text-yellow-600 rounded hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Pendiente
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeEstado(donation, 'Recogida')}
                        disabled={isProcessing || donation.estado === 'Recogida'}
                        className="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Recogida
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeEstado(donation, 'Entregada')}
                        disabled={isProcessing || donation.estado === 'Entregada'}
                        className="px-2 py-1 text-xs border border-green-200 text-green-600 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Entregada
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeEstado(donation, 'Cancelada')}
                        disabled={isProcessing || donation.estado === 'Cancelada'}
                        className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelada
                      </button>
                      <button
                        type="button"
                        onClick={onViewDetails ? () => onViewDetails(donation) : undefined}
                        disabled={!onViewDetails}
                        className="px-2 py-1 text-xs border border-gray-200 text-gray-600 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={onViewDetails ? 'Ver detalles' : 'Detallado no disponible'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonationsTable;
