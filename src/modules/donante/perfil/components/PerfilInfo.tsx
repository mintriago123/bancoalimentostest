import { UserProfile } from '../types';

interface PerfilInfoProps {
  profile: UserProfile;
}

export function PerfilInfo({ profile }: PerfilInfoProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="mt-8 text-sm text-gray-600 space-y-1">
      <p>Registrado: {formatDate(profile.created_at)}</p>
      {profile.updated_at && <p>Última actualización: {formatDate(profile.updated_at)}</p>}
    </div>
  );
}
