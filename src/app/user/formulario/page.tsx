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
  const [tipoAlimento, setTipoAlimento] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [comentarios, setComentarios] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<{
    latitud: number;
    longitud: number;
  } | null>(null);

  // Estados para la búsqueda de alimentos
  const [busquedaAlimento, setBusquedaAlimento] = useState("");
  const [alimentosFiltrados, setAlimentosFiltrados] = useState<any[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<any>(null);

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

  // Función para filtrar alimentos basado en la búsqueda
  const filtrarAlimentos = (termino: string) => {
    if (!termino.trim()) {
      setAlimentosFiltrados(alimentosDisponibles);
      return;
    }

    const terminoLower = termino.toLowerCase();
    const filtrados = alimentosDisponibles.filter(
      (alimento) =>
        alimento.nombre.toLowerCase().includes(terminoLower) ||
        alimento.categoria.toLowerCase().includes(terminoLower)
    );
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
    setBusquedaAlimento(alimento.nombre);
    setMostrarDropdown(false);
  };

  // Limpiar selección de alimento
  const limpiarSeleccion = () => {
    setAlimentoSeleccionado(null);
    setTipoAlimento("");
    setBusquedaAlimento("");
    setMostrarDropdown(true);
    filtrarAlimentos("");
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    if (!user || !userData || !tipoAlimento || cantidad <= 0) {
      setMensaje("Por favor completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("solicitudes").insert([
      {
        usuario_id: user.id,
        tipo_alimento: tipoAlimento,
        cantidad,
        comentarios,
        latitud: ubicacionSeleccionada?.latitud,
        longitud: ubicacionSeleccionada?.longitud,
      },
    ]);

    if (error) {
      setMensaje("Error al enviar la solicitud.");
    } else {
      setMensaje("Solicitud enviada con éxito.");
      setTipoAlimento("");
      setAlimentoSeleccionado(null);
      setBusquedaAlimento("");
      setCantidad(0);
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
                <div>
                  <label
                    htmlFor="tipoAlimento"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tipo de Alimento *
                  </label>
                  <div className="relative" onBlur={manejarBlurContainer}>
                    <input
                      type="text"
                      id="tipoAlimento"
                      placeholder="Buscar o seleccionar alimento..."
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none transition-colors"
                      value={busquedaAlimento}
                      onChange={manejarBusquedaAlimento}
                      onFocus={manejarFocusInput}
                      required
                    />
                    <ShoppingBasket className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

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
                        ) : busquedaAlimento ? (
                          <div className="p-3 text-gray-500 text-center">
                            No se encontraron alimentos que coincidan con "
                            {busquedaAlimento}"
                          </div>
                        ) : (
                          <div className="p-3 text-gray-500 text-center">
                            Escribe para buscar alimentos...
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mostrar contador de resultados si hay búsqueda activa */}
                    {busquedaAlimento && !alimentoSeleccionado && (
                      <p className="text-sm text-gray-500 mt-1">
                        {alimentosFiltrados.length} alimento
                        {alimentosFiltrados.length !== 1 ? "s" : ""} encontrado
                        {alimentosFiltrados.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cantidad"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Cantidad Solicitada *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="cantidad"
                      value={cantidad}
                      onChange={(e) => setCantidad(Number(e.target.value))}
                      required
                      min={1}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pl-12 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Ingresa la cantidad necesaria"
                    />
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Especifica la cantidad en kg, litros, unidades, etc.
                  </p>
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
