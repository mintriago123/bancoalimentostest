export interface Donacion {
  id: number;
  user_id: string;
  nombre_donante: string;
  ruc_donante?: string;
  cedula_donante?: string;
  direccion_donante_completa?: string;
  telefono: string;
  email: string;
  representante_donante?: string;
  tipo_persona_donante?: string;
  alimento_id?: number;
  tipo_producto: string;
  categoria_comida: string;
  es_producto_personalizado: boolean;
  cantidad: number;
  unidad_id: number;
  unidad_nombre: string;
  unidad_simbolo: string;
  fecha_vencimiento?: string;
  fecha_disponible: string;
  direccion_entrega: string;
  horario_preferido?: string;
  observaciones?: string;
  impacto_estimado_personas?: number;
  impacto_equivalente?: string;
  estado: 'Pendiente' | 'Recogida' | 'Entregada' | 'Cancelada';
  creado_en: string;
  actualizado_en: string;
  codigo_comprobante?: string;
}

export interface DonacionEstadisticas {
  total: number;
  pendientes: number;
  recogidas: number;
  entregadas: number;
  canceladas: number;
  impactoTotal: number;
}

export interface DonacionFormulario {
  tipo_producto: string;
  producto_personalizado_nombre: string;
  cantidad: string;
  unidad_id: string;
  fecha_vencimiento: string;
  fecha_disponible: string;
  direccion_entrega: string;
  horario_preferido: string;
  observaciones: string;
}
