'use client';

interface AccionesNotificacionesProps {
  readonly conteoNoLeidas: number;
  readonly seleccionadas: number;
  readonly onMarcarTodasLeidas: () => void;
  readonly onMarcarSeleccionadasLeidas: () => void;
  readonly onEliminarSeleccionadas: () => void;
}

export function AccionesNotificaciones({
  conteoNoLeidas,
  seleccionadas,
  onMarcarTodasLeidas,
  onMarcarSeleccionadasLeidas,
  onEliminarSeleccionadas
}: AccionesNotificacionesProps) {
  return (
    <div className="flex gap-2">
      {conteoNoLeidas > 0 && seleccionadas === 0 && (
        <button
          onClick={onMarcarTodasLeidas}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Marcar todas como leídas
        </button>
      )}
      
      {seleccionadas > 0 && (
        <>
          <button
            onClick={onMarcarSeleccionadasLeidas}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Marcar como leídas ({seleccionadas})
          </button>
          <button
            onClick={onEliminarSeleccionadas}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Eliminar ({seleccionadas})
          </button>
        </>
      )}
    </div>
  );
}
