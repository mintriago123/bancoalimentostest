-- =====================================================
-- SCHEMA ACTUALIZADO - BANCO DE ALIMENTOS
-- =====================================================
-- Generado: 31 de diciembre de 2025
-- Incluye: Tablas, Constraints, Índices, Funciones, Triggers, RLS
-- =====================================================

-- =====================================================
-- SEQUENCES
-- =====================================================

CREATE SEQUENCE public.alimentos_id_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  CACHE 1;

CREATE SEQUENCE public.alimentos_unidades_id_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  CACHE 1;

CREATE SEQUENCE public.conversiones_id_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  CACHE 1;

CREATE SEQUENCE public.donaciones_id_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 2147483647
  CACHE 1;

CREATE SEQUENCE public.tipos_magnitud_id_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  CACHE 1;

CREATE SEQUENCE public.unidades_id_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  CACHE 1;

-- =====================================================
-- TABLAS
-- =====================================================

CREATE TABLE public.alimentos (
  id bigint DEFAULT nextval('alimentos_id_seq'::regclass) NOT NULL,
  nombre text NOT NULL,
  categoria text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alimentos_pkey PRIMARY KEY (id)
);

CREATE TABLE public.alimentos_unidades (
  id bigint DEFAULT nextval('alimentos_unidades_id_seq'::regclass) NOT NULL,
  alimento_id bigint NOT NULL,
  unidad_id bigint NOT NULL,
  es_unidad_principal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alimentos_unidades_pkey PRIMARY KEY (id)
);

CREATE TABLE public.configuracion_notificaciones (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  usuario_id uuid,
  categoria character varying(100) NOT NULL,
  email_activo boolean DEFAULT true,
  push_activo boolean DEFAULT true,
  sonido_activo boolean DEFAULT true,
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT configuracion_notificaciones_pkey PRIMARY KEY (id)
);

CREATE TABLE public.conversiones (
  id bigint DEFAULT nextval('conversiones_id_seq'::regclass) NOT NULL,
  unidad_origen_id bigint NOT NULL,
  unidad_destino_id bigint NOT NULL,
  factor_conversion numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversiones_pkey PRIMARY KEY (id)
);

CREATE TABLE public.depositos (
  id_deposito uuid DEFAULT gen_random_uuid() NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  CONSTRAINT depositos_pkey PRIMARY KEY (id_deposito)
);

CREATE TABLE public.detalles_solicitud (
  id_detalle uuid DEFAULT gen_random_uuid() NOT NULL,
  id_solicitud uuid,
  id_producto uuid,
  cantidad_solicitada numeric,
  cantidad_entregada numeric,
  fecha_respuesta timestamp with time zone,
  comentario_admin text,
  CONSTRAINT detalles_solicitud_pkey PRIMARY KEY (id_detalle)
);

CREATE TABLE public.donaciones (
  id integer DEFAULT nextval('donaciones_id_seq'::regclass) NOT NULL,
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
  es_producto_personalizado boolean DEFAULT false NOT NULL,
  cantidad numeric NOT NULL,
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
  estado text DEFAULT 'Pendiente'::text NOT NULL,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT donaciones_pkey PRIMARY KEY (id)
);

CREATE TABLE public.inventario (
  id_inventario uuid DEFAULT gen_random_uuid() NOT NULL,
  id_deposito uuid NOT NULL,
  id_producto uuid NOT NULL,
  cantidad_disponible numeric DEFAULT 0 NOT NULL,
  fecha_actualizacion timestamp without time zone DEFAULT now(),
  CONSTRAINT inventario_pkey PRIMARY KEY (id_inventario)
);

CREATE TABLE public.movimiento_inventario_cabecera (
  id_movimiento uuid DEFAULT gen_random_uuid() NOT NULL,
  fecha_movimiento timestamp without time zone DEFAULT now(),
  id_donante uuid NOT NULL,
  id_solicitante uuid NOT NULL,
  estado_movimiento text NOT NULL,
  observaciones text,
  CONSTRAINT movimiento_inventario_cabecera_pkey PRIMARY KEY (id_movimiento)
);

CREATE TABLE public.movimiento_inventario_detalle (
  id_detalle uuid DEFAULT gen_random_uuid() NOT NULL,
  id_movimiento uuid NOT NULL,
  id_producto uuid NOT NULL,
  cantidad numeric NOT NULL,
  tipo_transaccion text NOT NULL,
  rol_usuario text NOT NULL,
  observacion_detalle text,
  unidad_id bigint,
  CONSTRAINT movimiento_inventario_detalle_pkey PRIMARY KEY (id_detalle)
);

