-- =====================================================
-- TABLA BAJAS DE PRODUCTOS
-- =====================================================
-- Permite registrar productos dados de baja sin eliminarlos
-- Incluye: responsable, motivo, fecha y observaciones
-- =====================================================

-- Crear tabla de bajas_productos
CREATE TABLE IF NOT EXISTS public.bajas_productos (
  id_baja uuid DEFAULT gen_random_uuid() NOT NULL,
  id_producto uuid NOT NULL,
  id_inventario uuid NOT NULL,
  cantidad_baja numeric NOT NULL CHECK (cantidad_baja > 0),
  motivo_baja text NOT NULL CHECK (motivo_baja IN ('vencido', 'dañado', 'contaminado', 'rechazado', 'otro')),
  usuario_responsable_id uuid NOT NULL,
  fecha_baja timestamp with time zone DEFAULT now() NOT NULL,
  observaciones text,
  estado_baja text DEFAULT 'confirmada' CHECK (estado_baja IN ('confirmada', 'pendiente_revision', 'revisada')),
  
  -- Datos adicionales del producto al momento de la baja
  nombre_producto text,
  cantidad_disponible_antes numeric,
  id_deposito uuid,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT bajas_productos_pkey PRIMARY KEY (id_baja),
  CONSTRAINT bajas_productos_id_producto_fkey 
    FOREIGN KEY (id_producto) REFERENCES public.productos_donados(id_producto) ON DELETE CASCADE,
  CONSTRAINT bajas_productos_id_inventario_fkey 
    FOREIGN KEY (id_inventario) REFERENCES public.inventario(id_inventario) ON DELETE CASCADE,
  CONSTRAINT bajas_productos_usuario_responsable_fkey 
    FOREIGN KEY (usuario_responsable_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT,
  CONSTRAINT bajas_productos_id_deposito_fkey 
    FOREIGN KEY (id_deposito) REFERENCES public.depositos(id_deposito) ON DELETE SET NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_bajas_productos_fecha ON public.bajas_productos USING btree (fecha_baja DESC);
CREATE INDEX IF NOT EXISTS idx_bajas_productos_producto ON public.bajas_productos USING btree (id_producto);
CREATE INDEX IF NOT EXISTS idx_bajas_productos_motivo ON public.bajas_productos USING btree (motivo_baja);
CREATE INDEX IF NOT EXISTS idx_bajas_productos_usuario ON public.bajas_productos USING btree (usuario_responsable_id);
CREATE INDEX IF NOT EXISTS idx_bajas_productos_estado ON public.bajas_productos USING btree (estado_baja);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_bajas_productos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bajas_productos_updated_at
  BEFORE UPDATE ON public.bajas_productos
  FOR EACH ROW
  EXECUTE FUNCTION update_bajas_productos_updated_at();

-- =====================================================
-- FUNCIÓN PARA DAR DE BAJA UN PRODUCTO
-- =====================================================
-- Registra la baja y actualiza el inventario automáticamente
CREATE OR REPLACE FUNCTION dar_baja_producto(
  p_id_inventario uuid,
  p_cantidad numeric,
  p_motivo text,
  p_usuario_id uuid,
  p_observaciones text DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  message text,
  id_baja uuid,
  cantidad_restante numeric
) AS $$
DECLARE
  v_id_producto uuid;
  v_id_deposito uuid;
  v_cantidad_actual numeric;
  v_nombre_producto text;
  v_nueva_cantidad numeric;
  v_id_baja uuid;
  v_rol_usuario text;
BEGIN
  -- Validar que el motivo sea válido
  IF p_motivo NOT IN ('vencido', 'dañado', 'contaminado', 'rechazado', 'otro') THEN
    RETURN QUERY SELECT false, 'Motivo de baja inválido', NULL::uuid, NULL::numeric;
    RETURN;
  END IF;

  -- Obtener el rol del usuario ejecutor
  SELECT rol INTO v_rol_usuario
  FROM usuarios
  WHERE id = p_usuario_id;

  -- Mapear rol de sistema a rol de movimiento
  -- ADMINISTRADOR y OPERADOR actúan como distribuidores en el sistema de movimientos
  IF v_rol_usuario IN ('ADMINISTRADOR', 'OPERADOR') THEN
    v_rol_usuario := 'distribuidor';
  ELSIF v_rol_usuario = 'DONANTE' THEN
    v_rol_usuario := 'donante';
  ELSIF v_rol_usuario IN ('USER', 'BENEFICIARIO') THEN
    v_rol_usuario := 'beneficiario';
  ELSE
    v_rol_usuario := 'distribuidor'; -- Por defecto
  END IF;

  -- Obtener información del inventario
  SELECT 
    i.id_producto, 
    i.id_deposito, 
    i.cantidad_disponible,
    p.nombre_producto
  INTO 
    v_id_producto, 
    v_id_deposito, 
    v_cantidad_actual,
    v_nombre_producto
  FROM inventario i
  LEFT JOIN productos_donados p ON p.id_producto = i.id_producto
  WHERE i.id_inventario = p_id_inventario;

  -- Verificar que existe el registro de inventario
  IF v_id_producto IS NULL THEN
    RETURN QUERY SELECT false, 'Registro de inventario no encontrado', NULL::uuid, NULL::numeric;
    RETURN;
  END IF;

  -- Verificar que hay suficiente cantidad
  IF v_cantidad_actual < p_cantidad THEN
    RETURN QUERY SELECT 
      false, 
      'Cantidad insuficiente en inventario. Disponible: ' || v_cantidad_actual, 
      NULL::uuid, 
      v_cantidad_actual;
    RETURN;
  END IF;

  -- Calcular nueva cantidad
  v_nueva_cantidad := v_cantidad_actual - p_cantidad;

  -- Registrar la baja
  INSERT INTO bajas_productos (
    id_producto,
    id_inventario,
    cantidad_baja,
    motivo_baja,
    usuario_responsable_id,
    observaciones,
    nombre_producto,
    cantidad_disponible_antes,
    id_deposito,
    estado_baja
  ) VALUES (
    v_id_producto,
    p_id_inventario,
    p_cantidad,
    p_motivo,
    p_usuario_id,
    p_observaciones,
    v_nombre_producto,
    v_cantidad_actual,
    v_id_deposito,
    'confirmada'
  ) RETURNING bajas_productos.id_baja INTO v_id_baja;

  -- Actualizar inventario
  UPDATE inventario 
  SET 
    cantidad_disponible = v_nueva_cantidad,
    fecha_actualizacion = NOW()
  WHERE id_inventario = p_id_inventario;

  -- Registrar movimiento en historial
  INSERT INTO movimiento_inventario_cabecera (
    id_donante,
    id_solicitante,
    estado_movimiento,
    observaciones
  ) VALUES (
    p_usuario_id,
    p_usuario_id,
    'completado',
    'Baja de producto - Motivo: ' || p_motivo
  );

  INSERT INTO movimiento_inventario_detalle (
    id_movimiento,
    id_producto,
    cantidad,
    tipo_transaccion,
    rol_usuario,
    observacion_detalle
  ) VALUES (
    (SELECT id_movimiento FROM movimiento_inventario_cabecera ORDER BY fecha_movimiento DESC LIMIT 1),
    v_id_producto,
    p_cantidad,
    'baja',
    v_rol_usuario,
    p_observaciones
  );

  -- Retornar éxito
  RETURN QUERY SELECT 
    true, 
    'Producto dado de baja exitosamente', 
    v_id_baja,
    v_nueva_cantidad;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VISTA PARA CONSULTAR BAJAS CON INFORMACIÓN DETALLADA
-- =====================================================
CREATE OR REPLACE VIEW v_bajas_productos_detalle AS
SELECT 
  bp.id_baja,
  bp.id_producto,
  bp.id_inventario,
  bp.cantidad_baja,
  bp.motivo_baja,
  bp.fecha_baja,
  bp.observaciones,
  bp.estado_baja,
  bp.nombre_producto,
  bp.cantidad_disponible_antes,
  bp.created_at,
  bp.updated_at,
  
  -- Información del usuario responsable
  u.id as usuario_id,
  u.nombre as usuario_nombre,
  u.email as usuario_email,
  u.rol as usuario_rol,
  
  -- Información del depósito
  d.id_deposito,
  d.nombre as deposito_nombre,
  d.descripcion as deposito_descripcion,
  
  -- Información del producto
  p.descripcion as producto_descripcion,
  p.unidad_medida,
  p.fecha_caducidad,
  
  -- Información de unidad
  un.nombre as unidad_nombre,
  un.simbolo as unidad_simbolo
  
FROM bajas_productos bp
LEFT JOIN usuarios u ON u.id = bp.usuario_responsable_id
LEFT JOIN depositos d ON d.id_deposito = bp.id_deposito
LEFT JOIN productos_donados p ON p.id_producto = bp.id_producto
LEFT JOIN unidades un ON un.id = p.unidad_id
ORDER BY bp.fecha_baja DESC;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================
-- Habilitar RLS
ALTER TABLE public.bajas_productos ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Usuarios autenticados pueden ver todas las bajas
CREATE POLICY "bajas_productos_select_authenticated"
  ON public.bajas_productos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.estado = 'activo'
    )
  );

