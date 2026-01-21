/**
 * @fileoverview Modal para dar de baja productos del inventario
 * Permite registrar bajas con motivo, cantidad y observaciones
 */

'use client';

import { useState } from 'react';
import { X, AlertTriangle, Package, Calendar, FileText } from 'lucide-react';
import type { InventarioItem } from '@/modules/operador/inventario/types';
import type { MotivoBaja } from '@/modules/operador/bajas/types';

interface BajaProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventarioItem;
  onSuccess: () => void;
}

const motivosOptions: { value: MotivoBaja; label: string; description: string }[] = [
  { value: 'vencido', label: 'Producto Vencido', description: 'Fecha de caducidad superada' },
  { value: 'dañado', label: 'Producto Dañado', description: 'Empaque deteriorado o producto en mal estado' },
  { value: 'contaminado', label: 'Producto Contaminado', description: 'Posible contaminación o riesgo sanitario' },
  { value: 'rechazado', label: 'Producto Rechazado', description: 'No cumple con estándares de calidad' },
  { value: 'otro', label: 'Otro Motivo', description: 'Especificar en observaciones' }
];

export default function BajaProductoModal({
  isOpen,
  onClose,
  item,
  onSuccess
}: BajaProductoModalProps) {
  const [motivo, setMotivo] = useState<MotivoBaja>('vencido');
  const [cantidad, setCantidad] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cantidadNum = parseFloat(cantidad);

    // Validaciones
    if (!cantidadNum || cantidadNum <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (cantidadNum > item.cantidad_disponible) {
      setError(`La cantidad no puede ser mayor a ${item.cantidad_disponible}`);
      return;
    }

    if (motivo === 'otro' && !observaciones.trim()) {
      setError('Las observaciones son obligatorias cuando el motivo es "Otro"');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/operador/bajas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_inventario: item.id_inventario,
          cantidad: cantidadNum,
          motivo,
          observaciones: observaciones.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar la baja');
      }

      // Éxito
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMotivo('vencido');
    setCantidad('');
    setObservaciones('');
    setError(null);
    onClose();
  };

  const cantidadMaxima = item.cantidad_disponible;
  const estaVencido = item.producto.fecha_caducidad 
    ? new Date(item.producto.fecha_caducidad) < new Date()
    : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dar de Baja Producto</h2>
              <p className="text-sm text-gray-500">Registra la baja del producto sin eliminarlo</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Información del producto */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.producto.nombre_producto}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Disponible:</span> {item.cantidad_disponible} {item.producto.unidad_simbolo || ''}</p>
                <p><span className="font-medium">Depósito:</span> {item.deposito.nombre}</p>
                {item.producto.fecha_caducidad && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Vencimiento:</span>
                    <span className={estaVencido ? 'text-red-600 font-semibold' : ''}>
                      {new Date(item.producto.fecha_caducidad).toLocaleDateString('es-ES')}
                      {estaVencido && ' (VENCIDO)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Motivo de baja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de Baja <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {motivosOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    motivo === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="motivo"
                    value={option.value}
                    checked={motivo === option.value}
                    onChange={(e) => setMotivo(e.target.value as MotivoBaja)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a dar de baja <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                min="0"
                max={cantidadMaxima}
                step="0.01"
                placeholder={`Máximo: ${cantidadMaxima}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
                required
              />
              <span className="text-gray-600 font-medium">{item.producto.unidad_simbolo || ''}</span>
              <button
                type="button"
                onClick={() => setCantidad(cantidadMaxima.toString())}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Todo
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Cantidad disponible: {cantidadMaxima} {item.producto.unidad_simbolo || ''}
            </p>
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
                placeholder="Detalla el motivo de la baja, estado del producto, etc."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={isSubmitting}
                required={motivo === 'otro'}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Máximo 500 caracteres. {motivo === 'otro' ? 'Obligatorio para "Otro motivo"' : 'Opcional'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Advertencia */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-yellow-800">
                <p className="font-medium">Esta acción actualizará el inventario</p>
                <p className="mt-1">
                  La cantidad será descontada del inventario y quedará registrada permanentemente 
                  con tu usuario como responsable.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Confirmar Baja</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
