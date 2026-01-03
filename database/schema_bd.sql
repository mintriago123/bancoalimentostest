-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alimentos (
  id bigint NOT NULL DEFAULT nextval('alimentos_id_seq'::regclass),
  nombre text NOT NULL,
  categoria text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alimentos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.alimentos_unidades (
  id bigint NOT NULL DEFAULT nextval('alimentos_unidades_id_seq'::regclass),
  alimento_id bigint NOT NULL,
  unidad_id bigint NOT NULL,
  es_unidad_principal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alimentos_unidades_pkey PRIMARY KEY (id),
  CONSTRAINT alimentos_unidades_alimento_id_fkey FOREIGN KEY (alimento_id) REFERENCES public.alimentos(id),
  CONSTRAINT alimentos_unidades_unidad_id_fkey FOREIGN KEY (unidad_id) REFERENCES public.unidades(id)
);
CREATE TABLE public.configuracion_notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  categoria character varying NOT NULL,
  email_activo boolean DEFAULT true,
  push_activo boolean DEFAULT true,
  sonido_activo boolean DEFAULT true,
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT configuracion_notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT configuracion_notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.conversiones (
  id bigint NOT NULL DEFAULT nextval('conversiones_id_seq'::regclass),
  unidad_origen_id bigint NOT NULL,
  unidad_destino_id bigint NOT NULL,
  factor_conversion numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversiones_pkey PRIMARY KEY (id),
  CONSTRAINT conversiones_unidad_destino_id_fkey FOREIGN KEY (unidad_destino_id) REFERENCES public.unidades(id),
  CONSTRAINT conversiones_unidad_origen_id_fkey FOREIGN KEY (unidad_origen_id) REFERENCES public.unidades(id)
);
CREATE TABLE public.depositos (
  id_deposito uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  CONSTRAINT depositos_pkey PRIMARY KEY (id_deposito)
);
CREATE TABLE public.detalles_solicitud (
  id_detalle uuid NOT NULL DEFAULT gen_random_uuid(),
  id_solicitud uuid,
  id_producto uuid,
  cantidad_solicitada numeric,
  cantidad_entregada numeric,
  fecha_respuesta timestamp with time zone,
  comentario_admin text,
  CONSTRAINT detalles_solicitud_pkey PRIMARY KEY (id_detalle),
  CONSTRAINT detalles_solicitud_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos_donados(id_producto),
  CONSTRAINT detalles_solicitud_id_solicitud_fkey FOREIGN KEY (id_solicitud) REFERENCES public.solicitudes(id)
);
CREATE TABLE public.donaciones (
  id integer NOT NULL DEFAULT nextval('donaciones_id_seq'::regclass),
  user_id uuid,
  nombre_donante text NOT NULL,
  ruc_donante text,
  cedula_donante text,
  direccion_donante_completa text,
  telefono text NOT NULL,
  email text NOT NULL,
  representante_donante text,
  tipo_persona_donante text,
  alimento_id integer,
  tipo_producto text NOT NULL,
  categoria_comida text NOT NULL,
  es_producto_personalizado boolean NOT NULL DEFAULT false,
  cantidad numeric NOT NULL CHECK (cantidad > 0::numeric),
  unidad_id integer NOT NULL,
  unidad_nombre text NOT NULL,
  unidad_simbolo text NOT NULL,
  fecha_vencimiento date,
  fecha_disponible date NOT NULL,
  direccion_entrega text NOT NULL,
  horario_preferido text,
  observaciones text,
  impacto_estimado_personas integer,
  impacto_equivalente text,
  estado text NOT NULL DEFAULT 'Pendiente'::text CHECK (estado = ANY (ARRAY['Pendiente'::text, 'Recogida'::text, 'Entregada'::text, 'Cancelada'::text])),
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT donaciones_pkey PRIMARY KEY (id),
  CONSTRAINT donaciones_alimento_id_fkey FOREIGN KEY (alimento_id) REFERENCES public.alimentos(id),
  CONSTRAINT donaciones_unidad_id_fkey FOREIGN KEY (unidad_id) REFERENCES public.unidades(id),
  CONSTRAINT donaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.inventario (
  id_inventario uuid NOT NULL DEFAULT gen_random_uuid(),
  id_deposito uuid NOT NULL,
  id_producto uuid NOT NULL,
  cantidad_disponible numeric NOT NULL DEFAULT 0,
  fecha_actualizacion timestamp without time zone DEFAULT now(),
  CONSTRAINT inventario_pkey PRIMARY KEY (id_inventario),
  CONSTRAINT inventario_id_deposito_fkey FOREIGN KEY (id_deposito) REFERENCES public.depositos(id_deposito),
  CONSTRAINT inventario_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos_donados(id_producto)
);
CREATE TABLE public.movimiento_inventario_cabecera (
  id_movimiento uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha_movimiento timestamp without time zone DEFAULT now(),
  id_donante uuid NOT NULL,
  id_solicitante uuid NOT NULL,
  estado_movimiento text NOT NULL CHECK (estado_movimiento = ANY (ARRAY['pendiente'::text, 'completado'::text, 'donado'::text])),
  observaciones text,
  CONSTRAINT movimiento_inventario_cabecera_pkey PRIMARY KEY (id_movimiento),
  CONSTRAINT movimiento_inventario_cabecera_id_donante_fkey FOREIGN KEY (id_donante) REFERENCES public.usuarios(id),
  CONSTRAINT movimiento_inventario_cabecera_id_solicitante_fkey FOREIGN KEY (id_solicitante) REFERENCES public.usuarios(id)
);
CREATE TABLE public.movimiento_inventario_detalle (
  id_detalle uuid NOT NULL DEFAULT gen_random_uuid(),
  id_movimiento uuid NOT NULL,
  id_producto uuid NOT NULL,
  cantidad numeric NOT NULL,
  tipo_transaccion text NOT NULL CHECK (tipo_transaccion = ANY (ARRAY['ingreso'::text, 'egreso'::text, 'baja'::text])),
  rol_usuario text NOT NULL CHECK (rol_usuario = ANY (ARRAY['donante'::text, 'beneficiario'::text, 'distribuidor'::text])),
  observacion_detalle text,
  unidad_id bigint,
  CONSTRAINT movimiento_inventario_detalle_pkey PRIMARY KEY (id_detalle),
  CONSTRAINT movimiento_inventario_detalle_id_movimiento_fkey FOREIGN KEY (id_movimiento) REFERENCES public.movimiento_inventario_cabecera(id_movimiento),
  CONSTRAINT movimiento_inventario_detalle_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos_donados(id_producto),
  CONSTRAINT movimiento_inventario_detalle_unidad_id_fkey FOREIGN KEY (unidad_id) REFERENCES public.unidades(id)
);
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo character varying NOT NULL,
  mensaje text NOT NULL,
  tipo character varying NOT NULL DEFAULT 'info'::character varying,
  destinatario_id uuid,
  rol_destinatario character varying,
  categoria character varying NOT NULL,
  leida boolean DEFAULT false,
  url_accion character varying,
  metadatos jsonb DEFAULT '{}'::jsonb,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_leida timestamp with time zone,
  activa boolean DEFAULT true,
  expira_en timestamp with time zone,
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_destinatario_id_fkey FOREIGN KEY (destinatario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.productos_donados (
  id_producto uuid NOT NULL DEFAULT gen_random_uuid(),
  id_usuario uuid,
  nombre_producto text,
  descripcion text,
  fecha_donacion timestamp with time zone DEFAULT now(),
  cantidad numeric,
  unidad_medida text,
  fecha_caducidad timestamp with time zone,
  alimento_id bigint,
  unidad_id bigint,
  CONSTRAINT productos_donados_pkey PRIMARY KEY (id_producto),
  CONSTRAINT productos_donados_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id),
  CONSTRAINT productos_donados_alimento_id_fkey FOREIGN KEY (alimento_id) REFERENCES public.alimentos(id),
  CONSTRAINT productos_donados_unidad_id_fkey FOREIGN KEY (unidad_id) REFERENCES public.unidades(id)
);
CREATE TABLE public.solicitudes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  tipo_alimento text NOT NULL,
  cantidad numeric NOT NULL,
  comentarios text,
  latitud double precision,
  longitud double precision,
  estado text DEFAULT 'pendiente'::text,
  created_at timestamp with time zone DEFAULT now(),
  fecha_respuesta timestamp with time zone,
  comentario_admin text,
  unidad_id bigint,
  CONSTRAINT solicitudes_pkey PRIMARY KEY (id),
  CONSTRAINT solicitudes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT solicitudes_unidad_id_fkey FOREIGN KEY (unidad_id) REFERENCES public.unidades(id)
);
CREATE TABLE public.tipos_magnitud (
  id bigint NOT NULL DEFAULT nextval('tipos_magnitud_id_seq'::regclass),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tipos_magnitud_pkey PRIMARY KEY (id)
);
CREATE TABLE public.unidades (
  id bigint NOT NULL DEFAULT nextval('unidades_id_seq'::regclass),
  nombre text NOT NULL,
  simbolo text NOT NULL,
  tipo_magnitud_id bigint NOT NULL,
  es_base boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unidades_pkey PRIMARY KEY (id),
  CONSTRAINT unidades_tipo_magnitud_id_fkey FOREIGN KEY (tipo_magnitud_id) REFERENCES public.tipos_magnitud(id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL,
  rol text CHECK (rol = ANY (ARRAY['ADMINISTRADOR'::text, 'DONANTE'::text, 'SOLICITANTE'::text, 'OPERADOR'::text])),
  tipo_persona text,
  nombre text,
  ruc text,
  cedula text,
  direccion text,
  telefono text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  representante text,
  estado character varying DEFAULT 'activo'::character varying CHECK (estado::text = ANY (ARRAY['activo'::character varying::text, 'bloqueado'::character varying::text, 'desactivado'::character varying::text])),
  email text,
  recibir_notificaciones boolean DEFAULT true,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Habilitar RLS en todas las tablas del esquema public

ALTER TABLE public.alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimiento_inventario_cabecera ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimiento_inventario_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_donados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_magnitud ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Nota: Las tablas de auth, storage y realtime tienen RLS habilitado por defecto en Supabase

-- =====================================================
-- FUNCIONES DE TRIGGER
-- =====================================================

-- Función para actualizar columna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para manejar nuevo usuario (debe ser implementada)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Implementar lógica para manejar nuevo usuario
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para notificar donación (debe ser implementada)
CREATE OR REPLACE FUNCTION trigger_notificacion_donacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Implementar lógica de notificación de donación
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para validar producto duplicado (debe ser implementada)
CREATE OR REPLACE FUNCTION validar_producto_duplicado()
RETURNS TRIGGER AS $$
BEGIN
  -- Implementar lógica de validación de producto duplicado
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para notificar solicitud (debe ser implementada)
CREATE OR REPLACE FUNCTION trigger_notificacion_solicitud()
RETURNS TRIGGER AS $$
BEGIN
  -- Implementar lógica de notificación de solicitud
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para notificar cambios en usuario (debe ser implementada)
CREATE OR REPLACE FUNCTION trigger_notificacion_usuario()
RETURNS TRIGGER AS $$
BEGIN
  -- Implementar lógica de notificación de cambios en usuario
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Funciones auxiliares para políticas RLS
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT rol FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_estado()
RETURNS TEXT AS $$
  SELECT estado::text FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si es admin u operador
CREATE OR REPLACE FUNCTION is_admin_or_operator()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND rol IN ('ADMINISTRADOR', 'OPERADOR')
    AND estado = 'activo'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para convertir cantidades entre unidades
CREATE OR REPLACE FUNCTION convertir_cantidad(
  p_cantidad numeric,
  p_unidad_origen_id bigint,
  p_unidad_destino_id bigint
)
RETURNS numeric AS $$
DECLARE
  v_factor_conversion numeric;
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
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIONES DE GESTIÓN DE NOTIFICACIONES
-- =====================================================

-- Función para crear notificaciones
CREATE OR REPLACE FUNCTION crear_notificacion(
  p_titulo character varying,
  p_mensaje text,
  p_tipo character varying DEFAULT 'info',
  p_destinatario_id uuid DEFAULT NULL,
  p_rol_destinatario character varying DEFAULT NULL,
  p_categoria character varying DEFAULT 'sistema',
  p_url_accion character varying DEFAULT NULL,
  p_metadatos jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  notificacion_id UUID;
BEGIN
  INSERT INTO notificaciones (
    titulo, mensaje, tipo, destinatario_id, rol_destinatario,
    categoria, url_accion, metadatos
  ) VALUES (
    p_titulo, p_mensaje, p_tipo, p_destinatario_id, p_rol_destinatario,
    p_categoria, p_url_accion, p_metadatos
  ) RETURNING id INTO notificacion_id;
  
  RETURN notificacion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION marcar_notificacion_leida(
  p_notificacion_id uuid,
  p_usuario_id uuid
)
RETURNS boolean AS $$
BEGIN
  UPDATE notificaciones 
  SET leida = TRUE, fecha_leida = NOW()
  WHERE id = p_notificacion_id 
    AND (destinatario_id = p_usuario_id OR destinatario_id IS NULL);
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener notificaciones no leídas
CREATE OR REPLACE FUNCTION obtener_notificaciones_no_leidas(
  p_usuario_id uuid,
  p_rol_usuario character varying
)
RETURNS TABLE(
  id uuid,
  titulo character varying,
  mensaje text,
  tipo character varying,
  categoria character varying,
  url_accion character varying,
  metadatos jsonb,
  fecha_creacion timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id, n.titulo, n.mensaje, n.tipo, n.categoria,
    n.url_accion, n.metadatos, n.fecha_creacion
  FROM notificaciones n
  WHERE n.activa = TRUE
    AND n.leida = FALSE
    AND (n.expira_en IS NULL OR n.expira_en > NOW())
    AND (
      n.destinatario_id = p_usuario_id 
      OR n.rol_destinatario = p_rol_usuario 
      OR n.rol_destinatario = 'TODOS'
    )
  ORDER BY n.fecha_creacion DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar notificaciones antiguas
CREATE OR REPLACE FUNCTION limpiar_notificaciones_antiguas()
RETURNS integer AS $$
DECLARE
  notificaciones_eliminadas INTEGER;
BEGIN
  -- Eliminar notificaciones leídas mayores a 30 días
  DELETE FROM notificaciones 
  WHERE leida = TRUE 
    AND fecha_leida < NOW() - INTERVAL '30 days';
    
  GET DIAGNOSTICS notificaciones_eliminadas = ROW_COUNT;
  
  -- Eliminar notificaciones expiradas
  DELETE FROM notificaciones 
  WHERE expira_en IS NOT NULL 
    AND expira_en < NOW();
    
  RETURN notificaciones_eliminadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIONES DE GESTIÓN DE INVENTARIO
-- =====================================================

-- Función para obtener información de producto en inventario
CREATE OR REPLACE FUNCTION obtener_info_producto_inventario(p_id_producto uuid)
RETURNS TABLE(
  id_producto uuid,
  nombre_producto text,
  alimento_nombre text,
  alimento_categoria text,
  cantidad_total numeric,
  unidad_id bigint,
  unidad_nombre text,
  unidad_simbolo text,
  depositos_con_stock jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pd.id_producto,
    pd.nombre_producto,
    a.nombre as alimento_nombre,
    a.categoria as alimento_categoria,
    SUM(i.cantidad_disponible) as cantidad_total,
    pd.unidad_id,
    u.nombre as unidad_nombre,
    u.simbolo as unidad_simbolo,
    jsonb_agg(
      jsonb_build_object(
        'deposito', d.nombre,
        'cantidad', i.cantidad_disponible
      )
    ) as depositos_con_stock
  FROM public.productos_donados pd
  LEFT JOIN public.inventario i ON pd.id_producto = i.id_producto
  LEFT JOIN public.depositos d ON i.id_deposito = d.id_deposito
  LEFT JOIN public.alimentos a ON pd.alimento_id = a.id
  LEFT JOIN public.unidades u ON pd.unidad_id = u.id
  WHERE pd.id_producto = p_id_producto
  GROUP BY 
    pd.id_producto, pd.nombre_producto, a.nombre, a.categoria,
    pd.unidad_id, u.nombre, u.simbolo;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar movimiento con unidad
CREATE OR REPLACE FUNCTION registrar_movimiento_con_unidad(
  p_id_movimiento uuid,
  p_id_producto uuid,
  p_cantidad numeric,
  p_tipo_transaccion text,
  p_unidad_id bigint,
  p_observacion text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_id_detalle uuid;
BEGIN
  INSERT INTO public.movimiento_inventario_detalle (
    id_movimiento, id_producto, cantidad, tipo_transaccion,
    unidad_id, observacion_detalle
  ) VALUES (
    p_id_movimiento, p_id_producto, p_cantidad, p_tipo_transaccion,
    p_unidad_id, p_observacion
  ) RETURNING id_detalle INTO v_id_detalle;
  
  RETURN v_id_detalle;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIONES DE GESTIÓN DE UNIDADES Y ALIMENTOS
-- =====================================================

-- Función para obtener unidades de un alimento
CREATE OR REPLACE FUNCTION obtener_unidades_alimento(p_alimento_id bigint)
RETURNS TABLE(
  unidad_id bigint,
  nombre text,
  simbolo text,
  tipo_magnitud_id bigint,
  tipo_magnitud_nombre text,
  es_base boolean,
  es_principal boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, u.nombre, u.simbolo, u.tipo_magnitud_id,
    tm.nombre as tipo_magnitud_nombre,
    u.es_base, au.es_unidad_principal
  FROM public.alimentos_unidades au
  JOIN public.unidades u ON au.unidad_id = u.id
  JOIN public.tipos_magnitud tm ON u.tipo_magnitud_id = tm.id
  WHERE au.alimento_id = p_alimento_id
  ORDER BY au.es_unidad_principal DESC, u.nombre ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para validar tipo de magnitud de alimento
CREATE OR REPLACE FUNCTION validar_tipo_magnitud_alimento()
RETURNS trigger AS $$
DECLARE
  v_tipo_magnitud_existente bigint;
  v_tipo_magnitud_nueva bigint;
BEGIN
  -- Obtener el tipo de magnitud de la nueva unidad
  SELECT tipo_magnitud_id INTO v_tipo_magnitud_nueva
  FROM public.unidades
  WHERE id = NEW.unidad_id;

  -- Verificar si ya existen unidades para este alimento
  SELECT u.tipo_magnitud_id INTO v_tipo_magnitud_existente
  FROM public.alimentos_unidades au
  JOIN public.unidades u ON au.unidad_id = u.id
  WHERE au.alimento_id = NEW.alimento_id
  LIMIT 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para validar unidad en movimiento
CREATE OR REPLACE FUNCTION validar_unidad_movimiento()
RETURNS trigger AS $$
DECLARE
  v_alimento_id bigint;
  v_unidad_permitida boolean;
BEGIN
  -- Obtener el alimento_id del producto
  SELECT alimento_id INTO v_alimento_id
  FROM public.productos_donados
  WHERE id_producto = NEW.id_producto;

  -- Si no hay alimento asociado o no hay unidad especificada, permitir
  IF v_alimento_id IS NULL OR NEW.unidad_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Verificar si la unidad está permitida para este alimento
  SELECT EXISTS (
    SELECT 1 FROM public.alimentos_unidades
    WHERE alimento_id = v_alimento_id AND unidad_id = NEW.unidad_id
  ) INTO v_unidad_permitida;

  -- Si no está permitida, advertir pero no bloquear
  IF NOT v_unidad_permitida THEN
    RAISE WARNING 'La unidad % no está configurada para el alimento %, pero se permite el movimiento', 
      NEW.unidad_id, v_alimento_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIONES ESPECIALIZADAS
-- =====================================================

-- Función para crear producto desde donación
CREATE OR REPLACE FUNCTION crear_producto_desde_donacion()
RETURNS trigger AS $$
DECLARE
  v_producto_id uuid;
  v_deposito_id uuid;
  v_movimiento_id uuid;
  v_alimento_id_final bigint;
BEGIN
  -- Solo procesar donaciones en estado 'Recogida' o 'Entregada'
  IF NEW.estado IN ('Recogida', 'Entregada') THEN
    
    -- Obtener el depósito principal
    SELECT id_deposito INTO v_deposito_id
    FROM depositos WHERE nombre = 'Depósito Principal' LIMIT 1;
    
    -- Si no hay depósito, crearlo
    IF v_deposito_id IS NULL THEN
      INSERT INTO depositos (nombre, descripcion)
      VALUES ('Depósito Principal', 'Depósito principal del Banco de Alimentos')
      RETURNING id_deposito INTO v_deposito_id;
    END IF;
    
    -- Determinar alimento_id final
    v_alimento_id_final := NEW.alimento_id;
    
    -- Si es producto personalizado y no tiene alimento_id, crear o buscar alimento
    IF NEW.es_producto_personalizado AND v_alimento_id_final IS NULL THEN
      SELECT id INTO v_alimento_id_final
      FROM alimentos
      WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(NEW.tipo_producto))
      LIMIT 1;
      
      IF v_alimento_id_final IS NULL THEN
        INSERT INTO alimentos (nombre, categoria)
        VALUES (NEW.tipo_producto, COALESCE(NEW.categoria_comida, 'Otros'))
        RETURNING id INTO v_alimento_id_final;
      END IF;
    END IF;
    
    -- Verificar duplicados recientes
    IF EXISTS (
      SELECT 1 FROM productos_donados pd
      WHERE pd.nombre_producto = NEW.tipo_producto
        AND pd.id_usuario = NEW.user_id
        AND pd.cantidad = NEW.cantidad
        AND ABS(EXTRACT(EPOCH FROM (NOW() - pd.fecha_donacion))) < 5
    ) THEN
      RETURN NEW;
    END IF;
    
    -- Crear producto donado
    INSERT INTO productos_donados (
      id_usuario, nombre_producto, descripcion, cantidad,
      unidad_medida, fecha_donacion, fecha_caducidad,
      alimento_id, unidad_id
    ) VALUES (
      NEW.user_id, NEW.tipo_producto, 
      COALESCE(NEW.observaciones, 'Producto donado'),
      NEW.cantidad, NEW.unidad_nombre,
      COALESCE(NEW.fecha_disponible, CURRENT_DATE),
      NEW.fecha_vencimiento, v_alimento_id_final, NEW.unidad_id
    ) RETURNING id_producto INTO v_producto_id;
    
    -- Crear o actualizar inventario
    IF EXISTS (
      SELECT 1 FROM inventario 
      WHERE id_producto = v_producto_id AND id_deposito = v_deposito_id
    ) THEN
      UPDATE inventario
      SET cantidad_disponible = cantidad_disponible + NEW.cantidad,
          fecha_actualizacion = NOW()
      WHERE id_producto = v_producto_id AND id_deposito = v_deposito_id;
    ELSE
      INSERT INTO inventario (id_deposito, id_producto, cantidad_disponible)
      VALUES (v_deposito_id, v_producto_id, NEW.cantidad);
    END IF;
    
    -- Crear movimiento de inventario
    INSERT INTO movimiento_inventario_cabecera (
      id_donante, id_solicitante, estado_movimiento, observaciones
    ) VALUES (
      NEW.user_id, NEW.user_id, 'completado',
      'Ingreso por donación: ' || NEW.tipo_producto
    ) RETURNING id_movimiento INTO v_movimiento_id;
    
    INSERT INTO movimiento_inventario_detalle (
      id_movimiento, id_producto, cantidad,
      tipo_transaccion, rol_usuario, unidad_id
    ) VALUES (
      v_movimiento_id, v_producto_id, NEW.cantidad,
      'ingreso', 'donante', NEW.unidad_id
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para cancelar eliminación de categoría
CREATE OR REPLACE FUNCTION cancelar_eliminacion_categoria(
  p_eliminacion_id uuid,
  p_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  eliminacion_existe boolean;
BEGIN
  -- Verificar que la eliminación existe y está pendiente
  SELECT EXISTS(
    SELECT 1 FROM public.eliminaciones_categorias_pendientes
    WHERE id = p_eliminacion_id
      AND estado = 'pendiente'
      AND fecha_ejecucion > now()
  ) INTO eliminacion_existe;
  
  IF NOT eliminacion_existe THEN
    RETURN false;
  END IF;
  
  -- Marcar como cancelada
  UPDATE public.eliminaciones_categorias_pendientes
  SET estado = 'cancelada',
      cancelado_por = p_user_id,
      fecha_cancelacion = now()
  WHERE id = p_eliminacion_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para procesar eliminaciones pendientes de categorías
CREATE OR REPLACE FUNCTION procesar_eliminaciones_categorias_pendientes()
RETURNS TABLE(categorias_eliminadas integer) AS $$
DECLARE
  eliminaciones_procesadas integer := 0;
  eliminacion_record RECORD;
BEGIN
  FOR eliminacion_record IN 
    SELECT id, categoria_nombre
    FROM public.eliminaciones_categorias_pendientes
    WHERE estado = 'pendiente' AND fecha_ejecucion <= now()
    ORDER BY fecha_ejecucion ASC
  LOOP
    DELETE FROM public.alimentos
    WHERE categoria = eliminacion_record.categoria_nombre;
    
    UPDATE public.eliminaciones_categorias_pendientes
    SET estado = 'ejecutada'
    WHERE id = eliminacion_record.id;
    
    eliminaciones_procesadas := eliminaciones_procesadas + 1;
  END LOOP;
  
  RETURN QUERY SELECT eliminaciones_procesadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Actualizar updated_at en usuarios
CREATE TRIGGER trigger_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Notificación de nueva donación o actualización
CREATE TRIGGER trigger_donacion_notificacion
  AFTER INSERT OR UPDATE ON public.donaciones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notificacion_donacion();

-- Trigger: Validar producto duplicado antes de insertar
CREATE TRIGGER trigger_validar_producto_duplicado
  BEFORE INSERT OR UPDATE ON public.productos_donados
  FOR EACH ROW
  EXECUTE FUNCTION validar_producto_duplicado();

-- Trigger: Notificación de nueva solicitud o actualización
CREATE TRIGGER trigger_solicitud_notificacion
  AFTER INSERT OR UPDATE ON public.solicitudes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notificacion_solicitud();

-- Trigger: Notificación de cambios en usuario
CREATE TRIGGER trigger_usuario_notificacion
  AFTER UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notificacion_usuario();

-- Nota: Los triggers de auth, storage y realtime son gestionados internamente por Supabase
-- Trigger en auth.users: on_auth_user_created (maneja nuevos usuarios)

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- ==================== TABLA: alimentos ====================
CREATE POLICY "Enable all operations for alimentos"
  ON public.alimentos
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Permitir lectura pública de alimentos"
  ON public.alimentos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "operadores_can_read_alimentos"
  ON public.alimentos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['OPERADOR'::text, 'ADMINISTRADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: configuracion_notificaciones ====================
CREATE POLICY "Users can manage their notification settings"
  ON public.configuracion_notificaciones
  FOR ALL
  TO public
  USING (usuario_id = auth.uid());

-- ==================== TABLA: conversiones ====================
CREATE POLICY "Enable all operations for conversiones"
  ON public.conversiones
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "users_can_read_conversiones"
  ON public.conversiones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: depositos ====================
CREATE POLICY "Usuarios autenticados pueden ver depósitos"
  ON public.depositos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "depositos_delete_admin"
  ON public.depositos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "depositos_insert_admin_operador"
  ON public.depositos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "depositos_update_admin_operador"
  ON public.depositos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "operadores_can_read_depositos"
  ON public.depositos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['OPERADOR'::text, 'ADMINISTRADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: donaciones ====================
CREATE POLICY "Administradores pueden actualizar todas las donaciones"
  ON public.donaciones
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
    )
  );

CREATE POLICY "Administradores pueden eliminar todas las donaciones"
  ON public.donaciones
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
    )
  );

CREATE POLICY "Administradores pueden ver todas las donaciones"
  ON public.donaciones
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
    )
  );

CREATE POLICY "Donors can create donations."
  ON public.donaciones
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Donors can view their own donations."
  ON public.donaciones
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "operadores_can_read_donaciones"
  ON public.donaciones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'OPERADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "operadores_can_update_donaciones_estado"
  ON public.donaciones
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'OPERADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'OPERADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: inventario ====================
CREATE POLICY "Permitir lectura de inventario a usuarios autenticados"
  ON public.inventario
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "inventario_delete_admin"
  ON public.inventario
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "inventario_insert_admin_operador"
  ON public.inventario
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "inventario_select_usuarios_activos"
  ON public.inventario
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "inventario_update_admin_operador"
  ON public.inventario
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: movimiento_inventario_cabecera ====================
CREATE POLICY "movimiento_cabecera_delete"
  ON public.movimiento_inventario_cabecera
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "movimiento_cabecera_insert"
  ON public.movimiento_inventario_cabecera
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "movimiento_cabecera_select"
  ON public.movimiento_inventario_cabecera
  FOR SELECT
  TO authenticated
  USING (
    id_donante = auth.uid()
    OR id_solicitante = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "movimiento_cabecera_update"
  ON public.movimiento_inventario_cabecera
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: movimiento_inventario_detalle ====================
CREATE POLICY "movimiento_detalle_delete"
  ON public.movimiento_inventario_detalle
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "movimiento_detalle_insert"
  ON public.movimiento_inventario_detalle
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "movimiento_detalle_select"
  ON public.movimiento_inventario_detalle
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM movimiento_inventario_cabecera mic
      WHERE mic.id_movimiento = movimiento_inventario_detalle.id_movimiento
        AND (
          mic.id_donante = auth.uid()
          OR mic.id_solicitante = auth.uid()
          OR EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
              AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
              AND usuarios.estado::text = 'activo'::text
          )
        )
    )
  );

CREATE POLICY "movimiento_detalle_update"
  ON public.movimiento_inventario_detalle
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: notificaciones ====================
CREATE POLICY "Users can update their own notifications"
  ON public.notificaciones
  FOR UPDATE
  TO public
  USING (
    destinatario_id = auth.uid()
    OR rol_destinatario::text = (SELECT usuarios.rol FROM usuarios WHERE usuarios.id = auth.uid())
    OR rol_destinatario::text = 'TODOS'::text
  );

CREATE POLICY "Users can view their own notifications"
  ON public.notificaciones
  FOR SELECT
  TO public
  USING (
    destinatario_id = auth.uid()
    OR rol_destinatario::text = (SELECT usuarios.rol FROM usuarios WHERE usuarios.id = auth.uid())
    OR rol_destinatario::text = 'TODOS'::text
  );

-- ==================== TABLA: productos_donados ====================
CREATE POLICY "Permitir lectura de productos_donados a usuarios autenticados"
  ON public.productos_donados
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "productos_donados_delete_admin"
  ON public.productos_donados
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "productos_donados_insert_permitidos"
  ON public.productos_donados
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text, 'DONANTE'::text])
        AND usuarios.estado::text = 'activo'::text
    )
    AND (
      (
        id_usuario = auth.uid()
        AND EXISTS (
          SELECT 1 FROM usuarios
          WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'DONANTE'::text
        )
      )
      OR EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = auth.uid()
          AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
      )
    )
  );

