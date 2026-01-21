'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useProfileForm, useProfileUpdate } from '@/modules/shared';
import { Loader2, Save, MapPin, Phone, User, Building2, FileText, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

// Lazy load del componente de mapa para mejor rendimiento
const MapboxLocationPicker = lazy(() => import('@/modules/shared/components/MapboxLocationPicker'));

export default function ActualizarPerfil() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const {
    form,
    handleChange,
    updateMultipleFields,
    updateLocation,
    validateTelefono,
  } = useProfileForm();

  const {
    loading: guardando,
    error,
    success: exito,
    setError,
    updateProfile,
  } = useProfileUpdate(supabase);

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoadingProfile(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        setError("No se pudo obtener el usuario autenticado.");
        setIsLoadingProfile(false);
        return;
      }

      const userId = userData.user.id;
      
      // Cargar perfil con coordenadas
      const { data, error: fetchError } = await supabase
        .from('usuarios')
        .select('tipo_persona, cedula, ruc, nombre, direccion, telefono, latitud, longitud')
        .eq('id', userId)
        .single();

      if (!fetchError && data) {
        updateMultipleFields(data);
      }
      setIsLoadingProfile(false);
    };

    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.telefono || !validateTelefono(form.telefono)) {
      setError("El número de teléfono debe tener 10 dígitos.");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      setError("No se pudo obtener el usuario autenticado.");
      return;
    }
    const userId = userData.user.id;

    const success = await updateProfile(userId, {
      direccion: form.direccion,
      telefono: form.telefono,
      latitud: form.latitud,
      longitud: form.longitud,
    });

    if (success) {
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  };

  if (isLoadingProfile) {
    return (
      <DashboardLayout title="Actualizar Perfil">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Cargando datos del perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Actualizar Perfil">
      <div className="max-w-3xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al perfil</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Actualizar Información</h1>
          <p className="text-gray-500 mt-1">Modifica tu dirección y teléfono de contacto</p>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {exito && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{exito}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="space-y-6">
          {/* Información de solo lectura */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                Información Personal
              </h2>
              <p className="text-sm text-gray-500 mt-1">Datos que no pueden ser modificados</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Tipo de Persona */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      Tipo de Persona
                    </span>
                  </label>
                  <div className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200 text-gray-700">
                    {form.tipo_persona === 'Natural' ? 'Persona Natural' : 'Persona Jurídica'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {form.tipo_persona === 'Natural' ? 'Cédula' : 'RUC'}
                    </span>
                  </label>
                  <div className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-mono">
                    {form.tipo_persona === 'Natural' ? form.cedula : form.ruc}
                  </div>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {form.tipo_persona === 'Natural' ? 'Nombre Completo' : 'Razón Social'}
                  </span>
                </label>
                <div className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200 text-gray-700">
                  {form.nombre || 'No especificado'}
                </div>
              </div>
            </div>
          </div>

          {/* Información editable */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Ubicación y Contacto
              </h2>
              <p className="text-sm text-gray-500 mt-1">Actualiza tu dirección y teléfono</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Mapa de ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Dirección
                  </span>
                </label>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-72 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-sm">Cargando mapa...</span>
                      </div>
                    </div>
                  }
                >
                  <MapboxLocationPicker
                    initialAddress={form.direccion}
                    initialLatitude={form.latitud || -2.1894}
                    initialLongitude={form.longitud || -79.8891}
                    onLocationSelect={updateLocation}
                    placeholder="Buscar tu dirección..."
                  />
                </Suspense>
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Teléfono de Contacto
                  </span>
                </label>
                <input
                  name="telefono"
                  id="telefono"
                  type="tel"
                  placeholder="0999999999"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={form.telefono}
                  onChange={handleChange}
                  inputMode="numeric"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-2">Ingresa un número de 10 dígitos</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-all"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
