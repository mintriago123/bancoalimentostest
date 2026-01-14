'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { UserProfileCard } from '@/modules/shared';
import { Loader2 } from 'lucide-react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

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
  latitud?: number | null;
  longitud?: number | null;
}

export default function OperadorPerfilPage() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setError('Usuario no autenticado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const { data: authUser } = await supabase.auth.getUser();

        const { data, error: fetchError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setProfile({
            ...data,
            email: authUser.user?.email || data.email || '',
          });
        }
      } catch (err: any) {
        console.error('Error al cargar perfil:', err);
        setError(err.message || 'Error al cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, supabase]);

  const handleEdit = () => {
    router.push('/perfil/actualizar');
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="OPERADOR">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout requiredRole="OPERADOR">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar el perfil
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'No se pudieron cargar los datos del perfil.'}
            </p>
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
    <DashboardLayout requiredRole="OPERADOR" title="Mi Perfil">
      <div className="max-w-3xl mx-auto">
        <UserProfileCard
          profile={profile}
          onEdit={handleEdit}
          showMap={true}
        />
      </div>
    </DashboardLayout>
  );
}
