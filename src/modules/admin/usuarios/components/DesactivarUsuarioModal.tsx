'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface DesactivarUsuarioModalProps {
  isOpen: boolean;
  userName: string;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

export default function DesactivarUsuarioModal({
  isOpen,
  userName,
  onConfirm,
  onCancel
}: DesactivarUsuarioModalProps) {
  const [motivo, setMotivo] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (motivo.trim()) {
      onConfirm(motivo.trim());
      setMotivo(''); // Limpiar para próxima vez
    }
  };

  const puedeConfirmar = motivo.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Desactivar permanentemente
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
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
            <p className="text-sm text-rose-800">
              <strong>⚠️ Acción permanente:</strong> Esta acción desactivará al usuario de forma permanente. 
              El usuario no podrá acceder al sistema hasta que sea reactivado manualmente por un administrador.
            </p>
          </div>

          {/* Campo de motivo */}
          <div className="space-y-2">
            <label htmlFor="motivo-desactivar" className="block text-sm font-medium text-slate-700">
              Motivo de la desactivación <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="motivo-desactivar"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Solicitud del usuario, incumplimiento de políticas, cierre de cuenta, etc."
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              required
              autoFocus
            />
            {!motivo.trim() && (
              <p className="text-xs text-slate-500">El motivo es obligatorio</p>
            )}
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
            Desactivar permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}
