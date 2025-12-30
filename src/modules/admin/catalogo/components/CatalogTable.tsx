import { Pencil, Trash2 } from 'lucide-react';
import type { FoodRecord } from '../types';

interface CatalogTableProps {
  foods: FoodRecord[];
  onEdit: (food: FoodRecord) => void;
  onDelete: (food: FoodRecord) => void;
}

const CatalogTable = ({ foods, onEdit, onDelete }: CatalogTableProps) => {
  if (foods.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-12 text-center shadow-sm">
        <div className="text-slate-400">No se encontraron alimentos con los filtros aplicados.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="overflow-x-auto">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {foods.map(food => (
                <tr key={food.id} className="transition-colors duration-150 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{food.nombre}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {food.categoria || <span className="italic text-slate-400">Sin categoría</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(food)}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(food)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CatalogTable;
