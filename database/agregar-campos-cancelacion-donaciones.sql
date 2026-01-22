-- =====================================================
-- AGREGAR CAMPOS DE CANCELACIÓN A DONACIONES
-- =====================================================
-- Permite registrar información detallada al cancelar donaciones
-- Incluye: motivo, observaciones, usuario responsable y fecha
-- =====================================================

-- Agregar columnas para información de cancelación
ALTER TABLE public.donaciones
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT CHECK (
  motivo_cancelacion IN (
    'error_donante',           -- El donante cometió un error al registrar
    'no_disponible',           -- El producto ya no está disponible
    'calidad_inadecuada',      -- El producto no cumple con los estándares de calidad
    'logistica_imposible',     -- No se puede coordinar la logística
    'duplicado',               -- Donación registrada por error/duplicada
    'solicitud_donante',       -- El donante solicita cancelar
    'otro'                     -- Otro motivo (requiere observaciones)
  )
),
ADD COLUMN IF NOT EXISTS observaciones_cancelacion TEXT,
ADD COLUMN IF NOT EXISTS usuario_cancelacion_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS fecha_cancelacion TIMESTAMP WITH TIME ZONE;

-- Comentarios para documentación
COMMENT ON COLUMN public.donaciones.motivo_cancelacion IS 
  'Motivo específico por el cual se canceló la donación';

COMMENT ON COLUMN public.donaciones.observaciones_cancelacion IS 
  'Observaciones detalladas sobre la cancelación (obligatorio cuando motivo es "otro")';

COMMENT ON COLUMN public.donaciones.usuario_cancelacion_id IS 
  'ID del usuario (administrador u operador) que canceló la donación';

COMMENT ON COLUMN public.donaciones.fecha_cancelacion IS 
  'Fecha y hora exacta cuando se canceló la donación';

-- Validación: Si el motivo es 'otro', las observaciones son obligatorias
ALTER TABLE public.donaciones
ADD CONSTRAINT check_observaciones_cancelacion
CHECK (
  motivo_cancelacion IS NULL OR
  motivo_cancelacion != 'otro' OR
  (motivo_cancelacion = 'otro' AND observaciones_cancelacion IS NOT NULL AND LENGTH(TRIM(observaciones_cancelacion)) > 0)
);

-- NOTA: No agregamos el constraint check_cancelacion_completa de forma estricta
-- porque podría haber donaciones canceladas existentes sin los nuevos campos.
-- En su lugar, la aplicación validará esto al momento de cancelar.

-- Si deseas aplicar el constraint estricto (solo si NO hay donaciones canceladas antiguas):
-- ALTER TABLE public.donaciones
-- ADD CONSTRAINT check_cancelacion_completa
-- CHECK (
--   estado != 'Cancelada' OR
--   (estado = 'Cancelada' AND motivo_cancelacion IS NOT NULL AND usuario_cancelacion_id IS NOT NULL AND fecha_cancelacion IS NOT NULL)
-- );

COMMENT ON CONSTRAINT check_observaciones_cancelacion ON public.donaciones IS
  'Garantiza que cuando el motivo es "otro", se proporcionen observaciones detalladas';
