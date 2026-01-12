import { FormEvent, useEffect, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { FoodFormValues, FoodRecord, Unidad } from '../types';

interface FoodModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: FoodRecord | null;
  unidadesDisponibles: Unidad[];
  loadingUnidades: boolean;
  categories: string[]; // Nueva prop para categorías dinámicas
  onClose: () => void;
  onSubmit: (values: FoodFormValues) => Promise<void>;
}

const FoodModal = ({ 
  open, 
  mode, 
  initialData, 
  unidadesDisponibles, 
  loadingUnidades, 
  categories,
  onClose, 
  onSubmit 
}: FoodModalProps) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState('');
  const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState<number[]>([]);
  const [unidadPrincipal, setUnidadPrincipal] = useState<number | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [mostrarSeccionUnidades, setMostrarSeccionUnidades] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(initialData?.nombre ?? '');
      const categoriaActual = initialData?.categoria ?? '';
      
      // Filtrar categorías reales (sin 'todos' ni 'Sin categoría')
      const categoriasReales = categories.filter(c => c !== 'todos' && c !== 'Sin categoría');
      
      if (categoriaActual && !categoriasReales.includes(categoriaActual)) {
        setCategoria('personalizada');
        setCategoriaPersonalizada(categoriaActual);
      } else {
        setCategoria(categoriaActual || '');
        setCategoriaPersonalizada('');
      }
      
      // Cargar unidades si estamos editando
      if (initialData?.unidades) {
        const unidadesIds = initialData.unidades.map(u => u.unidad_id);
        setUnidadesSeleccionadas(unidadesIds);
        const principal = initialData.unidades.find(u => u.es_principal);
        setUnidadPrincipal(principal?.unidad_id);
        setMostrarSeccionUnidades(unidadesIds.length > 0);
      } else {
        setUnidadesSeleccionadas([]);
        setUnidadPrincipal(undefined);
        setMostrarSeccionUnidades(false);
      }
    }
  }, [open, initialData, categories]);

  const toggleUnidad = (unidadId: number) => {
    setUnidadesSeleccionadas(prev => {
      const isSelected = prev.includes(unidadId);
      if (isSelected) {
        // Si se deselecciona y era la principal, limpiar principal
        if (unidadPrincipal === unidadId) {
          setUnidadPrincipal(undefined);
        }
        return prev.filter(id => id !== unidadId);
      } else {
        return [...prev, unidadId];
      }
    });
  };

  // Obtener el tipo de magnitud de las unidades ya seleccionadas
  const tipoMagnitudSeleccionado = unidadesSeleccionadas.length > 0
    ? unidadesDisponibles.find(u => u.id === unidadesSeleccionadas[0])?.tipo_magnitud_id
    : null;

  // Filtrar unidades disponibles según el tipo de magnitud seleccionado
  const unidadesFiltradasPorTipo = tipoMagnitudSeleccionado
    ? unidadesDisponibles.filter(u => u.tipo_magnitud_id === tipoMagnitudSeleccionado)
    : unidadesDisponibles;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!nombre.trim()) return;

    // Si es categoría personalizada, validar que se haya ingresado
    if (categoria === 'personalizada' && !categoriaPersonalizada.trim()) {
      return;
    }

    // Validar que se haya seleccionado al menos una unidad
    if (unidadesSeleccionadas.length === 0) {
      alert('Debes seleccionar al menos una unidad de medida');
      return;
    }

    setSubmitting(true);
    await onSubmit({ 
      nombre, 
      categoria, 
      categoriaPersonalizada,
      unidades_ids: unidadesSeleccionadas,
      unidad_principal_id: unidadPrincipal
    });
    setSubmitting(false);
  };

  // Agrupar unidades por tipo de magnitud (usar las filtradas)
  const unidadesPorTipo = unidadesFiltradasPorTipo.reduce((acc, unidad) => {
    const tipo = unidad.tipo_magnitud_id;
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(unidad);
    return acc;
  }, {} as Record<number, Unidad[]>);

  if (!open) return null;

  const showCustomField = categoria === 'personalizada';

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
              {categories
                .filter(cat => cat !== 'todos' && cat !== 'Sin categoría')
                .map(option => (
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

          {/* Sección de Unidades de Medida */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-medium text-slate-600">Unidades de Medida *</label>
                <p className="text-xs text-slate-500 mt-1">
                  Selecciona las unidades permitidas para este alimento
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarSeccionUnidades(!mostrarSeccionUnidades)}
                className="text-xs text-indigo-600 hover:text-indigo-700 underline"
              >
                {mostrarSeccionUnidades ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {mostrarSeccionUnidades && (
              <div className="space-y-4">
                {loadingUnidades ? (
                  <div className="text-sm text-slate-500 text-center py-4">
                    Cargando unidades...
                  </div>
                ) : unidadesDisponibles.length === 0 ? (
                  <div className="text-sm text-amber-600 text-center py-4">
                    No hay unidades disponibles. Contacta al administrador.
                  </div>
                ) : (
                  <>
                    {tipoMagnitudSeleccionado && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900">
                          ℹ️ Solo puedes seleccionar unidades del mismo tipo de magnitud para asegurar conversiones correctas
                        </p>
                      </div>
                    )}
                    <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-lg">
                    {Object.entries(unidadesPorTipo).map(([tipoId, unidades]) => {
                      const tipoMagnitudNombre = unidades[0]?.tipo_magnitud_nombre || `Tipo ${tipoId}`;
                      
                      return (
                        <div key={tipoId} className="space-y-2">
                          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            {tipoMagnitudNombre}
                          </p>
                        <div className="grid grid-cols-2 gap-2">
                          {unidades.map(unidad => {
                            const isSelected = unidadesSeleccionadas.includes(unidad.id);
                            const isPrincipal = unidadPrincipal === unidad.id;
                            
                            return (
                              <div key={unidad.id} className="relative">
                                <button
                                  type="button"
                                  onClick={() => toggleUnidad(unidad.id)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                    isSelected
                                      ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-900'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">{unidad.nombre}</div>
                                      <div className="text-xs text-slate-500">
                                        {unidad.simbolo}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                                    )}
                                  </div>
                                </button>
                                {isSelected && (
                                  <button
                                    type="button"
                                    onClick={() => setUnidadPrincipal(unidad.id)}
                                    className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                      isPrincipal
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-300 text-slate-600 hover:bg-green-400'
                                    }`}
                                    title={isPrincipal ? 'Unidad principal' : 'Marcar como principal'}
                                  >
                                    {isPrincipal ? '★ Principal' : 'Marcar'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  </>
                )}

                {unidadesSeleccionadas.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-900 mb-1">
                      {unidadesSeleccionadas.length} unidad{unidadesSeleccionadas.length !== 1 ? 'es' : ''} seleccionada{unidadesSeleccionadas.length !== 1 ? 's' : ''}
                    </p>
                    {!unidadPrincipal && (
                      <p className="text-xs text-amber-700">
                        ⚠️ Recomendado: Marca una unidad como principal
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

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
