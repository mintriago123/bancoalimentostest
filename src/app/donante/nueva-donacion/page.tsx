'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { fetchAlimentos, fetchUnidades } from '@/services/catalogService';
import { calcularImpacto as calcularImpactoUtil } from '@/utils/impact';
import DashboardLayout from '@/app/components/DashboardLayout';
import { ChevronLeft, ChevronRight, Heart, Package, MapPin, Clock, Check, User, Info, Plus, Search, X } from 'lucide-react';

// Define los horarios disponibles para la recolección
const HORARIOS_DISPONIBLES = [
  { value: '08:00-10:00', label: '08:00 AM - 10:00 AM' },
  { value: '10:00-12:00', label: '10:00 AM - 12:00 PM' },
  { value: '12:00-14:00', label: '12:00 PM - 02:00 PM' },
  { value: '14:00-16:00', label: '02:00 PM - 04:00 PM' },
  { value: '16:00-18:00', label: '04:00 PM - 06:00 PM' },
  { value: '18:00-20:00', label: '06:00 PM - 08:00 PM' },
];

// Interfaces para los tipos de datos
interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
}

interface Unidad {
  id: number;
  nombre: string;
  simbolo: string;
}

interface UserProfile {
  id: string;
  rol: string;
  tipo_persona: 'Natural' | 'Juridica';
  nombre: string;
  ruc?: string;
  cedula?: string;
  direccion: string;
  telefono: string;
  representante?: string;
  email?: string;
}

