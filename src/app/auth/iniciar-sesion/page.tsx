'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/app/components/SupabaseProvider';

// Componente para manejar los parámetros de búsqueda
function FormularioIniciarSesion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registroExitoso = searchParams.get('registro') === 'exitoso';
  const verificacionExitosa = searchParams.get('verificacion') === 'exitoso';

  const { supabase } = useSupabase();

  const [datosFormulario, setDatosFormulario] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(
    registroExitoso ? '¡Registro exitoso! Ahora puedes iniciar sesión.' :
    verificacionExitosa ? '¡Correo verificado exitosamente! Ya puedes iniciar sesión.' : null
  );
  const [estaCargando, setEstaCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  useEffect(() => {
    if (mensajeExito) {
      const temporizador = setTimeout(() => setMensajeExito(null), 5000);
      return () => clearTimeout(temporizador);
    }
  }, [mensajeExito]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

const manejarEnvio = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setEstaCargando(true);
  setError(null);
  setMensajeExito(null);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: datosFormulario.email,
      password: datosFormulario.password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      if (!data.user.email_confirmed_at) {
        setError('Por favor, verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
        await supabase.auth.signOut();
      } else {
        // Consultar perfil en la tabla personalizada
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('nombre, cedula, ruc, rol')
          .eq('id', data.user.id)
          .maybeSingle();

        // Si no existe el perfil (404 o perfil es null), o falta algún dato importante, redirige a completar
        if (!perfil || !perfil.nombre || (!perfil.cedula && !perfil.ruc)) {
          router.push('/perfil/completar');
        } else if (perfil.rol === 'ADMINISTRADOR') {
          router.push('/admin/dashboard');
        } else if (perfil.rol === 'DONANTE') {
          router.push('/donante/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      }
    }
  } catch {
    setError('Ocurrió un error inesperado al intentar iniciar sesión.');
  } finally {
    setEstaCargando(false);
  }
};

  const clasesInput = "block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/70 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200";
  const clasesLabel = "block mb-2 text-sm font-bold text-gray-700";
  const clasesBoton = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50";

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Bienvenido de Vuelta
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          ¿No tienes una cuenta?{' '}
          <Link href="/auth/registrar" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
            Crea una aquí
          </Link>
        </p>
      </div>

      {mensajeExito && <p className="text-sm text-center text-green-700 bg-green-100 p-3 rounded-lg mb-4">{mensajeExito}</p>}
      
      <form className="space-y-6" onSubmit={manejarEnvio}>
        <div>
          <label htmlFor="email" className={clasesLabel}>
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={clasesInput}
            placeholder="tu@correo.com"
            value={datosFormulario.email}
            onChange={manejarCambio}
          />
        </div>

        <div>
          <label htmlFor="password" className={clasesLabel}>
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={verPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="block w-full px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 bg-white/70 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
              placeholder="••••••••"
              value={datosFormulario.password}
              onChange={manejarCambio}
              style={{ MozAppearance: 'textfield' }}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-none border-none p-0 m-0 appearance-none overflow-visible focus:outline-none"
              onClick={() => setVerPassword((v) => !v)}
              aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{ lineHeight: 0 }}
            >
              <svg
                className={`w-5 h-5 block pointer-events-none ${verPassword ? 'text-blue-600' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

        <div className="flex items-center justify-end text-sm">
          <Link href="/auth/olvide-contrasena" className="font-medium text-blue-600 hover:text-blue-500">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div>
          <button type="submit" disabled={estaCargando} className={clasesBoton}>
            {estaCargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
    </>
  );
}

// Componente de carga
function CargandoFormulario() {
  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Bienvenido de Vuelta
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Cargando...
        </p>
      </div>
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function PaginaIniciarSesion() {
  return (
    <Suspense fallback={<CargandoFormulario />}>
      <FormularioIniciarSesion />
    </Suspense>
  );
} 