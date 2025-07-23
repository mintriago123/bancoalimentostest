'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import {
  MapPin,
  Calendar,
  MessageCircle,
  ShoppingBasket,
  Hash,
  Send,
  User,
  Phone,
  IdCard,
} from 'lucide-react';

export default function FormularioSolicitante() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  const [alimentosDisponibles, setAlimentosDisponibles] = useState<any[]>([]);
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

  useEffect(() => {
    const fetchAlimentos = async () => {
      const { data, error } = await supabase.from('alimentos').select('id, nombre');
      if (!error && data) {
        setAlimentosDisponibles(data);
      }
    };

    fetchAlimentos();
  }, [supabase]);

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
      <div className="max-w-2xl mx-auto space-y-6 bg-white rounded-xl shadow-lg p-6">
        {userData && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <p><strong>Nombre:</strong> {userData.nombre}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <IdCard className="w-4 h-4" />
              <p><strong>Cédula:</strong> {userData.cedula}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4" />
              <p><strong>Teléfono:</strong> {userData.telefono}</p>
            </div>
          </div>
        )}

        {ubicacionSeleccionada && (
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <p>
                <strong>Ubicación:</strong> Lat {ubicacionSeleccionada.latitud.toFixed(5)}, Lng {ubicacionSeleccionada.longitud.toFixed(5)}
              </p>
            </div>
            <iframe
              className="w-full h-64 rounded-md border"
              src={`https://maps.google.com/maps?q=${ubicacionSeleccionada.latitud},${ubicacionSeleccionada.longitud}&z=15&output=embed`}
              title="Ubicación"
            ></iframe>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tipoAlimento" className="block font-semibold text-sm text-gray-800">Tipo de Alimento</label>
            <div className="relative">
              <select
                id="tipoAlimento"
                value={tipoAlimento}
                onChange={(e) => setTipoAlimento(e.target.value)}
                required
                className="w-full p-2 pl-10 border border-gray-300 rounded-md"
              >
                <option value="">-- Selecciona un alimento --</option>
                {alimentosDisponibles.map((alimento) => (
                  <option key={alimento.id} value={alimento.nombre}>
                    {alimento.nombre}
                  </option>
                ))}
              </select>
              <ShoppingBasket className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="cantidad" className="block font-semibold text-sm text-gray-800">Cantidad</label>
            <div className="relative">
              <input
                type="number"
                id="cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                required
                min={1}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                placeholder="Cantidad (kg, litros, etc.)"
              />
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="comentarios" className="block font-semibold text-sm text-gray-800">Comentarios (opcional)</label>
            <div className="relative">
              <textarea
                id="comentarios"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                placeholder="Escribe cualquier detalle adicional..."
              />
              <MessageCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
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
