'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/app/components/DashboardLayout';
import { ArrowLeft, Printer, QrCode, Package, Gift, Building2, Calendar, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

interface ComprobanteData {
  tipo: 'solicitud' | 'donacion';
  codigo: string;
  estado: string;
  producto: string;
  cantidad: number;
  unidad: string;
  fechaCreacion: string;
  fechaRespuesta: string | null;
  usuario: {
    nombre: string;
    cedula: string;
    telefono: string;
    email: string;
    direccion: string;
  };
  comentario?: string;
}

export default function ComprobantePage({ params }: { params: Promise<{ codigo: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<ComprobanteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const codigo = resolvedParams.codigo;
      
      try {
        // Determinar tipo por prefijo
        const esSolicitud = codigo.startsWith('SOL-');
        const esDonacion = codigo.startsWith('DON-');

        if (esSolicitud) {
          const { data: solicitud, error } = await supabase
            .from('solicitudes')
            .select(`
              id, tipo_alimento, cantidad, estado, created_at, fecha_respuesta, comentario_admin, codigo_comprobante,
              unidades (nombre, simbolo),
              usuarios (nombre, cedula, telefono, email, direccion)
            `)
            .eq('codigo_comprobante', codigo)
            .single();

          if (error || !solicitud) throw new Error('Solicitud no encontrada');

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sol = solicitud as any;
          setData({
            tipo: 'solicitud',
            codigo: sol.codigo_comprobante,
            estado: sol.estado,
            producto: sol.tipo_alimento,
            cantidad: sol.cantidad,
            unidad: sol.unidades?.simbolo ?? 'unidades',
            fechaCreacion: sol.created_at,
            fechaRespuesta: sol.fecha_respuesta,
            usuario: {
              nombre: sol.usuarios?.nombre ?? 'N/A',
              cedula: sol.usuarios?.cedula ?? 'N/A',
              telefono: sol.usuarios?.telefono ?? 'N/A',
              email: sol.usuarios?.email ?? 'N/A',
              direccion: sol.usuarios?.direccion ?? 'N/A',
            },
            comentario: sol.comentario_admin ?? undefined,
          });
        } else if (esDonacion) {
          const { data: donacion, error } = await supabase
            .from('donaciones')
            .select('*')
            .eq('codigo_comprobante', codigo)
            .single();

          if (error || !donacion) throw new Error('Donación no encontrada');

          setData({
            tipo: 'donacion',
            codigo: donacion.codigo_comprobante,
            estado: donacion.estado,
            producto: donacion.tipo_producto,
            cantidad: donacion.cantidad,
            unidad: donacion.unidad_simbolo,
            fechaCreacion: donacion.creado_en,
            fechaRespuesta: donacion.actualizado_en,
            usuario: {
              nombre: donacion.nombre_donante,
              cedula: donacion.cedula_donante ?? donacion.ruc_donante ?? 'N/A',
              telefono: donacion.telefono,
              email: donacion.email,
              direccion: donacion.direccion_donante_completa ?? 'N/A',
            },
          });
        } else {
          throw new Error('Código de comprobante inválido');
        }

        // Generar QR
        const url = `${window.location.origin}/operador/comprobante/${codigo}`;
        const qr = await QRCode.toDataURL(url, { width: 200, margin: 2 });
        setQrImage(qr);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.codigo, supabase]);

  const handlePrint = () => {
    window.print();
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <QrCode className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Comprobante no encontrado</h2>
            <p className="text-red-600 mb-6">{error ?? 'El código ingresado no corresponde a ningún registro.'}</p>
            <Link
              href="/operador/validar-comprobante"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a buscar
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Botones no imprimibles */}
      <div className="max-w-4xl mx-auto p-6 print:hidden">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/operador/validar-comprobante"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Printer className="h-5 w-5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Comprobante imprimible */}
      <div className="comprobante-container max-w-4xl mx-auto p-6 print:p-0 print:max-w-none">
        <div id="comprobante-contenido" className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-0">
          {/* Header con logo y datos del banco */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 print:bg-red-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Building2 className="h-12 w-12" />
                <div>
                  <h1 className="text-2xl font-bold">Banco de Alimentos</h1>
                  <p className="text-red-100">Comprobante Electrónico de {data.tipo === 'solicitud' ? 'Entrega' : 'Donación'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-100">Código de verificación:</p>
                <p className="font-mono font-bold text-lg">{data.codigo}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Estado y tipo */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {data.tipo === 'solicitud' ? (
                  <Package className="h-8 w-8 text-red-600" />
                ) : (
                  <Gift className="h-8 w-8 text-green-600" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {data.tipo === 'solicitud' ? 'Solicitud de Alimentos' : 'Donación de Alimentos'}
                  </h2>
                  <p className="text-gray-500">
                    {data.tipo === 'solicitud' 
                      ? 'Comprobante de entrega al beneficiario'
                      : 'Comprobante de recepción de donación'}
                  </p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold ${
                data.estado.toLowerCase() === 'aprobada' || data.estado.toLowerCase() === 'entregada'
                  ? 'bg-green-100 text-green-800'
                  : data.estado.toLowerCase() === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {data.estado.toUpperCase()}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Columna izquierda - Datos del usuario */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {data.tipo === 'solicitud' ? 'Datos del Beneficiario' : 'Datos del Donante'}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Nombre completo</p>
                        <p className="font-medium text-gray-900">{data.usuario.nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Documento de identidad</p>
                        <p className="font-medium text-gray-900">{data.usuario.cedula}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium text-gray-900">{data.usuario.telefono}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Correo electrónico</p>
                        <p className="font-medium text-gray-900">{data.usuario.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="font-medium text-gray-900">{data.usuario.direccion}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalle del producto */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Detalle del Producto
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cantidad</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Unidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-200">
                          <td className="px-4 py-4 font-medium text-gray-900">{data.producto}</td>
                          <td className="px-4 py-4 text-center text-2xl font-bold text-red-600">{data.cantidad}</td>
                          <td className="px-4 py-4 text-center text-gray-600">{data.unidad}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Calendar className="h-4 w-4" />
                      Fecha de registro
                    </div>
                    <p className="font-medium text-gray-900">{formatDate(data.fechaCreacion)}</p>
                  </div>
                  {data.fechaRespuesta && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Calendar className="h-4 w-4" />
                        Fecha de procesamiento
                      </div>
                      <p className="font-medium text-gray-900">{formatDate(data.fechaRespuesta)}</p>
                    </div>
                  )}
                </div>

                {data.comentario && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Observaciones:</h4>
                    <p className="text-blue-700">{data.comentario}</p>
                  </div>
                )}
              </div>

              {/* Columna derecha - QR */}
              <div className="flex flex-col items-center justify-start">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Código QR de verificación
                  </h3>
                  {qrImage && (
                    <img src={qrImage} alt="QR Code" className="w-48 h-48 mx-auto" />
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Escanee para verificar
                  </p>
                </div>
              </div>
            </div>

            {/* Firmas */}
            <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-300">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 text-center">
                Firmas de Conformidad
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="h-24 border-b-2 border-gray-400 mb-2"></div>
                  <p className="font-medium text-gray-700">
                    {data.tipo === 'solicitud' ? 'Firma del Beneficiario' : 'Firma del Donante'}
                  </p>
                  <p className="text-sm text-gray-500">Nombre: {data.usuario.nombre}</p>
                  <p className="text-sm text-gray-500">C.I.: {data.usuario.cedula}</p>
                </div>
                <div className="text-center">
                  <div className="h-24 border-b-2 border-gray-400 mb-2"></div>
                  <p className="font-medium text-gray-700">Firma del Operador</p>
                  <p className="text-sm text-gray-500">Banco de Alimentos</p>
                  <p className="text-sm text-gray-500">Fecha: _______________</p>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Este documento es un comprobante electrónico válido emitido por el Banco de Alimentos.</p>
              <p>Para verificar su autenticidad, escanee el código QR o visite nuestro sitio web.</p>
              <p className="font-mono text-xs mt-2">{data.codigo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }
          
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          
          /* Ocultar sidebar, header, botones de navegación y accesibilidad */
          aside,
          nav,
          header,
          footer,
          .print\\:hidden,
          [class*="Sidebar"],
          [class*="sidebar"],
          [class*="Accesibilidad"],
          [class*="accesibilidad"],
          button[aria-label],
          .fixed {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Reset del layout principal */
          body > div,
          #__next,
          main {
            margin: 0 !important;
            padding: 0 !important;
            margin-left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Forzar que el contenedor del dashboard no tenga margen */
          [class*="ml-"] {
            margin-left: 0 !important;
          }
          
          /* Escalar y centrar el comprobante */
          .comprobante-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: scale(0.72) !important;
            transform-origin: top center !important;
            background: white !important;
            z-index: 999999 !important;
          }
          
          #comprobante-contenido {
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
