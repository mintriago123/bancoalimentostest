import {
  UserIcon,
  AtSymbolIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/app/components';
import { PerfilFormData, UserProfile } from '../types';

interface PerfilFormProps {
  profile: UserProfile;
  formData: PerfilFormData;
  isSaving: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PerfilForm({
  profile,
  formData,
  isSaving,
  onInputChange,
  onSubmit,
}: PerfilFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo *
        </label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={onInputChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Tu nombre completo"
            required
          />
        </div>
      </div>

      {/* Email (solo lectura) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email (Solo lectura)
        </label>
        <div className="relative">
          <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            id="email"
            value={profile.email || ''}
            disabled
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
      </div>

      {/* Identificación (solo lectura) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Identificación (Solo lectura)
        </label>
        <div className="relative">
          <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={profile.cedula || 'No especificada'}
            disabled
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Cédula de identidad - No modificable</p>
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono
        </label>
        <div className="relative">
          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={onInputChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Tu número de teléfono (10 dígitos)"
            maxLength={10}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ingresa un número de teléfono válido de 10 dígitos
        </p>
      </div>

      {/* Dirección */}
      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
          Dirección
        </label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={onInputChange}
            rows={3}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            placeholder="Tu dirección completa"
          />
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
        >
          {isSaving ? (
            <>
              <div className="inline-block mr-2">
                <LoadingSpinner size="sm" color="gray" />
              </div>
              Guardando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  );
}
