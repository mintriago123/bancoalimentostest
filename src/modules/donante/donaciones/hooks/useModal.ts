import { useState } from 'react';

interface UseModalReturn<T> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  setData: (data: T | null) => void;
}

export function useModal<T = any>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = (modalData?: T) => {
    if (modalData) {
      setData(modalData);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    // Limpiar datos después de un pequeño delay para permitir animaciones de cierre
    setTimeout(() => setData(null), 150);
  };

  return {
    isOpen,
    data,
    open,
    close,
    setData,
  };
}
