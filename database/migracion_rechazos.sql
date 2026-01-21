-- =====================================================
-- MIGRACIÓN: Agregar campos para detalles de rechazo y aprobación de solicitudes
-- Fecha: 15 de enero de 2026
-- =====================================================

-- Agregar columnas a la tabla solicitudes para registrar detalles de rechazo
ALTER TABLE public.solicitudes
  ADD COLUMN IF NOT EXISTS motivo_rechazo text,
  ADD COLUMN IF NOT EXISTS operador_rechazo_id uuid,
  ADD COLUMN IF NOT EXISTS fecha_rechazo timestamp with time zone;

-- Agregar columnas para registrar detalles de aprobación
ALTER TABLE public.solicitudes
  ADD COLUMN IF NOT EXISTS operador_aprobacion_id uuid,
  ADD COLUMN IF NOT EXISTS fecha_aprobacion timestamp with time zone;

-- Crear índices para mejora de rendimiento en consultas de rechazos
CREATE INDEX IF NOT EXISTS idx_solicitudes_motivo_rechazo ON public.solicitudes(motivo_rechazo);
CREATE INDEX IF NOT EXISTS idx_solicitudes_operador_rechazo ON public.solicitudes(operador_rechazo_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha_rechazo ON public.solicitudes(fecha_rechazo);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado_fecha_respuesta ON public.solicitudes(estado, fecha_respuesta);

-- Crear índices para aprobaciones
CREATE INDEX IF NOT EXISTS idx_solicitudes_operador_aprobacion ON public.solicitudes(operador_aprobacion_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha_aprobacion ON public.solicitudes(fecha_aprobacion);

-- Comentarios descriptivos para las nuevas columnas
COMMENT ON COLUMN public.solicitudes.motivo_rechazo IS 'Motivo del rechazo de la solicitud (stock_insuficiente, producto_no_disponible, datos_incompletos, etc.)';
COMMENT ON COLUMN public.solicitudes.operador_rechazo_id IS 'ID del operador o admin que rechazó la solicitud';
COMMENT ON COLUMN public.solicitudes.fecha_rechazo IS 'Fecha y hora exacta cuando se rechazó la solicitud';
COMMENT ON COLUMN public.solicitudes.operador_aprobacion_id IS 'ID del operador o admin que aprobó la solicitud';
COMMENT ON COLUMN public.solicitudes.fecha_aprobacion IS 'Fecha y hora exacta cuando se aprobó la solicitud';

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'solicitudes'
ORDER BY ordinal_position;