CREATE TABLE public.notificaciones (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  titulo character varying(255) NOT NULL,
  mensaje text NOT NULL,
  tipo character varying(50) DEFAULT 'info'::character varying NOT NULL,
  destinatario_id uuid,
  rol_destinatario character varying(50),
  categoria character varying(100) NOT NULL,
  leida boolean DEFAULT false,
  url_accion character varying(500),
  metadatos jsonb DEFAULT '{}'::jsonb,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_leida timestamp with time zone,
  activa boolean DEFAULT true,
  expira_en timestamp with time zone,
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id)
);

CREATE TABLE public.productos_donados (
  id_producto uuid DEFAULT gen_random_uuid() NOT NULL,
  id_usuario uuid,
  nombre_producto text,
  descripcion text,
  fecha_donacion timestamp with time zone DEFAULT now(),
  cantidad numeric,
  unidad_medida text,
  fecha_caducidad timestamp with time zone,
  alimento_id bigint,
  unidad_id bigint,
  CONSTRAINT productos_donados_pkey PRIMARY KEY (id_producto)
);

CREATE TABLE public.solicitudes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
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
  motivo_rechazo text,
  operador_rechazo_id uuid,
  fecha_rechazo timestamp with time zone,
  CONSTRAINT solicitudes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.tipos_magnitud (
  id bigint DEFAULT nextval('tipos_magnitud_id_seq'::regclass) NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tipos_magnitud_pkey PRIMARY KEY (id)
);

CREATE TABLE public.unidades (
  id bigint DEFAULT nextval('unidades_id_seq'::regclass) NOT NULL,
  nombre text NOT NULL,
  simbolo text NOT NULL,
  tipo_magnitud_id bigint NOT NULL,
  es_base boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unidades_pkey PRIMARY KEY (id)
);

CREATE TABLE public.usuarios (
  id uuid NOT NULL,
  rol text,
  tipo_persona text,
  nombre text,
  ruc text,
  cedula text,
  direccion text,
  telefono text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  representante text,
  estado character varying(20) DEFAULT 'activo'::character varying,
  email text,
  recibir_notificaciones boolean DEFAULT true,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

ALTER TABLE public.alimentos_unidades 
  ADD CONSTRAINT alimentos_unidades_alimento_id_fkey 
  FOREIGN KEY (alimento_id) REFERENCES public.alimentos(id);

ALTER TABLE public.alimentos_unidades 
  ADD CONSTRAINT alimentos_unidades_unidad_id_fkey 
  FOREIGN KEY (unidad_id) REFERENCES public.unidades(id);

ALTER TABLE public.configuracion_notificaciones 
  ADD CONSTRAINT configuracion_notificaciones_usuario_id_fkey 
  FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);

ALTER TABLE public.conversiones 
  ADD CONSTRAINT conversiones_unidad_destino_id_fkey 
  FOREIGN KEY (unidad_destino_id) REFERENCES public.unidades(id);

ALTER TABLE public.conversiones 
  ADD CONSTRAINT conversiones_unidad_origen_id_fkey 
  FOREIGN KEY (unidad_origen_id) REFERENCES public.unidades(id);

ALTER TABLE public.detalles_solicitud 
  ADD CONSTRAINT detalles_solicitud_id_producto_fkey 
  FOREIGN KEY (id_producto) REFERENCES public.productos_donados(id_producto);

ALTER TABLE public.detalles_solicitud 
  ADD CONSTRAINT detalles_solicitud_id_solicitud_fkey 
  FOREIGN KEY (id_solicitud) REFERENCES public.solicitudes(id);

ALTER TABLE public.donaciones 
  ADD CONSTRAINT donaciones_alimento_id_fkey 
  FOREIGN KEY (alimento_id) REFERENCES public.alimentos(id);

ALTER TABLE public.donaciones 
  ADD CONSTRAINT donaciones_unidad_id_fkey 
  FOREIGN KEY (unidad_id) REFERENCES public.unidades(id);

ALTER TABLE public.donaciones 
  ADD CONSTRAINT donaciones_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.usuarios(id);

ALTER TABLE public.inventario 
  ADD CONSTRAINT inventario_id_deposito_fkey 
  FOREIGN KEY (id_deposito) REFERENCES public.depositos(id_deposito);

ALTER TABLE public.inventario 
  ADD CONSTRAINT inventario_id_producto_fkey 
  FOREIGN KEY (id_producto) REFERENCES public.productos_donados(id_producto);

