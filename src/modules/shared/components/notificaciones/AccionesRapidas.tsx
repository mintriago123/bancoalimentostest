'use client';

interface AccionesRapidasProps {
  readonly onActivarTodas: () => void;
  readonly onDesactivarTodas: () => void;
  readonly guardando: boolean;
}

export function AccionesRapidas({
  onActivarTodas,
  onDesactivarTodas,
  guardando
}: AccionesRapidasProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
      <div className="flex gap-4">
        <button
          onClick={onActivarTodas}
          disabled={guardando}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {guardando ? 'Guardando...' : 'Activar Todas'}
        </button>
        <button
          onClick={onDesactivarTodas}
          disabled={guardando}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {guardando ? 'Guardando...' : 'Desactivar Todas'}
        </button>
      </div>
    </div>
  );
}
