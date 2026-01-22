


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."cancelar_eliminacion_categoria"("p_eliminacion_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Implementación placeholder
  RETURN true;
END;
$$;


ALTER FUNCTION "public"."cancelar_eliminacion_categoria"("p_eliminacion_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convertir_cantidad"("p_cantidad" numeric, "p_unidad_origen_id" bigint, "p_unidad_destino_id" bigint) RETURNS numeric
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_factor_conversion numeric;
  v_cantidad_convertida numeric;
BEGIN
  -- Si son la misma unidad, no hay conversión
  IF p_unidad_origen_id = p_unidad_destino_id THEN
    RETURN p_cantidad;
  END IF;

  -- Buscar factor de conversión directo
  SELECT factor_conversion INTO v_factor_conversion
  FROM public.conversiones
  WHERE unidad_origen_id = p_unidad_origen_id
    AND unidad_destino_id = p_unidad_destino_id;

  IF FOUND THEN
    RETURN p_cantidad * v_factor_conversion;
  END IF;

  -- Buscar factor de conversión inverso
  SELECT 1.0 / factor_conversion INTO v_factor_conversion
  FROM public.conversiones
  WHERE unidad_origen_id = p_unidad_destino_id
    AND unidad_destino_id = p_unidad_origen_id;

  IF FOUND THEN
    RETURN p_cantidad * v_factor_conversion;
  END IF;

  -- Si no se encuentra conversión, retornar NULL
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."convertir_cantidad"("p_cantidad" numeric, "p_unidad_origen_id" bigint, "p_unidad_destino_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."crear_notificacion"("p_titulo" character varying, "p_mensaje" "text", "p_tipo" character varying, "p_destinatario_id" "uuid", "p_rol_destinatario" character varying, "p_categoria" character varying, "p_url_accion" character varying DEFAULT NULL::character varying, "p_metadatos" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_notificacion_id uuid;
BEGIN
  INSERT INTO public.notificaciones (
    titulo,
    mensaje,
    tipo,
    destinatario_id,
    rol_destinatario,
    categoria,
    url_accion,
    metadatos,
    leida,
    activa,
    fecha_creacion
  )
  VALUES (
    p_titulo,
    p_mensaje,
    COALESCE(p_tipo, 'info'),
    p_destinatario_id,
    p_rol_destinatario,
    p_categoria,
    p_url_accion,
    COALESCE(p_metadatos, '{}'::jsonb),
    false,
    true,
    now()
  )
  RETURNING id INTO v_notificacion_id;
  
  RETURN v_notificacion_id;
END;
$$;


ALTER FUNCTION "public"."crear_notificacion"("p_titulo" character varying, "p_mensaje" "text", "p_tipo" character varying, "p_destinatario_id" "uuid", "p_rol_destinatario" character varying, "p_categoria" character varying, "p_url_accion" character varying, "p_metadatos" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."crear_producto_desde_donacion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_producto_id uuid;
  v_deposito_id uuid;
BEGIN
  IF NEW.estado = 'Entregada' THEN
    -- Obtener el primer depósito disponible
    SELECT id_deposito INTO v_deposito_id
    FROM public.depositos
    LIMIT 1;
    
    IF v_deposito_id IS NULL THEN
      RAISE EXCEPTION 'No hay depósitos disponibles';
    END IF;
    
    -- Insertar o actualizar el producto donado
    -- Primero buscar si ya existe un producto con el mismo nombre normalizado y unidad
    SELECT id_producto INTO v_producto_id
    FROM public.productos_donados
    WHERE lower(TRIM(BOTH FROM nombre_producto)) = lower(TRIM(BOTH FROM NEW.tipo_producto))
      AND unidad_id = NEW.unidad_id;
    
    IF v_producto_id IS NOT NULL THEN
      -- Si existe, actualizar la cantidad
      UPDATE public.productos_donados
      SET cantidad = cantidad + NEW.cantidad
      WHERE id_producto = v_producto_id;
    ELSE
      -- Si no existe, insertar nuevo producto
      INSERT INTO public.productos_donados (
        id_usuario,
        nombre_producto,
        descripcion,
        cantidad,
        unidad_medida,
        fecha_caducidad,
        alimento_id,
        unidad_id
      )
      VALUES (
        NEW.user_id,
        NEW.tipo_producto,
        NEW.observaciones,
        NEW.cantidad,
        NEW.unidad_nombre,
        NEW.fecha_vencimiento,
        NEW.alimento_id,
        NEW.unidad_id
      )
      RETURNING id_producto INTO v_producto_id;
    END IF;
    
    -- Insertar o actualizar el inventario
    -- Verificar si ya existe este producto en el inventario
    IF EXISTS (
      SELECT 1 FROM public.inventario
      WHERE id_deposito = v_deposito_id
        AND id_producto = v_producto_id
    ) THEN
      -- Si existe, actualizar la cantidad
      UPDATE public.inventario
      SET 
        cantidad_disponible = cantidad_disponible + NEW.cantidad,
        fecha_actualizacion = now()
      WHERE id_deposito = v_deposito_id
        AND id_producto = v_producto_id;
    ELSE
      -- Si no existe, insertar nuevo registro
      INSERT INTO public.inventario (
        id_deposito,
        id_producto,
        cantidad_disponible
      )
      VALUES (
        v_deposito_id,
        v_producto_id,
        NEW.cantidad
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."crear_producto_desde_donacion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dar_baja_producto"("p_id_inventario" "uuid", "p_cantidad" numeric, "p_motivo" "text", "p_usuario_id" "uuid", "p_observaciones" "text" DEFAULT NULL::"text") RETURNS TABLE("success" boolean, "message" "text", "id_baja" "uuid", "cantidad_restante" numeric)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."dar_baja_producto"("p_id_inventario" "uuid", "p_cantidad" numeric, "p_motivo" "text", "p_usuario_id" "uuid", "p_observaciones" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."dar_baja_producto"("p_id_inventario" "uuid", "p_cantidad" numeric, "p_motivo" "text", "p_usuario_id" "uuid", "p_observaciones" "text") IS 'Función para dar de baja un producto y actualizar inventario automáticamente';



CREATE OR REPLACE FUNCTION "public"."get_user_estado"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT estado FROM public.usuarios WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_estado"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT rol FROM public.usuarios WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_rol TEXT;
BEGIN
  -- Obtener el rol desde raw_user_meta_data
  -- Si no existe, usar 'SOLICITANTE' como valor por defecto
  v_rol := COALESCE(
    NEW.raw_user_meta_data->>'rol',
    'SOLICITANTE'
  );
  
  -- Validar que el rol sea válido
  IF v_rol NOT IN ('ADMINISTRADOR', 'DONANTE', 'SOLICITANTE', 'OPERADOR') THEN
    v_rol := 'SOLICITANTE';
  END IF;

  -- Insertar el nuevo usuario en public.usuarios
  INSERT INTO public.usuarios (
    id,
    email,
    rol,
    estado,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_rol,
    'activo',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si el usuario ya existe, no hacer nada
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log del error pero no fallar el registro
    RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_or_operator"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND rol IN ('ADMINISTRADOR', 'OPERADOR')
    AND estado = 'activo'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin_or_operator"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."limpiar_notificaciones_antiguas"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.notificaciones
  SET activa = false
  WHERE (expira_en IS NOT NULL AND expira_en < now())
     OR (fecha_creacion < now() - interval '30 days' AND leida = true);
END;
$$;


ALTER FUNCTION "public"."limpiar_notificaciones_antiguas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."marcar_notificacion_leida"("p_notificacion_id" "uuid", "p_usuario_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.notificaciones
  SET leida = true,
      fecha_leida = now()
  WHERE id = p_notificacion_id
    AND (destinatario_id = p_usuario_id 
         OR rol_destinatario = (SELECT rol FROM public.usuarios WHERE id = p_usuario_id));
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."marcar_notificacion_leida"("p_notificacion_id" "uuid", "p_usuario_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obtener_estadisticas_bajas"("p_fecha_inicio" timestamp with time zone DEFAULT ("now"() - '30 days'::interval), "p_fecha_fin" timestamp with time zone DEFAULT "now"()) RETURNS TABLE("total_bajas" bigint, "total_cantidad" numeric, "bajas_por_vencido" bigint, "bajas_por_danado" bigint, "bajas_por_contaminado" bigint, "bajas_por_rechazado" bigint, "bajas_por_otro" bigint, "cantidad_vencido" numeric, "cantidad_danado" numeric, "cantidad_contaminado" numeric, "cantidad_rechazado" numeric, "cantidad_otro" numeric)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."obtener_estadisticas_bajas"("p_fecha_inicio" timestamp with time zone, "p_fecha_fin" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."obtener_estadisticas_bajas"("p_fecha_inicio" timestamp with time zone, "p_fecha_fin" timestamp with time zone) IS 'Obtiene estadísticas de bajas por periodo y motivo';



CREATE OR REPLACE FUNCTION "public"."obtener_info_producto_inventario"("p_id_producto" "uuid") RETURNS TABLE("nombre_producto" "text", "alimento_nombre" "text", "categoria" "text", "unidad_nombre" "text", "unidad_simbolo" "text", "cantidad_total" numeric)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pd.nombre_producto,
    a.nombre,
    a.categoria,
    u.nombre,
    u.simbolo,
    COALESCE(SUM(i.cantidad_disponible), 0)
  FROM public.productos_donados pd
  LEFT JOIN public.alimentos a ON pd.alimento_id = a.id
  LEFT JOIN public.unidades u ON pd.unidad_id = u.id
  LEFT JOIN public.inventario i ON pd.id_producto = i.id_producto
  WHERE pd.id_producto = p_id_producto
  GROUP BY pd.nombre_producto, a.nombre, a.categoria, u.nombre, u.simbolo;
END;
$$;


ALTER FUNCTION "public"."obtener_info_producto_inventario"("p_id_producto" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obtener_notificaciones_no_leidas"("p_usuario_id" "uuid", "p_rol_usuario" character varying) RETURNS TABLE("id" "uuid", "titulo" character varying, "mensaje" "text", "tipo" character varying, "categoria" character varying, "url_accion" character varying, "metadatos" "jsonb", "fecha_creacion" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.titulo,
    n.mensaje,
    n.tipo,
    n.categoria,
    n.url_accion,
    n.metadatos,
    n.fecha_creacion
  FROM public.notificaciones n
  WHERE n.leida = false
    AND n.activa = true
    AND (n.destinatario_id = p_usuario_id 
         OR n.rol_destinatario = p_rol_usuario
         OR n.rol_destinatario = 'TODOS')
    AND (n.expira_en IS NULL OR n.expira_en > now())
  ORDER BY n.fecha_creacion DESC;
END;
$$;


ALTER FUNCTION "public"."obtener_notificaciones_no_leidas"("p_usuario_id" "uuid", "p_rol_usuario" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obtener_productos_proximos_vencer"("p_dias_umbral" integer DEFAULT 7) RETURNS TABLE("id_inventario" "uuid", "id_producto" "uuid", "nombre_producto" "text", "cantidad_disponible" numeric, "fecha_caducidad" timestamp with time zone, "dias_para_vencer" integer, "id_deposito" "uuid", "nombre_deposito" "text", "unidad_simbolo" "text", "prioridad" "text")
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."obtener_productos_proximos_vencer"("p_dias_umbral" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."obtener_productos_proximos_vencer"("p_dias_umbral" integer) IS 'Obtiene productos próximos a vencer o ya vencidos con su prioridad';



CREATE OR REPLACE FUNCTION "public"."obtener_unidades_alimento"("p_alimento_id" bigint) RETURNS TABLE("unidad_id" bigint, "nombre" "text", "simbolo" "text", "es_principal" boolean)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.nombre,
    u.simbolo,
    au.es_unidad_principal
  FROM public.alimentos_unidades au
  JOIN public.unidades u ON au.unidad_id = u.id
  WHERE au.alimento_id = p_alimento_id
  ORDER BY au.es_unidad_principal DESC, u.nombre;
END;
$$;


ALTER FUNCTION "public"."obtener_unidades_alimento"("p_alimento_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."procesar_eliminaciones_categorias_pendientes"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Implementación placeholder
  RETURN;
END;
$$;


ALTER FUNCTION "public"."procesar_eliminaciones_categorias_pendientes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."registrar_movimiento_con_unidad"("p_id_movimiento" "uuid", "p_id_producto" "uuid", "p_cantidad" numeric, "p_tipo_transaccion" "text", "p_unidad_id" bigint, "p_observacion" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_detalle_id uuid;
  v_cantidad_convertida numeric;
  v_unidad_producto bigint;
BEGIN
  SELECT unidad_id INTO v_unidad_producto
  FROM public.productos_donados
  WHERE id_producto = p_id_producto;
  
  IF v_unidad_producto != p_unidad_id THEN
    v_cantidad_convertida := public.convertir_cantidad(
      p_cantidad,
      p_unidad_id,
      v_unidad_producto
    );
  ELSE
    v_cantidad_convertida := p_cantidad;
  END IF;
  
  INSERT INTO public.movimiento_inventario_detalle (
    id_movimiento,
    id_producto,
    cantidad,
    tipo_transaccion,
    rol_usuario,
    observacion_detalle,
    unidad_id
  )
  VALUES (
    p_id_movimiento,
    p_id_producto,
    v_cantidad_convertida,
    p_tipo_transaccion,
    (SELECT rol FROM public.usuarios WHERE id = auth.uid()),
    p_observacion,
    p_unidad_id
  )
  RETURNING id_detalle INTO v_detalle_id;
  
  RETURN v_detalle_id;
END;
$$;


ALTER FUNCTION "public"."registrar_movimiento_con_unidad"("p_id_movimiento" "uuid", "p_id_producto" "uuid", "p_cantidad" numeric, "p_tipo_transaccion" "text", "p_unidad_id" bigint, "p_observacion" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_notificacion_donacion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notificación para ADMINISTRADOR
    PERFORM public.crear_notificacion(
      'Nueva Donación Registrada'::character varying,
      ('Se ha registrado una nueva donación de ' || NEW.tipo_producto)::text,
      'info'::character varying,
      NULL::uuid,  -- Cast explícito a UUID
      'ADMINISTRADOR'::character varying,
      'donaciones'::character varying,
      '/admin/donaciones'::character varying,
      jsonb_build_object('donacion_id', NEW.id, 'tipo_producto', NEW.tipo_producto)
    );
    
    -- Notificación para el DONANTE si existe
    IF NEW.user_id IS NOT NULL THEN
      PERFORM public.crear_notificacion(
        'Donación Registrada'::character varying,
        ('Tu donación de ' || NEW.tipo_producto || ' ha sido registrada exitosamente')::text,
        'success'::character varying,
        NEW.user_id::uuid,
        NULL::character varying,  -- Cast explícito a character varying
        'donaciones'::character varying,
        '/donante/donaciones'::character varying,
        jsonb_build_object('donacion_id', NEW.id)
      );
    END IF;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.estado <> NEW.estado THEN
    -- Notificación cuando cambia el estado de la donación
    IF NEW.user_id IS NOT NULL THEN
      PERFORM public.crear_notificacion(
        'Estado de Donación Actualizado'::character varying,
        ('Tu donación de ' || NEW.tipo_producto || ' ahora está en estado: ' || NEW.estado)::text,
        (CASE 
          WHEN NEW.estado = 'Entregada' THEN 'success'
          WHEN NEW.estado = 'Cancelada' THEN 'warning'
          ELSE 'info'
        END)::character varying,
        NEW.user_id::uuid,
        NULL::character varying,  -- Cast explícito a character varying
        'donaciones'::character varying,
        '/donante/donaciones'::character varying,
        jsonb_build_object('donacion_id', NEW.id, 'estado', NEW.estado)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_notificacion_donacion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_notificacion_solicitud"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notificación para ADMINISTRADOR
    PERFORM public.crear_notificacion(
      'Nueva Solicitud Recibida'::character varying,
      ('Se ha recibido una nueva solicitud de ' || NEW.tipo_alimento)::text,
      'info'::character varying,
      NULL::uuid,  -- Cast explícito a UUID
      'ADMINISTRADOR'::character varying,
      'solicitudes'::character varying,
      '/admin/solicitudes'::character varying,
      jsonb_build_object('solicitud_id', NEW.id, 'tipo_alimento', NEW.tipo_alimento)
    );
    
    -- Notificación para OPERADOR
    PERFORM public.crear_notificacion(
      'Nueva Solicitud Recibida'::character varying,
      ('Se ha recibido una nueva solicitud de ' || NEW.tipo_alimento)::text,
      'info'::character varying,
      NULL::uuid,  -- Cast explícito a UUID
      'OPERADOR'::character varying,
      'solicitudes'::character varying,
      '/operador/solicitudes'::character varying,
      jsonb_build_object('solicitud_id', NEW.id, 'tipo_alimento', NEW.tipo_alimento)
    );
    
    -- Notificación para el USUARIO que creó la solicitud
    PERFORM public.crear_notificacion(
      'Solicitud Registrada'::character varying,
      ('Tu solicitud de ' || NEW.tipo_alimento || ' ha sido registrada exitosamente')::text,
      'success'::character varying,
      NEW.usuario_id::uuid,
      NULL::character varying,  -- Cast explícito a character varying
      'solicitudes'::character varying,
      '/user/solicitudes'::character varying,
      jsonb_build_object('solicitud_id', NEW.id)
    );
    
  ELSIF TG_OP = 'UPDATE' AND OLD.estado <> NEW.estado THEN
    -- Notificación cuando cambia el estado
    PERFORM public.crear_notificacion(
      'Estado de Solicitud Actualizado'::character varying,
      ('Tu solicitud de ' || NEW.tipo_alimento || ' ahora está en estado: ' || NEW.estado)::text,
      (CASE 
        WHEN NEW.estado = 'aprobada' THEN 'success'
        WHEN NEW.estado = 'rechazada' THEN 'warning'
        ELSE 'info'
      END)::character varying,
      NEW.usuario_id::uuid,
      NULL::character varying,  -- Cast explícito a character varying
      'solicitudes'::character varying,
      '/user/solicitudes'::character varying,
      jsonb_build_object(
        'solicitud_id', NEW.id, 
        'estado', NEW.estado, 
        'comentario_admin', NEW.comentario_admin
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_notificacion_solicitud"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_notificacion_usuario"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Solo notificar si el estado cambió
  IF (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado) THEN
    -- Notificar al usuario sobre el cambio de estado
    IF NEW.estado = 'bloqueado' THEN
      PERFORM crear_notificacion(
        'Cuenta Bloqueada'::character varying,
        'Tu cuenta ha sido bloqueada por un administrador. Si crees que esto es un error, contacta al soporte.'::text,
        'alerta'::character varying,
        NEW.id::uuid,
        NULL::character varying,
        'sistema'::character varying,
        NULL::character varying,
        '{}'::jsonb
      );
    ELSIF NEW.estado = 'desactivado' THEN
      PERFORM crear_notificacion(
        'Cuenta Desactivada'::character varying,
        'Tu cuenta ha sido desactivada por un administrador. Contacta al soporte para más información.'::text,
        'advertencia'::character varying,
        NEW.id::uuid,
        NULL::character varying,
        'sistema'::character varying,
        NULL::character varying,
        '{}'::jsonb
      );
    ELSIF NEW.estado = 'activo' AND (OLD.estado = 'bloqueado' OR OLD.estado = 'desactivado') THEN
      PERFORM crear_notificacion(
        'Cuenta Reactivada'::character varying,
        'Tu cuenta ha sido reactivada. Ya puedes acceder al sistema normalmente.'::text,
        'exito'::character varying,
        NEW.id::uuid,
        NULL::character varying,
        'sistema'::character varying,
        NULL::character varying,
        '{}'::jsonb
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_notificacion_usuario"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_bajas_productos_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_bajas_productos_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_producto_duplicado"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_tipo_magnitud_id bigint;
  v_producto_existente_tipo_magnitud bigint;
BEGIN
  SELECT tipo_magnitud_id INTO v_tipo_magnitud_id
  FROM public.unidades
  WHERE id = NEW.unidad_id;
  
  SELECT u.tipo_magnitud_id INTO v_producto_existente_tipo_magnitud
  FROM public.productos_donados pd
  JOIN public.unidades u ON pd.unidad_id = u.id
  WHERE lower(TRIM(BOTH FROM pd.nombre_producto)) = lower(TRIM(BOTH FROM NEW.nombre_producto))
    AND pd.id_producto != COALESCE(NEW.id_producto, '00000000-0000-0000-0000-000000000000'::uuid);
  
  IF v_producto_existente_tipo_magnitud IS NOT NULL 
     AND v_producto_existente_tipo_magnitud != v_tipo_magnitud_id THEN
    RAISE EXCEPTION 'Ya existe un producto con este nombre pero con diferente tipo de magnitud';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validar_producto_duplicado"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_tipo_magnitud_alimento"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_tipo_magnitud_alimento bigint;
  v_tipo_magnitud_unidad bigint;
BEGIN
  IF NEW.alimento_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  SELECT u.tipo_magnitud_id INTO v_tipo_magnitud_alimento
  FROM public.alimentos_unidades au
  JOIN public.unidades u ON au.unidad_id = u.id
  WHERE au.alimento_id = NEW.alimento_id
    AND au.es_unidad_principal = true
  LIMIT 1;
  
  SELECT tipo_magnitud_id INTO v_tipo_magnitud_unidad
  FROM public.unidades
  WHERE id = NEW.unidad_id;
  
  IF v_tipo_magnitud_alimento IS NOT NULL 
     AND v_tipo_magnitud_alimento != v_tipo_magnitud_unidad THEN
    RAISE EXCEPTION 'La unidad no es compatible con el tipo de magnitud del alimento';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validar_tipo_magnitud_alimento"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_unidad_movimiento"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  v_unidad_producto bigint;
  v_tipo_magnitud_producto bigint;
  v_tipo_magnitud_movimiento bigint;
BEGIN
  IF NEW.unidad_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  SELECT unidad_id INTO v_unidad_producto
  FROM public.productos_donados
  WHERE id_producto = NEW.id_producto;
  
  SELECT tipo_magnitud_id INTO v_tipo_magnitud_producto
  FROM public.unidades
  WHERE id = v_unidad_producto;
  
  SELECT tipo_magnitud_id INTO v_tipo_magnitud_movimiento
  FROM public.unidades
  WHERE id = NEW.unidad_id;
  
  IF v_tipo_magnitud_producto != v_tipo_magnitud_movimiento THEN
    RAISE EXCEPTION 'La unidad del movimiento debe ser compatible con la unidad del producto';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validar_unidad_movimiento"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."alimentos" (
    "id" bigint NOT NULL,
    "nombre" "text" NOT NULL,
    "categoria" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."alimentos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."alimentos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."alimentos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."alimentos_id_seq" OWNED BY "public"."alimentos"."id";



CREATE TABLE IF NOT EXISTS "public"."alimentos_unidades" (
    "id" bigint NOT NULL,
    "alimento_id" bigint NOT NULL,
    "unidad_id" bigint NOT NULL,
    "es_unidad_principal" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."alimentos_unidades" OWNER TO "postgres";


COMMENT ON TABLE "public"."alimentos_unidades" IS 'Tabla intermedia que relaciona alimentos con sus unidades de medida permitidas';



COMMENT ON COLUMN "public"."alimentos_unidades"."es_unidad_principal" IS 'Indica si es la unidad de medida principal/recomendada para el alimento';



CREATE SEQUENCE IF NOT EXISTS "public"."alimentos_unidades_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."alimentos_unidades_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."alimentos_unidades_id_seq" OWNED BY "public"."alimentos_unidades"."id";



CREATE TABLE IF NOT EXISTS "public"."bajas_productos" (
    "id_baja" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_producto" "uuid" NOT NULL,
    "id_inventario" "uuid" NOT NULL,
    "cantidad_baja" numeric NOT NULL,
    "motivo_baja" "text" NOT NULL,
    "usuario_responsable_id" "uuid" NOT NULL,
    "fecha_baja" timestamp with time zone DEFAULT "now"() NOT NULL,
    "observaciones" "text",
    "estado_baja" "text" DEFAULT 'confirmada'::"text",
    "nombre_producto" "text",
    "cantidad_disponible_antes" numeric,
    "id_deposito" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bajas_productos_cantidad_baja_check" CHECK (("cantidad_baja" > (0)::numeric)),
    CONSTRAINT "bajas_productos_estado_baja_check" CHECK (("estado_baja" = ANY (ARRAY['confirmada'::"text", 'pendiente_revision'::"text", 'revisada'::"text"]))),
    CONSTRAINT "bajas_productos_motivo_baja_check" CHECK (("motivo_baja" = ANY (ARRAY['vencido'::"text", 'dañado'::"text", 'contaminado'::"text", 'rechazado'::"text", 'otro'::"text"])))
);


ALTER TABLE "public"."bajas_productos" OWNER TO "postgres";


COMMENT ON TABLE "public"."bajas_productos" IS 'Registro de productos dados de baja del inventario';



COMMENT ON COLUMN "public"."bajas_productos"."motivo_baja" IS 'Motivo de la baja: vencido, dañado, contaminado, rechazado, otro';



COMMENT ON COLUMN "public"."bajas_productos"."estado_baja" IS 'Estado del registro: confirmada, pendiente_revision, revisada';



CREATE TABLE IF NOT EXISTS "public"."configuracion_notificaciones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid",
    "categoria" character varying(100) NOT NULL,
    "email_activo" boolean DEFAULT true,
    "push_activo" boolean DEFAULT true,
    "sonido_activo" boolean DEFAULT true,
    "fecha_actualizacion" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."configuracion_notificaciones" OWNER TO "postgres";


COMMENT ON TABLE "public"."configuracion_notificaciones" IS 'Configuración personalizada de notificaciones por usuario';



CREATE TABLE IF NOT EXISTS "public"."conversiones" (
    "id" bigint NOT NULL,
    "unidad_origen_id" bigint NOT NULL,
    "unidad_destino_id" bigint NOT NULL,
    "factor_conversion" numeric(15,8) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "conversiones_unidades_diferentes" CHECK (("unidad_origen_id" <> "unidad_destino_id"))
);


ALTER TABLE "public"."conversiones" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."conversiones_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."conversiones_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."conversiones_id_seq" OWNED BY "public"."conversiones"."id";



CREATE TABLE IF NOT EXISTS "public"."depositos" (
    "id_deposito" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "descripcion" "text"
);


ALTER TABLE "public"."depositos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."detalles_solicitud" (
    "id_detalle" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_solicitud" "uuid",
    "id_producto" "uuid",
    "cantidad_solicitada" numeric,
    "cantidad_entregada" numeric,
    "fecha_respuesta" timestamp with time zone,
    "comentario_admin" "text"
);


ALTER TABLE "public"."detalles_solicitud" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."donaciones" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "nombre_donante" "text" NOT NULL,
    "ruc_donante" "text",
    "cedula_donante" "text",
    "direccion_donante_completa" "text",
    "telefono" "text" NOT NULL,
    "email" "text" NOT NULL,
    "representante_donante" "text",
    "tipo_persona_donante" "text",
    "alimento_id" integer,
    "tipo_producto" "text" NOT NULL,
    "categoria_comida" "text" NOT NULL,
    "es_producto_personalizado" boolean DEFAULT false NOT NULL,
    "cantidad" numeric(10,2) NOT NULL,
    "unidad_id" integer NOT NULL,
    "unidad_nombre" "text" NOT NULL,
    "unidad_simbolo" "text" NOT NULL,
    "fecha_vencimiento" "date",
    "fecha_disponible" "date" NOT NULL,
    "direccion_entrega" "text" NOT NULL,
    "horario_preferido" "text",
    "observaciones" "text",
    "impacto_estimado_personas" integer,
    "impacto_equivalente" "text",
    "estado" "text" DEFAULT 'Pendiente'::"text" NOT NULL,
    "creado_en" timestamp with time zone DEFAULT "now"(),
    "actualizado_en" timestamp with time zone DEFAULT "now"(),
    "codigo_comprobante" "text",
    "motivo_cancelacion" "text",
    "observaciones_cancelacion" "text",
    "usuario_cancelacion_id" "uuid",
    "fecha_cancelacion" timestamp with time zone,
    CONSTRAINT "check_observaciones_cancelacion" CHECK ((("motivo_cancelacion" IS NULL) OR ("motivo_cancelacion" <> 'otro'::"text") OR (("motivo_cancelacion" = 'otro'::"text") AND ("observaciones_cancelacion" IS NOT NULL) AND ("length"(TRIM(BOTH FROM "observaciones_cancelacion")) > 0)))),
    CONSTRAINT "donaciones_cantidad_check" CHECK (("cantidad" > (0)::numeric)),
    CONSTRAINT "donaciones_estado_check" CHECK (("estado" = ANY (ARRAY['Pendiente'::"text", 'Recogida'::"text", 'Entregada'::"text", 'Cancelada'::"text"]))),
    CONSTRAINT "donaciones_motivo_cancelacion_check" CHECK (("motivo_cancelacion" = ANY (ARRAY['error_donante'::"text", 'no_disponible'::"text", 'calidad_inadecuada'::"text", 'logistica_imposible'::"text", 'duplicado'::"text", 'solicitud_donante'::"text", 'otro'::"text"])))
);


ALTER TABLE "public"."donaciones" OWNER TO "postgres";


COMMENT ON COLUMN "public"."donaciones"."codigo_comprobante" IS 'Código único del comprobante generado al procesar la donación';



COMMENT ON COLUMN "public"."donaciones"."motivo_cancelacion" IS 'Motivo específico por el cual se canceló la donación';



COMMENT ON COLUMN "public"."donaciones"."observaciones_cancelacion" IS 'Observaciones detalladas sobre la cancelación (obligatorio cuando motivo es "otro")';



COMMENT ON COLUMN "public"."donaciones"."usuario_cancelacion_id" IS 'ID del usuario (administrador u operador) que canceló la donación';



COMMENT ON COLUMN "public"."donaciones"."fecha_cancelacion" IS 'Fecha y hora exacta cuando se canceló la donación';



COMMENT ON CONSTRAINT "check_observaciones_cancelacion" ON "public"."donaciones" IS 'Garantiza que cuando el motivo es "otro", se proporcionen observaciones detalladas';



CREATE SEQUENCE IF NOT EXISTS "public"."donaciones_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."donaciones_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."donaciones_id_seq" OWNED BY "public"."donaciones"."id";



CREATE TABLE IF NOT EXISTS "public"."historial_donaciones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "solicitud_id" "uuid" NOT NULL,
    "cantidad_entregada" numeric(10,2) NOT NULL,
    "porcentaje_entregado" integer NOT NULL,
    "cantidad_solicitada" numeric(10,2) NOT NULL,
    "operador_id" "uuid",
    "comentario" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cantidad_positiva" CHECK (("cantidad_entregada" > (0)::numeric)),
    CONSTRAINT "porcentaje_valido" CHECK ((("porcentaje_entregado" >= 0) AND ("porcentaje_entregado" <= 100)))
);


ALTER TABLE "public"."historial_donaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventario" (
    "id_inventario" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_deposito" "uuid" NOT NULL,
    "id_producto" "uuid" NOT NULL,
    "cantidad_disponible" numeric DEFAULT 0 NOT NULL,
    "fecha_actualizacion" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."inventario" OWNER TO "postgres";


COMMENT ON TABLE "public"."inventario" IS 'Tabla de inventario con RLS configurado. Solo usuarios activos pueden ver. Solo ADMIN/OPERADOR pueden modificar.';



CREATE TABLE IF NOT EXISTS "public"."movimiento_inventario_cabecera" (
    "id_movimiento" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fecha_movimiento" timestamp without time zone DEFAULT "now"(),
    "id_donante" "uuid" NOT NULL,
    "id_solicitante" "uuid" NOT NULL,
    "estado_movimiento" "text" NOT NULL,
    "observaciones" "text",
    CONSTRAINT "movimiento_inventario_cabecera_estado_movimiento_check" CHECK (("estado_movimiento" = ANY (ARRAY['pendiente'::"text", 'completado'::"text", 'donado'::"text"])))
);


ALTER TABLE "public"."movimiento_inventario_cabecera" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."movimiento_inventario_detalle" (
    "id_detalle" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_movimiento" "uuid" NOT NULL,
    "id_producto" "uuid" NOT NULL,
    "cantidad" numeric NOT NULL,
    "tipo_transaccion" "text" NOT NULL,
    "rol_usuario" "text" NOT NULL,
    "observacion_detalle" "text",
    "unidad_id" bigint,
    CONSTRAINT "movimiento_inventario_detalle_rol_usuario_check" CHECK (("rol_usuario" = ANY (ARRAY['donante'::"text", 'beneficiario'::"text", 'distribuidor'::"text"]))),
    CONSTRAINT "movimiento_inventario_detalle_tipo_transaccion_check" CHECK (("tipo_transaccion" = ANY (ARRAY['ingreso'::"text", 'egreso'::"text", 'baja'::"text"])))
);


ALTER TABLE "public"."movimiento_inventario_detalle" OWNER TO "postgres";


COMMENT ON COLUMN "public"."movimiento_inventario_detalle"."unidad_id" IS 'Unidad de medida utilizada en el movimiento';



CREATE TABLE IF NOT EXISTS "public"."notificaciones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "titulo" character varying(255) NOT NULL,
    "mensaje" "text" NOT NULL,
    "tipo" character varying(50) DEFAULT 'info'::character varying NOT NULL,
    "destinatario_id" "uuid",
    "rol_destinatario" character varying(50),
    "categoria" character varying(100) NOT NULL,
    "leida" boolean DEFAULT false,
    "url_accion" character varying(500),
    "metadatos" "jsonb" DEFAULT '{}'::"jsonb",
    "fecha_creacion" timestamp with time zone DEFAULT "now"(),
    "fecha_leida" timestamp with time zone,
    "activa" boolean DEFAULT true,
    "expira_en" timestamp with time zone
);


ALTER TABLE "public"."notificaciones" OWNER TO "postgres";


COMMENT ON TABLE "public"."notificaciones" IS 'Tabla para almacenar todas las notificaciones del sistema';



CREATE TABLE IF NOT EXISTS "public"."productos_donados" (
    "id_producto" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_usuario" "uuid",
    "nombre_producto" "text",
    "descripcion" "text",
    "fecha_donacion" timestamp with time zone DEFAULT "now"(),
    "cantidad" numeric,
    "unidad_medida" "text",
    "fecha_caducidad" timestamp with time zone,
    "alimento_id" bigint,
    "unidad_id" bigint
);


ALTER TABLE "public"."productos_donados" OWNER TO "postgres";


COMMENT ON TABLE "public"."productos_donados" IS 'Tabla de productos donados con RLS configurado. Solo usuarios activos pueden ver. ADMIN/OPERADOR/DONANTE pueden insertar.';



COMMENT ON COLUMN "public"."productos_donados"."unidad_id" IS 'Unidad de medida utilizada en la donación';



CREATE TABLE IF NOT EXISTS "public"."solicitudes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "tipo_alimento" "text" NOT NULL,
    "cantidad" numeric NOT NULL,
    "comentarios" "text",
    "latitud" double precision,
    "longitud" double precision,
    "estado" "text" DEFAULT 'pendiente'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "fecha_respuesta" timestamp with time zone,
    "comentario_admin" "text",
    "unidad_id" bigint,
    "motivo_rechazo" "text",
    "operador_rechazo_id" "uuid",
    "fecha_rechazo" timestamp with time zone,
    "operador_aprobacion_id" "uuid",
    "fecha_aprobacion" timestamp with time zone,
    "codigo_comprobante" "text",
    "cantidad_entregada" numeric(10,2) DEFAULT 0,
    "tiene_entregas_parciales" boolean DEFAULT false,
    CONSTRAINT "solicitudes_estado_check" CHECK (("estado" = ANY (ARRAY['pendiente'::"text", 'aprobada'::"text", 'rechazada'::"text", 'entregada'::"text"])))
);


ALTER TABLE "public"."solicitudes" OWNER TO "postgres";


COMMENT ON TABLE "public"."solicitudes" IS 'Tabla de solicitudes con RLS configurado. SOLICITANTES ven/crean/actualizan las suyas. ADMIN/OPERADOR pueden todo.';



COMMENT ON COLUMN "public"."solicitudes"."motivo_rechazo" IS 'Motivo del rechazo de la solicitud (stock_insuficiente, producto_no_disponible, datos_incompletos, etc.)';



COMMENT ON COLUMN "public"."solicitudes"."operador_rechazo_id" IS 'ID del operador o admin que rechazó la solicitud';



COMMENT ON COLUMN "public"."solicitudes"."fecha_rechazo" IS 'Fecha y hora exacta cuando se rechazó la solicitud';



COMMENT ON COLUMN "public"."solicitudes"."operador_aprobacion_id" IS 'ID del operador o admin que aprobó la solicitud';



COMMENT ON COLUMN "public"."solicitudes"."fecha_aprobacion" IS 'Fecha y hora exacta cuando se aprobó la solicitud';



COMMENT ON COLUMN "public"."solicitudes"."codigo_comprobante" IS 'Código único del comprobante generado al aprobar la solicitud';



CREATE TABLE IF NOT EXISTS "public"."tipos_magnitud" (
    "id" bigint NOT NULL,
    "nombre" "text" NOT NULL,
    "descripcion" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tipos_magnitud" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tipos_magnitud_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tipos_magnitud_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tipos_magnitud_id_seq" OWNED BY "public"."tipos_magnitud"."id";



CREATE TABLE IF NOT EXISTS "public"."unidades" (
    "id" bigint NOT NULL,
    "nombre" "text" NOT NULL,
    "simbolo" "text" NOT NULL,
    "tipo_magnitud_id" bigint NOT NULL,
    "es_base" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."unidades" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."unidades_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."unidades_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."unidades_id_seq" OWNED BY "public"."unidades"."id";



CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" "uuid" NOT NULL,
    "rol" "text",
    "tipo_persona" "text",
    "nombre" "text",
    "ruc" "text",
    "cedula" "text",
    "direccion" "text",
    "telefono" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "representante" "text",
    "estado" character varying(20) DEFAULT 'activo'::character varying,
    "email" "text",
    "recibir_notificaciones" boolean DEFAULT true,
    "fecha_fin_bloqueo" timestamp with time zone,
    "motivo_bloqueo" "text",
    "latitud" double precision,
    "longitud" double precision,
    CONSTRAINT "usuarios_estado_check" CHECK ((("estado")::"text" = ANY (ARRAY[('activo'::character varying)::"text", ('bloqueado'::character varying)::"text", ('desactivado'::character varying)::"text"]))),
    CONSTRAINT "usuarios_rol_check" CHECK (("rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'DONANTE'::"text", 'SOLICITANTE'::"text", 'OPERADOR'::"text"])))
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


COMMENT ON COLUMN "public"."usuarios"."fecha_fin_bloqueo" IS 'Fecha y hora en que termina el bloqueo temporal del usuario. NULL si el bloqueo es permanente o el usuario no está bloqueado';



COMMENT ON COLUMN "public"."usuarios"."motivo_bloqueo" IS 'Motivo por el cual el usuario está bloqueado o desactivado';



COMMENT ON COLUMN "public"."usuarios"."latitud" IS 'Latitud de la ubicación del usuario (coordenada geográfica)';



COMMENT ON COLUMN "public"."usuarios"."longitud" IS 'Longitud de la ubicación del usuario (coordenada geográfica)';



CREATE OR REPLACE VIEW "public"."v_bajas_productos_detalle" AS
 SELECT "bp"."id_baja",
    "bp"."id_producto",
    "bp"."id_inventario",
    "bp"."cantidad_baja",
    "bp"."motivo_baja",
    "bp"."fecha_baja",
    "bp"."observaciones",
    "bp"."estado_baja",
    "bp"."nombre_producto",
    "bp"."cantidad_disponible_antes",
    "bp"."created_at",
    "bp"."updated_at",
    "u"."id" AS "usuario_id",
    "u"."nombre" AS "usuario_nombre",
    "u"."email" AS "usuario_email",
    "u"."rol" AS "usuario_rol",
    "d"."id_deposito",
    "d"."nombre" AS "deposito_nombre",
    "d"."descripcion" AS "deposito_descripcion",
    "p"."descripcion" AS "producto_descripcion",
    "p"."unidad_medida",
    "p"."fecha_caducidad",
    "un"."nombre" AS "unidad_nombre",
    "un"."simbolo" AS "unidad_simbolo"
   FROM (((("public"."bajas_productos" "bp"
     LEFT JOIN "public"."usuarios" "u" ON (("u"."id" = "bp"."usuario_responsable_id")))
     LEFT JOIN "public"."depositos" "d" ON (("d"."id_deposito" = "bp"."id_deposito")))
     LEFT JOIN "public"."productos_donados" "p" ON (("p"."id_producto" = "bp"."id_producto")))
     LEFT JOIN "public"."unidades" "un" ON (("un"."id" = "p"."unidad_id")))
  ORDER BY "bp"."fecha_baja" DESC;


ALTER VIEW "public"."v_bajas_productos_detalle" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_inventario_con_conversiones" WITH ("security_invoker"='true') AS
 SELECT "i"."id_inventario",
    "i"."id_deposito",
    "d"."nombre" AS "deposito",
    "pd"."id_producto",
    "pd"."nombre_producto",
    "a"."id" AS "alimento_id",
    "a"."nombre" AS "alimento",
    "a"."categoria",
    "i"."cantidad_disponible",
    "u"."id" AS "unidad_actual_id",
    "u"."nombre" AS "unidad_actual_nombre",
    "u"."simbolo" AS "unidad_actual_simbolo",
    "u"."tipo_magnitud_id",
    "tm"."nombre" AS "tipo_magnitud",
    ( SELECT "jsonb_agg"("jsonb_build_object"('unidad_id', "au"."unidad_id", 'nombre', "u2"."nombre", 'simbolo', "u2"."simbolo", 'es_principal', "au"."es_unidad_principal")) AS "jsonb_agg"
           FROM ("public"."alimentos_unidades" "au"
             JOIN "public"."unidades" "u2" ON (("au"."unidad_id" = "u2"."id")))
          WHERE ("au"."alimento_id" = "a"."id")) AS "unidades_disponibles"
   FROM ((((("public"."inventario" "i"
     JOIN "public"."depositos" "d" ON (("i"."id_deposito" = "d"."id_deposito")))
     JOIN "public"."productos_donados" "pd" ON (("i"."id_producto" = "pd"."id_producto")))
     LEFT JOIN "public"."alimentos" "a" ON (("pd"."alimento_id" = "a"."id")))
     LEFT JOIN "public"."unidades" "u" ON (("pd"."unidad_id" = "u"."id")))
     LEFT JOIN "public"."tipos_magnitud" "tm" ON (("u"."tipo_magnitud_id" = "tm"."id")));


ALTER VIEW "public"."v_inventario_con_conversiones" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_inventario_con_unidades" WITH ("security_invoker"='true') AS
 SELECT "i"."id_inventario",
    "i"."id_deposito",
    "d"."nombre" AS "deposito_nombre",
    "i"."id_producto",
    "pd"."nombre_producto",
    "pd"."alimento_id",
    "a"."nombre" AS "alimento_nombre",
    "a"."categoria" AS "alimento_categoria",
    "i"."cantidad_disponible",
    "pd"."unidad_medida" AS "unidad_actual",
    "i"."fecha_actualizacion"
   FROM ((("public"."inventario" "i"
     JOIN "public"."depositos" "d" ON (("i"."id_deposito" = "d"."id_deposito")))
     JOIN "public"."productos_donados" "pd" ON (("i"."id_producto" = "pd"."id_producto")))
     LEFT JOIN "public"."alimentos" "a" ON (("pd"."alimento_id" = "a"."id")));


ALTER VIEW "public"."v_inventario_con_unidades" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_inventario_detallado" WITH ("security_invoker"='true') AS
 SELECT "i"."id_inventario",
    "i"."id_deposito",
    "d"."nombre" AS "nombre_deposito",
    "i"."id_producto",
    "pd"."nombre_producto",
    "pd"."alimento_id",
    "a"."nombre" AS "nombre_alimento",
    "a"."categoria" AS "categoria_alimento",
    "i"."cantidad_disponible",
    "pd"."unidad_id",
    "u"."nombre" AS "unidad_nombre",
    "u"."simbolo" AS "unidad_simbolo",
    "pd"."unidad_medida" AS "unidad_medida_legacy",
    "pd"."fecha_caducidad",
    "pd"."fecha_donacion",
    "i"."fecha_actualizacion"
   FROM (((("public"."inventario" "i"
     JOIN "public"."depositos" "d" ON (("i"."id_deposito" = "d"."id_deposito")))
     JOIN "public"."productos_donados" "pd" ON (("i"."id_producto" = "pd"."id_producto")))
     LEFT JOIN "public"."alimentos" "a" ON (("pd"."alimento_id" = "a"."id")))
     LEFT JOIN "public"."unidades" "u" ON (("pd"."unidad_id" = "u"."id")))
  ORDER BY "i"."fecha_actualizacion" DESC;


ALTER VIEW "public"."v_inventario_detallado" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_inventario_detallado" IS 'Vista completa del inventario con información de unidades estructuradas';



CREATE OR REPLACE VIEW "public"."v_movimientos_detallado" WITH ("security_invoker"='true') AS
 SELECT "mic"."id_movimiento",
    "mic"."fecha_movimiento",
    "mic"."estado_movimiento",
    "mic"."observaciones" AS "observaciones_cabecera",
    "mid"."id_detalle",
    "mid"."cantidad",
    "mid"."tipo_transaccion",
    "mid"."rol_usuario",
    "mid"."observacion_detalle",
    "mid"."id_producto",
    "pd"."nombre_producto",
    "pd"."alimento_id",
    "a"."nombre" AS "nombre_alimento",
    "a"."categoria" AS "categoria_alimento",
    COALESCE("mid"."unidad_id", "pd"."unidad_id") AS "unidad_id_utilizada",
    COALESCE("u_detalle"."nombre", "u_producto"."nombre") AS "unidad_nombre",
    COALESCE("u_detalle"."simbolo", "u_producto"."simbolo") AS "unidad_simbolo",
    "pd"."unidad_medida" AS "unidad_legacy",
    "udon"."nombre" AS "nombre_donante",
    "udon"."rol" AS "rol_donante",
    "usol"."nombre" AS "nombre_solicitante",
    "usol"."rol" AS "rol_solicitante"
   FROM ((((((("public"."movimiento_inventario_cabecera" "mic"
     JOIN "public"."movimiento_inventario_detalle" "mid" ON (("mic"."id_movimiento" = "mid"."id_movimiento")))
     JOIN "public"."productos_donados" "pd" ON (("mid"."id_producto" = "pd"."id_producto")))
     LEFT JOIN "public"."alimentos" "a" ON (("pd"."alimento_id" = "a"."id")))
     LEFT JOIN "public"."unidades" "u_detalle" ON (("mid"."unidad_id" = "u_detalle"."id")))
     LEFT JOIN "public"."unidades" "u_producto" ON (("pd"."unidad_id" = "u_producto"."id")))
     LEFT JOIN "public"."usuarios" "udon" ON (("mic"."id_donante" = "udon"."id")))
     LEFT JOIN "public"."usuarios" "usol" ON (("mic"."id_solicitante" = "usol"."id")))
  ORDER BY "mic"."fecha_movimiento" DESC;


ALTER VIEW "public"."v_movimientos_detallado" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_movimientos_detallado" IS 'Vista completa de movimientos con información estructurada de unidades';



CREATE OR REPLACE VIEW "public"."v_productos_duplicados" WITH ("security_invoker"='true') AS
 SELECT "lower"(TRIM(BOTH FROM "pd"."nombre_producto")) AS "nombre_normalizado",
    "count"(DISTINCT "pd"."id_producto") AS "cantidad_registros",
    "count"(DISTINCT "u"."tipo_magnitud_id") AS "tipos_magnitud_diferentes",
    "array_agg"(DISTINCT "pd"."id_producto") AS "ids_productos",
    "array_agg"(DISTINCT "u"."nombre") AS "unidades",
    "array_agg"(DISTINCT "u"."simbolo") AS "simbolos",
    "array_agg"(DISTINCT "tm"."nombre") AS "tipos_magnitud"
   FROM (("public"."productos_donados" "pd"
     JOIN "public"."unidades" "u" ON (("pd"."unidad_id" = "u"."id")))
     JOIN "public"."tipos_magnitud" "tm" ON (("u"."tipo_magnitud_id" = "tm"."id")))
  GROUP BY ("lower"(TRIM(BOTH FROM "pd"."nombre_producto")))
 HAVING ("count"(DISTINCT "u"."tipo_magnitud_id") > 1);


ALTER VIEW "public"."v_productos_duplicados" OWNER TO "postgres";


ALTER TABLE ONLY "public"."alimentos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."alimentos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."alimentos_unidades" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."alimentos_unidades_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."conversiones" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."conversiones_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."donaciones" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."donaciones_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tipos_magnitud" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tipos_magnitud_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."unidades" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."unidades_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."alimentos"
    ADD CONSTRAINT "alimentos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."alimentos_unidades"
    ADD CONSTRAINT "alimentos_unidades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."alimentos_unidades"
    ADD CONSTRAINT "alimentos_unidades_unique" UNIQUE ("alimento_id", "unidad_id");



ALTER TABLE ONLY "public"."bajas_productos"
    ADD CONSTRAINT "bajas_productos_pkey" PRIMARY KEY ("id_baja");



ALTER TABLE ONLY "public"."configuracion_notificaciones"
    ADD CONSTRAINT "configuracion_notificaciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."configuracion_notificaciones"
    ADD CONSTRAINT "configuracion_notificaciones_usuario_id_categoria_key" UNIQUE ("usuario_id", "categoria");



ALTER TABLE ONLY "public"."conversiones"
    ADD CONSTRAINT "conversiones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversiones"
    ADD CONSTRAINT "conversiones_unicas" UNIQUE ("unidad_origen_id", "unidad_destino_id");



ALTER TABLE ONLY "public"."depositos"
    ADD CONSTRAINT "depositos_pkey" PRIMARY KEY ("id_deposito");



ALTER TABLE ONLY "public"."detalles_solicitud"
    ADD CONSTRAINT "detalles_solicitud_pkey" PRIMARY KEY ("id_detalle");



ALTER TABLE ONLY "public"."donaciones"
    ADD CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."historial_donaciones"
    ADD CONSTRAINT "historial_donaciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventario"
    ADD CONSTRAINT "inventario_id_deposito_id_producto_key" UNIQUE ("id_deposito", "id_producto");



ALTER TABLE ONLY "public"."inventario"
    ADD CONSTRAINT "inventario_pkey" PRIMARY KEY ("id_inventario");



ALTER TABLE ONLY "public"."movimiento_inventario_cabecera"
    ADD CONSTRAINT "movimiento_inventario_cabecera_pkey" PRIMARY KEY ("id_movimiento");



ALTER TABLE ONLY "public"."movimiento_inventario_detalle"
    ADD CONSTRAINT "movimiento_inventario_detalle_pkey" PRIMARY KEY ("id_detalle");



ALTER TABLE ONLY "public"."notificaciones"
    ADD CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."productos_donados"
    ADD CONSTRAINT "productos_donados_pkey" PRIMARY KEY ("id_producto");



ALTER TABLE ONLY "public"."solicitudes"
    ADD CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tipos_magnitud"
    ADD CONSTRAINT "tipos_magnitud_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."tipos_magnitud"
    ADD CONSTRAINT "tipos_magnitud_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."unidades"
    ADD CONSTRAINT "unidades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_alimentos_categoria" ON "public"."alimentos" USING "btree" ("categoria");



CREATE INDEX "idx_alimentos_nombre" ON "public"."alimentos" USING "btree" ("nombre");



CREATE INDEX "idx_alimentos_unidades_alimento" ON "public"."alimentos_unidades" USING "btree" ("alimento_id");



CREATE INDEX "idx_alimentos_unidades_unidad" ON "public"."alimentos_unidades" USING "btree" ("unidad_id");



CREATE INDEX "idx_bajas_productos_estado" ON "public"."bajas_productos" USING "btree" ("estado_baja");



CREATE INDEX "idx_bajas_productos_fecha" ON "public"."bajas_productos" USING "btree" ("fecha_baja" DESC);



CREATE INDEX "idx_bajas_productos_motivo" ON "public"."bajas_productos" USING "btree" ("motivo_baja");



CREATE INDEX "idx_bajas_productos_producto" ON "public"."bajas_productos" USING "btree" ("id_producto");



CREATE INDEX "idx_bajas_productos_usuario" ON "public"."bajas_productos" USING "btree" ("usuario_responsable_id");



CREATE INDEX "idx_conversiones_bidireccional" ON "public"."conversiones" USING "btree" ("unidad_origen_id", "unidad_destino_id");



CREATE INDEX "idx_conversiones_destino" ON "public"."conversiones" USING "btree" ("unidad_destino_id");



CREATE INDEX "idx_conversiones_origen" ON "public"."conversiones" USING "btree" ("unidad_origen_id");



CREATE INDEX "idx_detalle_movimiento" ON "public"."movimiento_inventario_detalle" USING "btree" ("id_movimiento");



CREATE INDEX "idx_detalle_producto" ON "public"."movimiento_inventario_detalle" USING "btree" ("id_producto");



CREATE INDEX "idx_detalles_id_solicitud" ON "public"."detalles_solicitud" USING "btree" ("id_solicitud");



CREATE INDEX "idx_detalles_solicitud_id_producto" ON "public"."detalles_solicitud" USING "btree" ("id_producto");



CREATE INDEX "idx_donaciones_alimento_id" ON "public"."donaciones" USING "btree" ("alimento_id");



CREATE INDEX "idx_donaciones_codigo_comprobante" ON "public"."donaciones" USING "btree" ("codigo_comprobante");



CREATE INDEX "idx_donaciones_estado" ON "public"."donaciones" USING "btree" ("estado");



CREATE INDEX "idx_donaciones_fecha_disponible" ON "public"."donaciones" USING "btree" ("fecha_disponible");



CREATE INDEX "idx_donaciones_unidad_id" ON "public"."donaciones" USING "btree" ("unidad_id");



CREATE INDEX "idx_donaciones_user_id" ON "public"."donaciones" USING "btree" ("user_id");



CREATE INDEX "idx_historial_donaciones_fecha" ON "public"."historial_donaciones" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_historial_donaciones_operador" ON "public"."historial_donaciones" USING "btree" ("operador_id");



CREATE INDEX "idx_historial_donaciones_solicitud" ON "public"."historial_donaciones" USING "btree" ("solicitud_id");



CREATE INDEX "idx_inventario_id_producto" ON "public"."inventario" USING "btree" ("id_producto");



CREATE INDEX "idx_movimiento_detalle_unidad" ON "public"."movimiento_inventario_detalle" USING "btree" ("unidad_id");



CREATE INDEX "idx_movimiento_donante" ON "public"."movimiento_inventario_cabecera" USING "btree" ("id_donante");



CREATE INDEX "idx_movimiento_solicitante" ON "public"."movimiento_inventario_cabecera" USING "btree" ("id_solicitante");



CREATE INDEX "idx_notificaciones_activa" ON "public"."notificaciones" USING "btree" ("activa");



CREATE INDEX "idx_notificaciones_categoria" ON "public"."notificaciones" USING "btree" ("categoria");



CREATE INDEX "idx_notificaciones_destinatario" ON "public"."notificaciones" USING "btree" ("destinatario_id");



CREATE INDEX "idx_notificaciones_fecha_creacion" ON "public"."notificaciones" USING "btree" ("fecha_creacion" DESC);



CREATE INDEX "idx_notificaciones_leida" ON "public"."notificaciones" USING "btree" ("leida");



CREATE INDEX "idx_notificaciones_rol" ON "public"."notificaciones" USING "btree" ("rol_destinatario");



CREATE INDEX "idx_productos_donados_alimento_id" ON "public"."productos_donados" USING "btree" ("alimento_id");



CREATE INDEX "idx_productos_donados_unidad" ON "public"."productos_donados" USING "btree" ("unidad_id");



CREATE INDEX "idx_productos_id_usuario" ON "public"."productos_donados" USING "btree" ("id_usuario");



CREATE UNIQUE INDEX "idx_productos_nombre_unidad" ON "public"."productos_donados" USING "btree" ("lower"(TRIM(BOTH FROM "nombre_producto")), "unidad_id");



CREATE INDEX "idx_solicitudes_codigo_comprobante" ON "public"."solicitudes" USING "btree" ("codigo_comprobante");



CREATE INDEX "idx_solicitudes_estado_fecha_respuesta" ON "public"."solicitudes" USING "btree" ("estado", "fecha_respuesta");



CREATE INDEX "idx_solicitudes_fecha_aprobacion" ON "public"."solicitudes" USING "btree" ("fecha_aprobacion");



CREATE INDEX "idx_solicitudes_fecha_rechazo" ON "public"."solicitudes" USING "btree" ("fecha_rechazo");



CREATE INDEX "idx_solicitudes_id_usuario" ON "public"."solicitudes" USING "btree" ("usuario_id");



CREATE INDEX "idx_solicitudes_motivo_rechazo" ON "public"."solicitudes" USING "btree" ("motivo_rechazo");



CREATE INDEX "idx_solicitudes_operador_aprobacion" ON "public"."solicitudes" USING "btree" ("operador_aprobacion_id");



CREATE INDEX "idx_solicitudes_operador_rechazo" ON "public"."solicitudes" USING "btree" ("operador_rechazo_id");



CREATE INDEX "idx_solicitudes_unidad_id" ON "public"."solicitudes" USING "btree" ("unidad_id");



CREATE INDEX "idx_tipos_magnitud_nombre" ON "public"."tipos_magnitud" USING "btree" ("nombre");



CREATE INDEX "idx_unidades_es_base" ON "public"."unidades" USING "btree" ("es_base") WHERE ("es_base" = true);



CREATE INDEX "idx_unidades_nombre" ON "public"."unidades" USING "btree" ("nombre");



CREATE INDEX "idx_unidades_simbolo" ON "public"."unidades" USING "btree" ("simbolo");



CREATE INDEX "idx_unidades_tipo_magnitud" ON "public"."unidades" USING "btree" ("tipo_magnitud_id");



CREATE INDEX "idx_usuarios_estado" ON "public"."usuarios" USING "btree" ("estado");



CREATE INDEX "idx_usuarios_fecha_fin_bloqueo" ON "public"."usuarios" USING "btree" ("fecha_fin_bloqueo") WHERE ("fecha_fin_bloqueo" IS NOT NULL);



CREATE UNIQUE INDEX "unique_cedula_idx" ON "public"."usuarios" USING "btree" ("cedula") WHERE (("cedula" IS NOT NULL) AND ("cedula" <> ''::"text"));



CREATE OR REPLACE TRIGGER "trigger_crear_producto" AFTER INSERT OR UPDATE ON "public"."donaciones" FOR EACH ROW EXECUTE FUNCTION "public"."crear_producto_desde_donacion"();



CREATE OR REPLACE TRIGGER "trigger_donacion_notificacion" AFTER INSERT OR UPDATE ON "public"."donaciones" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_notificacion_donacion"();



CREATE OR REPLACE TRIGGER "trigger_solicitud_notificacion" AFTER INSERT OR UPDATE ON "public"."solicitudes" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_notificacion_solicitud"();



CREATE OR REPLACE TRIGGER "trigger_update_bajas_productos_updated_at" BEFORE UPDATE ON "public"."bajas_productos" FOR EACH ROW EXECUTE FUNCTION "public"."update_bajas_productos_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_usuario_notificacion" AFTER UPDATE ON "public"."usuarios" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_notificacion_usuario"();



CREATE OR REPLACE TRIGGER "trigger_usuarios_updated_at" BEFORE UPDATE ON "public"."usuarios" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_validar_producto_duplicado" BEFORE INSERT OR UPDATE ON "public"."productos_donados" FOR EACH ROW EXECUTE FUNCTION "public"."validar_producto_duplicado"();



ALTER TABLE ONLY "public"."alimentos_unidades"
    ADD CONSTRAINT "alimentos_unidades_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "public"."alimentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alimentos_unidades"
    ADD CONSTRAINT "alimentos_unidades_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bajas_productos"
    ADD CONSTRAINT "bajas_productos_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."depositos"("id_deposito") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bajas_productos"
    ADD CONSTRAINT "bajas_productos_id_inventario_fkey" FOREIGN KEY ("id_inventario") REFERENCES "public"."inventario"("id_inventario") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bajas_productos"
    ADD CONSTRAINT "bajas_productos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."productos_donados"("id_producto") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bajas_productos"
    ADD CONSTRAINT "bajas_productos_usuario_responsable_fkey" FOREIGN KEY ("usuario_responsable_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."configuracion_notificaciones"
    ADD CONSTRAINT "configuracion_notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversiones"
    ADD CONSTRAINT "conversiones_unidad_destino_id_fkey" FOREIGN KEY ("unidad_destino_id") REFERENCES "public"."unidades"("id");



ALTER TABLE ONLY "public"."conversiones"
    ADD CONSTRAINT "conversiones_unidad_origen_id_fkey" FOREIGN KEY ("unidad_origen_id") REFERENCES "public"."unidades"("id");



ALTER TABLE ONLY "public"."detalles_solicitud"
    ADD CONSTRAINT "detalles_solicitud_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."productos_donados"("id_producto") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."detalles_solicitud"
    ADD CONSTRAINT "detalles_solicitud_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "public"."solicitudes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."donaciones"
    ADD CONSTRAINT "donaciones_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "public"."alimentos"("id");



ALTER TABLE ONLY "public"."donaciones"
    ADD CONSTRAINT "donaciones_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id");



ALTER TABLE ONLY "public"."donaciones"
    ADD CONSTRAINT "donaciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."donaciones"
    ADD CONSTRAINT "donaciones_usuario_cancelacion_id_fkey" FOREIGN KEY ("usuario_cancelacion_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."historial_donaciones"
    ADD CONSTRAINT "historial_donaciones_operador_id_fkey" FOREIGN KEY ("operador_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."historial_donaciones"
    ADD CONSTRAINT "historial_donaciones_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "public"."solicitudes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventario"
    ADD CONSTRAINT "inventario_id_deposito_fkey" FOREIGN KEY ("id_deposito") REFERENCES "public"."depositos"("id_deposito");



ALTER TABLE ONLY "public"."inventario"
    ADD CONSTRAINT "inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."productos_donados"("id_producto");



ALTER TABLE ONLY "public"."movimiento_inventario_cabecera"
    ADD CONSTRAINT "movimiento_inventario_cabecera_id_donante_fkey" FOREIGN KEY ("id_donante") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."movimiento_inventario_cabecera"
    ADD CONSTRAINT "movimiento_inventario_cabecera_id_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."movimiento_inventario_detalle"
    ADD CONSTRAINT "movimiento_inventario_detalle_id_movimiento_fkey" FOREIGN KEY ("id_movimiento") REFERENCES "public"."movimiento_inventario_cabecera"("id_movimiento") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."movimiento_inventario_detalle"
    ADD CONSTRAINT "movimiento_inventario_detalle_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."productos_donados"("id_producto");



ALTER TABLE ONLY "public"."movimiento_inventario_detalle"
    ADD CONSTRAINT "movimiento_inventario_detalle_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id");



ALTER TABLE ONLY "public"."notificaciones"
    ADD CONSTRAINT "notificaciones_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."productos_donados"
    ADD CONSTRAINT "productos_donados_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "public"."alimentos"("id");



ALTER TABLE ONLY "public"."productos_donados"
    ADD CONSTRAINT "productos_donados_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."productos_donados"
    ADD CONSTRAINT "productos_donados_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id");



ALTER TABLE ONLY "public"."solicitudes"
    ADD CONSTRAINT "solicitudes_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id");



ALTER TABLE ONLY "public"."solicitudes"
    ADD CONSTRAINT "solicitudes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."unidades"
    ADD CONSTRAINT "unidades_tipo_magnitud_id_fkey" FOREIGN KEY ("tipo_magnitud_id") REFERENCES "public"."tipos_magnitud"("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Donantes pueden actualizar sus propias donaciones pendientes" ON "public"."donaciones" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("estado" = 'Pendiente'::"text"))) WITH CHECK ((("auth"."uid"() = "user_id") AND ("estado" = 'Pendiente'::"text")));



COMMENT ON POLICY "Donantes pueden actualizar sus propias donaciones pendientes" ON "public"."donaciones" IS 'Permite a los donantes editar sus propias donaciones solo si están en estado Pendiente';



CREATE POLICY "Donantes pueden eliminar sus propias donaciones pendientes" ON "public"."donaciones" FOR DELETE USING ((("auth"."uid"() = "user_id") AND ("estado" = 'Pendiente'::"text")));



COMMENT ON POLICY "Donantes pueden eliminar sus propias donaciones pendientes" ON "public"."donaciones" IS 'Permite a los donantes eliminar sus propias donaciones solo si están en estado Pendiente';



CREATE POLICY "Enable all operations for alimentos" ON "public"."alimentos" USING (true);



CREATE POLICY "Enable all operations for conversiones" ON "public"."conversiones" USING (true);



CREATE POLICY "Enable all operations for tipos_magnitud" ON "public"."tipos_magnitud" USING (true);



CREATE POLICY "Enable all operations for unidades" ON "public"."unidades" USING (true);



CREATE POLICY "Operadores y admins pueden registrar donaciones" ON "public"."historial_donaciones" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['OPERADOR'::"text", 'ADMINISTRADOR'::"text", 'ADMIN'::"text"]))))));



CREATE POLICY "Operadores y admins pueden ver todo el historial" ON "public"."historial_donaciones" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['OPERADOR'::"text", 'ADMINISTRADOR'::"text", 'ADMIN'::"text"]))))));



CREATE POLICY "Permitir lectura de inventario a usuarios autenticados" ON "public"."inventario" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Permitir lectura de productos_donados a usuarios autenticados" ON "public"."productos_donados" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Permitir lectura pública de alimentos" ON "public"."alimentos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Permitir lectura pública de unidades" ON "public"."unidades" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can manage their notification settings" ON "public"."configuracion_notificaciones" USING (("usuario_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own notifications" ON "public"."notificaciones" FOR UPDATE USING ((("destinatario_id" = "auth"."uid"()) OR (("rol_destinatario")::"text" = ( SELECT "usuarios"."rol"
   FROM "public"."usuarios"
  WHERE ("usuarios"."id" = "auth"."uid"()))) OR (("rol_destinatario")::"text" = 'TODOS'::"text")));



CREATE POLICY "Users can view their own notifications" ON "public"."notificaciones" FOR SELECT USING ((("destinatario_id" = "auth"."uid"()) OR (("rol_destinatario")::"text" = ( SELECT "usuarios"."rol"
   FROM "public"."usuarios"
  WHERE ("usuarios"."id" = "auth"."uid"()))) OR (("rol_destinatario")::"text" = 'TODOS'::"text")));



CREATE POLICY "Usuarios autenticados pueden ver depósitos" ON "public"."depositos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Usuarios pueden ver historial de sus solicitudes" ON "public"."historial_donaciones" FOR SELECT TO "authenticated" USING (("solicitud_id" IN ( SELECT "solicitudes"."id"
   FROM "public"."solicitudes"
  WHERE ("solicitudes"."usuario_id" = "auth"."uid"()))));



CREATE POLICY "admin_delete_donaciones" ON "public"."donaciones" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text")))));



CREATE POLICY "admin_select_donaciones" ON "public"."donaciones" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text")))));



CREATE POLICY "admin_update_donaciones" ON "public"."donaciones" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text")))));



ALTER TABLE "public"."alimentos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."alimentos_unidades" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "alimentos_unidades_delete_admin" ON "public"."alimentos_unidades" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "alimentos_unidades_insert_admin_operador" ON "public"."alimentos_unidades" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "alimentos_unidades_select_usuarios_activos" ON "public"."alimentos_unidades" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "alimentos_unidades_update_admin_operador" ON "public"."alimentos_unidades" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



ALTER TABLE "public"."bajas_productos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bajas_productos_delete_admin" ON "public"."bajas_productos" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "bajas_productos_insert_admin_operador" ON "public"."bajas_productos" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "bajas_productos_select_authenticated" ON "public"."bajas_productos" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "bajas_productos_update_admin" ON "public"."bajas_productos" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



ALTER TABLE "public"."configuracion_notificaciones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversiones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."depositos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "depositos_delete_admin" ON "public"."depositos" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "depositos_insert_admin_operador" ON "public"."depositos" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "depositos_update_admin_operador" ON "public"."depositos" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



ALTER TABLE "public"."detalles_solicitud" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "detalles_solicitud_delete_admin" ON "public"."detalles_solicitud" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "detalles_solicitud_insert_admin_operador" ON "public"."detalles_solicitud" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "detalles_solicitud_select_admin_operador" ON "public"."detalles_solicitud" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "detalles_solicitud_select_own" ON "public"."detalles_solicitud" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."solicitudes" "s"
  WHERE (("s"."id" = "detalles_solicitud"."id_solicitud") AND ("s"."usuario_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
           FROM "public"."usuarios"
          WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))))));



