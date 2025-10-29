import { Donacion } from '../types';
import { useDateFormatter } from '@/modules/shared/hooks/useDateFormatter';

interface DonacionDetalleModalProps {
  donacion: Donacion;
  isOpen: boolean;
  onClose: () => void;
}

export function DonacionDetalleModal({ donacion, isOpen, onClose }: DonacionDetalleModalProps) {
  const { formatDate } = useDateFormatter();

  if (!isOpen) return null;

  const getEstadoBadge = (estado: string) => {
    const base = 'px-3 py-1 text-xs font-semibold rounded-full border ';
    switch (estado) {
      case 'Pendiente':
        return base + 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Recogida':
        return base + 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Entregada':
        return base + 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelada':
        return base + 'bg-red-100 text-red-800 border-red-300';
      default:
        return base + 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Detalles de la Donación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Información del Producto</h4>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <p>
                  <span className="font-medium">Tipo:</span> {donacion.tipo_producto}
                </p>
                <p>
                  <span className="font-medium">Categoría:</span> {donacion.categoria_comida}
                </p>
                <p>
                  <span className="font-medium">Cantidad:</span> {donacion.cantidad}{' '}
                  {donacion.unidad_simbolo}
                </p>
                {donacion.fecha_vencimiento && (
                  <p>
                    <span className="font-medium">Vencimiento:</span>{' '}
                    {formatDate(donacion.fecha_vencimiento)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Información de Entrega</h4>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <p>
                  <span className="font-medium">Fecha disponible:</span>{' '}
                  {formatDate(donacion.fecha_disponible)}
                </p>
                <p>
                  <span className="font-medium">Dirección:</span> {donacion.direccion_entrega}
                </p>
                {donacion.horario_preferido && (
                  <p>
                    <span className="font-medium">Horario:</span> {donacion.horario_preferido}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Estado e Impacto</h4>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={getEstadoBadge(donacion.estado)}>{donacion.estado}</span>
                </div>
                {donacion.impacto_estimado_personas && (
                  <p>
                    <span className="font-medium">Impacto estimado:</span>{' '}
                    {donacion.impacto_estimado_personas} personas
                  </p>
                )}
                {donacion.impacto_equivalente && (
                  <p>
                    <span className="font-medium">Equivalente:</span> {donacion.impacto_equivalente}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Contacto</h4>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <p>
                  <span className="font-medium">Teléfono:</span> {donacion.telefono}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {donacion.email}
                </p>
              </div>
            </div>
          </div>

          {donacion.observaciones && (
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-700 mb-2">Observaciones</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <p>{donacion.observaciones}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
