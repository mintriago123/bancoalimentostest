/**
 * Componente selector de rol para registro
 */

import React from 'react';
import { Iconos } from '@/app/components/ui/Iconos';
import { ROLES_INFO } from '../constants';
import type { Rol } from '../types';

interface RoleSelectorProps {
  rolSeleccionado: Rol | null;
  onSeleccionarRol: (rol: Rol) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  rolSeleccionado,
  onSeleccionarRol,
}) => {
  if (rolSeleccionado) {
    return null;
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ROLES_INFO.map((rol) => (
        <button
          key={rol.valor}
          type="button"
          onClick={() => onSeleccionarRol(rol.valor)}
          className="rol-button flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-xl bg-white text-center transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-xl hover:border-blue-500"
        >
          {rol.valor === 'DONANTE' ? <Iconos.Donante /> : <Iconos.Solicitante />}
          <span className="font-bold text-xl mt-4">{rol.titulo}</span>
          <p className="text-sm text-gray-600 mt-2">{rol.descripcion}</p>
        </button>
      ))}
    </div>
  );
};