CREATE POLICY "productos_donados_select_usuarios_activos"
  ON public.productos_donados
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "productos_donados_update_admin_operador"
  ON public.productos_donados
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: solicitudes ====================
CREATE POLICY "solicitudes_delete_admin"
  ON public.solicitudes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'ADMINISTRADOR'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "solicitudes_insert_admin_operador"
  ON public.solicitudes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "solicitudes_insert_solicitante"
  ON public.solicitudes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'SOLICITANTE'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "solicitudes_select_admin_operador"
  ON public.solicitudes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "solicitudes_select_own"
  ON public.solicitudes
  FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'SOLICITANTE'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "solicitudes_update_admin_operador"
  ON public.solicitudes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "solicitudes_update_own_pending"
  ON public.solicitudes
  FOR UPDATE
  TO authenticated
  USING (
    usuario_id = auth.uid()
    AND estado = 'pendiente'::text
    AND EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'SOLICITANTE'::text
        AND usuarios.estado::text = 'activo'::text
    )
  )
  WITH CHECK (
    usuario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'SOLICITANTE'::text
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: tipos_magnitud ====================
CREATE POLICY "Enable all operations for tipos_magnitud"
  ON public.tipos_magnitud
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "users_can_read_tipos_magnitud"
  ON public.tipos_magnitud
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: unidades ====================
CREATE POLICY "Enable all operations for unidades"
  ON public.unidades
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Permitir lectura pública de unidades"
  ON public.unidades
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "operadores_can_read_unidades"
  ON public.unidades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = ANY (ARRAY['OPERADOR'::text, 'ADMINISTRADOR'::text, 'DONANTE'::text, 'SOLICITANTE'::text])
        AND usuarios.estado::text = 'activo'::text
    )
  );

CREATE POLICY "users_can_read_unidades"
  ON public.unidades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.estado::text = 'activo'::text
    )
  );

-- ==================== TABLA: usuarios ====================
CREATE POLICY "usuarios_delete_policy"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (
    get_user_role() = 'ADMINISTRADOR'::text
    AND get_user_estado() = 'activo'::text
  );

CREATE POLICY "usuarios_insert_policy"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "usuarios_select_policy"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR (
      get_user_role() = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])
      AND get_user_estado() = 'activo'::text
    )
  );

CREATE POLICY "usuarios_update_policy"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR (
      get_user_role() = 'ADMINISTRADOR'::text
      AND get_user_estado() = 'activo'::text
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR (
      get_user_role() = 'ADMINISTRADOR'::text
      AND get_user_estado() = 'activo'::text
    )
  );