export default function NuevaDonacionPage() {
  const { supabase, user: currentUser, isLoading: authLoading } = useSupabase();

  const [pasoActual, setPasoActual] = useState(1);
  const totalPasos = 3;

  // Estados para los catálogos
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargandoAlimentos, setCargandoAlimentos] = useState(true);
  const [cargandoUnidades, setCargandoUnidades] = useState(true);

  // Estado para el buscador de alimentos
  const [busquedaAlimento, setBusquedaAlimento] = useState('');
  const [alimentosFiltrados, setAlimentosFiltrados] = useState<Alimento[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<Alimento | null>(null);

  // Estado para el formulario de nuevo producto
  const [mostrarFormularioNuevoProducto, setMostrarFormularioNuevoProducto] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: ''
  });

  // Estado para la información del usuario logueado
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [formulario, setFormulario] = useState({
    // Paso 1: Información del producto
    tipo_producto: '',
    producto_personalizado_nombre: '',
    producto_personalizado_categoria: '',
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

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    (async () => {
      try {
        setCargandoAlimentos(true);
        setCargandoUnidades(true);
        const [alim, unid] = await Promise.all([
          fetchAlimentos(supabase),
          fetchUnidades(supabase),
        ]);
        setAlimentos(alim);
        setAlimentosFiltrados(alim);
        setUnidades(unid);
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        setMensaje('Error al cargar catálogos');
      } finally {
        setCargandoAlimentos(false);
        setCargandoUnidades(false);
      }
    })();

    if (!authLoading && currentUser !== undefined) {
      cargarPerfilUsuario(currentUser);
    }
  }, [currentUser, authLoading, supabase]);

  // Función para filtrar alimentos basado en la búsqueda
  const filtrarAlimentos = useCallback((termino: string) => {
    if (!termino.trim()) {
      setAlimentosFiltrados(alimentos);
      return;
    }

    const terminoLower = termino.toLowerCase();
    const filtrados = alimentos.filter(alimento => 
      alimento.nombre.toLowerCase().includes(terminoLower) ||
      alimento.categoria.toLowerCase().includes(terminoLower)
    );
    setAlimentosFiltrados(filtrados);
  }, [alimentos]);

  // Filtrar alimentos cuando cambia la búsqueda o se cargan los alimentos
  useEffect(() => {
    filtrarAlimentos(busquedaAlimento);
    
    // Actualizar el alimento seleccionado si hay un producto en el formulario
    if (formulario.tipo_producto && formulario.tipo_producto !== 'personalizado') {
      const alimento = alimentos.find(a => a.id.toString() === formulario.tipo_producto);
      if (alimento && !alimentoSeleccionado) {
        setAlimentoSeleccionado(alimento);
        setBusquedaAlimento(`${alimento.nombre} (${alimento.categoria})`);
      }
    } else if (formulario.tipo_producto === 'personalizado' && !alimentoSeleccionado) {
      setBusquedaAlimento('Producto personalizado');
    }
  }, [alimentos, busquedaAlimento, filtrarAlimentos, formulario.tipo_producto, alimentoSeleccionado]);

  // Manejar cambio en el buscador
  const manejarBusquedaAlimento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusquedaAlimento(valor);
    
    // Si hay un alimento seleccionado y el valor es diferente, limpiar la selección
    if (alimentoSeleccionado && valor !== `${alimentoSeleccionado.nombre} (${alimentoSeleccionado.categoria})`) {
      setAlimentoSeleccionado(null);
      setFormulario(prev => ({ ...prev, tipo_producto: '' }));
      setMostrarFormularioNuevoProducto(false);
    }
    
    filtrarAlimentos(valor);
    setMostrarDropdown(true);
  };

  // Manejar focus del input para mostrar el dropdown
  const manejarFocusInput = () => {
    if (!alimentoSeleccionado) {
      setMostrarDropdown(true);
    }
  };

  // Manejar selección de producto del dropdown
  const manejarSeleccionProducto = (alimento: Alimento) => {
    setFormulario(prev => ({ ...prev, tipo_producto: alimento.id.toString() }));
    setAlimentoSeleccionado(alimento);
    setBusquedaAlimento(`${alimento.nombre} (${alimento.categoria})`);
    setMostrarDropdown(false);
    setMostrarFormularioNuevoProducto(false);
    setMensaje(null);
  };

  // Manejar selección de producto personalizado
  const manejarSeleccionPersonalizado = () => {
    setFormulario(prev => ({ ...prev, tipo_producto: 'personalizado' }));
    setAlimentoSeleccionado(null);
    setBusquedaAlimento('Producto personalizado');
    setMostrarDropdown(false);
    setMostrarFormularioNuevoProducto(true);
    setMensaje(null);
  };

  // Limpiar selección de producto
  const limpiarSeleccion = () => {
    setAlimentoSeleccionado(null);
    setBusquedaAlimento('');
    setFormulario(prev => ({ ...prev, tipo_producto: '' }));
    setMostrarFormularioNuevoProducto(false);
    setMostrarDropdown(true); // Mostrar dropdown después de limpiar
  };
  const manejarBlurContainer = (e: React.FocusEvent) => {
    // Solo ocultar si el focus sale completamente del container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        setMostrarDropdown(false);
      }, 150);
    }
  };

  // Función para cargar el perfil del usuario
  const cargarPerfilUsuario = async (user: typeof currentUser) => {
    setLoadingUser(true);
    try {
      if (user) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, rol, tipo_persona, nombre, ruc, cedula, direccion, telefono, representante')
          .eq('id', user.id)
          .single();

        if (error && error.details?.includes('0 rows')) {
          console.log('Usuario no encontrado en la tabla usuarios');
          setUserProfile(null);
        } else if (error) {
          console.error('Error al cargar perfil:', error);
          setUserProfile(null);
        } else if (data) {
          setUserProfile(data);
          // Inicializar dirección de entrega con la dirección del perfil
          setFormulario(prev => ({
            ...prev,
            direccion_entrega: data.direccion || '',
          }));
        }
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error al cargar perfil del usuario:', error);
      setMensaje('Error al cargar tu información. Por favor, intenta nuevamente.');
    } finally {
      setLoadingUser(false);
    }
  };

  const cargarAlimentos = async () => {
    try {
      setCargandoAlimentos(true);
      const { data, error } = await supabase
        .from('alimentos')
        .select('id, nombre, categoria')
        .order('nombre');

      if (error) throw error;
      setAlimentos(data || []);
      setAlimentosFiltrados(data || []);
    } catch (error) {
      console.error('Error al cargar alimentos:', error);
      setMensaje('Error al cargar la lista de alimentos');
    } finally {
      setCargandoAlimentos(false);
    }
  };

  const cargarUnidades = async () => {
    try {
      setCargandoUnidades(true);
      const { data, error } = await supabase
        .from('unidades')
        .select('id, nombre, simbolo')
        .order('nombre');

      if (error) throw error;
      setUnidades(data || []);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      setMensaje('Error al cargar la lista de unidades');
    } finally {
      setCargandoUnidades(false);
    }
  };

  // Obtener información del producto seleccionado
  const getProductoSeleccionado = () => {
    if (formulario.tipo_producto === 'personalizado') {
      return {
        nombre: formulario.producto_personalizado_nombre,
        categoria: formulario.producto_personalizado_categoria
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

  // Cálculo de impacto estimado
  const calcularImpacto = () => calcularImpactoUtil(formulario.cantidad, getUnidadSeleccionada() ?? undefined);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setMensaje(null);

    // No necesitamos manejar tipo_producto aquí porque se maneja en las funciones específicas
  };

  const manejarCambioNuevoProducto = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: value }));

    if (name === 'nombre') {
      setFormulario(prev => ({ ...prev, producto_personalizado_nombre: value }));
    } else if (name === 'categoria') {
      setFormulario(prev => ({ ...prev, producto_personalizado_categoria: value }));
    }
  };

  const validarPaso = (paso: number) => {
    switch (paso) {
      case 1:
        if (!formulario.tipo_producto || !formulario.cantidad || !formulario.unidad_id) {
          setMensaje('Por favor, completa la información del producto.');
          return false;
        }
        if (formulario.tipo_producto === 'personalizado') {
          if (!formulario.producto_personalizado_nombre.trim() || !formulario.producto_personalizado_categoria.trim()) {
            setMensaje('Por favor, completa la información del producto personalizado.');
            return false;
          }
        }
        if (parseFloat(formulario.cantidad) <= 0) {
          setMensaje('La cantidad debe ser mayor a 0.');
          return false;
        }
        break;
      case 2:
        if (!formulario.fecha_disponible.trim() || !formulario.direccion_entrega.trim()) {
          setMensaje('Por favor, completa la información de logística.');
          return false;
        }
        const fechaSeleccionada = new Date(formulario.fecha_disponible);
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0);
        if (fechaSeleccionada < fechaHoy) {
          setMensaje('La fecha de disponibilidad no puede ser anterior a hoy.');
          return false;
        }
        break;
    }
    return true;
  };

  const siguientePaso = () => {
    if (validarPaso(pasoActual)) {
      setPasoActual(prev => Math.min(prev + 1, totalPasos));
      setMensaje(null);
    }
  };

  const pasoAnterior = () => {
    setPasoActual(prev => Math.max(prev - 1, 1));
    setMensaje(null);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarPaso(pasoActual)) {
      return;
    }

    setEnviando(true);
    setMensaje(null);

    try {
      const impacto = calcularImpacto();
      const productoInfo = getProductoSeleccionado();
      const unidadInfo = getUnidadSeleccionada();

      const datosInsercion: any = {
        nombre_donante: userProfile?.nombre || 'Usuario Anónimo',
        telefono: userProfile?.telefono || '',
        email: currentUser?.email || '',
        cantidad: Number(formulario.cantidad),
        fecha_vencimiento: formulario.fecha_vencimiento || null,
        fecha_disponible: formulario.fecha_disponible,
        direccion_entrega: formulario.direccion_entrega,
        horario_preferido: formulario.horario_preferido || null,
        observaciones: formulario.observaciones || null,
        impacto_estimado_personas: impacto.personasAlimentadas,
        impacto_equivalente: impacto.comidaEquivalente,
        creado_en: new Date().toISOString(),
        unidad_id: Number(formulario.unidad_id),
        unidad_nombre: unidadInfo?.nombre,
        unidad_simbolo: unidadInfo?.simbolo,
        user_id: currentUser?.id || null,
        ruc_donante: userProfile?.ruc || null,
        cedula_donante: userProfile?.cedula || null,
        direccion_donante_completa: userProfile?.direccion || null,
        representante_donante: userProfile?.representante || null,
        tipo_persona_donante: userProfile?.tipo_persona || null,
      };

      if (formulario.tipo_producto !== 'personalizado') {
        const alimento = alimentos.find(a => a.id.toString() === formulario.tipo_producto);
        Object.assign(datosInsercion, {
          alimento_id: Number(formulario.tipo_producto),
          tipo_producto: alimento?.nombre,
          categoria_comida: alimento?.categoria,
          es_producto_personalizado: false
        });
      } else {
        Object.assign(datosInsercion, {
          alimento_id: null,
          tipo_producto: formulario.producto_personalizado_nombre,
          categoria_comida: formulario.producto_personalizado_categoria,
          es_producto_personalizado: true
        });
      }

      const { error } = await supabase.from('donaciones').insert([datosInsercion]);

      if (error) {
        throw error;
      }

      setMensaje('¡Donación registrada exitosamente! Te contactaremos pronto. Gracias por tu contribución.');
      
      // Reiniciar formulario
      setFormulario({
        tipo_producto: '',
        producto_personalizado_nombre: '',
        producto_personalizado_categoria: '',
        cantidad: '',
        unidad_id: '',
        fecha_vencimiento: '',
        fecha_disponible: '',
        direccion_entrega: userProfile?.direccion || '',
        horario_preferido: '',
        observaciones: '',
      });
      setMostrarFormularioNuevoProducto(false);
      setAlimentoSeleccionado(null);
      setBusquedaAlimento('');
      setMostrarDropdown(false);
      setPasoActual(1);
    } catch (err: any) {
      setMensaje(err.message || 'Error al registrar la donación. Inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  // Obtener categorías únicas para productos personalizados
  const categoriasUnicas = [...new Set(alimentos.map(a => a.categoria))].sort();

  // Mostrar loader mientras se autentica
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-800">Información del Producto</h3>
              <p className="text-gray-600">Selecciona qué vas a donar</p>
            </div>

            <div className="space-y-4">
              <div className="relative" onBlur={manejarBlurContainer}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Producto *</label>
                
                {/* Input personalizado con dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar o seleccionar producto..."
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none transition-colors"
                    value={busquedaAlimento}
                    onChange={manejarBusquedaAlimento}
                    onFocus={manejarFocusInput}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    {alimentoSeleccionado && (
                      <button
                        type="button"
                        onClick={limpiarSeleccion}
                        className="p-1 mr-2 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors"
                        title="Limpiar selección"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <div className="pr-3 pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Dropdown personalizado con los productos filtrados */}
                {mostrarDropdown && !alimentoSeleccionado && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {cargandoAlimentos ? (
                      <div className="p-3 text-gray-500 text-center">Cargando productos...</div>
                    ) : (
                      <>
                        {alimentosFiltrados.length > 0 ? (
                          <>
                            {alimentosFiltrados.map((alimento) => (
                              <div
                                key={alimento.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => manejarSeleccionProducto(alimento)}
                              >
                                <div className="font-medium text-gray-900">{alimento.nombre}</div>
                                <div className="text-sm text-gray-500">{alimento.categoria}</div>
                              </div>
                            ))}
                            <div
                              className="p-3 hover:bg-blue-50 cursor-pointer border-t border-gray-200 text-blue-600 font-medium"
                              onClick={manejarSeleccionPersonalizado}
                            >
                              <div className="flex items-center">
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar producto personalizado
                              </div>
                            </div>
                          </>
                        ) : busquedaAlimento ? (
                          <div className="p-3 text-gray-500 text-center">
                            No se encontraron productos que coincidan con "{busquedaAlimento}"
                            <div
                              className="mt-2 text-blue-600 cursor-pointer hover:underline"
                              onClick={manejarSeleccionPersonalizado}
                            >
                              + Crear producto personalizado
                            </div>
                          </div>
                        ) : (
                          <div
                            className="p-3 hover:bg-blue-50 cursor-pointer text-blue-600 font-medium"
                            onClick={manejarSeleccionPersonalizado}
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

                {/* Mostrar contador de resultados si hay búsqueda activa */}
                {busquedaAlimento && !cargandoAlimentos && !alimentoSeleccionado && (
                  <p className="text-sm text-gray-500 mt-1">
                    {alimentosFiltrados.length} producto{alimentosFiltrados.length !== 1 ? 's' : ''} encontrado{alimentosFiltrados.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {mostrarFormularioNuevoProducto && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">Producto Personalizado</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                      <input
                        type="text"
                        name="nombre"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={nuevoProducto.nombre}
                        onChange={manejarCambioNuevoProducto}
                        placeholder="Ej: Pan integral casero"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                      <select
                        name="categoria"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={nuevoProducto.categoria}
                        onChange={manejarCambioNuevoProducto}
                      >
                        <option value="">Selecciona una categoría</option>
                        {categoriasUnicas.map((categoria) => (
                          <option key={categoria} value={categoria}>
                            {categoria}
                          </option>
                        ))}
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                  </div>
                </div>
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

              {/* Tabla de equivalencias - siempre visible como referencia */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Tabla de Equivalencias de Impacto
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-semibold text-blue-700 mb-2">Por Kilogramo (kg):</h5>
                    <ul className="text-blue-600 space-y-1">
                      <li>• 1 kg = ~2 personas alimentadas</li>
                      <li>• 1 kg = ~3 porciones</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-700 mb-2">Por Litro (l):</h5>
                    <ul className="text-blue-600 space-y-1">
                      <li>• 1 l = ~1.5 personas</li>
                      <li>• Bebidas y líquidos</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-700 mb-2">Por Caja:</h5>
                    <ul className="text-blue-600 space-y-1">
                      <li>• 1 caja = ~4 personas</li>
                      <li>• Alimentos empaquetados</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-700 mb-2">Por Unidad:</h5>
                    <ul className="text-blue-600 space-y-1">
                      <li>• 1 unidad = ~0.5 personas</li>
                      <li>• Productos individuales</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mostrar cálculo de impacto personalizado si hay datos */}
              {formulario.cantidad && formulario.unidad_id && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Impacto Estimado de tu Donación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-700">
                        ~{calcularImpacto().personasAlimentadas}
                      </div>
                      <div className="text-sm text-purple-600">
                        personas podrían alimentarse
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <div className="text-lg font-semibold text-purple-700">
                        {calcularImpacto().comidaEquivalente}
                      </div>
                      <div className="text-sm text-purple-600">
                        equivalencia alimentaria
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-purple-600 bg-white bg-opacity-40 rounded p-2">
                    <div className="flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      *Estimación basada en promedios generales. El impacto real puede variar según el tipo de alimento y las necesidades específicas.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-800">Logística de Entrega</h3>
              <p className="text-gray-600">Dinos cuándo y dónde podemos recoger tu donación</p>
            </div>

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
        const { personasAlimentadas, comidaEquivalente } = calcularImpacto();
        const productoFinal = getProductoSeleccionado();
        const unidadFinal = getUnidadSeleccionada();
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Heart className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-800">Confirmación y Detalles Adicionales</h3>
              <p className="text-gray-600">Revisa tu donación y añade cualquier observación</p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">Resumen de tu Donación</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <p><strong>Donante:</strong> {userProfile?.nombre || currentUser?.email || 'Usuario Anónimo'}</p>
                  <p><strong>Producto:</strong> {productoFinal?.nombre} ({productoFinal?.categoria})</p>
                  <p><strong>Cantidad:</strong> {formulario.cantidad} {unidadFinal?.simbolo}</p>
                  <p><strong>Fecha disponible:</strong> {new Date(formulario.fecha_disponible).toLocaleDateString('es-ES')}</p>
                  <p><strong>Dirección:</strong> {formulario.direccion_entrega}</p>
                  {formulario.horario_preferido && (
                    <p><strong>Horario:</strong> {HORARIOS_DISPONIBLES.find(h => h.value === formulario.horario_preferido)?.label}</p>
                  )}
                  <div className="bg-purple-100 p-3 rounded mt-3">
                    <p className="font-medium text-purple-800">Impacto Estimado:</p>
                    <p className="text-purple-700">• {personasAlimentadas} personas alimentadas</p>
                    <p className="text-purple-700">• {comidaEquivalente}</p>
                  </div>
                </div>
              </div>

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
            {/* Título y navegación de pasos en la misma línea */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <h1 className="text-xl sm:text-2xl font-extrabold text-blue-700">Nueva Donación</h1>
              <nav className="flex justify-center sm:justify-end space-x-2 sm:space-x-4">
                {Array.from({ length: totalPasos }).map((_, index) => (
                  <div
                    key={index + 1}
                    className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium ${
                      pasoActual >= index + 1 ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${
                        pasoActual >= index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {pasoActual > index + 1 ? <Check className="w-3 h-3 sm:w-5 sm:h-5" /> : index + 1}
                    </div>
                    <span className="hidden sm:block">
                      {index === 0 && 'Producto'}
                      {index === 1 && 'Logística'}
                      {index === 2 && 'Confirmación'}
                    </span>
                  </div>
                ))}
              </nav>
            </div>

            {mensaje && (
              <div className={`p-4 mb-6 rounded-lg text-white ${
                mensaje.includes('exitosa') ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {mensaje}
              </div>
            )}

            <form onSubmit={manejarEnvio}>
              {renderPaso()}

              <div className="flex justify-between mt-8">
                {pasoActual > 1 && (
                  <button
                    type="button"
                    onClick={pasoAnterior}
                    className="flex items-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Atrás
                  </button>
                )}

                {pasoActual < totalPasos && (
                  <button
                    type="button"
                    onClick={siguientePaso}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold ml-auto"
                  >
                    Siguiente <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                )}

                {pasoActual === totalPasos && (
                  <button
                    type="submit"
                    disabled={enviando}
                    className={`flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold ml-auto ${
                      enviando ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {enviando ? 'Enviando...' : (
                      <>
                        <Heart className="w-5 h-5 mr-2" />
                        Enviar Donación
                      </>
                    )}
                  </button>
                )}
              </div>
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
