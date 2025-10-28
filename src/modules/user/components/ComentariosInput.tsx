// ============================================================================
// Component: ComentariosInput
// Input de comentarios adicionales
// ============================================================================

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { FORM_CONFIG } from '../constants';

interface ComentariosInputProps {
  comentarios: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ComentariosInput({
  comentarios,
  onChange,
}: ComentariosInputProps) {
  return (
    <div>
      <label
        htmlFor="comentarios"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Comentarios Adicionales (opcional)
      </label>
      <div className="relative">
        <textarea
          id="comentarios"
          value={comentarios}
          onChange={onChange}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pl-12 focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="Describe detalles adicionales sobre tu solicitud..."
          rows={4}
          maxLength={FORM_CONFIG.COMENTARIOS_MAX_LENGTH}
        />
        <MessageCircle className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Máximo {FORM_CONFIG.COMENTARIOS_MAX_LENGTH} caracteres
      </p>
    </div>
  );
}
