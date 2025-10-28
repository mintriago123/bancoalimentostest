'use client';

import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { DashboardUserCards, useDatosBasicosUsuario } from '@/modules/user';

export default function UsuarioDashboardPage() {
  const { user, supabase } = useSupabase();
  const { userData } = useDatosBasicosUsuario(supabase, user?.id);

  return (
    <DashboardLayout
      requiredRole="SOLICITANTE"
      title="Inicio del Usuario"
      description="Panel principal con acceso a tus funcionalidades."
    >
      <DashboardUserCards nombre={userData?.nombre} />
    </DashboardLayout>
  );
}
