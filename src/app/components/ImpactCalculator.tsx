import { Heart, Info } from 'lucide-react';

interface ImpactoData {
  personasAlimentadas: number;
  comidaEquivalente: string;
}

interface ImpactCalculatorProps {
  impacto: ImpactoData;
  mostrar: boolean;
}

export default function ImpactCalculator({ impacto, mostrar }: ImpactCalculatorProps) {
  if (!mostrar) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
      <h4 className="font-medium text-purple-800 mb-3 flex items-center">
        <Heart className="w-5 h-5 mr-2" />
        Impacto Estimado de tu Donación
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-700">
            ~{impacto.personasAlimentadas}
          </div>
          <div className="text-sm text-purple-600">
            personas podrían alimentarse
          </div>
        </div>
        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="text-lg font-semibold text-purple-700">
            {impacto.comidaEquivalente}
          </div>
          <div className="text-sm text-purple-600">
            equivalencia alimentaria
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-purple-600 bg-white bg-opacity-40 rounded p-2">
        <div className="flex items-center">
          <Info className="w-3 h-3 mr-1" />
          *Estimación basada en promedios generales. El impacto real puede variar según el tipo de alimento y las necesidades específicas.
        </div>
      </div>
    </div>
  );
}
