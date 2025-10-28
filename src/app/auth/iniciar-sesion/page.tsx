'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  useLogin,
  AuthInput,
  PasswordInput,
  AuthButton,
  AuthMessage,
  AUTH_CONSTANTS,
} from '@/modules/auth';

// Componente para manejar los parámetros de búsqueda
function FormularioIniciarSesion() {
  const searchParams = useSearchParams();
  const registroExitoso = searchParams.get('registro') === 'exitoso';
  const verificacionExitosa = searchParams.get('verificacion') === 'exitoso';
  const errorParam = searchParams.get('error');

  const { login, estaCargando, mensaje, limpiarMensaje } = useLogin();

  const [datosFormulario, setDatosFormulario] = useState({ email: '', password: '' });
  const [mensajeInicial, setMensajeInicial] = useState<string | null>(
    errorParam === 'blocked'
      ? 'Tu cuenta ha sido bloqueada. Contacta al administrador.'
      : errorParam === 'deactivated'
      ? 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      : registroExitoso
      ? AUTH_CONSTANTS.MENSAJES.REGISTRO_EXITOSO
      : verificacionExitosa
      ? AUTH_CONSTANTS.MENSAJES.VERIFICACION_EXITOSA
      : null
  );

  useEffect(() => {
    if (mensajeInicial) {
      const temporizador = setTimeout(() => setMensajeInicial(null), 5000);
      return () => clearTimeout(temporizador);
    }
  }, [mensajeInicial]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));
    limpiarMensaje();
    setMensajeInicial(null);
  };

  const manejarEnvio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensajeInicial(null);
    await login(datosFormulario);
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Bienvenido de Vuelta
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          ¿No tienes una cuenta?{' '}
          <Link
            href={AUTH_CONSTANTS.RUTAS.REGISTRAR}
            className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
          >
            Crea una aquí
          </Link>
        </p>
      </div>

      {mensajeInicial && (
        <div className="mb-4">
          <AuthMessage
            mensaje={{
              tipo: errorParam ? 'error' : 'exito',
              texto: mensajeInicial,
            }}
            onClose={() => setMensajeInicial(null)}
          />
        </div>
      )}

      <form className="space-y-6" onSubmit={manejarEnvio}>
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu@correo.com"
          value={datosFormulario.email}
          onChange={manejarCambio}
          required
          autoComplete="email"
          disabled={estaCargando}
        />

        <PasswordInput
          id="password"
          name="password"
          label="Contraseña"
          placeholder="••••••••"
          value={datosFormulario.password}
          onChange={manejarCambio}
          required
          autoComplete="current-password"
          disabled={estaCargando}
        />

        {mensaje && (
          <AuthMessage mensaje={mensaje} onClose={limpiarMensaje} />
        )}

        <div className="flex items-center justify-end text-sm">
          <Link
            href={AUTH_CONSTANTS.RUTAS.OLVIDE_CONTRASENA}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <AuthButton
          type="submit"
          disabled={estaCargando}
          cargando={estaCargando}
          textoNormal="Iniciar Sesión"
          textoCargando="Iniciando sesión..."
        />
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