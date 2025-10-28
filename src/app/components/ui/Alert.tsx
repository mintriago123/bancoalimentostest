'use client';

interface AlertProps {
  readonly tipo: 'success' | 'error' | 'warning' | 'info';
  readonly mensaje: string;
  readonly onClose?: () => void;
}

export function Alert({ tipo, mensaje, onClose }: AlertProps) {
  const estilos = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  const iconos = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`p-4 rounded-md border ${estilos[tipo]} flex items-start justify-between`}>
      <div className="flex items-center">
        <span className="mr-2">{iconos[tipo]}</span>
        <span>{mensaje}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
