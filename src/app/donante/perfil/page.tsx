'use client';

import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { usePerfilData } from '@/modules/donante/perfil/hooks';
import {
  PerfilHeader,
  PerfilAvatar,
  PerfilForm,
  PerfilInfo,
  MessageAlert,
} from '@/modules/donante/perfil/components';

export default function UserPerfilPage() {
  const { supabase, user } = useSupabase();

  const {
    profile,
    isLoading,
    isSaving,
    message,
    formData,
    handleInputChange,
    handleSubmit,
  } = usePerfilData(supabase, user);

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
      <div className="max-w-4xl mx-auto">
        <PerfilHeader />

        {message && <MessageAlert message={message} />}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PerfilAvatar profile={profile} />
          <PerfilForm
            profile={profile}
            formData={formData}
            isSaving={isSaving}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </div>

        <PerfilInfo profile={profile} />
      </div>
    </DashboardLayout>
  );
}
