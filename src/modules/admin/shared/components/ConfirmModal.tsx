'use client';

import { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

type Variant = 'default' | 'danger' | 'warning';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  onConfirm: () => void;
  onCancel: () => void;
};

const VARIANT_ICON: Record<Variant, { icon: ReactNode; ring: string; text: string; button: string; buttonHover: string }> = {
  default: {
    icon: <Info className="h-5 w-5" />,
    ring: 'bg-slate-500/15 text-slate-600',
    text: 'text-slate-600',
    button: 'bg-slate-900 text-white',
    buttonHover: 'hover:bg-slate-700'
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    ring: 'bg-amber-500/15 text-amber-600',
    text: 'text-amber-600',
    button: 'bg-amber-500 text-white',
    buttonHover: 'hover:bg-amber-600'
  },
  danger: {
    icon: <AlertTriangle className="h-5 w-5" />,
    ring: 'bg-rose-500/15 text-rose-600',
    text: 'text-rose-600',
    button: 'bg-rose-500 text-white',
    buttonHover: 'hover:bg-rose-600'
  }
};


const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel
}: ConfirmModalProps) => {
  if (!open) return null;

  const variantStyles = VARIANT_ICON[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${variantStyles.ring}`}>
            {variantStyles.icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${variantStyles.button} ${variantStyles.buttonHover}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
