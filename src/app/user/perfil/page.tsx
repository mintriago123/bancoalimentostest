'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import {
  UserIcon,
  AtSymbolIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  CalendarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  email?: string;
  nombre: string;
  cedula?: string;
  telefono: string;
  direccion: string;
  tipo_persona: string;
  created_at?: string;
  updated_at?: string;
}

export default function UserPerfilPage() {
  const router = useRouter();
  const { supabase, user } = useSupabase();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setMessage({ type: 'error', text: 'Usuario no autenticado' });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw new Error('No se pudieron cargar los datos del perfil');
        }

        if (!data) {
          throw new Error('No se encontró el perfil del usuario');
        }

        const combinedProfile: UserProfile = {
          ...data,
          email: authUser.user?.email || data.email || ''
        };

        setProfile(combinedProfile);
        setFormData({
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          direccion: data.direccion || ''
        });

        setMessage(null);
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error.message || 'Error al cargar los datos del perfil'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (message?.type === 'error') setMessage(null);
  };

  const validateForm = (): string | null => {
    if (!formData.nombre.trim()) {
      return 'El nombre es obligatorio';
    }
    if (formData.telefono && formData.telefono.replace(/\D/g, '').length !== 10) {
      return 'El teléfono debe tener 10 dígitos';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const updateData = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw new Error('Error al actualizar el perfil: ' + error.message);

      const { data: updatedData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedData) {
        const { data: authUser } = await supabase.auth.getUser();
        setProfile({
          ...updatedData,
          email: authUser.user?.email || updatedData.email || ''
        });
      }

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el perfil</h2>
            <p className="text-gray-600 mb-6">No se pudieron cargar los datos del perfil.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Perfil de Usuario"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
        </div>
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}


        <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto">
                {getUserInitials(profile.nombre)}
              </div>
              <button
                className="absolute bottom-0 right-0 bg-gray-600 text-white p-1.5 rounded-full hover:bg-gray-700 transition"
                title="Cambiar foto (Próximamente)"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{profile.nombre}</h2>
            {/* <p className="text-gray-500 text-sm">{profile.email}</p> */}
          </div>
              
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <AtSymbolIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>
              
            {/* Cédula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificación
              </label>
              <div className="relative">
                <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Tu número de teléfono (10 dígitos)"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Ingresa un número de teléfono válido de 10 dígitos</p>
            </div>
              
            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Tu dirección completa"
                />
              </div>
            </div>
              
            {/* Pie: fechas y botón */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-6 border-t border-gray-200 gap-4">
              {/* Fechas */}
              <div className="text-sm text-gray-500">
                <p>Registrado: {formatDate(profile.created_at)}</p>
                {profile.updated_at && <p>Última actualización: {formatDate(profile.updated_at)}</p>}
              </div>
              
              {/* Botón */}
              <button
                type="submit"
                disabled={isSaving}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center text-sm font-medium"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        </div>



      </div>
    </DashboardLayout>
  );
}
