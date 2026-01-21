-- =====================================================
-- ROLLBACK COMPLETO - SISTEMA DE BAJAS
-- =====================================================
-- Este script elimina completamente el sistema de bajas
-- sin afectar ningún otro dato del sistema
-- =====================================================

-- Deshabilitar RLS temporalmente
ALTER TABLE IF EXISTS public.bajas_productos DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas RLS
DROP POLICY IF EXISTS "bajas_productos_select_authenticated" ON public.bajas_productos;
DROP POLICY IF EXISTS "bajas_productos_insert_admin_operador" ON public.bajas_productos;
DROP POLICY IF EXISTS "bajas_productos_update_admin" ON public.bajas_productos;
DROP POLICY IF EXISTS "bajas_productos_delete_admin" ON public.bajas_productos;

-- Eliminar vista
DROP VIEW IF EXISTS public.v_bajas_productos_detalle;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.obtener_estadisticas_bajas(timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS public.obtener_productos_proximos_vencer(integer);
DROP FUNCTION IF EXISTS public.dar_baja_producto(uuid, numeric, text, uuid, text);

-- Eliminar trigger y función de trigger
DROP TRIGGER IF EXISTS trigger_update_bajas_productos_updated_at ON public.bajas_productos;
DROP FUNCTION IF EXISTS public.update_bajas_productos_updated_at();

-- Eliminar índices (se eliminan automáticamente con la tabla, pero por claridad)
DROP INDEX IF EXISTS public.idx_bajas_productos_fecha;
DROP INDEX IF EXISTS public.idx_bajas_productos_producto;
DROP INDEX IF EXISTS public.idx_bajas_productos_motivo;
DROP INDEX IF EXISTS public.idx_bajas_productos_usuario;
DROP INDEX IF EXISTS public.idx_bajas_productos_estado;

-- Eliminar tabla (esto eliminará TODOS los registros de bajas)
-- ⚠️ ADVERTENCIA: Esta operación eliminará los datos históricos de bajas
DROP TABLE IF EXISTS public.bajas_productos CASCADE;

-- =====================================================
-- MENSAJES DE VERIFICACIÓN
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE '🔄 Rollback completado exitosamente';
  RAISE NOTICE '✅ Tabla bajas_productos eliminada';
  RAISE NOTICE '✅ Todas las funciones eliminadas';
  RAISE NOTICE '✅ Vista eliminada';
  RAISE NOTICE '✅ Políticas RLS eliminadas';
  RAISE NOTICE '✅ Índices eliminados';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Los datos de bajas han sido eliminados';
  RAISE NOTICE '📋 Las demás tablas (inventario, productos, usuarios) NO fueron afectadas';
END $$;
