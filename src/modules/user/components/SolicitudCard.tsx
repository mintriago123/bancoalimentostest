// ============================================================================
// Component: SolicitudCard
// Tarjeta individual de solicitud con opciones de edición y eliminación
// ============================================================================

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Calendar,
  MapPin,
  MessageCircle,
  ShoppingBasket,
  Hash,
  Send,
  X,
} from 'lucide-react';
import { Solicitud, SolicitudEditData } from '../types';
import { useDateFormatter } from '@/modules/shared/hooks/useDateFormatter';

interface SolicitudCardProps {
  solicitud: Solicitud;
  onDelete: (solicitud: Solicitud) => void;
  onEdit: (id: number, data: SolicitudEditData) => Promise<boolean>;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function SolicitudCard({
  solicitud,
  onDelete,
  onEdit,
  canEdit = true,
  canDelete = true,
}: SolicitudCardProps) {
  const { formatDateTime } = useDateFormatter();
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formEdit, setFormEdit] = useState<SolicitudEditData>({
    comentarios: solicitud.comentarios || '',
  });
  const [loadingEdit, setLoadingEdit] = useState(false);

  const getEstadoIcono = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return <Clock className="text-yellow-500 w-4 h-4" />;
      case 'aprobada':
        return <CheckCircle className="text-green-600 w-4 h-4" />;
      case 'rechazada':
        return <XCircle className="text-red-600 w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleEditar = () => {
    setEditandoId(solicitud.id);
    setFormEdit({
      comentarios: solicitud.comentarios || '',
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setFormEdit({ comentarios: '' });
  };

  const handleGuardar = async () => {
    setLoadingEdit(true);
    const success = await onEdit(solicitud.id, formEdit);

    if (success) {
      setEditandoId(null);
    }

    setLoadingEdit(false);
  };

  const puedeEditar =
    canEdit && solicitud.estado.toUpperCase() === 'PENDIENTE';
  const puedeEliminar =
    canDelete &&
    (solicitud.estado.toUpperCase() === 'RECHAZADA' ||
      solicitud.estado.toUpperCase() === 'PENDIENTE');

  return (
    <div className="border p-4 rounded-lg shadow-sm space-y-2 relative bg-white">
      {/* Botones de acción */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {puedeEliminar && (
          <button
            onClick={() => onDelete(solicitud)}
            className="text-red-500 hover:text-red-700 transition"
            title="Eliminar solicitud"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {puedeEditar && editandoId !== solicitud.id && (
          <button
            onClick={handleEditar}
            className="text-blue-500 hover:text-blue-700 transition"
            title="Editar solicitud"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Estado */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        {getEstadoIcono(solicitud.estado)}
        <p>
          <strong>Estado:</strong> {solicitud.estado}
        </p>
      </div>

      {/* Alimento */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <ShoppingBasket className="w-4 h-4" />
        <p>
          <strong>Alimento:</strong> {solicitud.tipo_alimento}
        </p>
      </div>

      {/* Cantidad */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Hash className="w-4 h-4" />
        <p>
          <strong>Cantidad:</strong> {solicitud.cantidad}
        </p>
      </div>

      {/* Comentarios */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <MessageCircle className="w-4 h-4" />
        {editandoId === solicitud.id ? (
          <textarea
            value={formEdit.comentarios}
            onChange={(e) =>
              setFormEdit((f) => ({ ...f, comentarios: e.target.value }))
            }
            rows={2}
            className="w-full p-1 border rounded resize-none"
            placeholder="Comentarios"
          />
        ) : (
          <p>
            <strong>Comentarios:</strong>{' '}
            {solicitud.comentarios || 'Sin comentarios'}
          </p>
        )}
      </div>

      {/* Fecha */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Calendar className="w-4 h-4" />
        <p>
          <strong>Fecha:</strong> {formatDateTime(solicitud.created_at)}
        </p>
      </div>

      {/* Ubicación */}
      {solicitud.latitud && solicitud.longitud && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <p>
              <strong>Ubicación:</strong> Lat {solicitud.latitud.toFixed(5)},
              Lng {solicitud.longitud.toFixed(5)}
            </p>
          </div>
          <iframe
            className="w-full h-48 mt-2 rounded-md border"
            src={`https://maps.google.com/maps?q=${solicitud.latitud},${solicitud.longitud}&z=15&output=embed`}
            title="Ubicación"
          ></iframe>
        </div>
      )}

      {/* Botones de edición */}
      {editandoId === solicitud.id && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleGuardar}
            disabled={loadingEdit}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-400 transition"
          >
            <Send className="w-4 h-4" />
            Guardar
          </button>
          <button
            onClick={handleCancelarEdicion}
            disabled={loadingEdit}
            className="flex items-center gap-1 bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
