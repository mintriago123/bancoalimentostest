/**
 * @fileoverview Componente para mostrar errores en el módulo de donaciones.
 */

interface DonationsErrorStateProps {
  message: string;
  onRetry: () => void;
}

const DonationsErrorState = ({ message, onRetry }: DonationsErrorStateProps) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
    <div>
      <h3 className="text-sm font-semibold text-red-800">Error al cargar las donaciones</h3>
      <p className="text-sm text-red-700 mt-1">{message}</p>
    </div>
    <button
      type="button"
      onClick={onRetry}
      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      Reintentar
    </button>
  </div>
);

export default DonationsErrorState;