ALTER TABLE public.movimiento_inventario_cabecera 
  ADD CONSTRAINT movimiento_inventario_cabecera_id_donante_fkey 
  FOREIGN KEY (id_donante) REFERENCES public.usuarios(id);

ALTER TABLE public.movimiento_inventario_cabecera 
  ADD CONSTRAINT movimiento_inventario_cabecera_id_solicitante_fkey 
  FOREIGN KEY (id_solicitante) REFERENCES public.usuarios(id);

ALTER TABLE public.movimiento_inventario_detalle 
  ADD CONSTRAINT movimiento_inventario_detalle_id_movimiento_fkey 
  FOREIGN KEY (id_movimiento) REFERENCES public.movimiento_inventario_cabecera(id_movimiento);

ALTER TABLE public.movimiento_inventario_detalle 
  ADD CONSTRAINT movimiento_inventario_detalle_id_producto_fkey 
  FOREIGN KEY (id_producto) REFERENCES public.productos_donados(id_producto);

ALTER TABLE public.movimiento_inventario_detalle 
  ADD CONSTRAINT movimiento_inventario_detalle_unidad_id_fkey 
  FOREIGN KEY (unidad_id) REFERENCES public.unidades(id);

ALTER TABLE public.notificaciones 
  ADD CONSTRAINT notificaciones_destinatario_id_fkey 
  FOREIGN KEY (destinatario_id) REFERENCES public.usuarios(id);

ALTER TABLE public.productos_donados 
  ADD CONSTRAINT productos_donados_alimento_id_fkey 
  FOREIGN KEY (alimento_id) REFERENCES public.alimentos(id);

ALTER TABLE public.productos_donados 
  ADD CONSTRAINT productos_donados_id_usuario_fkey 
  FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

ALTER TABLE public.productos_donados 
  ADD CONSTRAINT productos_donados_unidad_id_fkey 
  FOREIGN KEY (unidad_id) REFERENCES public.unidades(id);

ALTER TABLE public.solicitudes 
  ADD CONSTRAINT solicitudes_unidad_id_fkey 
  FOREIGN KEY (unidad_id) REFERENCES public.unidades(id);

ALTER TABLE public.solicitudes 
  ADD CONSTRAINT solicitudes_usuario_id_fkey 
  FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);

ALTER TABLE public.unidades 
  ADD CONSTRAINT unidades_tipo_magnitud_id_fkey 
  FOREIGN KEY (tipo_magnitud_id) REFERENCES public.tipos_magnitud(id);

ALTER TABLE public.usuarios 
  ADD CONSTRAINT usuarios_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id);

-- =====================================================
-- CHECK CONSTRAINTS
-- =====================================================

ALTER TABLE public.conversiones 
  ADD CONSTRAINT conversiones_unidades_diferentes 
  CHECK (unidad_origen_id <> unidad_destino_id);

ALTER TABLE public.donaciones 
  ADD CONSTRAINT donaciones_estado_check 
  CHECK (estado = ANY (ARRAY['Pendiente'::text, 'Recogida'::text, 'Entregada'::text, 'Cancelada'::text]));

ALTER TABLE public.donaciones 
  ADD CONSTRAINT donaciones_cantidad_check 
  CHECK (cantidad > (0)::numeric);

ALTER TABLE public.movimiento_inventario_cabecera 
  ADD CONSTRAINT movimiento_inventario_cabecera_estado_movimiento_check 
  CHECK (estado_movimiento = ANY (ARRAY['pendiente'::text, 'completado'::text, 'donado'::text]));

ALTER TABLE public.movimiento_inventario_detalle 
  ADD CONSTRAINT movimiento_inventario_detalle_tipo_transaccion_check 
  CHECK (tipo_transaccion = ANY (ARRAY['ingreso'::text, 'egreso'::text, 'baja'::text]));

ALTER TABLE public.movimiento_inventario_detalle 
  ADD CONSTRAINT movimiento_inventario_detalle_rol_usuario_check 
  CHECK (rol_usuario = ANY (ARRAY['donante'::text, 'beneficiario'::text, 'distribuidor'::text]));

ALTER TABLE public.usuarios 
  ADD CONSTRAINT usuarios_estado_check 
  CHECK ((estado)::text = ANY (ARRAY[('activo'::character varying)::text, ('bloqueado'::character varying)::text, ('desactivado'::character varying)::text]));

