'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  notificaciones_email: boolean;
  notificaciones_push: boolean;
  modo_mantenimiento: boolean;
  registro_publico: boolean;
  max_solicitudes_dia: number;
  tiempo_respuesta_horas: number;
  backup_automatico: boolean;
  logs_detallados: boolean;
}

export default function AdminConfiguracionPage() {
  const { supabase } = useSupabase();
  const [settings, setSettings] = useState<SystemSettings>({
    notificaciones_email: true,
    notificaciones_push: true,
    modo_mantenimiento: false,
    registro_publico: true,
    max_solicitudes_dia: 50,
    tiempo_respuesta_horas: 24,
    backup_automatico: true,
    logs_detallados: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // En una implementación real, cargarías estos datos desde la base de datos
      // Por ahora usamos valores por defecto
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setMessage({ type: 'error', text: 'Error al cargar la configuración' });
      setIsLoading(false);
    }
  };

  const handleSettingChange = (setting: keyof SystemSettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Aquí implementarías la lógica para guardar en la base de datos
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular llamada API
      
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      setIsChangingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Cog6ToothIcon className="w-8 h-8 mr-3 text-red-600" />
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las configuraciones generales del sistema y tu cuenta de administrador
          </p>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuración de Notificaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BellIcon className="w-5 h-5 mr-2 text-red-600" />
              Notificaciones
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="notif_email" className="text-sm font-medium text-gray-700">
                    Notificaciones por Email
                  </label>
                  <p className="text-xs text-gray-500">
                    Recibir alertas importantes por correo electrónico
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingChange('notificaciones_email', !settings.notificaciones_email)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notificaciones_email ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificaciones_email ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="notif_push" className="text-sm font-medium text-gray-700">
                    Notificaciones Push
                  </label>
                  <p className="text-xs text-gray-500">
                    Notificaciones en tiempo real en el navegador
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingChange('notificaciones_push', !settings.notificaciones_push)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notificaciones_push ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificaciones_push ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Configuración del Sistema */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-red-600" />
              Sistema
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="modo_mant" className="text-sm font-medium text-gray-700">
                    Modo Mantenimiento
                  </label>
                  <p className="text-xs text-gray-500">
                    Deshabilitar acceso público temporalmente
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingChange('modo_mantenimiento', !settings.modo_mantenimiento)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.modo_mantenimiento ? 'bg-yellow-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.modo_mantenimiento ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="registro_pub" className="text-sm font-medium text-gray-700">
                    Registro Público
                  </label>
                  <p className="text-xs text-gray-500">
                    Permitir nuevos registros de usuarios
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingChange('registro_publico', !settings.registro_publico)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.registro_publico ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.registro_publico ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="backup_auto" className="text-sm font-medium text-gray-700">
                    Backup Automático
                  </label>
                  <p className="text-xs text-gray-500">
                    Respaldos automáticos de la base de datos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSettingChange('backup_automatico', !settings.backup_automatico)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.backup_automatico ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.backup_automatico ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Límites y Rendimiento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-red-600" />
              Límites y Rendimiento
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="max_solicitudes" className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Solicitudes por Día
                </label>
                <input
                  type="number"
                  id="max_solicitudes"
                  min="1"
                  max="1000"
                  value={settings.max_solicitudes_dia}
                  onChange={(e) => handleSettingChange('max_solicitudes_dia', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número máximo de solicitudes que se pueden crear por día
                </p>
              </div>

              <div>
                <label htmlFor="tiempo_respuesta" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Respuesta (horas)
                </label>
                <input
                  type="number"
                  id="tiempo_respuesta"
                  min="1"
                  max="168"
                  value={settings.tiempo_respuesta_horas}
                  onChange={(e) => handleSettingChange('tiempo_respuesta_horas', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tiempo máximo para responder a una solicitud
                </p>
              </div>
            </div>
          </div>

          {/* Cambio de Contraseña */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <KeyIcon className="w-5 h-5 mr-2 text-red-600" />
              Cambiar Contraseña
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="current_password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Tu contraseña actual"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Tu nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Confirma tu nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Botón para guardar configuración general */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                Guardando...
              </>
            ) : (
              'Guardar Configuración'
            )}
          </button>
        </div>

        {/* Información del sistema */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">Última actualización: </span>
              <span className="font-medium ml-1">Hoy</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">Usuarios activos: </span>
              <span className="font-medium ml-1">---</span>
            </div>
            <div className="flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">Solicitudes hoy: </span>
              <span className="font-medium ml-1">---</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
