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
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowLeftIcon
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

export default function AdminPerfilPage() {
  const router = useRouter();
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
        
        // Obtener datos del usuario de Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        // Obtener datos del perfil desde la tabla usuarios
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

        // Combinar datos de auth y profile
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
    
    // Limpiar mensaje de error cuando el usuario empiece a escribir
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

      // Solo actualizar representante si es persona jurídica
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

      // Recargar los datos actualizados
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
      
      // Auto-hide success message after 3 seconds
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

  const getUserInitials = (name: string) => {
    if (!name) return 'AD';
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
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header con navegación */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil de Administrador</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu información personal y de contacto
          </p>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del perfil */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar y datos básicos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {getUserInitials(profile.nombre)}
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                    title="Cambiar foto (Próximamente)"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {profile.nombre || 'Administrador'}
                </h3>
                <p className="text-red-600 font-medium text-sm">
                  {profile.rol || 'ADMINISTRADOR'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {profile.email}
                </p>
              </div>

              {/* Información adicional */}
              <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  {profile.tipo_persona === 'Juridica' ? (
                    <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-500" />
                  ) : (
                    <IdentificationIcon className="w-4 h-4 mr-2 text-gray-500" />
                  )}
                  <span>Tipo: </span>
                  <span className="font-medium ml-1">
                    {profile.tipo_persona === 'Juridica' ? 'Persona Jurídica' : 'Persona Natural'}
                  </span>
                </div>
                
                {profile.cedula && (
                  <div className="flex items-center text-sm text-gray-600">
                    <IdentificationIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Cédula: </span>
                    <span className="font-medium ml-1">{profile.cedula}</span>
                  </div>
                )}
                
                {profile.ruc && (
                  <div className="flex items-center text-sm text-gray-600">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <span>RUC: </span>
                    <span className="font-medium ml-1">{profile.ruc}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Registrado: </span>
                  <span className="font-medium ml-1">{formatDate(profile.created_at)}</span>
                </div>
                
                {profile.updated_at && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                    <span>Actualizado: </span>
                    <span className="font-medium ml-1">{formatDate(profile.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Información del sistema */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Información del Sistema</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">ID de Usuario:</span>
                  <span className="font-mono text-blue-900 text-xs">{profile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Rol del Sistema:</span>
                  <span className="font-medium text-blue-900">{profile.rol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Estado:</span>
                  <span className="font-medium text-green-600">Activo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de edición */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Información Personal Editable
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre completo */}
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
                      onChange={handleInputChange}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    El email está vinculado a tu cuenta de autenticación y no se puede modificar aquí
                  </p>
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
                      value={profile.cedula || profile.ruc || 'No especificada'}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.tipo_persona === 'Juridica' ? 'RUC de la empresa' : 'Cédula de identidad'} - No modificable
                  </p>
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Tu dirección completa"
                    />
                  </div>
                </div>

                {/* Representante legal (solo para personas jurídicas) */}
                {profile.tipo_persona === 'Juridica' && (
                  <div>
                    <label htmlFor="representante" className="block text-sm font-medium text-gray-700 mb-2">
                      Representante Legal
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="representante"
                        name="representante"
                        value={formData.representante}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Nombre del representante legal"
                      />
                    </div>
                  </div>
                )}

                {/* Botón de guardar */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
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
        </div>
      </div>
    </DashboardLayout>
  );
}