ALTER TABLE public.usuarios 
  ADD CONSTRAINT usuarios_rol_check 
  CHECK (rol = ANY (ARRAY['ADMINISTRADOR'::text, 'DONANTE'::text, 'SOLICITANTE'::text, 'OPERADOR'::text]));

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE UNIQUE INDEX alimentos_unidades_unique ON public.alimentos_unidades USING btree (alimento_id, unidad_id);
CREATE UNIQUE INDEX configuracion_notificaciones_usuario_id_categoria_key ON public.configuracion_notificaciones USING btree (usuario_id, categoria);
CREATE UNIQUE INDEX conversiones_unicas ON public.conversiones USING btree (unidad_origen_id, unidad_destino_id);
CREATE INDEX idx_alimentos_categoria ON public.alimentos USING btree (categoria);
CREATE INDEX idx_alimentos_nombre ON public.alimentos USING btree (nombre);
CREATE INDEX idx_alimentos_unidades_alimento ON public.alimentos_unidades USING btree (alimento_id);
CREATE INDEX idx_alimentos_unidades_unidad ON public.alimentos_unidades USING btree (unidad_id);
CREATE INDEX idx_conversiones_bidireccional ON public.conversiones USING btree (unidad_origen_id, unidad_destino_id);
CREATE INDEX idx_conversiones_destino ON public.conversiones USING btree (unidad_destino_id);
CREATE INDEX idx_conversiones_origen ON public.conversiones USING btree (unidad_origen_id);
CREATE INDEX idx_detalle_movimiento ON public.movimiento_inventario_detalle USING btree (id_movimiento);
CREATE INDEX idx_detalle_producto ON public.movimiento_inventario_detalle USING btree (id_producto);
CREATE INDEX idx_detalles_id_solicitud ON public.detalles_solicitud USING btree (id_solicitud);
CREATE INDEX idx_detalles_solicitud_id_producto ON public.detalles_solicitud USING btree (id_producto);
CREATE INDEX idx_donaciones_alimento_id ON public.donaciones USING btree (alimento_id);
CREATE INDEX idx_donaciones_estado ON public.donaciones USING btree (estado);
CREATE INDEX idx_donaciones_fecha_disponible ON public.donaciones USING btree (fecha_disponible);
CREATE INDEX idx_donaciones_unidad_id ON public.donaciones USING btree (unidad_id);
CREATE INDEX idx_donaciones_user_id ON public.donaciones USING btree (user_id);
CREATE INDEX idx_inventario_id_producto ON public.inventario USING btree (id_producto);
CREATE INDEX idx_movimiento_detalle_unidad ON public.movimiento_inventario_detalle USING btree (unidad_id);
CREATE INDEX idx_movimiento_donante ON public.movimiento_inventario_cabecera USING btree (id_donante);
CREATE INDEX idx_movimiento_solicitante ON public.movimiento_inventario_cabecera USING btree (id_solicitante);
CREATE INDEX idx_notificaciones_activa ON public.notificaciones USING btree (activa);
CREATE INDEX idx_notificaciones_categoria ON public.notificaciones USING btree (categoria);
CREATE INDEX idx_notificaciones_destinatario ON public.notificaciones USING btree (destinatario_id);
CREATE INDEX idx_notificaciones_fecha_creacion ON public.notificaciones USING btree (fecha_creacion DESC);
CREATE INDEX idx_notificaciones_leida ON public.notificaciones USING btree (leida);
CREATE INDEX idx_notificaciones_rol ON public.notificaciones USING btree (rol_destinatario);
CREATE INDEX idx_productos_donados_alimento_id ON public.productos_donados USING btree (alimento_id);
CREATE INDEX idx_productos_donados_unidad ON public.productos_donados USING btree (unidad_id);
CREATE INDEX idx_productos_id_usuario ON public.productos_donados USING btree (id_usuario);
CREATE UNIQUE INDEX idx_productos_nombre_unidad ON public.productos_donados USING btree (lower(TRIM(BOTH FROM nombre_producto)), unidad_id);
CREATE INDEX idx_solicitudes_id_usuario ON public.solicitudes USING btree (usuario_id);
CREATE INDEX idx_solicitudes_unidad_id ON public.solicitudes USING btree (unidad_id);
CREATE INDEX idx_tipos_magnitud_nombre ON public.tipos_magnitud USING btree (nombre);
CREATE INDEX idx_unidades_es_base ON public.unidades USING btree (es_base) WHERE (es_base = true);
CREATE INDEX idx_unidades_nombre ON public.unidades USING btree (nombre);
CREATE INDEX idx_unidades_simbolo ON public.unidades USING btree (simbolo);
CREATE INDEX idx_unidades_tipo_magnitud ON public.unidades USING btree (tipo_magnitud_id);
CREATE INDEX idx_usuarios_estado ON public.usuarios USING btree (estado);
CREATE UNIQUE INDEX inventario_id_deposito_id_producto_key ON public.inventario USING btree (id_deposito, id_producto);
CREATE UNIQUE INDEX tipos_magnitud_nombre_key ON public.tipos_magnitud USING btree (nombre);
CREATE UNIQUE INDEX unique_cedula_idx ON public.usuarios USING btree (cedula) WHERE ((cedula IS NOT NULL) AND (cedula <> ''::text));