CREATE POLICY "detalles_solicitud_update_admin_operador" ON "public"."detalles_solicitud" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



ALTER TABLE "public"."donaciones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "donante_insert_donaciones" ON "public"."donaciones" FOR INSERT WITH CHECK (true);



CREATE POLICY "donante_select_own_donaciones" ON "public"."donaciones" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."historial_donaciones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventario" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventario_delete_admin" ON "public"."inventario" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "inventario_insert_admin_operador" ON "public"."inventario" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "inventario_select_usuarios_activos" ON "public"."inventario" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "inventario_update_admin_operador" ON "public"."inventario" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "movimiento_cabecera_delete" ON "public"."movimiento_inventario_cabecera" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "movimiento_cabecera_insert" ON "public"."movimiento_inventario_cabecera" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "movimiento_cabecera_select" ON "public"."movimiento_inventario_cabecera" FOR SELECT TO "authenticated" USING ((("id_donante" = "auth"."uid"()) OR ("id_solicitante" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))));



CREATE POLICY "movimiento_cabecera_update" ON "public"."movimiento_inventario_cabecera" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "movimiento_detalle_delete" ON "public"."movimiento_inventario_detalle" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "movimiento_detalle_insert" ON "public"."movimiento_inventario_detalle" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "movimiento_detalle_select" ON "public"."movimiento_inventario_detalle" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."movimiento_inventario_cabecera" "mic"
  WHERE (("mic"."id_movimiento" = "movimiento_inventario_detalle"."id_movimiento") AND (("mic"."id_donante" = "auth"."uid"()) OR ("mic"."id_solicitante" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."usuarios"
          WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))))))));



