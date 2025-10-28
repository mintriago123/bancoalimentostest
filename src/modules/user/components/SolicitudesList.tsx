// ============================================================================
// Component: SolicitudesList
// Lista de solicitudes con filtros
// ============================================================================

import React from 'react';
import { Solicitud, SolicitudEditData, FiltroEstadoSolicitud } from '../types';
import { SolicitudCard } from './SolicitudCard';
import { FILTROS_ESTADO } from '../constants';

interface SolicitudesListProps {
  solicitudes: Solicitud[];
  filtroEstado: FiltroEstadoSolicitud;
  onFiltroChange: (filtro: FiltroEstadoSolicitud) => void;
  onDelete: (solicitud: Solicitud) => void;
  onEdit: (id: number, data: SolicitudEditData) => Promise<boolean>;
  mensaje?: string;
}

export function SolicitudesList({
  solicitudes,
  filtroEstado,
  onFiltroChange,
  onDelete,
  onEdit,
  mensaje,
}: SolicitudesListProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-4 bg-white p-6 rounded-xl shadow">
      {/* Filtros */}
      <div className="flex justify-center gap-4 mb-4">
        {FILTROS_ESTADO.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onFiltroChange(value as FiltroEstadoSolicitud)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              filtroEstado === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mensaje */}
      {mensaje && (
        <p className="text-sm text-green-600 text-center">{mensaje}</p>
      )}

      {/* Lista de solicitudes */}
      {solicitudes.length === 0 ? (
        <p className="text-center text-gray-500">
          No hay solicitudes para mostrar.
        </p>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <SolicitudCard
              key={solicitud.id}
              solicitud={solicitud}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
