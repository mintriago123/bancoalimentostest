'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const SolicitudesPage = () => {
  const { supabase, user } = useSupabase();  // Obtener datos de Supabase y usuario autenticado
  const [solicitudes, setSolicitudes] = useState<any[]>([]);  // Almacenar las solicitudes
  const [loading, setLoading] = useState(true);  // Estado de carga
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(false);  // Para saber si estamos editando una solicitud
  const [solicitudAEditar, setSolicitudAEditar] = useState<any>(null);  // Almacenar la solicitud que se está editando
  const router = useRouter();

  const [estaCargando, setEstaCargando] = useState(false);
  const [perfil] = useState<any>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);


  // Cargar las solicitudes cuando el componente se monta
  useEffect(() => {
    if (user) {
      const fetchSolicitudes = async () => {
        try {
          const { data, error } = await supabase
            .from('solicitudes')
            .select('id, tipo_alimento, cantidad, comentarios, estado, created_at')  // Seleccionamos las columnas necesarias
            .eq('usuario_id', user.id);  // Filtramos por el usuario autenticado

          if (error) {
            setMensaje(`Error al cargar las solicitudes: ${error.message}`);
          } else {
            setSolicitudes(data);  // Almacenamos las solicitudes en el estado
          }
        } catch (error) {
          setMensaje('Error al cargar las solicitudes.');
        } finally {
          setLoading(false);  // Terminamos la carga
        }
      };

      fetchSolicitudes();
    } else {
      router.push('/auth/iniciar-sesion');  // Redirigir al login si no hay usuario autenticado
    }
  }, [user, supabase]);

  const manejarCerrarSesion = async () => {
    setEstaCargando(true);
    await supabase.auth.signOut();
    router.push("/auth/iniciar-sesion");
  };

  // Función para eliminar una solicitud
  const eliminarSolicitud = async (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta solicitud?');
    if (!confirmar) return;

    try {
      const { error } = await supabase
        .from('solicitudes')
        .delete()
        .eq('id', id);  // Eliminamos la solicitud por su id

      if (error) throw new Error(error.message);

      // Actualizamos la lista de solicitudes eliminando la solicitud eliminada
      setSolicitudes(solicitudes.filter(solicitud => solicitud.id !== id));

      setMensaje('Solicitud eliminada con éxito.');
      setTimeout(() => setMensaje(''), 2000);  // Limpiar mensaje después de 2 segundos
    } catch (error) {
      setMensaje(`Error al eliminar la solicitud: ${error instanceof Error ? error.message : 'Desconocido'}`);
      setTimeout(() => setMensaje(''), 2000);  // Limpiar mensaje después de 2 segundos
    }
  };

  // Función para actualizar una solicitud
  const actualizarSolicitud = async () => {
    if (!solicitudAEditar) return;

    try {
      // Optimista: Actualizamos la solicitud en el estado antes de enviar la actualización
      setSolicitudes(solicitudes.map(solicitud =>
        solicitud.id === solicitudAEditar.id
          ? { ...solicitud, ...solicitudAEditar }
          : solicitud
      ));

      // Realizamos la actualización en la base de datos
      const { data, error } = await supabase
        .from('solicitudes')
        .update({
          tipo_alimento: solicitudAEditar.tipo_alimento,
          cantidad: solicitudAEditar.cantidad,
          comentarios: solicitudAEditar.comentarios,
        })
        .eq('id', solicitudAEditar.id)
        .select();  // Filtramos por la solicitud a editar y seleccionamos los datos actualizados

      if (error) throw new Error(error.message);

      // Verificamos si 'data' contiene los datos actualizados
      if (Array.isArray(data) && data.length > 0) {
        // Si la actualización es exitosa, actualizamos el estado
        setSolicitudes(solicitudes.map(solicitud =>
          solicitud.id === solicitudAEditar.id ? data[0] : solicitud
        ));
        setMensaje('Solicitud actualizada con éxito');
        setTimeout(() => setMensaje(''), 3000);  
      } else {

        setMensaje('No se encontraron datos actualizados.');
        setTimeout(() => setMensaje(''), 3000);  
      }

      setEditando(false);  // Finalizamos el modo de edición
    } catch (error) {
      setMensaje(`Error al actualizar la solicitud: ${error instanceof Error ? error.message : 'Desconocido'}`);
      setTimeout(() => setMensaje(''), 3000);  
    }
  };

  // Función para manejar el cambio en los campos de edición
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSolicitudAEditar({
      ...solicitudAEditar,
      [name]: value,
    });
  };

  if (loading) return <div>Cargando solicitudes...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

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
                    onClick={() => router.push("/user/formulario")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Crear Solicitud
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

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mis Solicitudes</h2>

      {/* Si hay un mensaje, lo mostramos */}
      {mensaje && <div className="text-red-500 mb-4">{mensaje}</div>}

      {/* Si estamos editando una solicitud, mostramos el formulario de edición */}
      {editando && solicitudAEditar && (
        <div className="bg-white p-4 rounded-md shadow-md mb-4">
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

      {/* Tabla de solicitudes */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Tipo de Alimento</th>
              <th className="py-2 px-4 border-b">Cantidad</th>
              <th className="py-2 px-4 border-b">Comentarios</th>
              <th className="py-2 px-4 border-b">Estado</th>
              <th className="py-2 px-4 border-b">Fecha de Solicitud</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 px-6 text-center">No tienes solicitudes.</td>
              </tr>
            ) : (
              solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td className="py-2 px-4 border-b">{solicitud.tipo_alimento}</td>
                  <td className="py-2 px-4 border-b">{solicitud.cantidad}</td>
                  <td className="py-2 px-4 border-b">{solicitud.comentarios}</td>
                  <td className="py-2 px-4 border-b">{solicitud.estado}</td>
                  <td className="py-2 px-4 border-b">{new Date(solicitud.created_at).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">
                    {/* Botones de Editar y Eliminar */}
                    <button
                      onClick={() => { setSolicitudAEditar(solicitud); setEditando(true); }}
                      className="bg-yellow-500 text-white py-1 px-2 rounded-md mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarSolicitud(solicitud.id)}
                      className="bg-red-600 text-white py-1 px-2 rounded-md"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SolicitudesPage;
