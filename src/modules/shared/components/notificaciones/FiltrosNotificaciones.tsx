'use client';

interface Filtros {
  tipo: string;
  categoria: string;
  estado: string;
}

interface FiltrosNotificacionesProps {
  readonly filtros: Filtros;
  readonly onFiltrosChange: (filtros: Filtros) => void;
}

const TIPOS_FILTRO = [
  { value: 'todos', label: 'Todos' },
  { value: 'info', label: 'Información' },
  { value: 'success', label: 'Éxito' },
  { value: 'warning', label: 'Advertencia' },
  { value: 'error', label: 'Error' }
];

const CATEGORIAS_FILTRO = [
  { value: 'todas', label: 'Todas' },
  { value: 'donacion', label: 'Donaciones' },
  { value: 'solicitud', label: 'Solicitudes' },
  { value: 'sistema', label: 'Sistema' },
  { value: 'usuario', label: 'Usuario' },
  { value: 'inventario', label: 'Inventario' }
];

export function FiltrosNotificaciones({ 
  filtros, 
  onFiltrosChange 
}: FiltrosNotificacionesProps) {
  const handleChange = (campo: keyof Filtros, valor: string) => {
    onFiltrosChange({ ...filtros, [campo]: valor });
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          id="tipo"
          value={filtros.tipo}
          onChange={(e) => handleChange('tipo', e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TIPOS_FILTRO.map(tipo => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          id="categoria"
          value={filtros.categoria}
          onChange={(e) => handleChange('categoria', e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIAS_FILTRO.map(categoria => (
            <option key={categoria.value} value={categoria.value}>
              {categoria.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          id="estado"
          value={filtros.estado}
          onChange={(e) => handleChange('estado', e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todas">Todas</option>
          <option value="no_leidas">Sin leer</option>
          <option value="leidas">Leídas</option>
        </select>
      </div>
    </div>
  );
}