CREATE POLICY "movimiento_detalle_update" ON "public"."movimiento_inventario_detalle" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



ALTER TABLE "public"."movimiento_inventario_cabecera" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."movimiento_inventario_detalle" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notificaciones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notificaciones_delete_admin" ON "public"."notificaciones" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "notificaciones_insert_authenticated" ON "public"."notificaciones" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "notificaciones_select_own_or_role" ON "public"."notificaciones" FOR SELECT TO "authenticated" USING ((("destinatario_id" = "auth"."uid"()) OR (("rol_destinatario")::"text" IN ( SELECT "usuarios"."rol"
   FROM "public"."usuarios"
  WHERE ("usuarios"."id" = "auth"."uid"()))) OR ("destinatario_id" IS NULL)));



CREATE POLICY "notificaciones_update_own" ON "public"."notificaciones" FOR UPDATE TO "authenticated" USING ((("destinatario_id" = "auth"."uid"()) OR (("rol_destinatario")::"text" IN ( SELECT "usuarios"."rol"
   FROM "public"."usuarios"
  WHERE ("usuarios"."id" = "auth"."uid"()))))) WITH CHECK ((("destinatario_id" = "auth"."uid"()) OR (("rol_destinatario")::"text" IN ( SELECT "usuarios"."rol"
   FROM "public"."usuarios"
  WHERE ("usuarios"."id" = "auth"."uid"())))));



