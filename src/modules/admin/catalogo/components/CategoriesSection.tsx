import { useState } from 'react';
import { Trash2, Package } from 'lucide-react';

interface CategoryWithCount {
  nombre: string;
  cantidad: number;
}

interface CategoriesSectionProps {
  categories: CategoryWithCount[];
  onDeleteCategory: (categoryName: string) => void;
}

const CategoriesSection = ({ categories, onDeleteCategory }: CategoriesSectionProps) => {
  // Filtrar la categoría "todos" ya que no es una categoría real
  const realCategories = categories.filter(cat => cat.nombre !== 'todos');

  if (realCategories.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-12 text-center shadow-sm">
        <div className="text-slate-400">No hay categorías registradas.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Gestión de Categorías</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {realCategories.map((category) => {
            const isSinCategoria = category.nombre === 'Sin categoría';
            
            return (
              <div
                key={category.nombre}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-indigo-500" />
                      <h4 className="font-semibold text-slate-800 text-sm">
                        {category.nombre}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      {category.cantidad} alimento{category.cantidad !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {!isSinCategoria && (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(category.nombre)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      title={`Eliminar categoría ${category.nombre}`}
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
