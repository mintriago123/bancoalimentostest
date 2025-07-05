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

  const router = useRouter();

  // Obtenemos los datos del usuario autenticado
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from('usuarios') // Asegúrate de que la tabla de usuarios esté configurada correctamente
          .select('id, nombre, correo, cedula')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    // Verificar que el usuario esté autenticado
    if (!user || !userData) {
      setMensaje('Por favor, inicia sesión para enviar tu solicitud.');
      setLoading(false);
      return;
    }

    // Verificar que se haya seleccionado un tipo de alimento y cantidad
    if (!tipoAlimento || cantidad <= 0) {
      setMensaje('Por favor, ingresa el tipo de alimento y la cantidad.');
      setLoading(false);
      return;
    }

    // Enviar los datos de la solicitud a Supabase
    try {
      const { data, error } = await supabase
        .from('solicitudes_alimentos')
        .insert([
          {
            usuario_id: user.id,
            nombre: userData.nombre,
            cedula: userData.cedula,
            correo: userData.correo,
            tipo_alimento: tipoAlimento,
            cantidad,
            comentarios,
          },
        ]);

      if (error) throw new Error(error.message);

      setMensaje('Solicitud enviada con éxito.');
      setTipoAlimento('');
      setCantidad(0);
      setComentarios('');
    } catch (error) {
      if (error instanceof Error) {
        setMensaje(`Error al enviar la solicitud: ${error.message}`);
      } else {
        setMensaje('Error al enviar la solicitud.');
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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Banco de Alimentos</h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-sm"
              >
                {perfil?.nombre ?? user?.user_metadata?.nombre ?? user?.email ?? "Usuario"}
                <ChevronDownIcon
                  className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
                    menuAbierto ? "rotate-0" : "rotate-270"
                  }`}
                />
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Inicio
                  </button>
                  
                  <button
                    onClick={() => router.push("/perfil/actualizar")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Perfil
                  </button>

                  <button
                    onClick={() => router.push("/user/solicitudes")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Solicitudes
                  </button>

                  <button
                    onClick={manejarCerrarSesion}
                    disabled={estaCargando}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:text-red-400"
                  >
                    {estaCargando ? "Cerrando..." : "Cerrar Sesión"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal centrado */}
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="max-w-lg w-full bg-white shadow-md rounded-md p-6">
          <h2 className="text-2xl font-bold mb-4">Solicitar Alimentos del Banco</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datos del usuario (solo visualización) */}
            {userData && (
              <div className="space-y-2">
                <p><strong>Nombre:</strong> {userData.nombre}</p>
                <p><strong>Correo:</strong> {userData.correo}</p>
                <p><strong>Cédula:</strong> {userData.cedula}</p>
              </div>
            )}

            {/* Selección del tipo de alimento */}
            <div>
              <label htmlFor="tipoAlimento" className="block text-sm font-semibold text-gray-700">Tipo de Alimento</label>
              <input
                type="text"
                id="tipoAlimento"
                value={tipoAlimento}
                onChange={(e) => setTipoAlimento(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ejemplo: Arroz, Leche, Verduras..."
              />
            </div>

            {/* Cantidad */}
            <div>
              <label htmlFor="cantidad" className="block text-sm font-semibold text-gray-700">Cantidad (kg, litros, etc.)</label>
              <input
                type="number"
                id="cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Cantidad"
                min="1"
              />
            </div>

            {/* Comentarios adicionales */}
            <div>
              <label htmlFor="comentarios" className="block text-sm font-semibold text-gray-700">Comentarios (opcional)</label>
              <textarea
                id="comentarios"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Comentarios adicionales sobre la solicitud"
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </form>

          {/* Mensaje de estado */}
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
