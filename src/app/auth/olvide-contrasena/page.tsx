'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import {
  useForgotPassword,
  AuthInput,
  AuthButton,
  AuthMessage,
  AUTH_CONSTANTS,
} from '@/modules/auth';

export default function PaginaOlvideContrasena() {
  const { enviarRecuperacion, estaCargando, mensaje, limpiarMensaje } = useForgotPassword();
  const [email, setEmail] = useState('');

  const manejarEnvio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await enviarRecuperacion({ email });
  };

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

      <form className="space-y-6" onSubmit={manejarEnvio}>
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            limpiarMensaje();
          }}
          required
          autoComplete="email"
          disabled={estaCargando}
        />

        {mensaje && <AuthMessage mensaje={mensaje} onClose={limpiarMensaje} />}

        <AuthButton
          type="submit"
          disabled={estaCargando}
          cargando={estaCargando}
          textoNormal="Enviar Enlace de Restablecimiento"
          textoCargando="Enviando..."
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