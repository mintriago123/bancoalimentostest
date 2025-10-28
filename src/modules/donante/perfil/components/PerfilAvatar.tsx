import { CameraIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '../types';

interface PerfilAvatarProps {
  profile: UserProfile;
}

export function PerfilAvatar({ profile }: PerfilAvatarProps) {
  const getUserInitials = (name: string) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="text-center mb-6">
      <div className="relative inline-block">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto">
          {getUserInitials(profile.nombre)}
        </div>
        <button
          className="absolute bottom-0 right-0 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          title="Cambiar foto (Próximamente)"
        >
          <CameraIcon className="w-5 h-5" />
        </button>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">{profile.nombre}</h2>
      <p className="text-gray-500 text-sm">{profile.email}</p>
    </div>
  );
}
