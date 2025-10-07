'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Package, Calendar, MapPin, MessageCircle, Heart, Phone, Mail, Scale, Clock, Users, Plus, IdCard, Building } from 'lucide-react';

// Importa el hook useSupabase desde tu SupabaseProvider
import { useSupabase } from '@/app/components/SupabaseProvider'; // Ajusta la ruta si es diferente
import { fetchAlimentos, fetchUnidades } from '@/services/catalogService';
import { calcularImpacto as calcularImpactoUtil } from '@/utils/impact';

// Define los horarios disponibles para la recolección
const HORARIOS_DISPONIBLES = [
  { value: '08:00-10:00', label: '08:00 AM - 10:00 AM' },
  { value: '10:00-12:00', label: '10:00 AM - 12:00 PM' },
  { value: '12:00-14:00', label: '12:00 PM - 02:00 PM' },
  { value: '14:00-16:00', label: '02:00 PM - 04:00 PM' },
  { value: '16:00-18:00', label: '04:00 PM - 06:00 PM' },
  { value: '18:00-20:00', label: '06:00 PM - 08:00 PM' },
  // Puedes añadir más rangos horarios según sea necesario
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

// Nueva interfaz para el perfil de usuario de la base de datos
interface UserProfile {
  id: string; // El id de Supabase auth.users
  rol: string;
  tipo_persona: 'Natural' | 'Juridica';
  nombre: string;
  ruc?: string; // Opcional para Persona Natural
  cedula?: string; // Opcional para Persona Juridica
  direccion: string;
  telefono: string;
  representante?: string; // Solo para Persona Juridica
  email?: string; // Asumiendo que el email también se guarda en tu tabla de usuarios
}

export default function PaginaDonacion() {
  // Obtén la instancia de Supabase y el usuario del contexto
  const { supabase, user: currentUser } = useSupabase();

  const [pasoActual, setPasoActual] = useState(1);
  const totalPasos = 4;

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

  // Estado para la información del usuario logueado desde tu tabla 'usuarios'
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [formulario, setFormulario] = useState({
    // Paso 1: Información del donante
    nombre_donante: '',
    ruc: '',
    cedula: '',
    direccion_donante: '',
    telefono: '',
    email: '',
    representante: '',

    // Paso 2: Información del producto
    tipo_producto: '',
    producto_personalizado_nombre: '',
    producto_personalizado_categoria: '',
    cantidad: '',
    unidad_id: '',
    fecha_vencimiento: '',

    // Paso 3: Logística
    fecha_disponible: '',
    direccion_entrega: '',
    horario_preferido: '',
    // Paso 4: Detalles adicionales
    observaciones: '',
  });

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Cargar alimentos y unidades al montar el componente
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
        setUnidades(unid);
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        setMensaje('Error al cargar catálogos');
      } finally {
        setCargandoAlimentos(false);
        setCargandoUnidades(false);
      }
    })();

    // Llama a cargarPerfilUsuario cada vez que el `currentUser` del contexto cambie
    if (currentUser !== undefined) {
      cargarPerfilUsuario(currentUser);
    }
  }, [currentUser, supabase]); // Añade currentUser y supabase a las dependencias.

  // Función para cargar el perfil del usuario desde la tabla 'usuarios'
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
          console.warn("No se encontró perfil de usuario en la tabla 'usuarios' para el ID:", user.id);
          // Si no hay perfil en 'usuarios', pero hay usuario logueado, pre-rellena el email
          setFormulario(prev => ({ ...prev, email: user.email || '' }));
          setUserProfile(null);
        } else if (error) {
          throw error;
        } else if (data) {
          setUserProfile(data);
          // Pre-rellenar los campos del formulario con la información del usuario
          setFormulario(prev => ({
            ...prev,
            nombre_donante: data.nombre || '',
            ruc: data.ruc || '',
            cedula: data.cedula || '',
            direccion_donante: data.direccion || '',
            telefono: data.telefono || '',
            email: user.email || '', // El email lo obtengo de la sesión de auth
            representante: data.representante || '',
            direccion_entrega: data.direccion || '', // Sugiere la dirección del donante como entrega
          }));
        }
      } else {
        // Si no hay usuario logueado, limpia los campos relacionados con el perfil
        setFormulario(prev => ({
          ...prev,
          nombre_donante: '', ruc: '', cedula: '', direccion_donante: '',
          telefono: '', email: '', representante: '', direccion_entrega: '',
        }));
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error al cargar perfil del usuario:', error);
      setMensaje('Error al cargar tu información. Por favor, rellena los datos manualmente.');
    } finally {
      setLoadingUser(false);
    }
  };

  // carga de catálogos movida a catalogService (fetchAlimentos / fetchUnidades)

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

  // Impacto: usar utilidad centralizada

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setMensaje(null);

    // Si selecciona "personalizado", mostrar el formulario de nuevo producto
    if (name === 'tipo_producto' && value === 'personalizado') {
      setMostrarFormularioNuevoProducto(true);
    } else if (name === 'tipo_producto' && value !== 'personalizado') {
      setMostrarFormularioNuevoProducto(false);
    }
  };

  const manejarCambioNuevoProducto = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: value }));

    // Actualizar también el formulario principal para el resumen
    if (name === 'nombre') {
      setFormulario(prev => ({ ...prev, producto_personalizado_nombre: value }));
    } else if (name === 'categoria') {
      setFormulario(prev => ({ ...prev, producto_personalizado_categoria: value }));
    }
  };

  const validarPaso = (paso: number) => {
    switch (paso) {
      case 1:
        // Validación específica según el tipo de persona
        if (userProfile?.tipo_persona === 'Natural') {
          if (!formulario.nombre_donante.trim() || !formulario.cedula || !formulario.telefono || !formulario.email || !formulario.direccion_donante.trim()) {
            setMensaje('Por favor, completa toda la información de contacto (Nombre, Cédula, Dirección, Teléfono, Email).');
            return false;
          }
          if (formulario.cedula.length !== 10 && formulario.cedula.length !== 13) { // Asumiendo 10 para cédula, 13 para RUC si aplica a Natural
            setMensaje('Por favor, ingresa una cédula válida de 10 o 13 dígitos.');
            return false;
          }
        } else if (userProfile?.tipo_persona === 'Juridica') {
          if (!formulario.nombre_donante.trim() || !formulario.ruc || !formulario.telefono || !formulario.email || !formulario.direccion_donante.trim() || !formulario.representante.trim()) {
            setMensaje('Por favor, completa toda la información de contacto (Razón Social, RUC, Representante, Dirección, Teléfono, Email).');
            return false;
          }
          if (formulario.ruc.length !== 13) {
            setMensaje('Por favor, ingresa un RUC válido de 13 dígitos.');
            return false;
          }
        } else { // Si no hay perfil cargado o tipo de persona desconocido, valida los campos básicos
          if (!formulario.nombre_donante.trim() || !formulario.telefono || !formulario.email || !formulario.direccion_donante.trim()) {
            setMensaje('Por favor, completa toda la información de contacto.');
            return false;
          }
        }
        if (!/\S+@\S+\.\S+/.test(formulario.email)) {
          setMensaje('Por favor, ingresa un email válido.');
          return false;
        }
        break;
      case 2:
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
      case 3:
        if (!formulario.fecha_disponible.trim() || !formulario.direccion_entrega.trim()) {
          setMensaje('Por favor, completa la información de logística.');
          return false;
        }
        const fechaSeleccionada = new Date(formulario.fecha_disponible);
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00 para comparar solo fechas
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
  const impacto = calcularImpactoUtil(formulario.cantidad, getUnidadSeleccionada() ?? undefined);
      const productoInfo = getProductoSeleccionado();
      const unidadInfo = getUnidadSeleccionada();

      // Preparar datos para insertar
      const datosInsercion: any = {
        nombre_donante: formulario.nombre_donante,
        telefono: formulario.telefono,
        email: formulario.email,
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
        user_id: currentUser?.id || null, // Usa currentUser del contexto para el ID del usuario
        ruc_donante: formulario.ruc || null,
        cedula_donante: formulario.cedula || null,
        direccion_donante_completa: formulario.direccion_donante || null, // Guarda la dirección del donante por separado
        representante_donante: formulario.representante || null,
        tipo_persona_donante: userProfile?.tipo_persona || null,
      };

      // Si es un producto del catálogo
      if (formulario.tipo_producto !== 'personalizado') {
        const alimento = alimentos.find(a => a.id.toString() === formulario.tipo_producto);
        Object.assign(datosInsercion, {
          alimento_id: Number(formulario.tipo_producto),
          tipo_producto: alimento?.nombre,
          categoria_comida: alimento?.categoria,
          es_producto_personalizado: false
        });
      } else {
        // Si es un producto personalizado
        Object.assign(datosInsercion, {
          alimento_id: null,
          tipo_producto: formulario.producto_personalizado_nombre,
          categoria_comida: formulario.producto_personalizado_categoria,
          es_producto_personalizado: true
        });
      }

      // Inserción a Supabase
      const { error } = await supabase.from('donaciones').insert([datosInsercion]);

      if (error) {
        throw error;
      }

      setMensaje('¡Donación registrada exitosamente! Te contactaremos pronto. Gracias por tu contribución.');
      // Reiniciar formulario a los valores iniciales o del perfil
      setFormulario({
        nombre_donante: userProfile?.nombre || '',
        ruc: userProfile?.ruc || '',
        cedula: userProfile?.cedula || '',
        direccion_donante: userProfile?.direccion || '',
        telefono: userProfile?.telefono || '',
        email: currentUser?.email || '', // Usar el email del usuario logueado
        representante: userProfile?.representante || '',
        tipo_producto: '',
        producto_personalizado_nombre: '',
        producto_personalizado_categoria: '',
        cantidad: '',
        unidad_id: '',
        fecha_vencimiento: '',
        fecha_disponible: '',
        direccion_entrega: userProfile?.direccion || '', // Re-establecer si se usó la del perfil
        horario_preferido: '',
        observaciones: '',
      });
      setMostrarFormularioNuevoProducto(false);
      setPasoActual(1); // Regresar al primer paso
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
              <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-800">Información de Contacto</h3>
              <p className="text-gray-600">Necesitamos tus datos para coordinar la donación</p>
            </div>

            {loadingUser ? (
              <div className="p-4 text-center text-gray-600 bg-gray-50 rounded-lg">Cargando tu información de perfil...</div>
            ) : (
              <div className="space-y-4">
                {/* Nombre/Razón Social */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {userProfile?.tipo_persona === 'Juridica' ? 'Razón Social' : 'Nombre completo'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre_donante"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={formulario.nombre_donante}
                    onChange={manejarCambio}
                    placeholder={userProfile?.tipo_persona === 'Juridica' ? 'Nombre de la empresa' : 'Tu nombre completo'}
                    maxLength={100}
                    disabled={!!userProfile?.nombre} // Deshabilita si ya viene del perfil
                  />
                </div>

                {/* Cédula/RUC condicional */}
                {userProfile?.tipo_persona === 'Natural' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <IdCard className="inline w-4 h-4 mr-1" />
                      Número de Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cedula"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      value={formulario.cedula}
                      onChange={manejarCambio}
                      placeholder="Ej: 1712345678"
                      maxLength={10}
                      disabled={!!userProfile?.cedula}
                    />
                  </div>
                )}

                {userProfile?.tipo_persona === 'Juridica' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building className="inline w-4 h-4 mr-1" />
                      RUC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ruc"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      value={formulario.ruc}
                      onChange={manejarCambio}
                      placeholder="Ej: 1790000000001"
                      maxLength={13}
                      disabled={!!userProfile?.ruc}
                    />
                  </div>
                )}

                {/* Representante Legal (solo para persona Jurídica) */}
                {userProfile?.tipo_persona === 'Juridica' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="inline w-4 h-4 mr-1" />
                      Representante Legal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="representante"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      value={formulario.representante}
                      onChange={manejarCambio}
                      placeholder="Nombre del representante legal"
                      maxLength={100}
                      disabled={!!userProfile?.representante}
                    />
                  </div>
                )}

                {/* Dirección del donante */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Dirección del Donante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="direccion_donante"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={formulario.direccion_donante}
                    onChange={manejarCambio}
                    placeholder="Calle, número, ciudad, provincia"
                    maxLength={200}
                    disabled={!!userProfile?.direccion}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={formulario.telefono}
                    onChange={manejarCambio}
                    placeholder="+593 XX XXX XXXX"
                    maxLength={20}
                    disabled={!!userProfile?.telefono}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={formulario.email}
                    onChange={manejarCambio}
                    placeholder="tu@email.com"
                    maxLength={100}
                    disabled={!!currentUser?.email} // Si el email viene de Supabase Auth
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-800">Información del Producto</h3>
              <p className="text-gray-600">Selecciona qué vas a donar</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de producto <span className="text-red-500">*</span>
                </label>
                {cargandoAlimentos ? (
                  <div className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                    Cargando productos...
                  </div>
                ) : (
                  <select
                    name="tipo_producto"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={formulario.tipo_producto}
                    onChange={manejarCambio}
                  >
                    <option value="">Selecciona un producto</option>
                    {alimentos.map(alimento => (
                      <option key={alimento.id} value={alimento.id}>
                        {alimento.nombre} ({alimento.categoria})
                      </option>
                    ))}
                    <option value="personalizado">Otro producto (personalizado)</option>
                  </select>
                )}
              </div>

              {mostrarFormularioNuevoProducto && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Producto Personalizado
                  </h4>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del producto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      value={nuevoProducto.nombre}
                      onChange={manejarCambioNuevoProducto}
                      placeholder="Ej: Galletas de avena, Jugo de naranja, Arroz integral.."
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoria"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      value={nuevoProducto.categoria}
                      onChange={manejarCambioNuevoProducto}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categoriasUnicas.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Scale className="inline w-4 h-4 mr-1" />
                    Cantidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    name="cantidad"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={formulario.cantidad}
                    onChange={manejarCambio}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unidad <span className="text-red-500">*</span>
                  </label>
                  {cargandoUnidades ? (
                    <div className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                      Cargando unidades...
                    </div>
                  ) : (
                    <select
                      name="unidad_id"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      value={formulario.unidad_id}
                      onChange={manejarCambio}
                    >
                      <option value="">Selecciona una unidad</option>
                      {unidades.map(unidad => (
                        <option key={unidad.id} value={unidad.id}>
                          {unidad.nombre} ({unidad.simbolo})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Fecha de vencimiento solo si es alimento/bebida */}
              {((getProductoSeleccionado()?.categoria === 'Alimentos' ||
                getProductoSeleccionado()?.categoria === 'Bebidas') ||
                alimentos.find(a => a.id.toString() === formulario.tipo_producto)?.categoria === 'Alimentos' ||
                alimentos.find(a => a.id.toString() === formulario.tipo_producto)?.categoria === 'Bebidas') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Fecha de vencimiento (opcional)
                    </label>
                    <input
                      type="date"
                      name="fecha_vencimiento"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      value={formulario.fecha_vencimiento}
                      onChange={manejarCambio}
                    />
                  </div>
                )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-800">Logística de Entrega</h3>
              <p className="text-gray-600">Dinos cuándo y dónde podemos recoger tu donación</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Fecha disponible para recolección <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_disponible"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formulario.fecha_disponible}
                  onChange={manejarCambio}
                  min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Dirección de recolección <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Horario de recolección preferido (opcional)
                </label>
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

      case 4:
        const productoFinal = getProductoSeleccionado();
        const unidadFinal = getUnidadSeleccionada();
        const { personasAlimentadas, comidaEquivalente } = calcularImpactoUtil(formulario.cantidad, unidadFinal ?? undefined);
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Heart className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-800">Confirmación y Detalles Adicionales</h3>
              <p className="text-gray-600">Revisa tu donación y añade cualquier observación</p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-lg text-gray-800 mb-3">Resumen de la Donación</h4>
                <ul className="text-gray-700 space-y-2">
                  <li><span className="font-medium">Donante:</span> {formulario.nombre_donante}</li>
                  {userProfile?.tipo_persona === 'Juridica' && <li><span className="font-medium">Representante:</span> {formulario.representante}</li>}
                  {userProfile?.tipo_persona === 'Juridica' ? (
                    <li><span className="font-medium">RUC:</span> {formulario.ruc}</li>
                  ) : (
                    <li><span className="font-medium">Cédula:</span> {formulario.cedula}</li>
                  )}
                  <li><span className="font-medium">Contacto:</span> {formulario.telefono} | {formulario.email}</li>
                  <li><span className="font-medium">Dirección Donante:</span> {formulario.direccion_donante}</li>
                  <hr className="my-2 border-gray-200" />
                  <li><span className="font-medium">Producto:</span> {productoFinal?.nombre} ({productoFinal?.categoria})</li>
                  <li><span className="font-medium">Cantidad:</span> {formulario.cantidad} {unidadFinal?.nombre} ({unidadFinal?.simbolo})</li>
                  {formulario.fecha_vencimiento && <li><span className="font-medium">Fecha de Vencimiento:</span> {formulario.fecha_vencimiento}</li>}
                  <hr className="my-2 border-gray-200" />
                  <li><span className="font-medium">Fecha de Recolección:</span> {formulario.fecha_disponible}</li>
                  <li><span className="font-medium">Dirección de Recolección:</span> {formulario.direccion_entrega}</li>
                  {formulario.horario_preferido && <li><span className="font-medium">Horario Preferido:</span> {formulario.horario_preferido}</li>}
                  <hr className="my-2 border-gray-200" />
                  <li className="font-bold text-green-700"><span className="font-medium">Impacto Estimado:</span> Esta donación podría alimentar a {personasAlimentadas} personas con {comidaEquivalente}. ¡Gracias por tu generosidad!</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageCircle className="inline w-4 h-4 mr-1" />
                  Observaciones adicionales (opcional)
                </label>
                <textarea
                  name="observaciones"
                  rows={4}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors resize-y"
                  value={formulario.observaciones}
                  onChange={manejarCambio}
                  placeholder="Ej: El acceso es por la puerta trasera, el producto debe mantenerse refrigerado..."
                  maxLength={500}
                ></textarea>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-blue-700">Formulario de Donación</h1>
          <nav className="hidden md:flex space-x-4">
            {Array.from({ length: totalPasos }).map((_, index) => (
              <div
                key={index + 1}
                className={`flex items-center space-x-2 text-sm font-medium ${pasoActual >= index + 1 ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${pasoActual > index + 1
                      ? 'bg-blue-600 text-white'
                      : pasoActual === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {index + 1}
                </div>
                <span>Paso {index + 1}</span>
              </div>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
          {mensaje && (
            <div className={`p-4 mb-6 rounded-lg text-white ${mensaje.includes('exitosa') ? 'bg-green-500' : 'bg-red-500'}`}>
              {mensaje}
            </div>
          )}

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
                onClick={manejarEnvio}
                disabled={enviando}
                className={`flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold ml-auto ${enviando ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {enviando ? 'Enviando...' : (
                  <>
                    <Heart className="w-5 h-5 mr-2" /> Confirmar Donación
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white shadow-sm p-4 mt-8">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}