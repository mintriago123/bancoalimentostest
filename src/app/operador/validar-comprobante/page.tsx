'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Search, QrCode, Package, Gift, CheckCircle, XCircle, Clock, Truck, AlertCircle } from 'lucide-react';

interface SolicitudResult {
  tipo: 'solicitud';
  id: string;
  usuario_id: string;
  tipo_alimento: string;
  cantidad: number;
  estado: string;
  created_at: string;
  fecha_respuesta: string | null;
  comentario_admin: string | null;
  codigo_comprobante: string;
  unidades: { nombre: string; simbolo: string } | null;
  usuarios: {
    nombre: string;
    cedula: string;
    telefono: string;
    email: string;
    direccion: string;
  } | null;
}

interface DonacionResult {
  tipo: 'donacion';
  id: number;
  user_id: string;
  nombre_donante: string;
  cedula_donante: string | null;
  ruc_donante: string | null;
  telefono: string;
  email: string;
  tipo_producto: string;
  cantidad: number;
  unidad_simbolo: string;
  estado: string;
  creado_en: string;
  actualizado_en: string;
  codigo_comprobante: string;
  direccion_donante_completa: string | null;
}

type SearchResult = SolicitudResult | DonacionResult;

export default function ValidarComprobantePage() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const buscarPorCodigo = useCallback(async () => {
    if (!codigo.trim()) {
      setError('Por favor ingrese un código de comprobante');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Buscar en solicitudes
      const { data: solicitud, error: solError } = await supabase
        .from('solicitudes')
        .select(`
          id,
          usuario_id,
          tipo_alimento,
          cantidad,
          estado,
          created_at,
          fecha_respuesta,
          comentario_admin,
          codigo_comprobante,
          unidades (nombre, simbolo),
          usuarios (nombre, cedula, telefono, email, direccion)
        `)
        .eq('codigo_comprobante', codigo.trim().toUpperCase())
        .maybeSingle();

      if (solicitud) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sol = solicitud as any;
        setResult({
          tipo: 'solicitud',
          id: sol.id,
          usuario_id: sol.usuario_id,
          tipo_alimento: sol.tipo_alimento,
          cantidad: sol.cantidad,
          estado: sol.estado,
          created_at: sol.created_at,
          fecha_respuesta: sol.fecha_respuesta,
          comentario_admin: sol.comentario_admin,
          codigo_comprobante: sol.codigo_comprobante,
          unidades: sol.unidades,
          usuarios: sol.usuarios,
        } as SolicitudResult);
        setLoading(false);
        return;
      }

      // Buscar en donaciones
      const { data: donacion, error: donError } = await supabase
        .from('donaciones')
        .select('*')
        .eq('codigo_comprobante', codigo.trim().toUpperCase())
        .maybeSingle();

      if (donacion) {
        setResult({ ...donacion, tipo: 'donacion' } as DonacionResult);
        setLoading(false);
        return;
      }

      setError('No se encontró ningún registro con ese código de comprobante');
    } catch (err) {
      console.error('Error buscando:', err);
      setError('Error al buscar el comprobante');
    } finally {
      setLoading(false);
    }
  }, [codigo, supabase]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarPorCodigo();
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'aprobada':
      case 'entregada':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rechazada':
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pendiente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'recogida':
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEstadoBadge = (estado: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2';
    switch (estado.toLowerCase()) {
      case 'aprobada':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'entregada':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'rechazada':
      case 'cancelada':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pendiente':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'recogida':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarcarEntregada = async () => {
    if (!result) return;

    const confirmado = window.confirm(
      result.tipo === 'solicitud'
        ? '¿Confirmar que los alimentos han sido entregados al beneficiario?'
        : '¿Confirmar que la donación ha sido recibida e ingresada al inventario?'
    );

    if (!confirmado) return;

    setLoading(true);

    try {
      if (result.tipo === 'solicitud') {
        const { error } = await supabase
          .from('solicitudes')
          .update({ estado: 'entregada', fecha_respuesta: new Date().toISOString() })
          .eq('id', result.id);

        if (error) throw error;
        setResult({ ...result, estado: 'entregada' });
      } else {
        const { error } = await supabase
          .from('donaciones')
          .update({ estado: 'Entregada', actualizado_en: new Date().toISOString() })
          .eq('id', result.id);

        if (error) throw error;
        setResult({ ...result, estado: 'Entregada' });
      }

      alert('Estado actualizado exitosamente');
    } catch (err) {
      console.error('Error actualizando estado:', err);
      alert('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const abrirComprobante = () => {
    if (!result) return;
    window.open(`/operador/comprobante/${result.codigo_comprobante}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <QrCode className="h-8 w-8 text-red-600" />
            Validar Comprobante
          </h1>
          <p className="mt-2 text-gray-600">
            Ingrese el código de comprobante para buscar la solicitud o donación asociada.
          </p>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese código (ej: SOL-XXXXXX-XXXXXX)"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-mono uppercase"
              />
            </div>
            <button
              onClick={buscarPorCodigo}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Buscar
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        {/* Resultado */}
        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header del resultado */}
            <div className={`p-6 ${result.tipo === 'solicitud' ? 'bg-red-50 border-b border-red-100' : 'bg-green-50 border-b border-green-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {result.tipo === 'solicitud' ? (
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Gift className="h-6 w-6 text-green-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {result.tipo === 'solicitud' ? 'Solicitud de Alimentos' : 'Donación'}
                    </h2>
                    <p className="text-sm text-gray-600 font-mono">{result.codigo_comprobante}</p>
                  </div>
                </div>
                <span className={getEstadoBadge(result.estado)}>
                  {getEstadoIcon(result.estado)}
                  {result.estado.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Datos del usuario */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {result.tipo === 'solicitud' ? 'Datos del Beneficiario' : 'Datos del Donante'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium text-gray-900">
                      {result.tipo === 'solicitud' 
                        ? result.usuarios?.nombre ?? 'N/A'
                        : result.nombre_donante}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Documento</p>
                    <p className="font-medium text-gray-900">
                      {result.tipo === 'solicitud'
                        ? result.usuarios?.cedula ?? 'N/A'
                        : result.cedula_donante ?? result.ruc_donante ?? 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">
                      {result.tipo === 'solicitud'
                        ? result.usuarios?.telefono ?? 'N/A'
                        : result.telefono}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
                      {result.tipo === 'solicitud'
                        ? result.usuarios?.email ?? 'N/A'
                        : result.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles del pedido */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Detalles del {result.tipo === 'solicitud' ? 'Pedido' : 'Producto'}
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cantidad</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {result.tipo === 'solicitud' ? result.tipo_alimento : result.tipo_producto}
                        </td>
                        <td className="px-4 py-4 text-center text-xl font-bold text-red-600">
                          {result.cantidad}
                        </td>
                        <td className="px-4 py-4 text-center text-gray-600">
                          {result.tipo === 'solicitud' 
                            ? result.unidades?.simbolo ?? 'unidades'
                            : result.unidad_simbolo}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Información de Fechas
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Fecha de Creación</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(result.tipo === 'solicitud' ? result.created_at : result.creado_en)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Última Actualización</p>
                    <p className="font-medium text-gray-900">
                      {result.tipo === 'solicitud'
                        ? result.fecha_respuesta ? formatDate(result.fecha_respuesta) : 'Sin actualizar'
                        : formatDate(result.actualizado_en)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={abrirComprobante}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <QrCode className="h-5 w-5" />
                  Ver Comprobante Completo
                </button>
                
                {((result.tipo === 'solicitud' && result.estado === 'aprobada') ||
                  (result.tipo === 'donacion' && result.estado === 'Recogida')) && (
                  <button
                    onClick={handleMarcarEntregada}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Marcar como Entregada
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        {!result && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instrucciones
            </h3>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li>• Ingrese el código de comprobante que aparece en el email del usuario</li>
              <li>• Los códigos de solicitud comienzan con <strong>SOL-</strong></li>
              <li>• Los códigos de donación comienzan con <strong>DON-</strong></li>
              <li>• También puede escanear el código QR del comprobante</li>
              <li>• Verifique los datos del usuario antes de realizar la entrega</li>
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