CREATE POLICY "operador_select_donaciones" ON "public"."donaciones" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'OPERADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "operador_update_donaciones" ON "public"."donaciones" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'OPERADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'OPERADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "operadores_can_read_alimentos" ON "public"."alimentos" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['OPERADOR'::"text", 'ADMINISTRADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "operadores_can_read_depositos" ON "public"."depositos" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['OPERADOR'::"text", 'ADMINISTRADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "operadores_can_read_unidades" ON "public"."unidades" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['OPERADOR'::"text", 'ADMINISTRADOR'::"text", 'DONANTE'::"text", 'SOLICITANTE'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



ALTER TABLE "public"."productos_donados" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "productos_donados_delete_admin" ON "public"."productos_donados" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "productos_donados_insert_permitidos" ON "public"."productos_donados" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text", 'DONANTE'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))) AND ((("id_usuario" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'DONANTE'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"]))))))));



CREATE POLICY "productos_donados_select_usuarios_activos" ON "public"."productos_donados" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "productos_donados_update_admin_operador" ON "public"."productos_donados" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



ALTER TABLE "public"."solicitudes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "solicitudes_delete_admin" ON "public"."solicitudes" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'ADMINISTRADOR'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "solicitudes_insert_admin_operador" ON "public"."solicitudes" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "solicitudes_insert_solicitante" ON "public"."solicitudes" FOR INSERT TO "authenticated" WITH CHECK ((("usuario_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'SOLICITANTE'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text"))))));



