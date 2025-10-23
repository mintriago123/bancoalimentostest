import { Trash2, X } from 'lucide-react';
import type { FoodRecord } from '../types';

interface DeleteConfirmModalProps {
  open: boolean;
  food?: FoodRecord | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteConfirmModal = ({ open, food, onClose, onConfirm }: DeleteConfirmModalProps) => {
  if (!open || !food) return null;

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
          <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          ¿Estás seguro de que deseas eliminar <span className="font-semibold">{food.nombre}</span> del catálogo?
          Esta acción no se puede deshacer.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
