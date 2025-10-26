'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import {
  UserIcon,
  AtSymbolIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  email?: string;
  nombre: string;
  cedula?: string;
  ruc?: string;
  telefono: string;
  direccion: string;
  rol: string;
  tipo_persona: string;
  representante?: string;
  created_at?: string;
  updated_at?: string;
}

export default function OperadorPerfilPage() {
  const { supabase, user } = useSupabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    representante: ''
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
          console.error('Error de consulta:', error);
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
          direccion: data.direccion || '',
          representante: data.representante || ''
        });
        
        setMessage(null);
      } catch (error: any) {
        console.error('Error al cargar perfil:', error);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (message?.type === 'error') {
      setMessage(null);
    }
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
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const updateData: any = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        updated_at: new Date().toISOString()
      };

      if (profile?.tipo_persona === 'Juridica') {
        updateData.representante = formData.representante.trim();
      }

      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error de actualización:', error);
        throw new Error('Error al actualizar el perfil: ' + error.message);
      }

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
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al actualizar el perfil' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="OPERADOR" title="Mi Perfil">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4" />
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      requiredRole="OPERADOR"
      title="Mi Perfil"
      description="Gestiona tu información personal"
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Alert messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 mt-0.5" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Profile header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-orange-600" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{profile?.nombre || 'Operador'}</h2>
              <p className="opacity-90">{profile?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                Operador
              </span>
            </div>
          </div>
        </div>

        {/* Profile information cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <IdentificationIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm">
                  <strong>Identificación:</strong> {profile?.tipo_persona === 'Natural' ? profile?.cedula : profile?.ruc}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <UserIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm">
                  <strong>Tipo:</strong> {profile?.tipo_persona === 'Natural' ? 'Persona Natural' : 'Persona Jurídica'}
                </span>
              </div>
              {profile?.created_at && (
                <div className="flex items-center gap-3 text-gray-600">
                  <CalendarIcon className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">
                    <strong>Miembro desde:</strong> {new Date(profile.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <AtSymbolIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm break-all">
                  <strong>Email:</strong> {profile?.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <PhoneIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm">
                  <strong>Teléfono:</strong> {profile?.telefono || 'No especificado'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPinIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm">
                  <strong>Dirección:</strong> {profile?.direccion || 'No especificada'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-orange-600" />
            Editar Información
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Representante (solo para personas jurídicas) */}
            {profile?.tipo_persona === 'Juridica' && (
              <div>
                <label htmlFor="representante" className="block text-sm font-medium text-gray-700 mb-2">
                  Representante legal
                </label>
                <input
                  type="text"
                  id="representante"
                  name="representante"
                  value={formData.representante}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="0999999999"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Formato: 10 dígitos</p>
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
