/**
 * Componente de botón estándar para formularios de autenticación
 */

import React from 'react';

interface AuthButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  cargando?: boolean;
  textoNormal: string;
  textoCargando?: string;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  type = 'button',
  onClick,
  disabled = false,
  cargando = false,
  textoNormal,
  textoCargando,
  variant = 'primary',
  fullWidth = true,
  className = '',
}) => {
  const baseClasses = `${
    fullWidth ? 'w-full' : ''
  } flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

  const variantClasses = {
    primary:
      'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary:
      'text-blue-700 bg-white border-blue-300 hover:bg-blue-50 focus:ring-blue-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || cargando}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {cargando ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {textoCargando || textoNormal}
        </>
      ) : (
        textoNormal
      )}
    </button>
  );
};