-- =====================================================
-- FUNCIONES - CONFIGURACIÓN DE SEARCH_PATH
-- =====================================================

ALTER FUNCTION public.cancelar_eliminacion_categoria(p_eliminacion_id uuid, p_user_id uuid) SET search_path = '';
ALTER FUNCTION public.convertir_cantidad(p_cantidad numeric, p_unidad_origen_id bigint, p_unidad_destino_id bigint) SET search_path = '';
ALTER FUNCTION public.crear_notificacion(p_titulo character varying, p_mensaje text, p_tipo character varying, p_destinatario_id uuid, p_rol_destinatario character varying, p_categoria character varying, p_url_accion character varying, p_metadatos jsonb) SET search_path = '';
ALTER FUNCTION public.crear_producto_desde_donacion() SET search_path = '';
ALTER FUNCTION public.get_user_estado() SET search_path = '';
ALTER FUNCTION public.get_user_role() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.is_admin_or_operator() SET search_path = '';
ALTER FUNCTION public.limpiar_notificaciones_antiguas() SET search_path = '';
ALTER FUNCTION public.marcar_notificacion_leida(p_notificacion_id uuid, p_usuario_id uuid) SET search_path = '';
ALTER FUNCTION public.obtener_info_producto_inventario(p_id_producto uuid) SET search_path = '';
ALTER FUNCTION public.obtener_notificaciones_no_leidas(p_usuario_id uuid, p_rol_usuario character varying) SET search_path = '';
ALTER FUNCTION public.obtener_unidades_alimento(p_alimento_id bigint) SET search_path = '';
ALTER FUNCTION public.procesar_eliminaciones_categorias_pendientes() SET search_path = '';
ALTER FUNCTION public.registrar_movimiento_con_unidad(p_id_movimiento uuid, p_id_producto uuid, p_cantidad numeric, p_tipo_transaccion text, p_unidad_id bigint, p_observacion text) SET search_path = '';
ALTER FUNCTION public.trigger_notificacion_donacion() SET search_path = '';
ALTER FUNCTION public.trigger_notificacion_solicitud() SET search_path = '';
ALTER FUNCTION public.trigger_notificacion_usuario() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.validar_producto_duplicado() SET search_path = '';
ALTER FUNCTION public.validar_tipo_magnitud_alimento() SET search_path = '';
ALTER FUNCTION public.validar_unidad_movimiento() SET search_path = '';


-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER trigger_donacion_notificacion 
  AFTER INSERT OR UPDATE ON public.donaciones 
  FOR EACH ROW 
  EXECUTE FUNCTION trigger_notificacion_donacion();

CREATE TRIGGER trigger_validar_producto_duplicado 
  BEFORE INSERT OR UPDATE ON public.productos_donados 
  FOR EACH ROW 
  EXECUTE FUNCTION validar_producto_duplicado();

CREATE TRIGGER trigger_solicitud_notificacion 
  AFTER INSERT OR UPDATE ON public.solicitudes 
  FOR EACH ROW 
  EXECUTE FUNCTION trigger_notificacion_solicitud();

CREATE TRIGGER trigger_usuario_notificacion 
  AFTER UPDATE ON public.usuarios 
  FOR EACH ROW 
  EXECUTE FUNCTION trigger_notificacion_usuario();

CREATE TRIGGER trigger_usuarios_updated_at 
  BEFORE UPDATE ON public.usuarios 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- ROW LEVEL SECURITY (RLS) - HABILITACIÓN
-- =====================================================

