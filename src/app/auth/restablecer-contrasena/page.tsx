'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/app/components/SupabaseProvider';

export default function PaginaRestablecerContrasena() {
  const router = useRouter();
  const { supabase } = useSupabase();
  
  const [datosFormulario, setDatosFormulario] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [estaCargando, setEstaCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmPassword, setVerConfirmPassword] = useState(false);

  useEffect(() => {
    // Verificar si hay un token de acceso en la URL (Supabase maneja esto automáticamente)
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('El enlace de restablecimiento no es válido o ha expirado.');
      }
    };
    
    verificarSesion();
  }, [supabase.auth]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const manejarEnvio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (datosFormulario.password !== datosFormulario.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (datosFormulario.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setEstaCargando(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: datosFormulario.password
      });

      if (error) {
        setError(error.message);
      } else {
        setMensajeExito('Contraseña actualizada exitosamente. Serás redirigido al inicio de sesión.');
        setTimeout(() => {
          router.push('/auth/iniciar-sesion');
        }, 2000);
      }
    } catch {
      setError('Ocurrió un error inesperado.');
    } finally {
      setEstaCargando(false);
    }
  };

  const clasesInput = "block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/70 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200";
  const clasesLabel = "block mb-2 text-sm font-bold text-gray-700";
  const clasesBoton = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50";

  if (mensajeExito) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-700 mb-2">¡Contraseña Actualizada!</h3>
        <p className="text-gray-600 mb-4">{mensajeExito}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Restablecer Contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Ingresa tu nueva contraseña.
        </p>
      </div>

      <form className="space-y-6" onSubmit={manejarEnvio}>
        <div>
          <label htmlFor="password" className={clasesLabel}>
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={verPassword ? "text" : "password"}
              required
              className={clasesInput + ' pr-12'}
              placeholder="••••••••"
              value={datosFormulario.password}
              onChange={manejarCambio}
              minLength={6}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center cursor-pointer focus:outline-none group bg-transparent border-none"
              onClick={() => setVerPassword((v) => !v)}
              aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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

        <div>
          <label htmlFor="confirmPassword" className={clasesLabel}>
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={verConfirmPassword ? "text" : "password"}
              required
              className={clasesInput + ' pr-12'}
              placeholder="••••••••"
              value={datosFormulario.confirmPassword}
              onChange={manejarCambio}
              minLength={6}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center cursor-pointer focus:outline-none group bg-transparent border-none"
              onClick={() => setVerConfirmPassword((v) => !v)}
              aria-label={verConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <svg
                className={`w-5 h-5 block pointer-events-none ${verConfirmPassword ? 'text-blue-600' : 'text-gray-400'}`}
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

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <button type="submit" disabled={estaCargando} className={clasesBoton}>
            {estaCargando ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </div>

        <div className="text-center">
          <Link href="/auth/iniciar-sesion" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </>
  );
} 