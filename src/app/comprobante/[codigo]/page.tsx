'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import type { DatosComprobante } from '@/lib/comprobante/types';

interface ComprobanteResponse {
  success: boolean;
  tipo: 'solicitud' | 'donacion';
  comprobante: DatosComprobante;
  formatoFechas: {
    fechaEmision: string;
    fechaVencimiento: string;
    fechaCreacion: string;
  };
}

export default function ComprobantePage() {
  const params = useParams();
  const codigo = params.codigo as string;
  const [data, setData] = useState<ComprobanteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firmaEntrega, setFirmaEntrega] = useState('');
  const [firmaRecepcion, setFirmaRecepcion] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchComprobante = async () => {
      try {
        const response = await fetch(`/api/comprobante/${codigo}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Error al cargar el comprobante');
          return;
        }

        setData(result);
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    if (codigo) {
      fetchComprobante();
    }
  }, [codigo]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando comprobante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { comprobante, tipo, formatoFechas } = data;
  const esSolicitud = tipo === 'solicitud';

  return (
    <>
      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #comprobante-print, #comprobante-print * {
            visibility: visible;
          }
          #comprobante-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 py-8 px-4">
        {/* Botón de impresión */}
        <div className="max-w-3xl mx-auto mb-4 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Comprobante
          </button>
        </div>

        {/* Comprobante */}
        <div id="comprobante-print" ref={printRef} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`${esSolicitud ? 'bg-gradient-to-r from-green-600 to-blue-700' : 'bg-gradient-to-r from-green-600 to-green-700'} text-white p-8`}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Banco de Alimentos</h1>
                <p className="text-white/80">Comprobante Electrónico</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Código:</p>
                <p className="text-xl font-mono font-bold">{comprobante.codigoComprobante}</p>
              </div>
            </div>
          </div>

          {/* Tipo de comprobante */}
          <div className={`${esSolicitud ? 'bg-green-50 border-blue-200' : 'bg-green-50 border-green-200'} border-b px-8 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className={`font-bold ${esSolicitud ? 'text-green-800' : 'text-green-800'}`}>
                    {esSolicitud ? 'COMPROBANTE DE ENTREGA' : 'COMPROBANTE DE DONACIÓN'}
                  </h2>
                  <p className={`text-sm ${esSolicitud ? 'text-green-600' : 'text-green-600'}`}>
                    {esSolicitud ? 'Entrega de alimentos al beneficiario' : 'Recepción de donación'}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                comprobante.pedido.estado === 'aprobada' || comprobante.pedido.estado === 'Entregada'
                  ? 'bg-green-100 text-green-800'
                  : comprobante.pedido.estado === 'pendiente' || comprobante.pedido.estado === 'Pendiente'
                  ? 'bg-yellow-100 text-yellow-800'
                  : comprobante.pedido.estado === 'Recogida'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {comprobante.pedido.estado.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-8 space-y-8">
            {/* Fechas */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha Emisión</p>
                <p className="font-semibold text-gray-900">{formatoFechas.fechaEmision}</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha Solicitud</p>
                <p className="font-semibold text-gray-900">{formatoFechas.fechaCreacion}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Válido Hasta</p>
                <p className="font-semibold text-red-600">{formatoFechas.fechaVencimiento}</p>
              </div>
            </div>

            {/* Datos del Usuario */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                Datos del {esSolicitud ? 'Beneficiario' : 'Donante'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="font-semibold text-gray-900">{comprobante.usuario.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Documento de Identidad</p>
                  <p className="font-semibold text-gray-900">{comprobante.usuario.documento || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo Electrónico</p>
                  <p className="font-semibold text-gray-900">{comprobante.usuario.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-semibold text-gray-900">{comprobante.usuario.telefono || 'N/A'}</p>
                </div>
                {comprobante.usuario.direccion && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-semibold text-gray-900">{comprobante.usuario.direccion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del Pedido */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                Detalles del {esSolicitud ? 'Pedido' : 'Producto Donado'}
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cantidad</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-4 font-semibold text-gray-900">{comprobante.pedido.tipoAlimento}</td>
                      <td className="px-4 py-4 text-center font-bold text-xl text-black-600">{comprobante.pedido.cantidad}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{comprobante.pedido.unidad}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Firmas */}
            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Firma del {esSolicitud ? 'Beneficiario (Quien Recibe)' : 'Donante (Quien Entrega)'}
                </h4>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 h-32 flex flex-col justify-end">
                  <input
                    type="text"
                    value={firmaRecepcion}
                    onChange={(e) => setFirmaRecepcion(e.target.value)}
                    placeholder="Nombre y firma..."
                    className="border-t border-gray-300 pt-2 text-center text-sm text-gray-600 bg-transparent focus:outline-none no-print"
                  />
                  <div className="border-t border-gray-300 pt-2 text-center text-sm text-gray-600 print:block hidden">
                    {firmaRecepcion || '____________________________'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Cédula: {comprobante.usuario.documento || '________________'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Firma del Operador (Quien {esSolicitud ? 'Entrega' : 'Recibe'})
                </h4>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 h-32 flex flex-col justify-end">
                  <input
                    type="text"
                    value={firmaEntrega}
                    onChange={(e) => setFirmaEntrega(e.target.value)}
                    placeholder="Nombre y firma..."
                    className="border-t border-gray-300 pt-2 text-center text-sm text-gray-600 bg-transparent focus:outline-none no-print"
                  />
                  <div className="border-t border-gray-300 pt-2 text-center text-sm text-gray-600 print:block hidden">
                    {firmaEntrega || '____________________________'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Cédula: ________________
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Banco de Alimentos - ULEAM</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
