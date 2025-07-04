"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // Asegúrate de tener Heroicons instalado

import InicioUsuario from '../user/inicio/page';

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
                <ChevronDownIcon
                  className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
                    menuAbierto ? "rotate-0" : "rotate-270"
                  }`}
                />
              </button>

              {menuAbierto && (
                
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  
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

      {/* Contenido del dashboard del solicitante */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InicioUsuario />
      </main>

    </div>
  );
}
  
