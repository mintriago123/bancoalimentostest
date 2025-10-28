/**
 * Componente de input de contraseña con toggle para mostrar/ocultar
 */

import React, { useState } from 'react';

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  label,
  placeholder = '••••••••',
  value,
  onChange,
  required = false,
  autoComplete,
  minLength,
  disabled = false,
}) => {
  const [verPassword, setVerPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-bold text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={verPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          disabled={disabled}
          className="block w-full px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 bg-white/70 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ MozAppearance: 'textfield' }}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-none border-none p-0 m-0 appearance-none overflow-visible focus:outline-none"
          onClick={() => setVerPassword((v) => !v)}
          aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={{ lineHeight: 0 }}
        >
          <svg
            className={`w-5 h-5 block pointer-events-none ${
              verPassword ? 'text-blue-600' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
