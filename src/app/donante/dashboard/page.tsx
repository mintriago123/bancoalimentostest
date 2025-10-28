'use client';

import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { usePerfilData } from '@/modules/donante/perfil/hooks';
import { DashboardCardsGrid } from '@/modules/donante/dashboard/components';

export default function UsuarioDashboardPage() {
  const { supabase, user } = useSupabase();
  const { profile, isLoading: loadingUser } = usePerfilData(supabase, user);

  return (
    <DashboardLayout
      requiredRole="DONANTE"
      title="Inicio del Usuario"
      description="Panel principal con acceso a tus funcionalidades."
    >
      {loadingUser ? (
        <div className="animate-pulse space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ) : (
        <DashboardCardsGrid nombre={profile?.nombre} />
      )}
    </DashboardLayout>
  );
}
