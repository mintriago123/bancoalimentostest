import { useState, useCallback } from 'react';

type MessageType = 'success' | 'error' | 'info' | 'warning';

interface Message {
  type: MessageType;
  text: string;
}

interface UseMessageReturn {
  message: Message | null;
  showMessage: (type: MessageType, text: string, duration?: number) => void;
  clearMessage: () => void;
  showSuccess: (text: string, duration?: number) => void;
  showError: (text: string, duration?: number) => void;
  showInfo: (text: string, duration?: number) => void;
  showWarning: (text: string, duration?: number) => void;
}

export function useMessage(): UseMessageReturn {
  const [message, setMessage] = useState<Message | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const clearMessage = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setMessage(null);
  }, [timeoutId]);

  const showMessage = useCallback(
    (type: MessageType, text: string, duration: number = 5000) => {
      // Limpiar mensaje anterior
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setMessage({ type, text });

      // Auto-ocultar después del duration
      const newTimeoutId = setTimeout(() => {
        setMessage(null);
        setTimeoutId(null);
      }, duration);

      setTimeoutId(newTimeoutId);
    },
    [timeoutId]
  );

  const showSuccess = useCallback(
    (text: string, duration?: number) => showMessage('success', text, duration),
    [showMessage]
  );

  const showError = useCallback(
    (text: string, duration?: number) => showMessage('error', text, duration),
    [showMessage]
  );

  const showInfo = useCallback(
    (text: string, duration?: number) => showMessage('info', text, duration),
    [showMessage]
  );

  const showWarning = useCallback(
    (text: string, duration?: number) => showMessage('warning', text, duration),
    [showMessage]
  );

  return {
    message,
    showMessage,
    clearMessage,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
