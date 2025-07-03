"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // Asegúrate de tener Heroicons instalado



export default function DashboardPage() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [estaCargando, setEstaCargando] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/iniciar-sesion");
      return;
    }
    // Obtener datos del perfil del usuario desde la tabla usuarios
    const obtenerPerfil = async () => {
      setCargandoPerfil(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        setPerfil(null);
      } else {
        setPerfil(data);
      }
      setCargandoPerfil(false);
    };
    obtenerPerfil();
  }, [user, router, supabase]);

  const manejarCerrarSesion = async () => {
    setEstaCargando(true);
    await supabase.auth.signOut();
    router.push("/auth/iniciar-sesion");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200">
      {/* Header simple */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Banco de Alimentos
              </h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-sm"
              >
                {perfil?.nombre ?? user.user_metadata?.nombre ?? user.email}
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => router.push("/perfil/actualizar")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Actualizar Perfil
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

      {/* Contenido Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h2>
            <p className="text-gray-600">
              Bienvenido a tu panel de usuario. Aquí puedes ver tu información
              registrada.
            </p>
          </div>

          {/* Datos del usuario */}
          {cargandoPerfil ? (
            <div className="text-center text-gray-500">Cargando datos...</div>
          ) : perfil ? (
            <div className="max-w-xl mx-auto">
              <div className="bg-blue-50 rounded-lg p-6 shadow">
                <h3 className="text-xl font-bold text-blue-800 mb-4">
                  Datos personales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <span className="font-semibold">Nombre:</span>{" "}
                    {perfil.nombre || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Correo:</span>{" "}
                    {perfil.correo || user.email}
                  </div>
                  <div>
                    <span className="font-semibold">Rol:</span>{" "}
                    {perfil.rol || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Tipo de persona:</span>{" "}
                    {perfil.tipo_persona || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Cédula:</span>{" "}
                    {perfil.cedula || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">RUC:</span>{" "}
                    {perfil.ruc || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Dirección:</span>{" "}
                    {perfil.direccion || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Teléfono:</span>{" "}
                    {perfil.telefono || "-"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-600">
              No se pudo cargar la información de tu perfil.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
