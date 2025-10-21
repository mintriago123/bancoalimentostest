import { Info } from 'lucide-react';

export default function ImpactEquivalenceTable() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-3 flex items-center">
        <Info className="w-5 h-5 mr-2" />
        Tabla de Equivalencias de Impacto
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h5 className="font-semibold text-blue-700 mb-2">Por Kilogramo (kg):</h5>
          <ul className="text-blue-600 space-y-1">
            <li>• 1 kg = ~2 personas alimentadas</li>
            <li>• 1 kg = ~3 porciones</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-blue-700 mb-2">Por Litro (l):</h5>
          <ul className="text-blue-600 space-y-1">
            <li>• 1 l = ~1.5 personas</li>
            <li>• Bebidas y líquidos</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-blue-700 mb-2">Por Caja:</h5>
          <ul className="text-blue-600 space-y-1">
            <li>• 1 caja = ~4 personas</li>
            <li>• Alimentos empaquetados</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-blue-700 mb-2">Por Unidad:</h5>
          <ul className="text-blue-600 space-y-1">
            <li>• 1 unidad = ~0.5 personas</li>
            <li>• Productos individuales</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