ALTER TABLE public.alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alimentos_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_solicitud ENABLE ROW LEVEL SECURITY;
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
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['OPERADOR'::text, 'ADMINISTRADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: alimentos_unidades ====================

CREATE POLICY "alimentos_unidades_delete_admin"
  ON public.alimentos_unidades
  FOR DELETE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "alimentos_unidades_insert_admin_operador"
  ON public.alimentos_unidades
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "alimentos_unidades_select_usuarios_activos"
  ON public.alimentos_unidades
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "alimentos_unidades_update_admin_operador"
  ON public.alimentos_unidades
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: configuracion_notificaciones ====================

CREATE POLICY "Users can manage their notification settings"
  ON public.configuracion_notificaciones
  FOR ALL
  TO public
  USING ((usuario_id = auth.uid()));

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
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.estado)::text = 'activo'::text)))));

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
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "depositos_insert_admin_operador"
  ON public.depositos
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "depositos_update_admin_operador"
  ON public.depositos
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "operadores_can_read_depositos"
  ON public.depositos
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['OPERADOR'::text, 'ADMINISTRADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: detalles_solicitud ====================

CREATE POLICY "detalles_solicitud_delete_admin"
  ON public.detalles_solicitud
  FOR DELETE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "detalles_solicitud_insert_admin_operador"
  ON public.detalles_solicitud
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "detalles_solicitud_select_admin_operador"
  ON public.detalles_solicitud
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "detalles_solicitud_select_own"
  ON public.detalles_solicitud
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM solicitudes s
  WHERE ((s.id = detalles_solicitud.id_solicitud) AND (s.usuario_id = auth.uid()) AND (EXISTS ( SELECT 1
           FROM usuarios
          WHERE ((usuarios.id = auth.uid()) AND ((usuarios.estado)::text = 'activo'::text))))))));

CREATE POLICY "detalles_solicitud_update_admin_operador"
  ON public.detalles_solicitud
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: donaciones ====================

CREATE POLICY "Administradores pueden actualizar todas las donaciones"
  ON public.donaciones
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text)))));

CREATE POLICY "Administradores pueden eliminar todas las donaciones"
  ON public.donaciones
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text)))));

CREATE POLICY "Administradores pueden ver todas las donaciones"
  ON public.donaciones
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text)))));

CREATE POLICY "Donors can create donations."
  ON public.donaciones
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Donors can view their own donations."
  ON public.donaciones
  FOR SELECT
  TO public
  USING ((auth.uid() = user_id));

CREATE POLICY "operadores_can_read_donaciones"
  ON public.donaciones
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'OPERADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "operadores_can_update_donaciones_estado"
  ON public.donaciones
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'OPERADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'OPERADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

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
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "inventario_insert_admin_operador"
  ON public.inventario
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "inventario_select_usuarios_activos"
  ON public.inventario
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "inventario_update_admin_operador"
  ON public.inventario
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: movimiento_inventario_cabecera ====================

CREATE POLICY "movimiento_cabecera_delete"
  ON public.movimiento_inventario_cabecera
  FOR DELETE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "movimiento_cabecera_insert"
  ON public.movimiento_inventario_cabecera
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "movimiento_cabecera_select"
  ON public.movimiento_inventario_cabecera
  FOR SELECT
  TO authenticated
  USING (((id_donante = auth.uid()) OR (id_solicitante = auth.uid()) OR (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text))))));

CREATE POLICY "movimiento_cabecera_update"
  ON public.movimiento_inventario_cabecera
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: movimiento_inventario_detalle ====================

CREATE POLICY "movimiento_detalle_delete"
  ON public.movimiento_inventario_detalle
  FOR DELETE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "movimiento_detalle_insert"
  ON public.movimiento_inventario_detalle
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "movimiento_detalle_select"
  ON public.movimiento_inventario_detalle
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM movimiento_inventario_cabecera mic
  WHERE ((mic.id_movimiento = movimiento_inventario_detalle.id_movimiento) AND ((mic.id_donante = auth.uid()) OR (mic.id_solicitante = auth.uid()) OR (EXISTS ( SELECT 1
           FROM usuarios
          WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))))));

CREATE POLICY "movimiento_detalle_update"
  ON public.movimiento_inventario_detalle
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: notificaciones ====================

CREATE POLICY "Users can update their own notifications"
  ON public.notificaciones
  FOR UPDATE
  TO public
  USING (((destinatario_id = auth.uid()) OR ((rol_destinatario)::text = ( SELECT usuarios.rol
   FROM usuarios
  WHERE (usuarios.id = auth.uid()))) OR ((rol_destinatario)::text = 'TODOS'::text)));

