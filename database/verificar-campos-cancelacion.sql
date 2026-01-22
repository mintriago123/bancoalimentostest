-- =====================================================
-- VERIFICAR CAMPOS DE CANCELACIÓN EN DONACIONES
-- =====================================================
-- Script para verificar si los campos de cancelación existen
-- =====================================================

-- Consulta para verificar si las columnas existen
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'donaciones'
  AND column_name IN (
    'motivo_cancelacion',
    'observaciones_cancelacion',
    'usuario_cancelacion_id',
    'fecha_cancelacion'
  )
ORDER BY column_name;

-- Si el resultado tiene 4 filas, los campos existen
-- Si el resultado está vacío o tiene menos de 4 filas, debes ejecutar:
-- database/agregar-campos-cancelacion-donaciones.sql
