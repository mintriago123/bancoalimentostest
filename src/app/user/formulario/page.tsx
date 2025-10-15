"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/components/SupabaseProvider";
import DashboardLayout from "@/app/components/DashboardLayout";
import MapboxMap from "@/app/components/MapboxMap";
import {
  MapPin,
  Calendar,
  MessageCircle,
  ShoppingBasket,
  Hash,
  Send,
  User,
  Phone,
  IdCard,
  Search,
  X,
} from "lucide-react";

export default function FormularioSolicitante() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  const [alimentosDisponibles, setAlimentosDisponibles] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [tipoAlimento, setTipoAlimento] = useState("");
  const [alimentoId, setAlimentoId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [unidadId, setUnidadId] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cargandoUnidades, setCargandoUnidades] = useState(true);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<{
    latitud: number;
    longitud: number;
  } | null>(null);

  // Estados para la búsqueda de alimentos
  const [busquedaAlimento, setBusquedaAlimento] = useState("");
  const [alimentosFiltrados, setAlimentosFiltrados] = useState<any[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<any>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    if (user) {
      supabase
        .from("usuarios")
        .select("id, nombre, cedula, telefono")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error) setUserData(data);
        });
    }
  }, [user, supabase]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionSeleccionada({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
          });
        },
        () => {
          setMensaje("No se pudo obtener la ubicación.");
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchAlimentos = async () => {
      const { data, error } = await supabase
        .from("alimentos")
        .select("id, nombre, categoria");
      if (!error && data) {
        setAlimentosDisponibles(data);
        setAlimentosFiltrados(data);
      }
    };

    fetchAlimentos();
  }, [supabase]);

  useEffect(() => {
    const fetchUnidades = async () => {
      setCargandoUnidades(true);
      const { data, error } = await supabase
        .from("unidades")
        .select("id, nombre, simbolo")
        .order("nombre");
      if (!error && data) {
        setUnidades(data);
      }
      setCargandoUnidades(false);
    };

    fetchUnidades();
  }, [supabase]);

  // Función para filtrar alimentos basado en la búsqueda y categoría
  const filtrarAlimentos = (termino: string, categoria: string = filtroCategoria) => {
    let filtrados = alimentosDisponibles;

    // Filtrar por término de búsqueda
    if (termino.trim()) {
      const terminoLower = termino.toLowerCase();
      filtrados = filtrados.filter(
        (alimento) =>
          alimento.nombre.toLowerCase().includes(terminoLower) ||
          alimento.categoria.toLowerCase().includes(terminoLower)
      );
    }

    // Filtrar por categoría
    if (categoria) {
      filtrados = filtrados.filter(
        (alimento) => alimento.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }

    setAlimentosFiltrados(filtrados);
  };

  // Manejar cambio en el buscador
  const manejarBusquedaAlimento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusquedaAlimento(valor);

    // Si hay un alimento seleccionado y el valor es diferente, limpiar la selección
    if (alimentoSeleccionado && valor !== alimentoSeleccionado.nombre) {
      setAlimentoSeleccionado(null);
      setTipoAlimento("");
      setAlimentoId(null);
    }

    filtrarAlimentos(valor);
    setMostrarDropdown(true);
  };

  // Manejar focus del input para mostrar el dropdown
  const manejarFocusInput = () => {
    if (!alimentoSeleccionado) {
      setMostrarDropdown(true);
      filtrarAlimentos(busquedaAlimento);
    }
  };

  // Manejar selección de alimento del dropdown
  const manejarSeleccionAlimento = (alimento: any) => {
    setAlimentoSeleccionado(alimento);
    setTipoAlimento(alimento.nombre);
    setAlimentoId(alimento.id);
    setBusquedaAlimento(alimento.nombre);
    setMostrarDropdown(false);
  };

  // Limpiar selección de alimento
  const limpiarSeleccion = () => {
    setAlimentoSeleccionado(null);
    setTipoAlimento("");
    setAlimentoId(null);
    setBusquedaAlimento("");
    setMostrarDropdown(true);
    filtrarAlimentos("", filtroCategoria);
  };

  // Manejar cambio de categoría
  const manejarCambioCategoria = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoria = e.target.value;
    setFiltroCategoria(categoria);
    
    // Limpiar la selección actual si existe
    if (alimentoSeleccionado) {
      setAlimentoSeleccionado(null);
      setTipoAlimento("");
      setAlimentoId(null);
      setBusquedaAlimento("");
    }

    // Filtrar y mostrar el dropdown
    filtrarAlimentos("", categoria);
    setMostrarDropdown(false);
  };

  // Obtener categorías únicas de los alimentos disponibles
  const categoriasUnicas = [...new Set(alimentosDisponibles.map(a => a.categoria))].sort();

  // Manejar blur del container
  const manejarBlurContainer = (e: React.FocusEvent) => {
    // Solo ocultar si el focus sale completamente del container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        setMostrarDropdown(false);
      }, 150);
    }
  };

  // Función para manejar el cambio de ubicación desde el mapa
  const manejarCambioUbicacion = (lat: number, lng: number) => {
    setUbicacionSeleccionada({
      latitud: lat,
      longitud: lng,
    });
  };

  // Obtener información de la unidad seleccionada
  const getUnidadSeleccionada = () => {
    const unidad = unidades.find((u) => u.id.toString() === unidadId);
    return unidad || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    const cantidadNum = parseFloat(cantidad);

    if (!user || !userData || !tipoAlimento || !cantidad || cantidadNum <= 0 || !unidadId) {
      setMensaje("Por favor completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("solicitudes").insert([
      {
        usuario_id: user.id,
        tipo_alimento: tipoAlimento,
        cantidad: cantidadNum,
        unidad_id: parseInt(unidadId),
        comentarios,
        latitud: ubicacionSeleccionada?.latitud,
        longitud: ubicacionSeleccionada?.longitud,
      },
    ]);

    if (error) {
      console.error("Error al insertar:", error);
      setMensaje("Error al enviar la solicitud: " + error.message);
    } else {
      setMensaje("Solicitud enviada con éxito.");
      setTipoAlimento("");
      setAlimentoId(null);
      setAlimentoSeleccionado(null);
      setBusquedaAlimento("");
      setFiltroCategoria("");
      setCantidad("");
      setUnidadId("");
      setComentarios("");
    }

    setTimeout(() => setMensaje(""), 3000);
    setLoading(false);
  };

  return (
    <DashboardLayout
      requiredRole="SOLICITANTE"
      title="Solicitar Alimentos"
      description="Rellena el formulario para enviar tu solicitud al Banco de Alimentos."
    >
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-blue-700 flex items-center">
                  <ShoppingBasket className="w-8 h-8 mr-3 text-blue-600" />
                  Solicitar Alimentos
                </h1>
              </div>
            </header>
            {/* Información del usuario */}
            {userData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información del Solicitante
                </h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <p>
                      <strong>Nombre:</strong> {userData.nombre}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    <p>
                      <strong>Cédula:</strong> {userData.cedula}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <p>
                      <strong>Teléfono:</strong> {userData.telefono}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ubicación */}
            {ubicacionSeleccionada && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-800 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Ubicación de Entrega
                </h3>
                <div className="text-sm text-green-700 mb-3">
                  <p>
                    <strong>Coordenadas:</strong> Lat{" "}
                    {ubicacionSeleccionada.latitud.toFixed(5)}, Lng{" "}
                    {ubicacionSeleccionada.longitud.toFixed(5)}
                  </p>
                  <p className="text-xs mt-1 text-green-600">
                    💡 Puedes ajustar la ubicación haciendo clic en el mapa o arrastrando el marcador
                  </p>
                </div>
                <MapboxMap
                  latitude={ubicacionSeleccionada.latitud}
                  longitude={ubicacionSeleccionada.longitud}
                  onLocationChange={manejarCambioUbicacion}
                  className="w-full h-48 rounded-lg border border-green-200"
                />
              </div>
            )}

            {/* Mensajes */}
            {mensaje && (
              <div
                className={`p-4 mb-6 rounded-lg text-white ${
                  mensaje.includes("éxito") ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {mensaje}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Detalles de la Solicitud
                </h3>
                <p className="text-gray-600">
                  Especifica qué alimentos necesitas
                </p>
              </div>

              <div className="space-y-4">
                {/* Filtro de Categoría */}
                <div>
                  <label
                    htmlFor="filtroCategoria"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Categoría de Alimentos
                  </label>
                  <select
                    id="filtroCategoria"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    value={filtroCategoria}
                    onChange={manejarCambioCategoria}
                  >
                    <option value="">Todas las categorías</option>
                    {categoriasUnicas.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Filtra por categoría para encontrar alimentos más fácilmente
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="tipoAlimento"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Productos *
                  </label>
                  <div className="relative" onBlur={manejarBlurContainer}>
                    <input
                      type="text"
                      id="tipoAlimento"
                      placeholder="Buscar o seleccionar producto..."
                      className="w-full border-2 border-gray-300 rounded-lg pl-11 pr-12 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      value={busquedaAlimento}
                      onChange={manejarBusquedaAlimento}
                      onFocus={manejarFocusInput}
                      required
                    />
                    <ShoppingBasket className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />

                    {alimentoSeleccionado && (
                      <button
                        type="button"
                        onClick={limpiarSeleccion}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors"
                        title="Limpiar selección"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    {/* Dropdown con los alimentos filtrados */}
                    {mostrarDropdown && !alimentoSeleccionado && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {alimentosFiltrados.length > 0 ? (
                          alimentosFiltrados.map((alimento) => (
                            <div
                              key={alimento.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => manejarSeleccionAlimento(alimento)}
                            >
                              <div className="font-medium text-gray-900">
                                {alimento.nombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                {alimento.categoria}
                              </div>
                            </div>
                          ))
                        ) : busquedaAlimento || filtroCategoria ? (
                          <div className="p-3 text-gray-500 text-center">
                            No se encontraron productos que coincidan con tu búsqueda
                            {filtroCategoria && ` en la categoría "${filtroCategoria}"`}
                          </div>
                        ) : (
                          <div className="p-3 text-gray-500 text-center">
                            {filtroCategoria 
                              ? `Escribe para buscar productos en "${filtroCategoria}"...` 
                              : "Escribe para buscar productos..."}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mostrar contador de resultados */}
                    {(busquedaAlimento || filtroCategoria) && !alimentoSeleccionado && (
                      <p className="text-sm text-gray-500 mt-1">
                        {alimentosFiltrados.length} producto
                        {alimentosFiltrados.length !== 1 ? "s" : ""} disponible
                        {alimentosFiltrados.length !== 1 ? "s" : ""}
                        {filtroCategoria && ` en "${filtroCategoria}"`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grid de Cantidad y Unidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cantidad"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Cantidad Solicitada *
                    </label>
                    <input
                      type="number"
                      id="cantidad"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      required
                      min="0.1"
                      step="0.1"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa la cantidad necesaria
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="unidad"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Unidad de Medida *
                    </label>
                    <select
                      id="unidad"
                      value={unidadId}
                      onChange={(e) => setUnidadId(e.target.value)}
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="">Selecciona una unidad</option>
                      {cargandoUnidades ? (
                        <option disabled>Cargando unidades...</option>
                      ) : (
                        unidades.map((unidad) => (
                          <option key={unidad.id} value={unidad.id}>
                            {unidad.nombre} ({unidad.simbolo})
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Selecciona la unidad de medida
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="comentarios"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Comentarios Adicionales (opcional)
                  </label>
                  <div className="relative">
                    <textarea
                      id="comentarios"
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pl-12 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Describe detalles adicionales sobre tu solicitud..."
                      rows={4}
                      maxLength={500}
                    />
                    <MessageCircle className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Máximo 500 caracteres
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  "Enviando Solicitud..."
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="bg-white shadow-sm p-4 mt-8">
          <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Banco de Alimentos. Todos los
            derechos reservados.
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