CREATE POLICY "Users can view their own notifications"
  ON public.notificaciones
  FOR SELECT
  TO public
  USING (((destinatario_id = auth.uid()) OR ((rol_destinatario)::text = ( SELECT usuarios.rol
   FROM usuarios
  WHERE (usuarios.id = auth.uid()))) OR ((rol_destinatario)::text = 'TODOS'::text)));

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
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "productos_donados_insert_permitidos"
  ON public.productos_donados
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text, 'DONANTE'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "productos_donados_select_usuarios_activos"
  ON public.productos_donados
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "productos_donados_update_admin_operador"
  ON public.productos_donados
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: solicitudes ====================

CREATE POLICY "solicitudes_delete_admin"
  ON public.solicitudes
  FOR DELETE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'ADMINISTRADOR'::text) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "solicitudes_insert_admin_operador"
  ON public.solicitudes
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "solicitudes_insert_solicitante"
  ON public.solicitudes
  FOR INSERT
  TO authenticated
  WITH CHECK (((usuario_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'SOLICITANTE'::text) AND ((usuarios.estado)::text = 'activo'::text))))));

CREATE POLICY "solicitudes_select_admin_operador"
  ON public.solicitudes
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "solicitudes_select_own"
  ON public.solicitudes
  FOR SELECT
  TO authenticated
  USING (((usuario_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'SOLICITANTE'::text) AND ((usuarios.estado)::text = 'activo'::text))))));

CREATE POLICY "solicitudes_update_admin_operador"
  ON public.solicitudes
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "solicitudes_update_own_pending"
  ON public.solicitudes
  FOR UPDATE
  TO authenticated
  USING (((usuario_id = auth.uid()) AND (estado = 'pendiente'::text) AND (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'SOLICITANTE'::text) AND ((usuarios.estado)::text = 'activo'::text))))))
  WITH CHECK (((usuario_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = 'SOLICITANTE'::text) AND ((usuarios.estado)::text = 'activo'::text))))));

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
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.estado)::text = 'activo'::text)))));

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
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.rol = ANY (ARRAY['OPERADOR'::text, 'ADMINISTRADOR'::text, 'DONANTE'::text, 'SOLICITANTE'::text])) AND ((usuarios.estado)::text = 'activo'::text)))));

CREATE POLICY "users_can_read_unidades"
  ON public.unidades
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.estado)::text = 'activo'::text)))));

-- ==================== TABLA: usuarios ====================

CREATE POLICY "usuarios_delete_policy"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (((get_user_role() = 'ADMINISTRADOR'::text) AND (get_user_estado() = 'activo'::text)));

CREATE POLICY "usuarios_insert_policy"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "usuarios_select_policy"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR ((get_user_role() = ANY (ARRAY['ADMINISTRADOR'::text, 'OPERADOR'::text])) AND (get_user_estado() = 'activo'::text))));

CREATE POLICY "usuarios_update_policy"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR ((get_user_role() = 'ADMINISTRADOR'::text) AND (get_user_estado() = 'activo'::text))))
  WITH CHECK (((id = auth.uid()) OR ((get_user_role() = 'ADMINISTRADOR'::text) AND (get_user_estado() = 'activo'::text))));

-- =====================================================
-- VISTAS
-- =====================================================

CREATE VIEW public.v_inventario_con_conversiones AS
 SELECT i.id_inventario,
    i.id_deposito,
    d.nombre AS deposito,
    pd.id_producto,
    pd.nombre_producto,
    a.id AS alimento_id,
    a.nombre AS alimento,
    a.categoria,
    i.cantidad_disponible,
    u.id AS unidad_actual_id,
    u.nombre AS unidad_actual_nombre,
    u.simbolo AS unidad_actual_simbolo,
    u.tipo_magnitud_id,
    tm.nombre AS tipo_magnitud,
    ( SELECT jsonb_agg(jsonb_build_object('unidad_id', au.unidad_id, 'nombre', u2.nombre, 'simbolo', u2.simbolo, 'es_principal', au.es_unidad_principal)) AS jsonb_agg
           FROM (alimentos_unidades au
             JOIN unidades u2 ON ((au.unidad_id = u2.id)))
          WHERE (au.alimento_id = a.id)) AS unidades_disponibles
   FROM (((((inventario i
     JOIN depositos d ON ((i.id_deposito = d.id_deposito)))
     JOIN productos_donados pd ON ((i.id_producto = pd.id_producto)))
     LEFT JOIN alimentos a ON ((pd.alimento_id = a.id)))
     LEFT JOIN unidades u ON ((pd.unidad_id = u.id)))
     LEFT JOIN tipos_magnitud tm ON ((u.tipo_magnitud_id = tm.id)));

