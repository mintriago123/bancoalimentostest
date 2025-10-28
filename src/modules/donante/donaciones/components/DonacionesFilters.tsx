interface DonacionesFiltersProps {
  filtroEstado: string;
  onFiltroChange: (estado: string) => void;
  totalDonaciones: number;
  donacionesFiltradas: number;
}

export function DonacionesFilters({
  filtroEstado,
  onFiltroChange,
  totalDonaciones,
  donacionesFiltradas,
}: DonacionesFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
        <select
          value={filtroEstado}
          onChange={(e) => onFiltroChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Recogida">Recogidas</option>
          <option value="Entregada">Entregadas</option>
          <option value="Cancelada">Canceladas</option>
        </select>
        <span className="text-sm text-gray-500">
          Mostrando {donacionesFiltradas} de {totalDonaciones} donaciones
        </span>
      </div>
    </div>
  );
}
