'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
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

export default function MisSolicitudesPage() {
  const { supabase, user } = useSupabase();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formEdit, setFormEdit] = useState<{ cantidad: number; comentarios: string }>({
    cantidad: 0,
    comentarios: '',
  });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'pendiente' | 'aprobada' | 'rechazada'>('TODOS');

  useEffect(() => {
    const fetchSolicitudes = async () => {
      if (user) {
        let query = supabase
          .from('solicitudes')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false });

        // Aplica filtro si no es TODOS
        if (filtroEstado !== 'TODOS') {
          query = query.eq('estado', filtroEstado);
        }

        const { data, error } = await query;

        if (!error && data) {
          setSolicitudes(data);
        }
      }
    };

    fetchSolicitudes();
  }, [supabase, user, filtroEstado]);

  const handleEliminar = async (id: number) => {
    const confirmacion = window.confirm('¿Estás seguro de eliminar esta solicitud?');
    if (!confirmacion) return;

    const { error } = await supabase.from('solicitudes').delete().eq('id', id);

    if (!error) {
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
      setMensaje('Solicitud eliminada.');
      setTimeout(() => setMensaje(''), 3000);
      if (editandoId === id) setEditandoId(null);
    } else {
      setMensaje('Error al eliminar la solicitud.');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const handleEditar = (solicitud: any) => {
    setEditandoId(solicitud.id);
    setFormEdit({
      cantidad: solicitud.cantidad,
      comentarios: solicitud.comentarios || '',
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setFormEdit({ cantidad: 0, comentarios: '' });
  };

  const handleGuardar = async (id: number) => {
    if (formEdit.cantidad <= 0) {
      setMensaje('La cantidad debe ser mayor que cero.');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    setLoadingEdit(true);
    const { error } = await supabase
      .from('solicitudes')
      .update({
        cantidad: formEdit.cantidad,
        comentarios: formEdit.comentarios,
      })
      .eq('id', id);

    if (!error) {
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, cantidad: formEdit.cantidad, comentarios: formEdit.comentarios } : s
        )
      );
      setMensaje('Solicitud actualizada.');
      setEditandoId(null);
    } else {
      setMensaje('Error al actualizar la solicitud.');
    }

    setTimeout(() => setMensaje(''), 3000);
    setLoadingEdit(false);
  };

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

  return (
    <DashboardLayout
      requiredRole="SOLICITANTE"
      title="Mis Solicitudes"
      description="Revisa el historial de tus solicitudes de alimentos."
    >
      <div className="max-w-4xl mx-auto space-y-4 bg-white p-6 rounded-xl shadow">
        {/* Filtro de estado */}
        {/* <div className="flex justify-center gap-4 mb-4">
          {['TODOS', 'pendiente', 'APROBADA=aprobada', 'rechazada'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado as any)}
              className={`px-4 py-2 rounded-full font-semibold ${
                filtroEstado === estado
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {estado.charAt(0) + estado.slice(1).toLowerCase()}
            </button>
          ))}
        </div> */}
        <div className="flex justify-center gap-4 mb-4">
          {[
            { label: 'TODOS', value: 'TODOS' },
            { label: 'PENDIENTES', value: 'pendiente' },
            { label: 'APROBADAS', value: 'aprobada' },
            { label: 'RECHAZADAS', value: 'rechazada' },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFiltroEstado(value as 'TODOS' | 'pendiente' | 'aprobada' | 'rechazada')}
              className={`px-4 py-2 rounded-full font-semibold ${
                filtroEstado === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mensaje && <p className="text-sm text-green-600 text-center">{mensaje}</p>}

        {solicitudes.length === 0 ? (
          <p className="text-center text-gray-500">No hay solicitudes para mostrar.</p>
        ) : (
          solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="border p-4 rounded-lg shadow-sm space-y-2 relative"
            >
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {(solicitud.estado.toUpperCase() === 'rechazada' ||
                  solicitud.estado.toUpperCase() === 'pendiente') && (
                  <button
                    onClick={() => handleEliminar(solicitud.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar solicitud"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {solicitud.estado.toUpperCase() === 'pendiente' && editandoId !== solicitud.id && (
                  <button
                    onClick={() => handleEditar(solicitud)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Editar solicitud"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                {getEstadoIcono(solicitud.estado)}
                <p>
                  <strong>Estado:</strong> {solicitud.estado}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ShoppingBasket className="w-4 h-4" />
                <p>
                  <strong>Alimento:</strong> {solicitud.tipo_alimento}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Hash className="w-4 h-4" />
                {editandoId === solicitud.id ? (
                  <input
                    type="number"
                    min={1}
                    value={formEdit.cantidad}
                    onChange={(e) =>
                      setFormEdit((f) => ({ ...f, cantidad: Number(e.target.value) }))
                    }
                    className="w-24 p-1 border rounded"
                  />
                ) : (
                  <p>
                    <strong>Cantidad:</strong> {solicitud.cantidad}
                  </p>
                )}
              </div>

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
                    <strong>Comentarios:</strong> {solicitud.comentarios || 'Sin comentarios'}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4" />
                <p>
                  <strong>Fecha:</strong>{' '}
                  {new Date(solicitud.created_at).toLocaleString()}
                </p>
              </div>

              {solicitud.latitud && solicitud.longitud && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <p>
                      <strong>Ubicación:</strong> Lat{' '}
                      {solicitud.latitud.toFixed(5)}, Lng{' '}
                      {solicitud.longitud.toFixed(5)}
                    </p>
                  </div>
                  <iframe
                    className="w-full h-48 mt-2 rounded-md border"
                    src={`https://maps.google.com/maps?q=${solicitud.latitud},${solicitud.longitud}&z=15&output=embed`}
                    title="Ubicación"
                  ></iframe>
                </div>
              )}

              {editandoId === solicitud.id && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleGuardar(solicitud.id)}
                    disabled={loadingEdit}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-400"
                  >
                    <Send className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelarEdicion}
                    disabled={loadingEdit}
                    className="flex items-center gap-1 bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
