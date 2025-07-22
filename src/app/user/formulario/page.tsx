'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function FormularioSolicitante() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  const [tipoAlimento, setTipoAlimento] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [comentarios, setComentarios] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<{ latitud: number; longitud: number } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('id, nombre, cedula, telefono')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error) setUserData(data);
        });
    }
  }, [user, supabase]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionSeleccionada({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
          });
        },
        () => {
          setMensaje('No se pudo obtener la ubicación.');
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    if (!user || !userData || !tipoAlimento || cantidad <= 0) {
      setMensaje('Por favor completa todos los campos requeridos.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('solicitudes').insert([
      {
        usuario_id: user.id,
        tipo_alimento: tipoAlimento,
        cantidad,
        comentarios,
        latitud: ubicacionSeleccionada?.latitud,
        longitud: ubicacionSeleccionada?.longitud,
      },
    ]);

    if (error) {
      setMensaje('Error al enviar la solicitud.');
    } else {
      setMensaje('Solicitud enviada con éxito.');
      setTipoAlimento('');
      setCantidad(0);
      setComentarios('');
    }

    setTimeout(() => setMensaje(''), 3000);
    setLoading(false);
  };

  return (
    <DashboardLayout
      requiredRole="SOLICITANTE"
      title="Solicitar Alimentos"
      description="Rellena el formulario para enviar tu solicitud al Banco de Alimentos."
    >
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        {userData && (
          <div className="space-y-1 text-sm">
            <p><strong>Nombre:</strong> {userData.nombre}</p>
            <p><strong>Cédula:</strong> {userData.cedula}</p>
            <p><strong>Teléfono:</strong> {userData.telefono}</p>
          </div>
        )}

        {ubicacionSeleccionada && (
          <div>
            <p className="text-sm text-gray-600">
              <strong>Ubicación:</strong> Lat {ubicacionSeleccionada.latitud.toFixed(5)}, Lng {ubicacionSeleccionada.longitud.toFixed(5)}
            </p>
            <iframe
              className="w-full h-64 mt-2 rounded border"
              src={`https://maps.google.com/maps?q=${ubicacionSeleccionada.latitud},${ubicacionSeleccionada.longitud}&z=15&output=embed`}
              title="Ubicación"
            ></iframe>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tipoAlimento" className="block font-medium text-sm">Tipo de Alimento</label>
            <input
              type="text"
              id="tipoAlimento"
              value={tipoAlimento}
              onChange={(e) => setTipoAlimento(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Ej: Arroz, Verduras, Leche..."
            />
          </div>

          <div>
            <label htmlFor="cantidad" className="block font-medium text-sm">Cantidad</label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              required
              min={1}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Cantidad (kg, litros, etc.)"
            />
          </div>

          <div>
            <label htmlFor="comentarios" className="block font-medium text-sm">Comentarios (opcional)</label>
            <textarea
              id="comentarios"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Escribe cualquier detalle adicional..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>

        {mensaje && (
          <p className={`text-center text-sm ${mensaje.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>
            {mensaje}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