-- Política INSERT: Solo ADMIN y OPERADOR pueden registrar bajas
CREATE POLICY "bajas_productos_insert_admin_operador"
  ON public.bajas_productos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol IN ('ADMINISTRADOR', 'OPERADOR')
      AND usuarios.estado = 'activo'
    )
  );

-- Política UPDATE: Solo ADMIN puede modificar bajas
CREATE POLICY "bajas_productos_update_admin"
  ON public.bajas_productos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'ADMINISTRADOR'
      AND usuarios.estado = 'activo'
    )
  );

-- Política DELETE: Solo ADMIN puede eliminar bajas (registros históricos)
CREATE POLICY "bajas_productos_delete_admin"
  ON public.bajas_productos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.rol = 'ADMINISTRADOR'
      AND usuarios.estado = 'activo'
    )
  );

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================
COMMENT ON TABLE public.bajas_productos IS 'Registro de productos dados de baja del inventario';
COMMENT ON COLUMN public.bajas_productos.motivo_baja IS 'Motivo de la baja: vencido, dañado, contaminado, rechazado, otro';
COMMENT ON COLUMN public.bajas_productos.estado_baja IS 'Estado del registro: confirmada, pendiente_revision, revisada';
COMMENT ON FUNCTION dar_baja_producto IS 'Función para dar de baja un producto y actualizar inventario automáticamente';

