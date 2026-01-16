-- Script para agregar campo de código de comprobante a solicitudes y donaciones
-- Ejecutar en Supabase SQL Editor

-- Agregar campo codigo_comprobante a la tabla solicitudes
ALTER TABLE public.solicitudes 
ADD COLUMN IF NOT EXISTS codigo_comprobante text;

-- Crear índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_solicitudes_codigo_comprobante 
ON public.solicitudes(codigo_comprobante);

-- Agregar campo codigo_comprobante a la tabla donaciones
ALTER TABLE public.donaciones 
ADD COLUMN IF NOT EXISTS codigo_comprobante text;

-- Crear índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_donaciones_codigo_comprobante 
ON public.donaciones(codigo_comprobante);

-- Comentarios descriptivos
COMMENT ON COLUMN public.solicitudes.codigo_comprobante IS 'Código único del comprobante generado al aprobar la solicitud';
COMMENT ON COLUMN public.donaciones.codigo_comprobante IS 'Código único del comprobante generado al procesar la donación';
