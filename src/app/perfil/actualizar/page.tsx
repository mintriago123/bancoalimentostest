'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useProfileForm, useProfileUpdate } from '@/modules/shared';
import { Loader2 } from 'lucide-react';

// Lazy load del componente de mapa para mejor rendimiento
const MapboxLocationPicker = lazy(() => import('@/modules/shared/components/MapboxLocationPicker'));

export default function ActualizarPerfil() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [estaCargando, setEstaCargando] = useState(false);
  const [perfil] = useState<any>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const {
    form,
    handleChange,
    updateMultipleFields,
    updateLocation,
    validateTelefono,
  } = useProfileForm();

  const {
    loading: cargando,
    error,
    success: exito,
    setError,
    loadUserProfile,
    updateProfile,
  } = useProfileUpdate(supabase);

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        setError("No se pudo obtener el usuario autenticado.");
        return;
      }

      const userId = userData.user.id;
      
      // Cargar perfil con coordenadas
      const { data, error: fetchError } = await supabase
        .from('usuarios')
        .select('tipo_persona, cedula, ruc, nombre, direccion, telefono, latitud, longitud')
        .eq('id', userId)
        .single();

      if (!fetchError && data) {
        updateMultipleFields(data);
      }
    };

    cargarDatos();
  }, [supabase, updateMultipleFields, setError]);

  // Manejo de Cerrar sesión
  const manejarCerrarSesion = async () => {
    setEstaCargando(true);
    try {
      // 1. Cerrar sesión en el cliente
      await supabase.auth.signOut();
      
      // 2. Llamar a la API para limpiar cookies del servidor
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Suprimir errores de fetch durante logout
      });
      
      // 3. Forzar recarga completa
      window.location.href = '/auth/iniciar-sesion';
    } catch (error) {
      // Solo loggear si no es un error esperado
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code !== 'ECONNRESET') {
          console.error('Error al cerrar sesión:', error);
        }
      }
      window.location.href = '/auth/iniciar-sesion';
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.telefono || !validateTelefono(form.telefono)) {
      setError("El número de teléfono debe tener 10 dígitos.");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      setError("No se pudo obtener el usuario autenticado.");
      return;
    }
    const userId = userData.user.id;

    const success = await updateProfile(userId, {
      direccion: form.direccion,
      telefono: form.telefono,
      latitud: form.latitud,
      longitud: form.longitud,
    });

    if (success) {
      router.push("/dashboard");
    }
  };

  if (cargando) {
    return <div className="text-center p-6">Cargando...</div>;
  }

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
    
    {/* Barra superior fija */}
    <header className="bg-white shadow-sm border-b border-gray-200 w-full fixed top-0 left-0 z-50">
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
                    onClick={() => router.push("/user/solicitudes")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Solicitudes
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

    {/* Formulario */}
    <form
      className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-blue-100 p-8 space-y-6 mt-24"
      onSubmit={manejarEnvio}
    >
      <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-4">
        Actualizar Perfil
      </h2>

      <div>
        <label className="font-semibold text-gray-700 block mb-1">Tipo de Persona</label>
        <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-300">
          {form.tipo_persona === 'Natural' ? 'Natural (Cédula)' : 'Jurídica (RUC)'}
        </div>
      </div>

      <div>
        <label className="font-semibold text-gray-700 block mb-1">
          {form.tipo_persona === 'Natural' ? 'Cédula' : 'RUC'}
        </label>
        <input
          type="text"
          disabled
          className="w-full border border-gray-300 bg-gray-100 rounded-lg px-4 py-2"
          value={form.tipo_persona === 'Natural' ? form.cedula : form.ruc}
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700 block mb-1">Nombre o Razón Social</label>
        <input
          type="text"
          readOnly
          className="w-full border border-gray-300 bg-gray-100 rounded-lg px-4 py-2"
          value={form.nombre}
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700 block mb-2">Ubicación</label>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Cargando mapa...</span>
              </div>
            </div>
          }
        >
          <MapboxLocationPicker
            initialAddress={form.direccion}
            initialLatitude={form.latitud || -2.1894}
            initialLongitude={form.longitud || -79.8891}
            onLocationSelect={updateLocation}
            placeholder="Buscar tu dirección..."
          />
        </Suspense>
      </div>

      <div>
        <label htmlFor="telefono" className="font-semibold text-gray-700 block mb-1">Teléfono</label>
        <input
          name="telefono"
          id="telefono"
          type="tel"
          placeholder="Teléfono"
          maxLength={10}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          value={form.telefono}
          onChange={handleChange}
          inputMode="numeric"
          autoComplete="off"
        />
      </div>

      {error && <div className="text-center text-red-700 bg-red-100 py-2 px-3 rounded-lg">{error}</div>}
      {exito && <div className="text-center text-green-700 bg-green-100 py-2 px-3 rounded-lg">{exito}</div>}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition-all"
      >
        Guardar Cambios
      </button>
    </form>
  </div>
);

  
}
