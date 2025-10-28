'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import {
  useResetPassword,
  PasswordInput,
  AuthButton,
  AuthMessage,
  AUTH_CONSTANTS,
} from '@/modules/auth';

export default function PaginaRestablecerContrasena() {
  const {
    restablecerContrasena,
    estaCargando,
    mensaje,
    sesionValida,
    verificandoSesion,
    limpiarMensaje,
  } = useResetPassword();

  const [datosFormulario, setDatosFormulario] = useState({
    password: '',
    confirmPassword: '',
  });

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));
    limpiarMensaje();
  };

  const manejarEnvio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await restablecerContrasena(datosFormulario);
  };

  if (verificandoSesion) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando enlace...</p>
      </div>
    );
  }

  if (mensaje?.tipo === 'exito') {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-700 mb-2">
          ¡Contraseña Actualizada!
        </h3>
        <p className="text-gray-600 mb-4">{mensaje.texto}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Restablecer Contraseña
        </h2>
        <p className="mt-2 text-sm text-gray-700">Ingresa tu nueva contraseña.</p>
      </div>

      <form className="space-y-6" onSubmit={manejarEnvio}>
        <PasswordInput
          id="password"
          name="password"
          label="Nueva Contraseña"
          placeholder="••••••••"
          value={datosFormulario.password}
          onChange={manejarCambio}
          required
          minLength={AUTH_CONSTANTS.MIN_PASSWORD_LENGTH}
          disabled={estaCargando || !sesionValida}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar Nueva Contraseña"
          placeholder="••••••••"
          value={datosFormulario.confirmPassword}
          onChange={manejarCambio}
          required
          minLength={AUTH_CONSTANTS.MIN_PASSWORD_LENGTH}
          disabled={estaCargando || !sesionValida}
        />

        {mensaje && <AuthMessage mensaje={mensaje} onClose={limpiarMensaje} />}

        <AuthButton
          type="submit"
          disabled={estaCargando || !sesionValida}
          cargando={estaCargando}
          textoNormal="Actualizar Contraseña"
          textoCargando="Actualizando..."
        />

        <div className="text-center">
          <Link
            href={AUTH_CONSTANTS.RUTAS.INICIAR_SESION}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </>
  );
} 