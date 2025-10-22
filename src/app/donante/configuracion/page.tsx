'use client';

import { DashboardLayout, UserSettings } from '@/app/components';

export default function UserConfiguracionPage() {
  return (
    <DashboardLayout title="Configuración de Usuario" description="Gestiona tus preferencias y seguridad">
      <UserSettings />
    </DashboardLayout>
  );
}