CREATE POLICY "solicitudes_select_admin_operador" ON "public"."solicitudes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "solicitudes_select_own" ON "public"."solicitudes" FOR SELECT TO "authenticated" USING ((("usuario_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'SOLICITANTE'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text"))))));



CREATE POLICY "solicitudes_update_admin_operador" ON "public"."solicitudes" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "solicitudes_update_own_pending" ON "public"."solicitudes" FOR UPDATE TO "authenticated" USING ((("usuario_id" = "auth"."uid"()) AND ("estado" = 'pendiente'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'SOLICITANTE'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text")))))) WITH CHECK ((("usuario_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."rol" = 'SOLICITANTE'::"text") AND (("usuarios"."estado")::"text" = 'activo'::"text"))))));



ALTER TABLE "public"."tipos_magnitud" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."unidades" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_can_read_conversiones" ON "public"."conversiones" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "users_can_read_tipos_magnitud" ON "public"."tipos_magnitud" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



CREATE POLICY "users_can_read_unidades" ON "public"."unidades" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."estado")::"text" = 'activo'::"text")))));



ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usuarios_delete_policy" ON "public"."usuarios" FOR DELETE TO "authenticated" USING ((("public"."get_user_role"() = 'ADMINISTRADOR'::"text") AND ("public"."get_user_estado"() = 'activo'::"text")));