CREATE VIEW public.v_inventario_con_unidades AS
 SELECT i.id_inventario,
    i.id_deposito,
    d.nombre AS deposito_nombre,
    i.id_producto,
    pd.nombre_producto,
    pd.alimento_id,
    a.nombre AS alimento_nombre,
    a.categoria AS alimento_categoria,
    i.cantidad_disponible,
    pd.unidad_medida AS unidad_actual,
    i.fecha_actualizacion
   FROM (((inventario i
     JOIN depositos d ON ((i.id_deposito = d.id_deposito)))
     JOIN productos_donados pd ON ((i.id_producto = pd.id_producto)))
     LEFT JOIN alimentos a ON ((pd.alimento_id = a.id)));

CREATE VIEW public.v_inventario_detallado AS
 SELECT i.id_inventario,
    i.id_deposito,
    d.nombre AS nombre_deposito,
    i.id_producto,
    pd.nombre_producto,
    pd.alimento_id,
    a.nombre AS nombre_alimento,
    a.categoria AS categoria_alimento,
    i.cantidad_disponible,
    pd.unidad_id,
    u.nombre AS unidad_nombre,
    u.simbolo AS unidad_simbolo,
    pd.unidad_medida AS unidad_medida_legacy,
    pd.fecha_caducidad,
    pd.fecha_donacion,
    i.fecha_actualizacion
   FROM ((((inventario i
     JOIN depositos d ON ((i.id_deposito = d.id_deposito)))
     JOIN productos_donados pd ON ((i.id_producto = pd.id_producto)))
     LEFT JOIN alimentos a ON ((pd.alimento_id = a.id)))
     LEFT JOIN unidades u ON ((pd.unidad_id = u.id)))
  ORDER BY i.fecha_actualizacion DESC;

CREATE VIEW public.v_movimientos_detallado AS
 SELECT mic.id_movimiento,
    mic.fecha_movimiento,
    mic.estado_movimiento,
    mic.observaciones AS observaciones_cabecera,
    mid.id_detalle,
    mid.cantidad,
    mid.tipo_transaccion,
    mid.rol_usuario,
    mid.observacion_detalle,
    mid.id_producto,
    pd.nombre_producto,
    pd.alimento_id,
    a.nombre AS nombre_alimento,
    a.categoria AS categoria_alimento,
    COALESCE(mid.unidad_id, pd.unidad_id) AS unidad_id_utilizada,
    COALESCE(u_detalle.nombre, u_producto.nombre) AS unidad_nombre,
    COALESCE(u_detalle.simbolo, u_producto.simbolo) AS unidad_simbolo,
    pd.unidad_medida AS unidad_legacy,
    udon.nombre AS nombre_donante,
    udon.rol AS rol_donante,
    usol.nombre AS nombre_solicitante,
    usol.rol AS rol_solicitante
   FROM (((((((movimiento_inventario_cabecera mic
     JOIN movimiento_inventario_detalle mid ON ((mic.id_movimiento = mid.id_movimiento)))
     JOIN productos_donados pd ON ((mid.id_producto = pd.id_producto)))
     LEFT JOIN alimentos a ON ((pd.alimento_id = a.id)))
     LEFT JOIN unidades u_detalle ON ((mid.unidad_id = u_detalle.id)))
     LEFT JOIN unidades u_producto ON ((pd.unidad_id = u_producto.id)))
     LEFT JOIN usuarios udon ON ((mic.id_donante = udon.id)))
     LEFT JOIN usuarios usol ON ((mic.id_solicitante = usol.id)))
  ORDER BY mic.fecha_movimiento DESC;

CREATE VIEW public.v_productos_duplicados AS
 SELECT lower(TRIM(BOTH FROM pd.nombre_producto)) AS nombre_normalizado,
    count(DISTINCT pd.id_producto) AS cantidad_registros,
    count(DISTINCT u.tipo_magnitud_id) AS tipos_magnitud_diferentes,
    array_agg(DISTINCT pd.id_producto) AS ids_productos,
    array_agg(DISTINCT u.nombre) AS unidades,
    array_agg(DISTINCT u.simbolo) AS simbolos,
    array_agg(DISTINCT tm.nombre) AS tipos_magnitud
   FROM ((productos_donados pd
     JOIN unidades u ON ((pd.unidad_id = u.id)))
     JOIN tipos_magnitud tm ON ((u.tipo_magnitud_id = tm.id)))
  GROUP BY (lower(TRIM(BOTH FROM pd.nombre_producto)))
 HAVING (count(DISTINCT u.tipo_magnitud_id) > 1);

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
