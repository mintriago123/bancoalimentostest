'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface BloqueoTemporalModalProps {
  isOpen: boolean;
  userName: string;
  onConfirm: (duracion: number, unidad: 'horas' | 'dias', motivo: string) => void;
  onCancel: () => void;
}

const DURACIONES_PREDEFINIDAS = [
  { label: '1 hora', duracion: 1, unidad: 'horas' as const },
  { label: '6 horas', duracion: 6, unidad: 'horas' as const },
  { label: '12 horas', duracion: 12, unidad: 'horas' as const },
  { label: '1 día', duracion: 1, unidad: 'dias' as const },
  { label: '3 días', duracion: 3, unidad: 'dias' as const },
  { label: '7 días', duracion: 7, unidad: 'dias' as const },
  { label: '15 días', duracion: 15, unidad: 'dias' as const },
  { label: '30 días', duracion: 30, unidad: 'dias' as const }
];

export default function BloqueoTemporalModal({
  isOpen,
  userName,
  onConfirm,
  onCancel
}: BloqueoTemporalModalProps) {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [duracionCustom, setDuracionCustom] = useState<string>('');
  const [unidadCustom, setUnidadCustom] = useState<'horas' | 'dias'>('dias');
  const [modoCustom, setModoCustom] = useState(false);
  const [motivo, setMotivo] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!motivo.trim()) {
      return; // Requiere motivo
    }

    if (modoCustom) {
      const duracion = parseInt(duracionCustom);
      if (duracion > 0) {
        onConfirm(duracion, unidadCustom, motivo.trim());
      }
    } else if (seleccionado !== null) {
      const opcion = DURACIONES_PREDEFINIDAS[seleccionado];
      onConfirm(opcion.duracion, opcion.unidad, motivo.trim());
    }
  };

  const puedeConfirmar = motivo.trim() && (modoCustom 
    ? duracionCustom && parseInt(duracionCustom) > 0
    : seleccionado !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Bloqueo temporal
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {userName}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Selecciona por cuánto tiempo deseas bloquear temporalmente a este usuario:
          </p>

          {/* Opciones predefinidas */}
          {!modoCustom && (
            <div className="grid grid-cols-2 gap-2">
              {DURACIONES_PREDEFINIDAS.map((opcion, index) => (
                <button
                  key={index}
                  onClick={() => setSeleccionado(index)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    seleccionado === index
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opcion.label}
                </button>
              ))}
            </div>
          )}

          {/* Modo personalizado */}
          {modoCustom && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={duracionCustom}
                  onChange={(e) => setDuracionCustom(e.target.value)}
                  placeholder="Cantidad"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <select
                  value={unidadCustom}
                  onChange={(e) => setUnidadCustom(e.target.value as 'horas' | 'dias')}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="horas">Horas</option>
                  <option value="dias">Días</option>
                </select>
              </div>
            </div>
          )}

          {/* Campo de motivo */}
          <div className="space-y-2">
            <label htmlFor="motivo" className="block text-sm font-medium text-slate-700">
              Motivo del bloqueo <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Violación de términos de servicio, comportamiento inapropiado, etc."
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              required
            />
            {!motivo.trim() && (
              <p className="text-xs text-slate-500">El motivo es obligatorio</p>
            )}
          </div>

          {/* Toggle modo custom */}
          <button
            onClick={() => {
              setModoCustom(!modoCustom);
              setSeleccionado(null);
              setDuracionCustom('');
            }}
            className="text-sm text-rose-600 hover:text-rose-700 hover:underline"
          >
            {modoCustom ? '← Volver a opciones predefinidas' : 'Personalizar duración'}
          </button>

          {/* Info adicional */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-800">
              <strong>Nota:</strong> El usuario no podrá iniciar sesión hasta que expire el tiempo de bloqueo. 
              Para un bloqueo permanente, usa la opción "Desactivar".
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 p-6">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!puedeConfirmar}
            className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bloquear
          </button>
        </div>
      </div>
    </div>
  );
}
