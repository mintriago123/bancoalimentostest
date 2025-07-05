'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function ActualizarPerfil() {
  const router = useRouter();
  const { supabase, user } = useSupabase();  // Obtener datos de Supabase y usuario autenticado
  const [estaCargando, setEstaCargando] = useState(false);
  const [perfil] = useState<any>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);


  const [form, setForm] = useState({
    tipo_persona: '',
    cedula: '',
    ruc: '',
    nombre: '',
    direccion: '',
    telefono: '',
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        setError("No se pudo obtener el usuario autenticado.");
        setCargando(false);
        return;
      }

      const userId = userData.user.id;
      const { data, error } = await supabase
        .from("usuarios")
        .select("tipo_persona, cedula, ruc, nombre, direccion, telefono")
        .eq("id", userId)
        .single();

      if (error) {
        setError("No se pudieron cargar los datos del perfil.");
      } else {
        setForm(data);
      }
      setCargando(false);
    };

    cargarDatos();
  }, [supabase]);

  // Manejo de Cerrar sesión
  const manejarCerrarSesion = async () => {
    setEstaCargando(true);
    await supabase.auth.signOut();
    router.push("/auth/iniciar-sesion");
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!form.telefono || form.telefono.replace(/\D/g, '').length !== 10) {
      setError("El número de teléfono debe tener 10 dígitos.");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      setError("No se pudo obtener el usuario autenticado.");
      return;
    }
    const userId = userData.user.id;

    const { error: updateError } = await supabase
      .from("usuarios")
      .update({
        direccion: form.direccion,
        telefono: form.telefono,
      })
      .eq("id", userId);

    if (updateError) {
      setError("No se pudo actualizar el perfil. " + updateError.message);
    } else {
      setExito("¡Perfil actualizado correctamente!");
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
        <label htmlFor="direccion" className="font-semibold text-gray-700 block mb-1">Dirección</label>
        <input
          name="direccion"
          id="direccion"
          type="text"
          placeholder="Dirección"
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          value={form.direccion}
          onChange={manejarCambio}
        />
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
          onChange={manejarCambio}
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
