import { Donacion } from '../types';

interface DonacionEdicionModalProps {
  donacion: Donacion;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function DonacionEdicionModal({
  donacion,
  isOpen,
  onClose,
  onSave,
  onChange,
}: DonacionEdicionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Editar Donación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Producto
            </label>
            <input
              type="text"
              name="tipo_producto"
              value={donacion.tipo_producto}
              onChange={onChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="categoria_comida"
              value={donacion.categoria_comida}
              onChange={onChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="Verduras">Verduras</option>
              <option value="Frutas">Frutas</option>
              <option value="Carnes">Carnes</option>
              <option value="Lácteos">Lácteos</option>
              <option value="Granos">Granos</option>
              <option value="Enlatados">Enlatados</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input
              type="number"
              name="cantidad"
              value={donacion.cantidad === 0 ? '' : donacion.cantidad}
              onChange={onChange}
              min="0.01"
              step="0.1"
              placeholder="Ingrese la cantidad"
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Disponible
            </label>
            <input
              type="date"
              name="fecha_disponible"
              value={donacion.fecha_disponible}
              onChange={onChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección de Entrega
            </label>
            <input
              type="text"
              name="direccion_entrega"
              value={donacion.direccion_entrega}
              onChange={onChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horario Preferido
            </label>
            <input
              type="text"
              name="horario_preferido"
              value={donacion.horario_preferido || ''}
              onChange={onChange}
              placeholder="Ej: 9:00 AM - 5:00 PM"
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              value={donacion.observaciones || ''}
              onChange={onChange}
              rows={3}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex-1"
          >
            Guardar Cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
