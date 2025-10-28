'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useRegister,
  RoleSelector,
  AuthInput,
  PasswordInput,
  AuthButton,
  AuthMessage,
  AUTH_CONSTANTS,
  type Rol,
} from '@/modules/auth';

export default function PaginaRegistroSimple() {
  const { registrar, estaCargando, mensaje, registroExitoso, irALogin, limpiarMensaje } = useRegister();

  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [datos, setDatos] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos((d) => ({ ...d, [e.target.name]: e.target.value }));
    limpiarMensaje();
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolSeleccionado) {
      return;
    }
    await registrar({
      ...datos,
      rol: rolSeleccionado,
    });
  };

  if (registroExitoso) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
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
        <h2 className="text-2xl font-bold text-gray-900">¡Registro exitoso!</h2>
        {mensaje && <AuthMessage mensaje={mensaje} />}
        <AuthButton
          onClick={irALogin}
          textoNormal="Ir al inicio de sesión"
          variant="primary"
        />
      </div>
    );
  }

  return (
    <form className="space-y-4 max-w-md mx-auto" onSubmit={manejarEnvio}>
      <h2 className="text-2xl font-bold text-center">Registro</h2>

      <RoleSelector
        rolSeleccionado={rolSeleccionado}
        onSeleccionarRol={setRolSeleccionado}
      />

      {rolSeleccionado && (
        <>
          <input type="hidden" name="rol" value={rolSeleccionado} />
          <p className="text-center text-gray-500">
            Rol: <b>{rolSeleccionado}</b>
          </p>

          <div className="space-y-3">
            <AuthInput
              id="email"
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="tu@correo.com"
              value={datos.email}
              onChange={manejarCambio}
              required
              disabled={estaCargando}
            />

            <PasswordInput
              id="password"
              name="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={datos.password}
              onChange={manejarCambio}
              required
              minLength={AUTH_CONSTANTS.MIN_PASSWORD_LENGTH}
              disabled={estaCargando}
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar contraseña"
              placeholder="Confirma tu contraseña"
              value={datos.confirmPassword}
              onChange={manejarCambio}
              required
              minLength={AUTH_CONSTANTS.MIN_PASSWORD_LENGTH}
              disabled={estaCargando}
            />
          </div>

          {mensaje && <AuthMessage mensaje={mensaje} onClose={limpiarMensaje} />}

          <AuthButton
            type="submit"
            disabled={estaCargando}
            cargando={estaCargando}
            textoNormal="Crear cuenta"
            textoCargando="Creando..."
          />

          <button
            type="button"
            onClick={() => {
              setRolSeleccionado(null);
              limpiarMensaje();
            }}
            className="text-sm text-blue-600 underline w-full mt-2 hover:text-blue-700 transition-colors"
          >
            Cambiar rol
          </button>
        </>
      )}

      <div className="text-center text-sm text-gray-600 mt-4">
        ¿Ya tienes una cuenta?{' '}
        <Link
          href={AUTH_CONSTANTS.RUTAS.INICIAR_SESION}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Inicia sesión aquí
        </Link>
      </div>
    </form>
  );
}