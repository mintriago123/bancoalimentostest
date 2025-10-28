'use client';

import { DashboardLayout } from '@/app/components';
import { UserSettings } from '@/modules/shared';

export default function UserConfiguracionPage() {
  return (
    <DashboardLayout title="Configuración de Usuario" description="Gestiona tus preferencias y seguridad">
      <UserSettings />
    </DashboardLayout>
  );
}
