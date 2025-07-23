'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { ChevronLeft, ChevronRight, Heart, Package, MapPin, Clock, Check, User, Info, Plus } from 'lucide-react';

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
  const { supabase, user: currentUser } = useSupabase();

  const [pasoActual, setPasoActual] = useState(1);
  const totalPasos = 3;

  // Estados para los catálogos
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargandoAlimentos, setCargandoAlimentos] = useState(true);
  const [cargandoUnidades, setCargandoUnidades] = useState(true);

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
    cargarAlimentos();
    cargarUnidades();
    if (currentUser !== undefined) {
      cargarPerfilUsuario(currentUser);
    }
  }, [currentUser]);

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
  const calcularImpacto = () => {
    const cantidad = parseInt(formulario.cantidad) || 0;
    const unidadSeleccionada = getUnidadSeleccionada();
    let personasAlimentadas = 0;
    let comidaEquivalente = '';

    if (unidadSeleccionada) {
      const simbolo = unidadSeleccionada.simbolo.toLowerCase();

      if (simbolo.includes('kg')) {
        personasAlimentadas = Math.floor(cantidad * 2);
        comidaEquivalente = `${cantidad * 3} porciones aproximadamente`;
      } else if (simbolo.includes('l')) {
        personasAlimentadas = Math.floor(cantidad * 1.5);
        comidaEquivalente = `${cantidad} litros de bebida`;
      } else if (simbolo.includes('caja')) {
        personasAlimentadas = Math.floor(cantidad * 4);
        comidaEquivalente = `${cantidad} cajas de alimentos`;
      } else if (simbolo.includes('und') || simbolo.includes('pza')) {
        personasAlimentadas = Math.floor(cantidad * 0.5);
        comidaEquivalente = `${cantidad} unidades`;
      } else {
        personasAlimentadas = Math.floor(cantidad * 1);
        comidaEquivalente = `${cantidad} ${unidadSeleccionada.nombre}`;
      }
    }

    return { personasAlimentadas, comidaEquivalente };
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setMensaje(null);

    if (name === 'tipo_producto' && value === 'personalizado') {
      setMostrarFormularioNuevoProducto(true);
    } else if (name === 'tipo_producto' && value !== 'personalizado') {
      setMostrarFormularioNuevoProducto(false);
    }
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
        if (parseInt(formulario.cantidad) <= 0) {
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
      setPasoActual(1);
    } catch (err: any) {
      setMensaje(err.message || 'Error al registrar la donación. Inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  // Obtener categorías únicas para productos personalizados
  const categoriasUnicas = [...new Set(alimentos.map(a => a.categoria))].sort();

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Producto *</label>
                <select
                  name="tipo_producto"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formulario.tipo_producto}
                  onChange={manejarCambio}
                >
                  <option value="">Selecciona un producto</option>
                  {cargandoAlimentos ? (
                    <option disabled>Cargando productos...</option>
                  ) : (
                    alimentos.map((alimento) => (
                      <option key={alimento.id} value={alimento.id.toString()}>
                        {alimento.nombre} ({alimento.categoria})
                      </option>
                    ))
                  )}
                  <option value="personalizado">+ Agregar producto personalizado</option>
                </select>
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
                    min="1"
                    step="0.1"
                  />
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

              {/* Mostrar cálculo de impacto si hay datos */}
              {formulario.cantidad && formulario.unidad_id && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Impacto Estimado de tu Donación
                  </h4>
                  <div className="text-sm text-purple-700">
                    <p>• Personas que podrían alimentarse: <strong>~{calcularImpacto().personasAlimentadas}</strong></p>
                    <p>• Equivalente: <strong>{calcularImpacto().comidaEquivalente}</strong></p>
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
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-blue-700">Nueva Donación</h1>
            <nav className="hidden md:flex space-x-4">
              {Array.from({ length: totalPasos }).map((_, index) => (
                <div
                  key={index + 1}
                  className={`flex items-center space-x-2 text-sm font-medium ${
                    pasoActual >= index + 1 ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      pasoActual >= index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {pasoActual > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className="hidden lg:block">
                    {index === 0 && 'Producto'}
                    {index === 1 && 'Logística'}
                    {index === 2 && 'Confirmación'}
                  </span>
                </div>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
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
