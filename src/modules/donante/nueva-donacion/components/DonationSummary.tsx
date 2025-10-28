interface ProductoInfo {
  nombre: string;
  categoria: string;
}

interface UnidadInfo {
  simbolo: string;
}

interface DonationSummaryProps {
  donante: string;
  producto: ProductoInfo | null;
  cantidad: string;
  unidad: UnidadInfo | null;
  fechaDisponible: string;
  direccion: string;
  horario?: string;
  horarioLabel?: string;
  personasAlimentadas: number;
  comidaEquivalente: string;
}

export default function DonationSummary({
  donante,
  producto,
  cantidad,
  unidad,
  fechaDisponible,
  direccion,
  horario,
  horarioLabel,
  personasAlimentadas,
  comidaEquivalente,
}: DonationSummaryProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-3">Resumen de tu Donación</h4>
      <div className="space-y-2 text-sm text-blue-700">
        <p><strong>Donante:</strong> {donante}</p>
        <p><strong>Producto:</strong> {producto?.nombre} ({producto?.categoria})</p>
        <p><strong>Cantidad:</strong> {cantidad} {unidad?.simbolo}</p>
        <p><strong>Fecha disponible:</strong> {new Date(fechaDisponible).toLocaleDateString('es-ES')}</p>
        <p><strong>Dirección:</strong> {direccion}</p>
        {horario && horarioLabel && (
          <p><strong>Horario:</strong> {horarioLabel}</p>
        )}
        <div className="bg-purple-100 p-3 rounded mt-3">
          <p className="font-medium text-purple-800">Impacto Estimado:</p>
          <p className="text-purple-700">• {personasAlimentadas} personas alimentadas</p>
          <p className="text-purple-700">• {comidaEquivalente}</p>
        </div>
      </div>
    </div>
  );
}
