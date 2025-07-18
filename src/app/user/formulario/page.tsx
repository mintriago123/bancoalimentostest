'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function FormularioSolicitante() {
  const { supabase, user } = useSupabase();
  const [estaCargando, setEstaCargando] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [tipoAlimento, setTipoAlimento] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [comentarios, setComentarios] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<{ latitud: number; longitud: number } | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre, cedula, telefono')
          .eq('id', user.id)
          .single();

        if (error) {
          setMensaje('Error al cargar los datos del usuario.');
        } else {
          setUserData(data);
        }
      };
      fetchUserData();
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
        (error) => {
          console.error('Error al obtener ubicación:', error);
          setMensaje('No se pudo obtener la ubicación.');
          setTimeout(() => setMensaje(''), 2000);
        }
      );
    } else {
      setMensaje('La geolocalización no está disponible en este navegador.');
      setTimeout(() => setMensaje(''), 2000);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    if (!user || !userData) {
      setMensaje('Por favor, inicia sesión para enviar tu solicitud.');
      setLoading(false);
      setTimeout(() => setMensaje(''), 2000);
      return;
    }

    if (!tipoAlimento || cantidad <= 0) {
      setMensaje('Por favor, ingresa el tipo de alimento y la cantidad.');
      setLoading(false);
      setTimeout(() => setMensaje(''), 2000);
      return;
    }

    try {
      const { error } = await supabase
        .from('solicitudes')
        .insert([
          {
            usuario_id: user.id,
            tipo_alimento: tipoAlimento,
            cantidad,
            comentarios,
            latitud: ubicacionSeleccionada?.latitud,
            longitud: ubicacionSeleccionada?.longitud,
          },
        ]);

      if (error) throw new Error(error.message);

      setMensaje('Solicitud enviada con éxito.');
      setTipoAlimento('');
      setCantidad(0);
      setComentarios('');
      setTimeout(() => setMensaje(''), 2000);
    } catch (error) {
      if (error instanceof Error) {
        setMensaje(`Error al enviar la solicitud: ${error.message}`);
        setTimeout(() => setMensaje(''), 2000);
      } else {
        setMensaje('Error al enviar la solicitud.');
        setTimeout(() => setMensaje(''), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const manejarCerrarSesion = async () => {
    setEstaCargando(true);
    await supabase.auth.signOut();
    setEstaCargando(false);
    router.push('/auth/iniciar-sesion');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Barra superior */}
      <header className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Banco de Alimentos</h1>

            <div className="relative">
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm"
              >
                {perfil?.nombre ?? user?.user_metadata?.nombre ?? "Usuario"}
                <ChevronDownIcon
                  className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
                    menuAbierto ? "rotate-0" : "rotate-270"
                  }`}
                />
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                  <button onClick={() => router.push("/dashboard")} className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Inicio</button>
                  <button onClick={() => router.push("/perfil/actualizar")} className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Perfil</button>
                  <button onClick={() => router.push("/user/solicitudes")} className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Solicitudes</button>
                  <button onClick={manejarCerrarSesion} disabled={estaCargando} className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">{estaCargando ? "Cerrando..." : "Cerrar Sesión"}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="max-w-lg w-full bg-white shadow-md rounded-md p-6">
          <h2 className="text-2xl font-bold mb-4">Solicitar Alimentos del Banco</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {userData && (
              <div className="space-y-2 text-sm">
                <p><strong>Nombre:</strong> {userData.nombre}</p>
                <p><strong>Cédula:</strong> {userData.cedula}</p>
                <p><strong>Teléfono:</strong> {userData.telefono}</p>
              </div>
            )}

            {ubicacionSeleccionada && (
              <>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Ubicación detectada:</strong> Lat {ubicacionSeleccionada.latitud.toFixed(5)}, Lng {ubicacionSeleccionada.longitud.toFixed(5)}
                </p>
                <iframe
                  title="Mapa de ubicación"
                  className="w-full h-64 mt-2 rounded border"
                  src={`https://maps.google.com/maps?q=${ubicacionSeleccionada.latitud},${ubicacionSeleccionada.longitud}&z=15&output=embed`}
                ></iframe>
              </>
            )}

            <div>
              <label htmlFor="tipoAlimento" className="block text-sm font-semibold">Tipo de Alimento</label>
              <input
                type="text"
                id="tipoAlimento"
                value={tipoAlimento}
                onChange={(e) => setTipoAlimento(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ej: Arroz, Leche, Verduras..."
              />
            </div>

            <div>
              <label htmlFor="cantidad" className="block text-sm font-semibold">Cantidad</label>
              <input
                type="number"
                id="cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Cantidad (kg, litros, etc.)"
                min="1"
              />
            </div>

            <div>
              <label htmlFor="comentarios" className="block text-sm font-semibold">Comentarios (opcional)</label>
              <textarea
                id="comentarios"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Comentarios adicionales"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </form>

          {mensaje && (
            <p className={`mt-4 text-center ${mensaje.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
