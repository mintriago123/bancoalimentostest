'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { FECHAS } from '@/lib/constantes';

function ContenidoVerificarEmail() {
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();
  
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    const verificarEmail = async () => {
      try {
        // Supabase maneja automáticamente la verificación de email
        // cuando el usuario hace clic en el enlace del correo
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError('Error al verificar el email: ' + error.message);
        } else if (session?.user?.email_confirmed_at) {
          setMensajeExito('¡Email verificado exitosamente! Ya puedes iniciar sesión.');
          // Actualizar el estado de verificación en nuestra tabla personalizada
          if (session.user) {
            await supabase
              .from('usuarios')
              .update({ 
                email_verified: true,
                updated_at: FECHAS.ahora()
              })
              .eq('id', session.user.id);
          }
        } else {
          setError('El enlace de verificación no es válido o ha expirado.');
        }
      } catch {
        setError('Ocurrió un error inesperado.');
      } finally {
        setEstaCargando(false);
      }
    };

    verificarEmail();
  }, [supabase]);

  const reenviarEmail = async () => {
    setEstaCargando(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: searchParams.get('email') ?? '',
      });

      if (error) {
        setError(error.message);
      } else {
        setMensajeExito('Se ha reenviado el email de verificación. Por favor, revisa tu bandeja de entrada.');
      }
    } catch {
      setError('Ocurrió un error al reenviar el email.');
    } finally {
      setEstaCargando(false);
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

  if (mensajeExito) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-700 mb-2">¡Email Verificado!</h3>
        <p className="text-gray-600 mb-6">{mensajeExito}</p>
        <Link
          href="/auth/iniciar-sesion"
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
          {error ? 'Hubo un problema con la verificación.' : 'Verificando tu dirección de email...'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="text-center space-y-4">
        <p className="text-gray-600">
          Si no recibiste el email de verificación, puedes solicitar que se reenvíe.
        </p>
        
        <button
          onClick={reenviarEmail}
          disabled={estaCargando}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {estaCargando ? 'Enviando...' : 'Reenviar Email de Verificación'}
        </button>

        <div className="pt-4">
          <Link href="/auth/iniciar-sesion" className="text-sm font-medium text-blue-600 hover:text-blue-500">
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