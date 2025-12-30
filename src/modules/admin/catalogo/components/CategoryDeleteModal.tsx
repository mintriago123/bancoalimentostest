import { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface CategoryDeleteModalProps {
  open: boolean;
  categoryName?: string | null;
  foodCount?: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const CategoryDeleteModal = ({ 
  open, 
  categoryName, 
  foodCount = 0,
  onClose, 
  onConfirm 
}: CategoryDeleteModalProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!open || !categoryName) return null;

  const handleConfirm = async () => {
    // Validar que el texto coincida exactamente con el nombre de la categoría
    if (confirmText.trim() !== categoryName) {
      setError('El nombre de la categoría no coincide. Escribe exactamente el nombre para confirmar.');
      return;
    }

    setDeleting(true);
    setError('');
    await onConfirm();
    setDeleting(false);
    setConfirmText('');
  };

  const handleClose = () => {
    setConfirmText('');
    setError('');
    onClose();
  };

  const isConfirmDisabled = confirmText.trim() !== categoryName || deleting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-rose-200/60 bg-white/95 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-rose-500/15 p-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-rose-600">Eliminar categoría</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600">
            ¿Estás seguro de que deseas eliminar la categoría <span className="font-semibold">{categoryName}</span>?
          </p>

          {foodCount > 0 && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-rose-800 mb-1">
                    Esta categoría tiene {foodCount} alimento{foodCount > 1 ? 's' : ''} asociado{foodCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-rose-700 font-semibold">
                    Al eliminar esta categoría, también se eliminarán todos los alimentos asociados de forma permanente.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="confirm-category" className="block text-sm font-medium text-slate-700">
              Para confirmar, escribe el nombre de la categoría: <span className="font-semibold text-rose-600">{categoryName}</span>
            </label>
            <input
              id="confirm-category"
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError('');
              }}
              placeholder="Escribe el nombre exacto de la categoría"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            {error && (
              <p className="text-xs text-rose-600 mt-1">{error}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Eliminando...' : 'Eliminar categoría'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDeleteModal;
