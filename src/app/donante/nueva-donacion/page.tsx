'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Package, MapPin, Heart } from 'lucide-react';
import {
  StepIndicator,
  StepHeader,
  StepNavigation,
  ProductSelector,
  CustomProductForm,
  ImpactCalculator,
  ImpactEquivalenceTable,
  DonationSummary,
  useProductSelector,
  useCatalogData,
  useUserProfile,
  useMultiStepForm,
  useFormValidation,
  useNuevaDonacionSubmit,
  HORARIOS_DISPONIBLES,
  calcularImpacto
} from '@/modules/donante';

export default function NuevaDonacionPage() {
  const { supabase, user: currentUser, isLoading: authLoading } = useSupabase();

  // Hook de navegación multi-paso
  const { pasoActual, siguientePaso: avanzarPaso, pasoAnterior, resetearPaso } = useMultiStepForm(3);

  // Hook para cargar catálogos
  const { alimentos, unidades, cargandoAlimentos, cargandoUnidades, categoriasUnicas } = useCatalogData(supabase, authLoading);

  // Hook para perfil de usuario
  const { userProfile } = useUserProfile(supabase, currentUser, authLoading);

  // Hook para envío de donación
  const { enviando, mensaje, enviarDonacion, limpiarMensaje } = useNuevaDonacionSubmit(supabase, currentUser, userProfile);

  // Hook para validación de formulario
  const { mensajeValidacion, setMensajeValidacion, limpiarMensajeValidacion } = useFormValidation();

  // Hook para selector de productos
  const {
    busquedaAlimento,
    alimentosFiltrados,
    mostrarDropdown,
    alimentoSeleccionado,
    filtroCategoria,
    mostrarFormularioNuevoProducto,
    nuevoProducto,
    manejarBusquedaAlimento,
    manejarFocusInput,
    manejarSeleccionProducto,
    manejarSeleccionPersonalizado,
    limpiarSeleccion,
    manejarCambioCategoria,
    manejarBlurContainer,
    manejarCambioNuevoProducto,
  } = useProductSelector(
    alimentos,
    (id: string, nombrePersonalizado?: string) => {
      setFormulario(prev => ({
        ...prev,
        tipo_producto: id,
        producto_personalizado_nombre: nombrePersonalizado || prev.producto_personalizado_nombre
      }));
    },
    limpiarMensaje
  );

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    // Paso 1: Información del producto
    tipo_producto: '',
    producto_personalizado_nombre: '',
    cantidad: '',
    unidad_id: '',
    fecha_vencimiento: '',

    // Paso 2: Logística
    fecha_disponible: '',
    direccion_entrega: '',
    horario_preferido: '',

    // Paso 3: Detalles adicionales
    observaciones: '',
  });

  // Inicializar dirección cuando se carga el perfil
  useEffect(() => {
    if (userProfile?.direccion && !formulario.direccion_entrega) {
      setFormulario(prev => ({
        ...prev,
        direccion_entrega: userProfile.direccion
      }));
    }
  }, [userProfile]);

  // Obtener información del producto seleccionado
  const getProductoSeleccionado = () => {
    if (formulario.tipo_producto === 'personalizado') {
      return {
        nombre: formulario.producto_personalizado_nombre,
        categoria: nuevoProducto.categoria
      };
    }

    const alimento = alimentos.find(a => a.id.toString() === formulario.tipo_producto);
    return alimento ? { nombre: alimento.nombre, categoria: alimento.categoria } : null;
  };

  // Obtener información de la unidad seleccionada
  const getUnidadSeleccionada = () => {
    const unidad = unidades.find(u => u.id.toString() === formulario.unidad_id);
    return unidad || null;
  };

  // Cálculo de impacto estimado usando la utilidad
  const calcularImpactoEstimado = () => {
    const unidadSeleccionada = getUnidadSeleccionada();
    if (!unidadSeleccionada) {
      return { personasAlimentadas: 0, comidaEquivalente: '' };
    }
    return calcularImpacto(formulario.cantidad, unidadSeleccionada.simbolo);
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    limpiarMensajeValidacion();
  };

  const validarPaso = (paso: number): boolean => {
    switch (paso) {
      case 1:
        if (!formulario.tipo_producto || !formulario.cantidad || !formulario.unidad_id) {
          setMensajeValidacion('Por favor, completa la información del producto.');
          return false;
        }
        if (formulario.tipo_producto === 'personalizado') {
          if (!formulario.producto_personalizado_nombre.trim() || !nuevoProducto.categoria.trim()) {
            setMensajeValidacion('Por favor, completa la información del producto personalizado.');
            return false;
          }
        }
        if (parseFloat(formulario.cantidad) <= 0) {
          setMensajeValidacion('La cantidad debe ser mayor a 0.');
          return false;
        }
        break;
      case 2:
        if (!formulario.fecha_disponible.trim() || !formulario.direccion_entrega.trim()) {
          setMensajeValidacion('Por favor, completa la información de logística.');
          return false;
        }
        const fechaSeleccionada = new Date(formulario.fecha_disponible);
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0);
        if (fechaSeleccionada < fechaHoy) {
          setMensajeValidacion('La fecha de disponibilidad no puede ser anterior a hoy.');
          return false;
        }
        break;
    }
    return true;
  };

  const siguientePaso = () => {
    if (validarPaso(pasoActual)) {
      avanzarPaso();
      limpiarMensajeValidacion();
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarPaso(pasoActual)) {
      return;
    }

    const impacto = calcularImpactoEstimado();
    const productoInfo = getProductoSeleccionado();
    const unidadInfo = getUnidadSeleccionada();

    const exito = await enviarDonacion(
      formulario,
      nuevoProducto,
      impacto,
      productoInfo,
      unidadInfo,
      alimentos
    );

    if (exito) {
      // Reiniciar formulario
      setFormulario({
        tipo_producto: '',
        producto_personalizado_nombre: '',
        cantidad: '',
        unidad_id: '',
        fecha_vencimiento: '',
        fecha_disponible: '',
        direccion_entrega: userProfile?.direccion || '',
        horario_preferido: '',
        observaciones: '',
      });
      limpiarSeleccion();
      resetearPaso();
    }
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <div className="space-y-6">
            <StepHeader 
              icon={Package}
              title="Información del Producto"
              description="Selecciona qué vas a donar"
              iconColor="text-green-600"
            />

            <div className="space-y-4">
              <div className="relative" onBlur={manejarBlurContainer}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria de Alimentos *</label>

                <div className="mb-3">
                  <select
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={filtroCategoria}
                    onChange={manejarCambioCategoria}
                  >
                    <option value="">Todas las categorías</option>
                    {categoriasUnicas.map((categoria) => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <ProductSelector
                  busqueda={busquedaAlimento}
                  onBusquedaChange={manejarBusquedaAlimento}
                  onFocus={manejarFocusInput}
                  alimentoSeleccionado={alimentoSeleccionado}
                  onLimpiarSeleccion={limpiarSeleccion}
                  mostrarDropdown={mostrarDropdown}
                  cargando={cargandoAlimentos}
                  alimentosFiltrados={alimentosFiltrados}
                  onSeleccionarProducto={manejarSeleccionProducto}
                  onSeleccionarPersonalizado={manejarSeleccionPersonalizado}
                />
              </div>

              {mostrarFormularioNuevoProducto && (
                <CustomProductForm
                  nombre={nuevoProducto.nombre}
                  categoria={nuevoProducto.categoria}
                  categoriasDisponibles={categoriasUnicas}
                  onChange={manejarCambioNuevoProducto}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
                  <input
                    type="number"
                    name="cantidad"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={formulario.cantidad}
                    onChange={manejarCambio}
                    placeholder="0"
                    min="0.1"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ingresa la cantidad disponible</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unidad de Medida *</label>
                  <select
                    name="unidad_id"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={formulario.unidad_id}
                    onChange={manejarCambio}
                  >
                    <option value="">Selecciona una unidad</option>
                    {cargandoUnidades ? (
                      <option disabled>Cargando unidades...</option>
                    ) : (
                      unidades.map((unidad) => (
                        <option key={unidad.id} value={unidad.id.toString()}>
                          {unidad.nombre} ({unidad.simbolo})
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">La unidad afecta el cálculo de impacto</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento (opcional)</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formulario.fecha_vencimiento}
                  onChange={manejarCambio}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <ImpactEquivalenceTable />

              <ImpactCalculator
                impacto={calcularImpactoEstimado()}
                mostrar={!!(formulario.cantidad && formulario.unidad_id)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <StepHeader 
              icon={MapPin}
              title="Logística de Entrega"
              description="Dinos cuándo y dónde podemos recoger tu donación"
              iconColor="text-purple-600"
            />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Disponible *</label>
                <input
                  type="date"
                  name="fecha_disponible"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formulario.fecha_disponible}
                  onChange={manejarCambio}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Entrega *</label>
                <input
                  type="text"
                  name="direccion_entrega"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formulario.direccion_entrega}
                  onChange={manejarCambio}
                  placeholder="Calle, número, ciudad, provincia"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario Preferido (opcional)</label>
                <select
                  name="horario_preferido"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formulario.horario_preferido}
                  onChange={manejarCambio}
                >
                  <option value="">Selecciona un horario</option>
                  {HORARIOS_DISPONIBLES.map((horario) => (
                    <option key={horario.value} value={horario.value}>
                      {horario.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        const { personasAlimentadas, comidaEquivalente } = calcularImpactoEstimado();
        const productoFinal = getProductoSeleccionado();
        const unidadFinal = getUnidadSeleccionada();
        return (
          <div className="space-y-6">
            <StepHeader 
              icon={Heart}
              title="Confirmación y Detalles Adicionales"
              description="Revisa tu donación y añade cualquier observación"
              iconColor="text-red-600"
            />

            <div className="space-y-4">
              <DonationSummary
                donante={userProfile?.nombre || currentUser?.email || 'Usuario Anónimo'}
                producto={productoFinal}
                cantidad={formulario.cantidad}
                unidad={unidadFinal}
                fechaDisponible={formulario.fecha_disponible}
                direccion={formulario.direccion_entrega}
                horario={formulario.horario_preferido}
                horarioLabel={HORARIOS_DISPONIBLES.find(h => h.value === formulario.horario_preferido)?.label}
                personasAlimentadas={personasAlimentadas}
                comidaEquivalente={comidaEquivalente}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones Adicionales (opcional)</label>
                <textarea
                  name="observaciones"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formulario.observaciones}
                  onChange={manejarCambio}
                  placeholder="Cualquier información adicional que consideres importante..."
                  rows={4}
                  maxLength={500}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
            {mensaje && (
              <div className={`p-4 mb-6 rounded-lg text-white ${
                mensaje.includes('exitosa') ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {mensaje}
              </div>
            )}
            {mensajeValidacion && (
              <div className="p-4 mb-6 rounded-lg text-white bg-yellow-500">
                {mensajeValidacion}
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <h1 className="text-xl sm:text-2xl font-extrabold text-blue-700">Nueva Donación</h1>
              <StepIndicator
                currentStep={pasoActual}
                totalSteps={3}
                stepLabels={['Producto', 'Logística', 'Confirmación']}
              />
            </div>

            <form onSubmit={manejarEnvio}>
              {renderPaso()}

              <StepNavigation
                pasoActual={pasoActual}
                totalPasos={3}
                onAnterior={pasoAnterior}
                onSiguiente={siguientePaso}
                onEnviar={manejarEnvio}
                enviando={enviando}
              />
            </form>
          </div>
        </main>

        <footer className="bg-white shadow-sm p-4 mt-8">
          <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
