import { Heart } from 'lucide-react';

interface DonacionesEmptyStateProps {
  filtroEstado: string;
}

export function DonacionesEmptyState({ filtroEstado }: DonacionesEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Heart className="w-16 h-16 text-gray-400 mx-auto" />
      <p className="text-gray-500 mt-2">
        {filtroEstado === 'todos'
          ? 'No has registrado ninguna donación aún.'
          : `No tienes donaciones con estado "${filtroEstado}".`}
      </p>
    </div>
  );
}
