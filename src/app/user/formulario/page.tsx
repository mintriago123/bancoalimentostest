"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/components/SupabaseProvider";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useInventoryStock } from "@/modules/user/hooks/useInventoryStock";
import { ShoppingBasket, Send, AlertTriangle } from "lucide-react";
import {
  useDatosBasicosUsuario,
  useAlimentos,
  useUnidades,
  useUbicacion,
  useSolicitudes,
  UserInfoCard,
  UbicacionCard,
  AlimentoSelector,
  InventarioInfo,
  CantidadUnidadInputs,
  ComentariosInput,
  SolicitudFormData,
  Alimento,
  MESSAGES,
  FORM_CONFIG,
} from "@/modules/user";

export default function FormularioSolicitante() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  // Hooks de datos
  const { userData } = useDatosBasicosUsuario(supabase, user?.id);
  const {
    alimentosFiltrados,
    categorias,
    busqueda,
    filtroCategoria,
    setBusqueda,
    setFiltroCategoria,
    filtrarAlimentos,
    obtenerUnidadesAlimento,
  } = useAlimentos(supabase);
  const { unidades, loading: loadingUnidades } = useUnidades(supabase);
  const { ubicacion, setUbicacion } = useUbicacion();
  const { createSolicitud } = useSolicitudes(supabase, user?.id);

  // Hook de inventario
  const {
    stockInfo,
    loadingState: inventoryLoadingState,
    errorMessage: inventoryErrorMessage,
    checkStock,
    clearStock,
    isStockSufficient,
    getStockMessage,
  } = useInventoryStock(supabase);

  // Estados locales del formulario
  const [tipoAlimento, setTipoAlimento] = useState("");
  const [alimentoId, setAlimentoId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [unidadId, setUnidadId] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para el selector de alimentos
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<Alimento | null>(null);

  // Manejadores
  const manejarBusquedaAlimento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);

    if (alimentoSeleccionado && valor !== alimentoSeleccionado.nombre) {
      setAlimentoSeleccionado(null);
      setTipoAlimento("");
      setAlimentoId(null);
    }

    filtrarAlimentos(valor);
    setMostrarDropdown(true);
  };

  const manejarFocusInput = () => {
    if (!alimentoSeleccionado) {
      setMostrarDropdown(true);
      filtrarAlimentos(busqueda);
    }
  };

  const manejarSeleccionAlimento = (alimento: Alimento) => {
    setAlimentoSeleccionado(alimento);
    setTipoAlimento(alimento.nombre);
    setAlimentoId(alimento.id);
    setBusqueda(alimento.nombre);
    setMostrarDropdown(false);

    // Limpiar unidad seleccionada cuando cambia el alimento
    setUnidadId("");

    // Consultar inventario automáticamente
    checkStock(alimento.nombre);
  };

  const limpiarSeleccion = () => {
    setAlimentoSeleccionado(null);
    setTipoAlimento("");
    setAlimentoId(null);
    setBusqueda("");
    setMostrarDropdown(true);
    filtrarAlimentos("", filtroCategoria);
    clearStock();
  };

  const manejarCambioCategoria = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoria = e.target.value;
    setFiltroCategoria(categoria);

    if (alimentoSeleccionado) {
      setAlimentoSeleccionado(null);
      setTipoAlimento("");
      setAlimentoId(null);
      setBusqueda("");
      clearStock();
    }

    filtrarAlimentos("", categoria);
    setMostrarDropdown(false);
  };

  const manejarBlurContainer = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        setMostrarDropdown(false);
      }, 150);
    }
  };

  const manejarCambioUbicacion = (lat: number, lng: number) => {
    setUbicacion({ latitud: lat, longitud: lng });
  };

  const manejarUseMaxStock = () => {
    if (stockInfo && stockInfo.producto_encontrado) {
      setCantidad(stockInfo.total_disponible.toString());
    }
  };

  // Obtener unidades disponibles para el alimento seleccionado
  const getUnidadesDisponibles = () => {
    if (!alimentoId) {
      return [];
    }

    // Obtener unidades específicas del alimento seleccionado
    const unidadesAlimento = obtenerUnidadesAlimento(alimentoId);
    
    // Si el alimento no tiene unidades configuradas, mostrar todas
    if (unidadesAlimento.length === 0) {
      return unidades;
    }

    // Convertir UnidadAlimento a Unidad
    return unidadesAlimento.map(u => ({
      id: u.unidad_id,
      nombre: u.nombre,
      simbolo: u.simbolo
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    const cantidadNum = parseFloat(cantidad);

    if (!user || !userData || !tipoAlimento || !cantidad || cantidadNum <= 0 || !unidadId) {
      setMensaje(MESSAGES.VALIDATION.REQUIRED_FIELDS);
      setLoading(false);
      return;
    }

    // Verificar que la ubicación esté disponible
    if (!ubicacion || ubicacion.latitud === null || ubicacion.longitud === null) {
      setMensaje("Debes compartir tu ubicación para enviar la solicitud. Por favor, permite el acceso a tu ubicación en el navegador.");
      setLoading(false);
      return;
    }

    // Verificar stock disponible si hay información de inventario
    if (stockInfo && stockInfo.producto_encontrado && !isStockSufficient(cantidadNum)) {
      const cantidadDisponible = stockInfo.total_formateado
        ? `${stockInfo.total_formateado.cantidad} ${stockInfo.total_formateado.simbolo}`
        : `${stockInfo.total_disponible} ${stockInfo.unidad_simbolo || stockInfo.unidad_nombre || 'unidades'}`;
      
      const unidad = stockInfo.unidad_simbolo || stockInfo.unidad_nombre || 'unidades';
      
      setMensaje(
        `${MESSAGES.SOLICITUD.STOCK_INSUFFICIENT} Solo hay ${cantidadDisponible} disponibles y has solicitado ${cantidadNum} ${unidad}.`
      );
      setLoading(false);
      return;
    }

    const solicitudData: SolicitudFormData = {
      tipo_alimento: tipoAlimento,
      cantidad: cantidadNum,
      unidad_id: parseInt(unidadId),
      comentarios,
      latitud: ubicacion?.latitud || null,
      longitud: ubicacion?.longitud || null,
    };

    const success = await createSolicitud(solicitudData);

    if (success) {
      setMensaje(MESSAGES.SOLICITUD.SUCCESS_CREATE);
      // Limpiar formulario
      setTipoAlimento("");
      setAlimentoId(null);
      setAlimentoSeleccionado(null);
      setBusqueda("");
      setFiltroCategoria("");
      setCantidad("");
      setUnidadId("");
      setComentarios("");
      clearStock();
    } else {
      setMensaje(MESSAGES.SOLICITUD.ERROR_CREATE);
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
            {userData && <UserInfoCard userData={userData} />}

            {/* Ubicación */}
            {ubicacion && (
              <UbicacionCard
                ubicacion={ubicacion}
                onUbicacionChange={manejarCambioUbicacion}
              />
            )}

            {/* Alerta de ubicación requerida */}
            {!ubicacion && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">
                      Ubicación requerida
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Para enviar tu solicitud, debes compartir tu ubicación. Por favor, permite el acceso a tu ubicación en el navegador para continuar.
                    </p>
                  </div>
                </div>
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
                {/* Selector de alimentos */}
                <AlimentoSelector
                  alimentos={[]}
                  alimentosFiltrados={alimentosFiltrados}
                  alimentoSeleccionado={alimentoSeleccionado}
                  busqueda={busqueda}
                  filtroCategoria={filtroCategoria}
                  categorias={categorias}
                  mostrarDropdown={mostrarDropdown}
                  onBusquedaChange={manejarBusquedaAlimento}
                  onCategoriaChange={manejarCambioCategoria}
                  onAlimentoSelect={manejarSeleccionAlimento}
                  onLimpiarSeleccion={limpiarSeleccion}
                  onFocus={manejarFocusInput}
                  onBlur={manejarBlurContainer}
                />

                {/* Información de inventario */}
                {alimentoSeleccionado && (
                  <InventarioInfo
                    stockInfo={stockInfo}
                    loadingState={inventoryLoadingState}
                    errorMessage={inventoryErrorMessage || null}
                    cantidad={parseFloat(cantidad) || 0}
                    isStockSufficient={isStockSufficient}
                    getStockMessage={getStockMessage}
                    onUseMaxStock={manejarUseMaxStock}
                  />
                )}

                {/* Cantidad y Unidad */}
                <CantidadUnidadInputs
                  cantidad={cantidad}
                  unidadId={unidadId}
                  unidades={getUnidadesDisponibles()}
                  loadingUnidades={loadingUnidades === 'loading'}
                  stockInfo={stockInfo}
                  isStockSufficient={isStockSufficient}
                  onCantidadChange={(e) => setCantidad(e.target.value)}
                  onUnidadChange={(e) => setUnidadId(e.target.value)}
                  onUseMaxStock={manejarUseMaxStock}
                />

                {/* Comentarios */}
                <ComentariosInput
                  comentarios={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !ubicacion ||
                  (!!cantidad &&
                    parseFloat(cantidad) > 0 &&
                    !!stockInfo &&
                    stockInfo.producto_encontrado &&
                    !isStockSufficient(parseFloat(cantidad)))
                }
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg shadow-md transition-colors font-semibold ${
                  loading ||
                  !ubicacion ||
                  (!!cantidad &&
                    parseFloat(cantidad) > 0 &&
                    !!stockInfo &&
                    stockInfo.producto_encontrado &&
                    !isStockSufficient(parseFloat(cantidad)))
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  "Enviando Solicitud..."
                ) : !ubicacion ? (
                  <>
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Ubicación Requerida
                  </>
                ) : !!cantidad &&
                  parseFloat(cantidad) > 0 &&
                  !!stockInfo &&
                  stockInfo.producto_encontrado &&
                  !isStockSufficient(parseFloat(cantidad)) ? (
                  <>
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Stock Insuficiente
                  </>
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
