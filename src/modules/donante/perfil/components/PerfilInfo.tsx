import { UserProfile } from '../types';
import { formatLongDate } from '@/lib/dateUtils';

interface PerfilInfoProps {
  profile: UserProfile;
}

export function PerfilInfo({ profile }: PerfilInfoProps) {
  return (
    <div className="mt-8 text-sm text-gray-600 space-y-1">
      <p>Registrado: {formatLongDate(profile.created_at)}</p>
      {profile.updated_at && <p>Última actualización: {formatLongDate(profile.updated_at)}</p>}
    </div>
  );
}
