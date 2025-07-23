'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Plus, Package, Tag, Save, XCircle, Search, Filter, Info } from 'lucide-react'; // Iconos de Lucide React

// Define las categorías locales predefinidas, incluyendo 'Otros' y 'Agregar Nueva Categoría'
const CATEGORIAS_LOCALES = [
  { id: 1, nombre: "Granos y Cereales" },
  { id: 2, nombre: "Legumbres" },
  { id: 3, nombre: "Lácteos" },
  { id: 4, nombre: "Carnes y Proteínas" },
  { id: 5, nombre: "Frutas" },
  { id: 6, nombre: "Verduras" },
  { id: 7, nombre: "Aceites y Grasas" },
  { id: 8, nombre: "Condimentos" },
  { id: 9, nombre: "Bebidas" },
  { id: 10, nombre: "Productos Enlatados" },
  { id: 11, nombre: "Otros" }, // Opción para categorías que no encajan directamente
  { id: 12, nombre: "Agregar Nueva Categoría" } // Opción para que el usuario defina una categoría completamente nueva
];

// Interfaz para los tipos de datos de Alimento
interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
}

export default function RegistrarAlimentoPage() {
  // Hook de Supabase para acceder al cliente y al estado de autenticación
  const { supabase, isLoading: authLoading } = useSupabase();

  // Estados para el formulario de nuevo alimento
  const [nombreAlimento, setNombreAlimento] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  // Controla la visibilidad del campo de texto para nueva/otra categoría
  const [mostrarCampoNuevaCategoria, setMostrarCampoNuevaCategoria] = useState(false);
  // Controla la visibilidad del modal para agregar un nuevo alimento
  const [mostrarModalAgregarAlimento, setMostrarModalAgregarAlimento] = useState(false);

  // Estados para mensajes de usuario y estado de carga
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error' | null>(null);
  const [cargando, setCargando] = useState(false);

  // Estados para la lista de alimentos existentes y filtros de búsqueda
  const [alimentosExistentes, setAlimentosExistentes] = useState<Alimento[]>([]);
  const [cargandoAlimentos, setCargandoAlimentos] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Efecto para cargar los alimentos existentes al montar el componente o cuando Supabase esté listo
  useEffect(() => {
    if (!authLoading && supabase) {
      cargarAlimentos();
    }
  }, [authLoading, supabase]);

  // Función asíncrona para cargar los alimentos desde Supabase
  const cargarAlimentos = async () => {
    setCargandoAlimentos(true);
    setMensaje(null); // Limpiar mensajes anteriores
    try {
      const { data, error } = await supabase
        .from('alimentos')
        .select('id, nombre, categoria')
        .order('nombre'); // Ordenar por nombre para una mejor visualización

      if (error) throw error;
      setAlimentosExistentes(data || []); // Actualizar el estado con los alimentos cargados
    } catch (error: any) {
      console.error('Error al cargar alimentos:', error.message);
      setMensaje('Error al cargar la lista de alimentos: ' + error.message);
      setTipoMensaje('error');
    } finally {
      setCargandoAlimentos(false);
    }
  };

  // Maneja el cambio en el selector de categoría
  const manejarCambioCategoria = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value; // El valor seleccionado es el nombre de la categoría
    setCategoriaSeleccionada(selectedValue);
    setMensaje(null); // Limpiar mensajes al cambiar la selección

    // Mostrar el campo de texto para nueva/otra categoría si se selecciona la opción correspondiente
    if (selectedValue === 'Agregar Nueva Categoría' || selectedValue === 'Otros') {
      setMostrarCampoNuevaCategoria(true);
      setNuevaCategoria(''); // Limpiar el campo de texto de nueva categoría
    } else {
      setMostrarCampoNuevaCategoria(false);
      setNuevaCategoria('');
    }
  };

  // Maneja el envío del formulario para registrar un nuevo alimento
  const manejarEnvioAlimento = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setMensaje(null);
    setTipoMensaje(null);

    let categoriaFinal = categoriaSeleccionada;

    // Validaciones del formulario
    if (!nombreAlimento.trim()) {
      setMensaje('El nombre del alimento es obligatorio.');
      setTipoMensaje('error');
      return;
    }

    if (!categoriaSeleccionada) {
      setMensaje('Debes seleccionar una categoría.');
      setTipoMensaje('error');
      return;
    }

    // Si se seleccionó "Otros" o "Agregar Nueva Categoría", usar el valor del campo de texto
    if (categoriaSeleccionada === 'Agregar Nueva Categoría' || categoriaSeleccionada === 'Otros') {
      if (!nuevaCategoria.trim()) {
        setMensaje('Debes ingresar el nombre de la nueva categoría o especificar la categoría para "Otros".');
        setTipoMensaje('error');
        return;
      }
      categoriaFinal = nuevaCategoria.trim(); // La categoría final es el valor ingresado por el usuario
    }

    setCargando(true); // Indicar que se está enviando el formulario
    try {
      // Verificar si el alimento ya existe (ignorando mayúsculas/minúsculas)
      const { data: existingFood, error: existingError } = await supabase
        .from('alimentos')
        .select('id')
        .ilike('nombre', nombreAlimento.trim()) // Búsqueda insensible a mayúsculas/minúsculas
        .single(); // Esperar un solo resultado

      // Manejar error si no es un error de "no se encontraron filas" (PGRST116)
      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      // Si el alimento ya existe, mostrar un mensaje de error
      if (existingFood) {
        setMensaje(`El alimento "${nombreAlimento.trim()}" ya existe.`);
        setTipoMensaje('error');
        return;
      }

      // Insertar el nuevo alimento en la tabla 'alimentos' de Supabase
      const { error } = await supabase.from('alimentos').insert([
        {
          nombre: nombreAlimento.trim(),
          categoria: categoriaFinal,
        },
      ]);

      if (error) {
        throw error;
      }

      setMensaje('¡Alimento registrado exitosamente!');
      setTipoMensaje('success');
      // Limpiar el formulario y recargar la lista de alimentos
      setNombreAlimento('');
      setCategoriaSeleccionada('');
      setNuevaCategoria('');
      setMostrarCampoNuevaCategoria(false);
      setMostrarModalAgregarAlimento(false); // Cerrar el modal
      cargarAlimentos(); // Recargar la lista para mostrar el nuevo alimento
    } catch (err: any) {
      console.error('Error al registrar alimento:', err.message);
      setMensaje('Error al registrar el alimento: ' + err.message);
      setTipoMensaje('error');
    } finally {
      setCargando(false); // Finalizar el estado de carga
    }
  };

  // Filtrar la lista de alimentos existentes según los criterios de búsqueda y categoría
  const alimentosFiltrados = alimentosExistentes.filter(alimento => {
    const matchesSearch = filtroBusqueda ?
      alimento.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) : true;
    const matchesCategory = filtroCategoria ?
      alimento.categoria.toLowerCase() === filtroCategoria.toLowerCase() : true;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas de los alimentos existentes para el filtro del catálogo
  const categoriasParaFiltro = [...new Set(alimentosExistentes.map(a => a.categoria))].sort();

  // Mostrar un loader mientras se autentica el usuario
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        {/* Encabezado de la página */}
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-green-700 flex items-center">
              <Package className="w-8 h-8 mr-3 text-green-600" /> Catálogo de Alimentos
            </h1>
            {/* Botón para abrir el modal de registro de nuevo alimento */}
            <button
              onClick={() => setMostrarModalAgregarAlimento(true)}
              className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" /> Registrar Alimento
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
          {/* Mensajes de éxito o error */}
          {mensaje && (
            <div className={`p-4 mb-6 rounded-lg text-white ${
              tipoMensaje === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {mensaje}
            </div>
          )}

          {/* Sección de búsqueda y filtros */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" /> Filtros de Búsqueda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    className="w-full border-2 border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Nombre o descripción..."
                    value={filtroBusqueda}
                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  id="categoryFilter"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categoriasParaFiltro.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección del Catálogo de Alimentos */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Catálogo de Alimentos ({alimentosFiltrados.length} de {alimentosExistentes.length} alimentos)
            </h2>
            {cargandoAlimentos ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                <p className="ml-4 text-gray-600">Cargando alimentos...</p>
              </div>
            ) : alimentosFiltrados.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md">
                <p className="font-medium">No se encontraron alimentos que coincidan con los filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {alimentosFiltrados.map((alimento) => (
                  <div key={alimento.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{alimento.nombre}</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                        Disponible
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Categoría: <span className="font-medium text-gray-800">{alimento.categoria}</span>
                    </p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Info className="w-4 h-4 mr-1" />
                      <span>ID: {alimento.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Modal para Registrar Nuevo Alimento */}
        {mostrarModalAgregarAlimento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
              {/* Botón para cerrar el modal */}
              <button
                onClick={() => {
                  setMostrarModalAgregarAlimento(false);
                  setMensaje(null); // Limpiar mensajes al cerrar el modal
                  setTipoMensaje(null);
                  setNombreAlimento(''); // Limpiar campos del formulario
                  setCategoriaSeleccionada('');
                  setNuevaCategoria('');
                  setMostrarCampoNuevaCategoria(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-7 h-7" />
              </button>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Registrar Nuevo Alimento</h3>

              <form onSubmit={manejarEnvioAlimento} className="space-y-5">
                <div>
                  <label htmlFor="nombreAlimento" className="block text-sm font-medium text-gray-700 mb-2">Nombre del Alimento *</label>
                  <input
                    type="text"
                    id="nombreAlimento"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors"
                    value={nombreAlimento}
                    onChange={(e) => { setNombreAlimento(e.target.value); setMensaje(null); }}
                    placeholder="Ej: Manzanas, Arroz, Leche"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select
                    id="categoria"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors"
                    value={categoriaSeleccionada}
                    onChange={manejarCambioCategoria}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {CATEGORIAS_LOCALES.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campo de texto condicional para nueva/otra categoría */}
                {mostrarCampoNuevaCategoria && (
                  <div>
                    <label htmlFor="nuevaCategoria" className="block text-sm font-medium text-gray-700 mb-2">
                      {categoriaSeleccionada === 'Otros' ? 'Especifica la categoría (Ej: Comida para mascotas)' : 'Nombre de la Nueva Categoría *'}
                    </label>
                    <input
                      type="text"
                      id="nuevaCategoria"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors"
                      value={nuevaCategoria}
                      onChange={(e) => { setNuevaCategoria(e.target.value); setMensaje(null); }}
                      placeholder={categoriaSeleccionada === 'Otros' ? 'Ej: Comida para mascotas' : 'Ej: Productos Gourmet'}
                      required
                    />
                  </div>
                )}

                {/* Mensajes dentro del modal */}
                {mensaje && (
                  <div className={`p-3 rounded-lg text-sm ${
                    tipoMensaje === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {mensaje}
                  </div>
                )}

                {/* Botón de envío del formulario */}
                <button
                  type="submit"
                  disabled={cargando}
                  className={`w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors font-semibold ${
                    cargando ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {cargando ? 'Guardando...' : (
                    <>
                      <Save className="w-5 h-5 mr-2" /> Guardar Alimento
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Pie de página */}
        <footer className="bg-white shadow-sm p-4 mt-8">
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
