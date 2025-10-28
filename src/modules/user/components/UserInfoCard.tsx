// ============================================================================
// Component: UserInfoCard
// Tarjeta de información del usuario solicitante
// ============================================================================

import React from 'react';
import { User, IdCard, Phone } from 'lucide-react';
import { UserProfile } from '../types';

interface UserInfoCardProps {
  userData: Pick<UserProfile, 'nombre' | 'cedula' | 'telefono'>;
}

export function UserInfoCard({ userData }: UserInfoCardProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-blue-800 mb-3 flex items-center">
        <User className="w-5 h-5 mr-2" />
        Información del Solicitante
      </h3>
      <div className="space-y-2 text-sm text-blue-700">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <p>
            <strong>Nombre:</strong> {userData.nombre}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IdCard className="w-4 h-4" />
          <p>
            <strong>Cédula:</strong> {userData.cedula}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <p>
            <strong>Teléfono:</strong> {userData.telefono}
          </p>
        </div>
      </div>
    </div>
  );
}
