import { useState } from 'react';
import { Trash2, X, AlertTriangle, Lock } from 'lucide-react';
import type { FoodRecord } from '../types';

interface DeleteConfirmModalProps {
  open: boolean;
  food?: FoodRecord | null;
  usageInfo?: {
    totalDonaciones: number;
    totalProductos: number;
  } | null;
  onClose: () => void;
  onConfirm: (cascade: boolean, password?: string) => Promise<void>;
}

const DeleteConfirmModal = ({ open, food, usageInfo, onClose, onConfirm }: DeleteConfirmModalProps) => {
  const [cascade, setCascade] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!open || !food) return null;

  const hasReferences = usageInfo && (usageInfo.totalDonaciones > 0 || usageInfo.totalProductos > 0);
  const totalReferencias = (usageInfo?.totalDonaciones || 0) + (usageInfo?.totalProductos || 0);
  const hasReferencesBoolean = Boolean(hasReferences);

  const handleConfirm = async () => {
    // Si tiene referencias y cascade está activado, validar contraseña
    if (hasReferencesBoolean && cascade) {
      if (!password.trim()) {
        setPasswordError('Debes ingresar tu contraseña para confirmar');
        return;
      }
    }

    setDeleting(true);
    setPasswordError('');
    await onConfirm(cascade, password);
    setDeleting(false);
    setCascade(false);
    setPassword('');
  };

  const handleClose = () => {
    setCascade(false);
    setPassword('');
    setPasswordError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-rose-200/60 bg-white/95 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-rose-500/15 p-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-rose-600">Eliminar alimento</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">
            ¿Estás seguro de que deseas eliminar <span className="font-semibold">{food.nombre}</span> del catálogo?
          </p>

          {hasReferences && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">Este alimento está siendo usado en:</p>
                  <ul className="text-amber-700 space-y-1 ml-1">
                    {usageInfo.totalDonaciones > 0 && (
                      <li>• {usageInfo.totalDonaciones} donación{usageInfo.totalDonaciones > 1 ? 'es' : ''}</li>
                    )}
                    {usageInfo.totalProductos > 0 && (
                      <li>• {usageInfo.totalProductos} producto{usageInfo.totalProductos > 1 ? 's' : ''} donado{usageInfo.totalProductos > 1 ? 's' : ''}</li>
                    )}
                  </ul>
                </div>
              </div>

              <label className="mt-3 flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cascade}
                  onChange={(e) => {
                    setCascade(e.target.checked);
                    setPasswordError('');
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-0"
                />
                <span className="text-xs text-amber-800">
                  Desvincular este alimento de todos los registros relacionados antes de eliminarlo
                </span>
              </label>

              {cascade && (
                <div className="mt-3 space-y-1">
                  <label htmlFor="admin-password" className="block text-xs font-medium text-amber-800 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Confirma tu contraseña para continuar
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  {passwordError && (
                    <p className="text-xs text-rose-600">{passwordError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!hasReferences && (
            <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting || (hasReferencesBoolean && (!cascade || (cascade && !password.trim())))}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
