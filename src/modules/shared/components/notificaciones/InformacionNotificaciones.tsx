'use client';

export function InformacionNotificaciones() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-base font-medium text-blue-900 mb-2">
        ℹ️ Información sobre las Notificaciones
      </h3>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• <strong>Email:</strong> Recibirás notificaciones en tu correo electrónico</li>
        <li>• <strong>Push:</strong> Notificaciones en tiempo real mientras usas la aplicación</li>
        <li>• <strong>Sonido:</strong> Reproducir sonido al recibir notificaciones push</li>
        <li>• Los cambios se guardan automáticamente</li>
        <li>• Puedes cambiar estas configuraciones en cualquier momento</li>
      </ul>
    </div>
  );
}
