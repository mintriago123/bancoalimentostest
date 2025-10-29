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
CREATE TABLE public.backup_detalles_solicitud (
  id_detalle uuid,
  id_solicitud uuid,
  id_producto uuid,
  cantidad_solicitada numeric,
  cantidad_entregada numeric,
  fecha_respuesta timestamp with time zone,
  comentario_admin text
);
CREATE TABLE public.backup_donaciones (
  id integer,
  user_id uuid,
  nombre_donante text,
  ruc_donante text,
  cedula_donante text,
  direccion_donante_completa text,
  telefono text,
  email text,
  representante_donante text,
  tipo_persona_donante text,
  alimento_id integer,
  tipo_producto text,
  categoria_comida text,
  es_producto_personalizado boolean,
  cantidad numeric,
  unidad_id integer,
  unidad_nombre text,
  unidad_simbolo text,
  fecha_vencimiento date,
  fecha_disponible date,
  direccion_entrega text,
  horario_preferido text,
  observaciones text,
  impacto_estimado_personas integer,
  impacto_equivalente text,
  estado text,
  creado_en timestamp with time zone,
  actualizado_en timestamp with time zone
);
CREATE TABLE public.backup_inventario (
  id_inventario uuid,
  id_deposito uuid,
  id_producto uuid,
  cantidad_disponible numeric,
  fecha_actualizacion timestamp without time zone
);
CREATE TABLE public.backup_movimiento_inventario_cabecera (
  id_movimiento uuid,
  fecha_movimiento timestamp without time zone,
  id_donante uuid,
  id_solicitante uuid,
  estado_movimiento text,
  observaciones text
);
CREATE TABLE public.backup_movimiento_inventario_detalle (
  id_detalle uuid,
  id_movimiento uuid,
  id_producto uuid,
  cantidad numeric,
  tipo_transaccion text,
  rol_usuario text,
  observacion_detalle text
);
CREATE TABLE public.backup_productos_donados (
  id_producto uuid,
  id_usuario uuid,
  nombre_producto text,
  descripcion text,
  fecha_donacion timestamp with time zone,
  cantidad numeric,
  unidad_medida text,
  fecha_caducidad timestamp with time zone
);
CREATE TABLE public.backup_solicitudes (
  id uuid,
  usuario_id uuid,
  tipo_alimento text,
  cantidad numeric,
  comentarios text,
  latitud double precision,
  longitud double precision,
  estado text,
  created_at timestamp with time zone,
  fecha_respuesta timestamp with time zone,
  comentario_admin text,
  unidad_id bigint
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
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);