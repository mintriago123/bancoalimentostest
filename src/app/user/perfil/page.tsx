'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function PerfilUsuarioPage() {
  const { supabase, user } = useSupabase();
  const [solicitante, setSolicitante] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [estaCargando, setEstaCargando] = useState(false);

  const router = useRouter();

  // Cargar datos del usuario desde Supabase
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre, cedula, correo, telefono, direccion')
            .eq('id', user.id)
            .single();
          if (error) throw new Error(error.message);
          setSolicitante(data);
        } catch (err) {
          console.error('Error al cargar los datos del usuario:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, supabase]);

  if (loading) return <p>Cargando...</p>;

  // Manejo de Cerrar sesión
  const manejarCerrarSesion = async () => {
    setEstaCargando(true);
    await supabase.auth.signOut();
    router.push("/auth/iniciar-sesion");
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 mb-6">
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
                {solicitante?.nombre ?? user?.user_metadata?.nombre ?? user?.email ?? 'Usuario'}
                <ChevronDownIcon
                  className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
                    menuAbierto ? 'rotate-0' : 'rotate-270'
                  }`}
                />
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Inicio
                  </button>
                  <button
                    onClick={() => router.push('/perfil/actualizar')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Actualizar Perfil
                  </button>
                  <button
                    onClick={manejarCerrarSesion}
                    disabled={estaCargando}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:text-red-400"
                  >
                    {estaCargando ? 'Cerrando...' : 'Cerrar Sesión'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto p-6 bg-gray-100">
        <div className="bg-white shadow rounded p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Perfil del Usuario</h2>
          <div className="space-y-4">
            <h3 className="font-semibold">Información del Usuario:</h3>
            {solicitante ? (
              <div>
                <p><strong>Nombre:</strong> {solicitante.nombre}</p>
                <p><strong>Cédula:</strong> {solicitante.cedula}</p>
                <p><strong>Correo:</strong> {solicitante.correo}</p>
                <p><strong>Teléfono:</strong> {solicitante.telefono}</p>
                <p><strong>Dirección:</strong> {solicitante.direccion}</p>
              </div>
            ) : (
              <p>No se encontró información del usuario.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
