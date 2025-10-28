/**
 * Componente de input estándar para formularios de autenticación
 */

import React from 'react';

interface AuthInputProps {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  minLength,
  maxLength,
  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-bold text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disabled}
        className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/70 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
