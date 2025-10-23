import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { FoodFormValues, FoodRecord } from '../types';

const BASE_CATEGORIES = [
  'Granos y Cereales',
  'Legumbres',
  'Lácteos',
  'Carnes y Proteínas',
  'Frutas',
  'Verduras',
  'Aceites y Grasas',
  'Condimentos',
  'Bebidas',
  'Productos Enlatados',
  'Otros'
];

interface FoodModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: FoodRecord | null;
  onClose: () => void;
  onSubmit: (values: FoodFormValues) => Promise<void>;
}

const FoodModal = ({ open, mode, initialData, onClose, onSubmit }: FoodModalProps) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(initialData?.nombre ?? '');
      const categoriaActual = initialData?.categoria ?? '';
      if (categoriaActual && !BASE_CATEGORIES.includes(categoriaActual)) {
        setCategoria('personalizada');
        setCategoriaPersonalizada(categoriaActual);
      } else {
        setCategoria(categoriaActual || '');
        setCategoriaPersonalizada('');
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!nombre.trim()) return;

    setSubmitting(true);
    await onSubmit({ nombre, categoria, categoriaPersonalizada });
    setSubmitting(false);
  };

  if (!open) return null;

  const showCustomField = categoria === 'Otros' || categoria === 'personalizada';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {mode === 'create' ? 'Registrar alimento' : 'Editar alimento'}
            </h2>
            <p className="text-xs text-slate-500">Completa la información requerida para el catálogo.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-600">Nombre del alimento</label>
            <input
              id="nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej. Arroz integrales"
              required
            />
          </div>

          <div>
            <label htmlFor="categoria" className="mb-1 block text-sm font-medium text-slate-600">Categoría</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Selecciona una categoría</option>
              {BASE_CATEGORIES.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="personalizada">Agregar nueva categoría</option>
            </select>
          </div>

          {showCustomField && (
            <div>
              <label htmlFor="categoriaPersonalizada" className="mb-1 block text-sm font-medium text-slate-600">Nombre de categoría personalizada</label>
              <input
                id="categoriaPersonalizada"
                value={categoriaPersonalizada}
                onChange={(event) => setCategoriaPersonalizada(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Ej. Productos sin gluten"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === 'create' ? 'Registrar' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodModal;
