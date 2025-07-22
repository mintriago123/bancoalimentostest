'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Eye, Edit, Trash2, Clock, CheckCircle, XCircle, Calendar, FileText } from 'lucide-react';

interface Solicitud {
  id: number;
  usuario_id: string;
  tipo_alimento: string;
  cantidad: number;
  comentarios?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  created_at: string;
  fecha_respuesta?: string;
  comentario_admin?: string;
}

export default function MisSolicitudesPage() {
  const { supabase, user } = useSupabase();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(false);
  const [solicitudAEditar, setSolicitudAEditar] = useState<Solicitud | null>(null);

  const cargarMisSolicitudes = useCallback(async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('usuario_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setCargando(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user) cargarMisSolicitudes();
  }, [cargarMisSolicitudes, user]);

  const eliminarSolicitud = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) return;
    try {
      const { error } = await supabase.from('solicitudes').delete().eq('id', id);
      if (error) throw error;
      await cargarMisSolicitudes();
      setMensaje('Solicitud eliminada con éxito.');
      setTimeout(() => setMensaje(''), 2000);
    } catch (error) {
      console.error('Error al eliminar solicitud:', error);
      setMensaje('Error al eliminar la solicitud.');
      setTimeout(() => setMensaje(''), 2000);
    }
  };

  const actualizarSolicitud = async () => {
    if (!solicitudAEditar) return;
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .update({
          tipo_alimento: solicitudAEditar.tipo_alimento,
          cantidad: solicitudAEditar.cantidad,
          comentarios: solicitudAEditar.comentarios,
        })
        .eq('id', solicitudAEditar.id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setSolicitudes(solicitudes.map(s => s.id === solicitudAEditar.id ? data[0] : s));
        setMensaje('Solicitud actualizada con éxito.');
      } else {
        setMensaje('No se encontraron datos actualizados.');
      }
      setEditando(false);
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al actualizar la solicitud:', error);
      setMensaje('Error al actualizar la solicitud.');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (solicitudAEditar) {
      setSolicitudAEditar({ ...solicitudAEditar, [name]: value });
    }
  };

  const getEstadoBadge = (estado: string) => {
    const base = 'px-2 py-1 text-xs font-semibold rounded-full border ';
    switch (estado) {
      case 'pendiente':
        return base + 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'aprobada':
        return base + 'bg-green-100 text-green-800 border-green-300';
      case 'rechazada':
        return base + 'bg-red-100 text-red-800 border-red-300';
      default:
        return base + 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'aprobada': return <CheckCircle className="w-4 h-4" />;
      case 'rechazada': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h1>
        {mensaje && <div className="text-sm text-blue-600 bg-blue-100 p-2 rounded-md">{mensaje}</div>}

        {editando && solicitudAEditar && (
          <div className="bg-white p-4 rounded-md shadow-md">
            <h3 className="text-xl mb-4">Editar Solicitud</h3>
            <div>
              <label>Tipo de Alimento</label>
              <input
                type="text"
                name="tipo_alimento"
                value={solicitudAEditar.tipo_alimento}
                onChange={handleChange}
                className="border p-2 w-full mb-4"
              />
            </div>
            <div>
              <label>Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={solicitudAEditar.cantidad}
                onChange={handleChange}
                className="border p-2 w-full mb-4"
              />
            </div>
            <div>
              <label>Comentarios</label>
              <textarea
                name="comentarios"
                value={solicitudAEditar.comentarios}
                onChange={handleChange}
                className="border p-2 w-full mb-4"
              />
            </div>
            <button
              onClick={actualizarSolicitud}
              className="bg-blue-600 text-white p-2 rounded-md"
            >
              Guardar Cambios
            </button>
          </div>
        )}

        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-2">No has registrado ninguna solicitud aún.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Alimento</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {solicitudes.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{s.tipo_alimento}</td>
                      <td className="px-6 py-4 text-sm">{s.cantidad}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getEstadoIcon(s.estado)}
                          <span className={getEstadoBadge(s.estado)}>{s.estado}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{formatearFecha(s.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {s.estado === 'pendiente' && (
                            <>
                              <button
                                onClick={() => { setSolicitudAEditar(s); setEditando(true); }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Editar"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => eliminarSolicitud(s.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => alert('Ver detalles (en construcción)')}
                            className="text-gray-600 hover:text-gray-800"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
