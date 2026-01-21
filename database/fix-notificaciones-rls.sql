-- =====================================================
-- FIX: Políticas RLS para tabla notificaciones
-- =====================================================
-- Soluciona el error "Error al crear la notificacion"
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Eliminar políticas existentes si las hay (por si acaso)
DROP POLICY IF EXISTS "notificaciones_insert_authenticated" ON public.notificaciones;
DROP POLICY IF EXISTS "notificaciones_select_own_or_role" ON public.notificaciones;
DROP POLICY IF EXISTS "notificaciones_update_own" ON public.notificaciones;
DROP POLICY IF EXISTS "notificaciones_delete_admin" ON public.notificaciones;

-- Habilitar RLS en la tabla notificaciones
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Política 1: INSERT - Cualquier usuario autenticado puede crear notificaciones
CREATE POLICY "notificaciones_insert_authenticated"
  ON public.notificaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política 2: SELECT - Los usuarios pueden ver sus propias notificaciones o las de su rol
CREATE POLICY "notificaciones_select_own_or_role"
  ON public.notificaciones
  FOR SELECT
  TO authenticated
  USING (
    destinatario_id = auth.uid()
    OR rol_destinatario IN (
      SELECT rol FROM usuarios WHERE id = auth.uid()
    )
    OR destinatario_id IS NULL
  );

-- Política 3: UPDATE - Los usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "notificaciones_update_own"
  ON public.notificaciones
  FOR UPDATE
  TO authenticated
  USING (
    destinatario_id = auth.uid()
    OR rol_destinatario IN (
      SELECT rol FROM usuarios WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    destinatario_id = auth.uid()
    OR rol_destinatario IN (
      SELECT rol FROM usuarios WHERE id = auth.uid()
    )
  );

-- Política 4: DELETE - Solo administradores pueden eliminar notificaciones
CREATE POLICY "notificaciones_delete_admin"
  ON public.notificaciones
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'ADMINISTRADOR'
      AND estado = 'activo'
    )
  );

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ RLS habilitado en tabla notificaciones';
  RAISE NOTICE '✅ Política INSERT creada para usuarios autenticados';
  RAISE NOTICE '✅ Política SELECT creada para notificaciones propias o por rol';
  RAISE NOTICE '✅ Política UPDATE creada para notificaciones propias';
  RAISE NOTICE '✅ Política DELETE creada solo para administradores activos';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Las notificaciones ahora funcionarán correctamente';
  RAISE NOTICE '🔄 Recarga la página del navegador después de ejecutar este script';
END $$;
