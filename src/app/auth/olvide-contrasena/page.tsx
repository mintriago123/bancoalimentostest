'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/components/SupabaseProvider';

export default function PaginaOlvideContrasena() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarEnvio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEstaCargando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/restablecer-contrasena`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMensajeExito('Se ha enviado un enlace de restablecimiento a tu correo electrónico. Por favor, revisa tu bandeja de entrada.');
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

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Recuperar Contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {mensajeExito && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {mensajeExito}
        </div>
      )}

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <button type="submit" disabled={estaCargando} className={clasesBoton}>
            {estaCargando ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
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