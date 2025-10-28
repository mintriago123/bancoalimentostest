import { Heart } from 'lucide-react';

interface DonacionesHeaderProps {
  totalDonaciones: number;
}

export function DonacionesHeader({ totalDonaciones }: DonacionesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-900">Mis Donaciones</h1>
      <div className="flex items-center space-x-2">
        <Heart className="w-6 h-6 text-red-500" />
        <span className="text-lg font-semibold text-gray-700">
          {totalDonaciones} donaciones realizadas
        </span>
      </div>
    </div>
  );
}
