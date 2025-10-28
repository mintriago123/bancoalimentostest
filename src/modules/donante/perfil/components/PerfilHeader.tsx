import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export function PerfilHeader() {
  const router = useRouter();

  return (
    <div className="mb-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver
      </button>

      <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
      <p className="text-gray-600 mt-2">
        Aquí puedes actualizar tu información personal y de contacto
      </p>
    </div>
  );
}