-- =====================================================
-- FUNCIÓN PARA OBTENER PRODUCTOS PRÓXIMOS A VENCER
-- =====================================================
CREATE OR REPLACE FUNCTION obtener_productos_proximos_vencer(
  p_dias_umbral integer DEFAULT 7
)
RETURNS TABLE (
  id_inventario uuid,
  id_producto uuid,
  nombre_producto text,
  cantidad_disponible numeric,
  fecha_caducidad timestamp with time zone,
  dias_para_vencer integer,
  id_deposito uuid,
  nombre_deposito text,
  unidad_simbolo text,
  prioridad text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id_inventario,
    i.id_producto,
    p.nombre_producto,
    i.cantidad_disponible,
    p.fecha_caducidad,
    EXTRACT(DAY FROM (p.fecha_caducidad - NOW()))::integer as dias_para_vencer,
    i.id_deposito,
    d.nombre as nombre_deposito,
    u.simbolo as unidad_simbolo,
    CASE 
      WHEN p.fecha_caducidad < NOW() THEN 'vencido'
      WHEN EXTRACT(DAY FROM (p.fecha_caducidad - NOW())) <= 3 THEN 'alta'
      WHEN EXTRACT(DAY FROM (p.fecha_caducidad - NOW())) <= p_dias_umbral THEN 'media'
      ELSE 'baja'
    END as prioridad
  FROM inventario i
  INNER JOIN productos_donados p ON p.id_producto = i.id_producto
  LEFT JOIN depositos d ON d.id_deposito = i.id_deposito
  LEFT JOIN unidades u ON u.id = p.unidad_id
  WHERE 
    p.fecha_caducidad IS NOT NULL
    AND i.cantidad_disponible > 0
    AND (
      p.fecha_caducidad < NOW() 
      OR EXTRACT(DAY FROM (p.fecha_caducidad - NOW())) <= p_dias_umbral
    )
  ORDER BY p.fecha_caducidad ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_productos_proximos_vencer IS 'Obtiene productos próximos a vencer o ya vencidos con su prioridad';

-- =====================================================
-- FUNCIÓN PARA ESTADÍSTICAS DE BAJAS
-- =====================================================
CREATE OR REPLACE FUNCTION obtener_estadisticas_bajas(
  p_fecha_inicio timestamp with time zone DEFAULT NOW() - INTERVAL '30 days',
  p_fecha_fin timestamp with time zone DEFAULT NOW()
)
RETURNS TABLE (
  total_bajas bigint,
  total_cantidad numeric,
  bajas_por_vencido bigint,
  bajas_por_danado bigint,
  bajas_por_contaminado bigint,
  bajas_por_rechazado bigint,
  bajas_por_otro bigint,
  cantidad_vencido numeric,
  cantidad_danado numeric,
  cantidad_contaminado numeric,
  cantidad_rechazado numeric,
  cantidad_otro numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_bajas,
    COALESCE(SUM(cantidad_baja), 0) as total_cantidad,
    COUNT(*) FILTER (WHERE motivo_baja = 'vencido')::bigint as bajas_por_vencido,
    COUNT(*) FILTER (WHERE motivo_baja = 'dañado')::bigint as bajas_por_danado,
    COUNT(*) FILTER (WHERE motivo_baja = 'contaminado')::bigint as bajas_por_contaminado,
    COUNT(*) FILTER (WHERE motivo_baja = 'rechazado')::bigint as bajas_por_rechazado,
    COUNT(*) FILTER (WHERE motivo_baja = 'otro')::bigint as bajas_por_otro,
    COALESCE(SUM(cantidad_baja) FILTER (WHERE motivo_baja = 'vencido'), 0) as cantidad_vencido,
    COALESCE(SUM(cantidad_baja) FILTER (WHERE motivo_baja = 'dañado'), 0) as cantidad_danado,
    COALESCE(SUM(cantidad_baja) FILTER (WHERE motivo_baja = 'contaminado'), 0) as cantidad_contaminado,
    COALESCE(SUM(cantidad_baja) FILTER (WHERE motivo_baja = 'rechazado'), 0) as cantidad_rechazado,
    COALESCE(SUM(cantidad_baja) FILTER (WHERE motivo_baja = 'otro'), 0) as cantidad_otro
  FROM bajas_productos
  WHERE fecha_baja BETWEEN p_fecha_inicio AND p_fecha_fin;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_estadisticas_bajas IS 'Obtiene estadísticas de bajas por periodo y motivo';

-- =====================================================
-- MENSAJES DE VERIFICACIÓN
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Tabla bajas_productos creada exitosamente';
  RAISE NOTICE '✅ Índices creados';
  RAISE NOTICE '✅ Función dar_baja_producto() disponible';
  RAISE NOTICE '✅ Función obtener_productos_proximos_vencer() disponible';
  RAISE NOTICE '✅ Función obtener_estadisticas_bajas() disponible';
  RAISE NOTICE '✅ Vista v_bajas_productos_detalle disponible';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Uso de funciones:';
  RAISE NOTICE '   - SELECT * FROM dar_baja_producto(id_inventario, cantidad, motivo, usuario_id, observaciones)';
  RAISE NOTICE '   - SELECT * FROM obtener_productos_proximos_vencer(7)';
  RAISE NOTICE '   - SELECT * FROM obtener_estadisticas_bajas()';
  RAISE NOTICE '   - SELECT * FROM v_bajas_productos_detalle';
END $$;
