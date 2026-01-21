/**
 * @fileoverview Modal para cancelar donaciones
 * Permite registrar cancelaciones con motivo, observaciones y usuario responsable
 */

'use client';

import { useState } from 'react';
import { X, AlertTriangle, Package, FileText } from 'lucide-react';
import type { Donation, MotivoCancelacion } from '../types';

interface CancelarDonacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  donacion: Donation | null;
  onConfirm: (motivo: MotivoCancelacion, observaciones?: string) => Promise<void>;
  isProcessing?: boolean;
}

const motivosOptions: { value: MotivoCancelacion; label: string; description: string }[] = [
  { value: 'error_donante', label: 'Error del Donante', description: 'El donante cometió un error al registrar' },
  { value: 'no_disponible', label: 'Producto No Disponible', description: 'El producto ya no está disponible para donar' },
  { value: 'calidad_inadecuada', label: 'Calidad Inadecuada', description: 'El producto no cumple con estándares de calidad' },
  { value: 'logistica_imposible', label: 'Logística Imposible', description: 'No se puede coordinar la logística de recolección' },
  { value: 'duplicado', label: 'Donación Duplicada', description: 'Donación registrada por error o duplicada' },
  { value: 'solicitud_donante', label: 'Solicitud del Donante', description: 'El donante solicita cancelar la donación' },
  { value: 'otro', label: 'Otro Motivo', description: 'Especificar en observaciones' }
];

export default function CancelarDonacionModal({
  isOpen,
  onClose,
  donacion,
  onConfirm,
  isProcessing = false
}: CancelarDonacionModalProps) {
  const [motivo, setMotivo] = useState<MotivoCancelacion>('solicitud_donante');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación: observaciones obligatorias si el motivo es "otro"
    if (motivo === 'otro' && !observaciones.trim()) {
      setError('Las observaciones son obligatorias cuando el motivo es "Otro"');
      return;
    }

    try {
      await onConfirm(motivo, observaciones.trim() || undefined);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la cancelación');
    }
  };

  const handleClose = () => {
    setMotivo('solicitud_donante');
    setObservaciones('');
    setError(null);
    onClose();
  };

  // No renderizar si no está abierto o no hay donación
  if (!isOpen || !donacion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Cancelar Donación</h2>
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-red-700 rounded-full p-1 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Información de la donación */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-gray-600" />
              <div>
                <span className="font-semibold text-gray-700">Donación:</span>
                <span className="ml-2 text-gray-900">
                  {donacion.cantidad} {donacion.unidad_simbolo} de {donacion.tipo_producto}
                </span>
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Donante:</span>
              <span className="ml-2 text-gray-900">{donacion.nombre_donante}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Estado actual:</span>
              <span className="ml-2 text-gray-900">{donacion.estado}</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Motivo de cancelación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de Cancelación <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {motivosOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    motivo === option.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-red-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="motivo"
                    value={option.value}
                    checked={motivo === option.value}
                    onChange={(e) => setMotivo(e.target.value as MotivoCancelacion)}
                    className="mt-1"
                    disabled={isProcessing}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones {motivo === 'otro' && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={4}
                placeholder="Detalla el motivo de la cancelación, información adicional, etc."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                disabled={isProcessing}
                required={motivo === 'otro'}
              />
            </div>
            {motivo === 'otro' && (
              <p className="mt-1 text-xs text-gray-500">
                Las observaciones son obligatorias cuando seleccionas "Otro Motivo"
              </p>
            )}
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Advertencia */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">⚠️ Acción Importante</p>
                <p>
                  Al cancelar esta donación, se notificará al donante sobre la cancelación.
                  Esta acción no se puede deshacer fácilmente.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Confirmar Cancelación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
