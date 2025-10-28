'use client';

import React from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { Alert } from '@/app/components';
import {
  UserIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { usePasswordChange, useUserPreferences, useMessage } from '@/modules/shared';

type Props = {
  title?: string;
  description?: string;
  showHeader?: boolean;
  showPreferences?: boolean;
  showPasswordChange?: boolean;
};

export default function UserSettings({
  title = 'Configuración de Usuario',
  description = 'Gestiona tus preferencias personales y de cuenta',
  showHeader = true,
  showPreferences = true,
  showPasswordChange = true,
}: Props) {
  const { supabase, user } = useSupabase();

  const { preferences, updatePreference, savePreferences, isSaving: savingPreferences } = useUserPreferences();
  const { message, showSuccess, showError } = useMessage();

  const {
    currentPassword,
    newPassword,
    confirmPassword,
    showPasswords,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    resetPasswords,
    validatePasswords,
  } = usePasswordChange();

  const handleSavePreferences = async () => {
    if (!user?.id) {
      showError('Usuario no autenticado');
      return;
    }

    const success = await savePreferences(supabase, user.id);
    if (success) {
      showSuccess('Preferencias guardadas con éxito');
    } else {
      showError('Error al guardar preferencias');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePasswords();
    if (!validation.valid) {
      showError(validation.error || 'Error de validación');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      showSuccess('Contraseña actualizada correctamente');
      resetPasswords();
    } catch {
      showError('Error al cambiar la contraseña');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {showHeader && (
        <>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
            <UserIcon className="w-7 h-7 mr-2 text-red-600" />
            {title}
          </h1>
          <p className="text-gray-600 mb-6">{description}</p>
        </>
      )}

      {message && (
        <div className="mb-6">
          <Alert
            tipo={message.type}
            mensaje={message.text}
          />
        </div>
      )}

      {showPreferences && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-red-600" />
            Preferencias
          </h2>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">Recibir Notificaciones</p>
              <p className="text-xs text-gray-500">Notificaciones sobre cambios importantes</p>
            </div>
            <button
              onClick={() => updatePreference('recibir_notificaciones', !preferences.recibir_notificaciones)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.recibir_notificaciones ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.recibir_notificaciones ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label htmlFor="idioma" className="block text-sm font-medium text-gray-700 mb-1">
              <GlobeAltIcon className="inline w-4 h-4 mr-1 text-red-600" />
              Idioma
            </label>
            <select
              id="idioma"
              value={preferences.idioma}
              onChange={(e) => updatePreference('idioma', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">Perfil Público</p>
              <p className="text-xs text-gray-500">Permitir que otros usuarios vean tu perfil</p>
            </div>
            <button
              onClick={() => updatePreference('perfil_publico', !preferences.perfil_publico)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.perfil_publico ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.perfil_publico ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {savingPreferences ? 'Guardando...' : 'Guardar Preferencias'}
            </button>
          </div>
        </div>
      )}

      {showPasswordChange && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-2">
            <KeyIcon className="w-5 h-5 mr-2 text-red-600" />
            Cambiar Contraseña
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {([
              ['current', 'Contraseña Actual', currentPassword, setCurrentPassword],
              ['new', 'Nueva Contraseña', newPassword, setNewPassword],
              ['confirm', 'Confirmar Contraseña', confirmPassword, setConfirmPassword],
            ] as [keyof typeof showPasswords, string, string, React.Dispatch<React.SetStateAction<string>>][]).map(
              ([field, label, value, setter]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={showPasswords[field] ? 'text' : 'password'}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords[field] ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium"
              >
                Cambiar Contraseña
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
