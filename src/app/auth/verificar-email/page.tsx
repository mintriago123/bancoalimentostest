'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  useVerifyEmail,
  AuthButton,
  AuthMessage,
  AUTH_CONSTANTS,
} from '@/modules/auth';

function ContenidoVerificarEmail() {
  const searchParams = useSearchParams();
  const { estaCargando, mensaje, emailVerificado, reenviarEmail } = useVerifyEmail();
  const [emailReenvio, setEmailReenvio] = useState(searchParams.get('email') || '');

  const manejarReenviar = async () => {
    if (emailReenvio) {
      await reenviarEmail(emailReenvio);
    }
  };

  if (estaCargando) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando email...</p>
      </div>
    );
  }

  if (emailVerificado) {
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
        <h3 className="text-xl font-bold text-green-700 mb-2">¡Email Verificado!</h3>
        {mensaje && <div className="mb-6"><AuthMessage mensaje={mensaje} /></div>}
        <Link
          href={AUTH_CONSTANTS.RUTAS.INICIAR_SESION}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Ir al Inicio de Sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Verificar Email
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          {mensaje?.tipo === 'error'
            ? 'Hubo un problema con la verificación.'
            : 'Verificando tu dirección de email...'}
        </p>
      </div>

      {mensaje && (
        <div className="mb-6">
          <AuthMessage mensaje={mensaje} />
        </div>
      )}

      <div className="text-center space-y-4">
        <p className="text-gray-600">
          Si no recibiste el email de verificación, puedes solicitar que se reenvíe.
        </p>

        {emailReenvio && (
          <div className="mb-4">
            <input
              type="email"
              value={emailReenvio}
              onChange={(e) => setEmailReenvio(e.target.value)}
              placeholder="tu@correo.com"
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/70 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
            />
          </div>
        )}

        <AuthButton
          onClick={manejarReenviar}
          disabled={estaCargando || !emailReenvio}
          cargando={estaCargando}
          textoNormal="Reenviar Email de Verificación"
          textoCargando="Enviando..."
        />

        <div className="pt-4">
          <Link
            href={AUTH_CONSTANTS.RUTAS.INICIAR_SESION}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </>
  );
}

// Componente de carga
function CargandoVerificacion() {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  );
}

export default function PaginaVerificarEmail() {
  return (
    <Suspense fallback={<CargandoVerificacion />}>
      <ContenidoVerificarEmail />
    </Suspense>
  );
} 