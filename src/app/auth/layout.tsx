import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-200 px-4 py-8">
      {/* Botón de inicio */}
      <div className="absolute top-6 right-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-base font-semibold text-blue-700 bg-white/70 backdrop-blur-md border border-blue-200/60 rounded-xl shadow-md hover:bg-white/90 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="hidden sm:inline">Regresar al inicio</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-full bg-white/70 p-3 shadow-lg mb-3">
            <Image
              src="/favicon2.ico"
              alt="Logo del Banco de Alimentos"
              width={64}
              height={64}
              priority
              className="drop-shadow-xl"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight text-center drop-shadow-sm">
            Banco de Alimentos
          </h1>
          <p className="mt-1 text-sm text-blue-700 text-center font-medium">
            Proyecto de Vinculación con la Sociedad &bull; ULEAM
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl px-8 py-10 sm:p-10 border border-blue-100/60">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 