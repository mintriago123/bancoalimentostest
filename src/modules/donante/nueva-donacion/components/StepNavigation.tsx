import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface StepNavigationProps {
  pasoActual: number;
  totalPasos: number;
  onAnterior: () => void;
  onSiguiente: () => void;
  onEnviar: (e: React.FormEvent) => void;
  enviando: boolean;
}

export default function StepNavigation({
  pasoActual,
  totalPasos,
  onAnterior,
  onSiguiente,
  onEnviar,
  enviando,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between mt-8">
      {pasoActual > 1 && (
        <button
          type="button"
          onClick={onAnterior}
          className="flex items-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Atrás
        </button>
      )}

      {pasoActual < totalPasos && (
        <button
          type="button"
          onClick={onSiguiente}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold ml-auto"
        >
          Siguiente <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      )}

      {pasoActual === totalPasos && (
        <button
          type="submit"
          disabled={enviando}
          className={`flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold ml-auto ${
            enviando ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {enviando ? 'Enviando...' : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              Enviar Donación
            </>
          )}
        </button>
      )}
    </div>
  );
}
