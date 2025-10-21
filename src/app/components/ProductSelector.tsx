import { Plus, ShoppingBasket, X } from 'lucide-react';

interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
}

interface ProductSelectorProps {
  busqueda: string;
  onBusquedaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  alimentoSeleccionado: Alimento | null;
  onLimpiarSeleccion: () => void;
  mostrarDropdown: boolean;
  cargando: boolean;
  alimentosFiltrados: Alimento[];
  onSeleccionarProducto: (alimento: Alimento) => void;
  onSeleccionarPersonalizado: () => void;
}

export default function ProductSelector({
  busqueda,
  onBusquedaChange,
  onFocus,
  alimentoSeleccionado,
  onLimpiarSeleccion,
  mostrarDropdown,
  cargando,
  alimentosFiltrados,
  onSeleccionarProducto,
  onSeleccionarPersonalizado,
}: ProductSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Productos a donar *</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar o seleccionar producto..."
          className="w-full border-2 border-gray-300 rounded-lg pl-11 pr-12 py-3 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
          value={busqueda}
          onChange={onBusquedaChange}
          onFocus={onFocus}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none">
          <ShoppingBasket className="h-5 w-5" />
        </span>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          {alimentoSeleccionado && (
            <button
              type="button"
              onClick={onLimpiarSeleccion}
              className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors"
              title="Limpiar selección"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {mostrarDropdown && !alimentoSeleccionado && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {cargando ? (
            <div className="p-3 text-gray-500 text-center">Cargando productos...</div>
          ) : (
            <>
              {alimentosFiltrados.length > 0 ? (
                <>
                  {alimentosFiltrados.map((alimento) => (
                    <div
                      key={alimento.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => onSeleccionarProducto(alimento)}
                    >
                      <div className="font-medium text-gray-900">{alimento.nombre}</div>
                      <div className="text-sm text-gray-500">{alimento.categoria}</div>
                    </div>
                  ))}
                  <div
                    className="p-3 hover:bg-blue-50 cursor-pointer border-t border-gray-200 text-blue-600 font-medium"
                    onClick={onSeleccionarPersonalizado}
                  >
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar producto personalizado
                    </div>
                  </div>
                </>
              ) : busqueda ? (
                <div className="p-3 text-gray-500 text-center">
                  No se encontraron productos que coincidan con "{busqueda}"
                  <div
                    className="mt-2 text-blue-600 cursor-pointer hover:underline"
                    onClick={onSeleccionarPersonalizado}
                  >
                    + Crear producto personalizado
                  </div>
                </div>
              ) : (
                <div
                  className="p-3 hover:bg-blue-50 cursor-pointer text-blue-600 font-medium"
                  onClick={onSeleccionarPersonalizado}
                >
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar producto personalizado
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {busqueda && !cargando && !alimentoSeleccionado && (
        <p className="text-sm text-gray-500 mt-1">
          {alimentosFiltrados.length} producto{alimentosFiltrados.length !== 1 ? 's' : ''} encontrado{alimentosFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
