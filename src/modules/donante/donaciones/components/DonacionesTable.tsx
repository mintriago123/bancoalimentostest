import { Eye, Edit, Trash2, Clock, CheckCircle, XCircle, Calendar, Package } from 'lucide-react';
import { Donacion } from '../types';
import { useDateFormatter } from '@/modules/shared/hooks/useDateFormatter';

interface DonacionesTableProps {
  donaciones: Donacion[];
  onVerDetalle: (donacion: Donacion) => void;
  onEditar: (donacion: Donacion) => void;
  onEliminar: (id: number) => void;
}

export function DonacionesTable({
  donaciones,
  onVerDetalle,
  onEditar,
  onEliminar,
}: DonacionesTableProps) {
  const { formatDate } = useDateFormatter();

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

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return <Clock className="w-4 h-4" />;
      case 'Recogida':
        return <Calendar className="w-4 h-4" />;
      case 'Entregada':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelada':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Fecha Disponible
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Impacto
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {donaciones.map((donacion) => (
              <tr key={donacion.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donacion.tipo_producto}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {donacion.categoria_comida}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="font-medium">{donacion.cantidad}</span>
                  <span className="text-gray-500 ml-1">{donacion.unidad_simbolo}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getEstadoIcon(donacion.estado)}
                    <span className={getEstadoBadge(donacion.estado)}>
                      {donacion.estado}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(donacion.fecha_disponible)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {donacion.impacto_estimado_personas ? (
                    <span className="text-purple-600 font-medium">
                      ~{donacion.impacto_estimado_personas} personas
                    </span>
                  ) : (
                    <span className="text-gray-400">No calculado</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onVerDetalle(donacion)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {donacion.estado === 'Pendiente' && (
                      <>
                        <button
                          onClick={() => onEditar(donacion)}
                          className="text-green-600 hover:text-green-800"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onEliminar(donacion.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