CREATE POLICY "usuarios_insert_policy" ON "public"."usuarios" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "usuarios_select_policy" ON "public"."usuarios" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR (("public"."get_user_role"() = ANY (ARRAY['ADMINISTRADOR'::"text", 'OPERADOR'::"text"])) AND ("public"."get_user_estado"() = 'activo'::"text"))));



CREATE POLICY "usuarios_update_policy" ON "public"."usuarios" FOR UPDATE TO "authenticated" USING ((("id" = "auth"."uid"()) OR (("public"."get_user_role"() = 'ADMINISTRADOR'::"text") AND ("public"."get_user_estado"() = 'activo'::"text")))) WITH CHECK ((("id" = "auth"."uid"()) OR (("public"."get_user_role"() = 'ADMINISTRADOR'::"text") AND ("public"."get_user_estado"() = 'activo'::"text"))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."cancelar_eliminacion_categoria"("p_eliminacion_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cancelar_eliminacion_categoria"("p_eliminacion_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancelar_eliminacion_categoria"("p_eliminacion_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."convertir_cantidad"("p_cantidad" numeric, "p_unidad_origen_id" bigint, "p_unidad_destino_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."convertir_cantidad"("p_cantidad" numeric, "p_unidad_origen_id" bigint, "p_unidad_destino_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."convertir_cantidad"("p_cantidad" numeric, "p_unidad_origen_id" bigint, "p_unidad_destino_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."crear_notificacion"("p_titulo" character varying, "p_mensaje" "text", "p_tipo" character varying, "p_destinatario_id" "uuid", "p_rol_destinatario" character varying, "p_categoria" character varying, "p_url_accion" character varying, "p_metadatos" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."crear_notificacion"("p_titulo" character varying, "p_mensaje" "text", "p_tipo" character varying, "p_destinatario_id" "uuid", "p_rol_destinatario" character varying, "p_categoria" character varying, "p_url_accion" character varying, "p_metadatos" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crear_notificacion"("p_titulo" character varying, "p_mensaje" "text", "p_tipo" character varying, "p_destinatario_id" "uuid", "p_rol_destinatario" character varying, "p_categoria" character varying, "p_url_accion" character varying, "p_metadatos" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."crear_producto_desde_donacion"() TO "anon";
GRANT ALL ON FUNCTION "public"."crear_producto_desde_donacion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."crear_producto_desde_donacion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."dar_baja_producto"("p_id_inventario" "uuid", "p_cantidad" numeric, "p_motivo" "text", "p_usuario_id" "uuid", "p_observaciones" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."dar_baja_producto"("p_id_inventario" "uuid", "p_cantidad" numeric, "p_motivo" "text", "p_usuario_id" "uuid", "p_observaciones" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."dar_baja_producto"("p_id_inventario" "uuid", "p_cantidad" numeric, "p_motivo" "text", "p_usuario_id" "uuid", "p_observaciones" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_estado"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_estado"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_estado"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_or_operator"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_or_operator"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_or_operator"() TO "service_role";



GRANT ALL ON FUNCTION "public"."limpiar_notificaciones_antiguas"() TO "anon";
GRANT ALL ON FUNCTION "public"."limpiar_notificaciones_antiguas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."limpiar_notificaciones_antiguas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."marcar_notificacion_leida"("p_notificacion_id" "uuid", "p_usuario_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."marcar_notificacion_leida"("p_notificacion_id" "uuid", "p_usuario_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."marcar_notificacion_leida"("p_notificacion_id" "uuid", "p_usuario_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_estadisticas_bajas"("p_fecha_inicio" timestamp with time zone, "p_fecha_fin" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_estadisticas_bajas"("p_fecha_inicio" timestamp with time zone, "p_fecha_fin" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_estadisticas_bajas"("p_fecha_inicio" timestamp with time zone, "p_fecha_fin" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_info_producto_inventario"("p_id_producto" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_info_producto_inventario"("p_id_producto" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_info_producto_inventario"("p_id_producto" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_notificaciones_no_leidas"("p_usuario_id" "uuid", "p_rol_usuario" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_notificaciones_no_leidas"("p_usuario_id" "uuid", "p_rol_usuario" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_notificaciones_no_leidas"("p_usuario_id" "uuid", "p_rol_usuario" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_productos_proximos_vencer"("p_dias_umbral" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_productos_proximos_vencer"("p_dias_umbral" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_productos_proximos_vencer"("p_dias_umbral" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_unidades_alimento"("p_alimento_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_unidades_alimento"("p_alimento_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_unidades_alimento"("p_alimento_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."procesar_eliminaciones_categorias_pendientes"() TO "anon";
GRANT ALL ON FUNCTION "public"."procesar_eliminaciones_categorias_pendientes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."procesar_eliminaciones_categorias_pendientes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."registrar_movimiento_con_unidad"("p_id_movimiento" "uuid", "p_id_producto" "uuid", "p_cantidad" numeric, "p_tipo_transaccion" "text", "p_unidad_id" bigint, "p_observacion" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."registrar_movimiento_con_unidad"("p_id_movimiento" "uuid", "p_id_producto" "uuid", "p_cantidad" numeric, "p_tipo_transaccion" "text", "p_unidad_id" bigint, "p_observacion" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."registrar_movimiento_con_unidad"("p_id_movimiento" "uuid", "p_id_producto" "uuid", "p_cantidad" numeric, "p_tipo_transaccion" "text", "p_unidad_id" bigint, "p_observacion" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_notificacion_donacion"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_notificacion_donacion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_notificacion_donacion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_notificacion_solicitud"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_notificacion_solicitud"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_notificacion_solicitud"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_notificacion_usuario"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_notificacion_usuario"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_notificacion_usuario"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_bajas_productos_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_bajas_productos_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_bajas_productos_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_producto_duplicado"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_producto_duplicado"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_producto_duplicado"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_tipo_magnitud_alimento"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_tipo_magnitud_alimento"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_tipo_magnitud_alimento"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_unidad_movimiento"() TO "anon";
GRANT ALL ON FUNCTION "public"."validar_unidad_movimiento"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_unidad_movimiento"() TO "service_role";


















GRANT ALL ON TABLE "public"."alimentos" TO "anon";
GRANT ALL ON TABLE "public"."alimentos" TO "authenticated";
GRANT ALL ON TABLE "public"."alimentos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."alimentos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."alimentos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."alimentos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."alimentos_unidades" TO "anon";
GRANT ALL ON TABLE "public"."alimentos_unidades" TO "authenticated";
GRANT ALL ON TABLE "public"."alimentos_unidades" TO "service_role";



GRANT ALL ON SEQUENCE "public"."alimentos_unidades_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."alimentos_unidades_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."alimentos_unidades_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bajas_productos" TO "anon";
GRANT ALL ON TABLE "public"."bajas_productos" TO "authenticated";
GRANT ALL ON TABLE "public"."bajas_productos" TO "service_role";



GRANT ALL ON TABLE "public"."configuracion_notificaciones" TO "anon";
GRANT ALL ON TABLE "public"."configuracion_notificaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracion_notificaciones" TO "service_role";



GRANT ALL ON TABLE "public"."conversiones" TO "anon";
GRANT ALL ON TABLE "public"."conversiones" TO "authenticated";
GRANT ALL ON TABLE "public"."conversiones" TO "service_role";



GRANT ALL ON SEQUENCE "public"."conversiones_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."conversiones_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."conversiones_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."depositos" TO "anon";
GRANT ALL ON TABLE "public"."depositos" TO "authenticated";
GRANT ALL ON TABLE "public"."depositos" TO "service_role";



GRANT ALL ON TABLE "public"."detalles_solicitud" TO "anon";
GRANT ALL ON TABLE "public"."detalles_solicitud" TO "authenticated";
GRANT ALL ON TABLE "public"."detalles_solicitud" TO "service_role";



GRANT ALL ON TABLE "public"."donaciones" TO "anon";
GRANT ALL ON TABLE "public"."donaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."donaciones" TO "service_role";



GRANT ALL ON SEQUENCE "public"."donaciones_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."donaciones_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."donaciones_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."historial_donaciones" TO "anon";
GRANT ALL ON TABLE "public"."historial_donaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."historial_donaciones" TO "service_role";



GRANT ALL ON TABLE "public"."inventario" TO "anon";
GRANT ALL ON TABLE "public"."inventario" TO "authenticated";
GRANT ALL ON TABLE "public"."inventario" TO "service_role";



GRANT ALL ON TABLE "public"."movimiento_inventario_cabecera" TO "anon";
GRANT ALL ON TABLE "public"."movimiento_inventario_cabecera" TO "authenticated";
GRANT ALL ON TABLE "public"."movimiento_inventario_cabecera" TO "service_role";



GRANT ALL ON TABLE "public"."movimiento_inventario_detalle" TO "anon";
GRANT ALL ON TABLE "public"."movimiento_inventario_detalle" TO "authenticated";
GRANT ALL ON TABLE "public"."movimiento_inventario_detalle" TO "service_role";



GRANT ALL ON TABLE "public"."notificaciones" TO "anon";
GRANT ALL ON TABLE "public"."notificaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."notificaciones" TO "service_role";



GRANT ALL ON TABLE "public"."productos_donados" TO "anon";
GRANT ALL ON TABLE "public"."productos_donados" TO "authenticated";
GRANT ALL ON TABLE "public"."productos_donados" TO "service_role";



GRANT ALL ON TABLE "public"."solicitudes" TO "anon";
GRANT ALL ON TABLE "public"."solicitudes" TO "authenticated";
GRANT ALL ON TABLE "public"."solicitudes" TO "service_role";



GRANT ALL ON TABLE "public"."tipos_magnitud" TO "anon";
GRANT ALL ON TABLE "public"."tipos_magnitud" TO "authenticated";
GRANT ALL ON TABLE "public"."tipos_magnitud" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tipos_magnitud_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tipos_magnitud_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tipos_magnitud_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."unidades" TO "anon";
GRANT ALL ON TABLE "public"."unidades" TO "authenticated";
GRANT ALL ON TABLE "public"."unidades" TO "service_role";



GRANT ALL ON SEQUENCE "public"."unidades_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."unidades_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."unidades_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



GRANT ALL ON TABLE "public"."v_bajas_productos_detalle" TO "anon";
GRANT ALL ON TABLE "public"."v_bajas_productos_detalle" TO "authenticated";
GRANT ALL ON TABLE "public"."v_bajas_productos_detalle" TO "service_role";



GRANT ALL ON TABLE "public"."v_inventario_con_conversiones" TO "anon";
GRANT ALL ON TABLE "public"."v_inventario_con_conversiones" TO "authenticated";
GRANT ALL ON TABLE "public"."v_inventario_con_conversiones" TO "service_role";



GRANT ALL ON TABLE "public"."v_inventario_con_unidades" TO "anon";
GRANT ALL ON TABLE "public"."v_inventario_con_unidades" TO "authenticated";
GRANT ALL ON TABLE "public"."v_inventario_con_unidades" TO "service_role";



GRANT ALL ON TABLE "public"."v_inventario_detallado" TO "anon";
GRANT ALL ON TABLE "public"."v_inventario_detallado" TO "authenticated";
GRANT ALL ON TABLE "public"."v_inventario_detallado" TO "service_role";



GRANT ALL ON TABLE "public"."v_movimientos_detallado" TO "anon";
GRANT ALL ON TABLE "public"."v_movimientos_detallado" TO "authenticated";
GRANT ALL ON TABLE "public"."v_movimientos_detallado" TO "service_role";



GRANT ALL ON TABLE "public"."v_productos_duplicados" TO "anon";
GRANT ALL ON TABLE "public"."v_productos_duplicados" TO "authenticated";
GRANT ALL ON TABLE "public"."v_productos_duplicados" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























