'use client';

import { EnvelopeIcon, BellIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { Switch } from './Switch';

interface ConfiguracionCategoria {
  categoria: string;
  nombre: string;
  descripcion: string;
  email_activo: boolean;
  push_activo: boolean;
  sonido_activo: boolean;
}

interface ConfiguracionCategoriaItemProps {
  readonly config: ConfiguracionCategoria;
  readonly onCambiar: (
    categoria: string, 
    tipo: 'email_activo' | 'push_activo' | 'sonido_activo', 
    valor: boolean
  ) => void;
  readonly guardando: boolean;
}

export function ConfiguracionCategoriaItem({
  config,
  onCambiar,
  guardando
}: ConfiguracionCategoriaItemProps) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900">
            {config.nombre}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {config.descripcion}
          </p>
        </div>

        <div className="ml-6 grid grid-cols-3 gap-6">
          {/* Email */}
          <div className="flex flex-col items-center space-y-2">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Email</span>
            <Switch
              checked={config.email_activo}
              onChange={(checked: boolean) => 
                onCambiar(config.categoria, 'email_activo', checked)
              }
              disabled={guardando}
            />
          </div>

          {/* Push */}
          <div className="flex flex-col items-center space-y-2">
            <BellIcon className="h-5 w-5 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Push</span>
            <Switch
              checked={config.push_activo}
              onChange={(checked: boolean) => 
                onCambiar(config.categoria, 'push_activo', checked)
              }
              disabled={guardando}
            />
          </div>

          {/* Sonido */}
          <div className="flex flex-col items-center space-y-2">
            <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Sonido</span>
            <Switch
              checked={config.sonido_activo}
              onChange={(checked: boolean) => 
                onCambiar(config.categoria, 'sonido_activo', checked)
              }
              disabled={guardando}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
