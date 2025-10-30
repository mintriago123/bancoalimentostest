'use client';

import { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Type, 
  Keyboard, 
  Volume2, 
  ZoomIn, 
  X 
} from 'lucide-react';

export default function AccesibilidadFlotante() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  // Aplicar tamaño de fuente
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  // Navegación por teclado con lectura de voz
  useEffect(() => {
    if (keyboardNavEnabled) {
      document.body.classList.add('keyboard-navigation');
      
      // Leer elemento enfocado con Tab
      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        const text = target.textContent || target.getAttribute('aria-label') || target.getAttribute('title') || target.getAttribute('placeholder');
        
        if (text && text.trim()) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text.trim());
          utterance.lang = 'es-ES';
          utterance.rate = 0.9;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
      };

      document.addEventListener('focusin', handleFocus);
      
      return () => {
        document.removeEventListener('focusin', handleFocus);
        window.speechSynthesis.cancel();
      };
    } else {
      document.body.classList.remove('keyboard-navigation');
    }
  }, [keyboardNavEnabled]);

  // Lector de pantalla al pasar el mouse
  useEffect(() => {
    if (!screenReaderEnabled) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const text = target.textContent || target.getAttribute('aria-label') || target.getAttribute('title');
      
      if (text && text.trim()) {
        // Cancelar cualquier lectura anterior
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      window.speechSynthesis.cancel();
    };
  }, [screenReaderEnabled]);

  const aumentarTexto = () => {
    if (fontSize < 150) {
      setFontSize(prev => prev + 10);
    }
  };

  const disminuirTexto = () => {
    if (fontSize > 80) {
      setFontSize(prev => prev - 10);
    }
  };

  const resetearTexto = () => {
    setFontSize(100);
  };

  return (
    <>
      {/* Botón flotante principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Abrir panel de accesibilidad"
        title="Accesibilidad"
      >
        <Accessibility className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Panel de accesibilidad */}
      {isOpen && (
        <div className="fixed top-24 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              <h3 className="font-semibold">Accesibilidad</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-4 space-y-4">
            {/* Tamaño de texto */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Type className="w-4 h-4" />
                <span className="text-sm">Tamaño de texto</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={disminuirTexto}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                  disabled={fontSize <= 80}
                  aria-label="Disminuir tamaño de texto"
                >
                  A-
                </button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-semibold text-blue-600">{fontSize}%</span>
                </div>
                <button
                  onClick={aumentarTexto}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                  disabled={fontSize >= 150}
                  aria-label="Aumentar tamaño de texto"
                >
                  A+
                </button>
                <button
                  onClick={resetearTexto}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                  aria-label="Restablecer tamaño de texto"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Navegación por teclado */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Keyboard className="w-4 h-4" />
                  <span className="text-sm">Navegación por teclado</span>
                </div>
                <button
                  onClick={() => setKeyboardNavEnabled(!keyboardNavEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    keyboardNavEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={keyboardNavEnabled}
                  aria-label="Activar navegación por teclado"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      keyboardNavEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {keyboardNavEnabled && (
                <p className="text-xs text-gray-500 pl-6">
                  Use Tab para navegar y escuchar, Enter para seleccionar
                </p>
              )}
            </div>

            {/* Lector de pantalla */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Lector de pantalla</span>
                </div>
                <button
                  onClick={() => setScreenReaderEnabled(!screenReaderEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    screenReaderEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={screenReaderEnabled}
                  aria-label="Activar lector de pantalla"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      screenReaderEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {screenReaderEnabled && (
                <p className="text-xs text-gray-500 pl-6">
                  Pase el cursor sobre el texto para escucharlo
                </p>
              )}
            </div>

            {/* Información adicional */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <ZoomIn className="w-3 h-3" />
                <span>Use Ctrl + rueda del mouse para zoom adicional</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos adicionales para navegación por teclado */}
      <style jsx global>{`
        .keyboard-navigation *:focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 2px !important;
        }
        
        .keyboard-navigation button:focus,
        .keyboard-navigation a:focus,
        .keyboard-navigation input:focus,
        .keyboard-navigation select:focus,
        .keyboard-navigation textarea:focus {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3) !important;
        }
      `}</style>
    </>
  );
}
