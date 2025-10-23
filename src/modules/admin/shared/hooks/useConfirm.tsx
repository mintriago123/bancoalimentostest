'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

type ConfirmVariant = 'default' | 'danger' | 'warning';

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

interface PendingConfirmation extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);

  const value = useMemo(() => ({
    confirm: (options: ConfirmOptions) => new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    })
  }), []);

  const handleClose = (result: boolean) => {
    if (pending) {
      pending.resolve(result);
      setPending(null);
    }
  };

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmModal
        open={Boolean(pending)}
        title={pending?.title ?? ''}
        description={pending?.description}
        confirmLabel={pending?.confirmLabel}
        cancelLabel={pending?.cancelLabel}
        variant={pending?.variant}
        onConfirm={() => handleClose(true)}
        onCancel={() => handleClose(false)}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextValue['confirm'] => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm debe utilizarse dentro de un ConfirmProvider');
  }
  return context.confirm;
};
