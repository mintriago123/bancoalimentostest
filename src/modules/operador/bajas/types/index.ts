/**
 * @fileoverview Tipos para el sistema de bajas de productos
 */

export type MotivoBaja = 'vencido' | 'dañado' | 'contaminado' | 'rechazado' | 'otro';
export type EstadoBaja = 'confirmada' | 'pendiente_revision' | 'revisada';
export type PrioridadAlerta = 'vencido' | 'alta' | 'media' | 'baja';

export interface BajaProducto {
  id_baja: string;
  id_producto: string;
  id_inventario: string;
  cantidad_baja: number;
  motivo_baja: MotivoBaja;
  usuario_responsable_id: string;
  fecha_baja: string;
  observaciones?: string;
  estado_baja: EstadoBaja;
  nombre_producto?: string;
  cantidad_disponible_antes?: number;
  id_deposito?: string;
  created_at: string;
  updated_at: string;
}

export interface BajaProductoDetalle extends BajaProducto {
  usuario_id: string;
  usuario_nombre: string;
  usuario_email: string;
  usuario_rol: string;
  deposito_nombre?: string;
  deposito_descripcion?: string;
  producto_descripcion?: string;
  unidad_medida?: string;
  fecha_caducidad?: string;
  unidad_nombre?: string;
  unidad_simbolo?: string;
}

export interface BajaProductoRequest {
  id_inventario: string;
  cantidad: number;
  motivo: MotivoBaja;
  observaciones?: string;
}

export interface EstadisticasBajas {
  total: {
    bajas: number;
    cantidad: number;
  };
  por_motivo: {
    vencido: { bajas: number; cantidad: number };
    dañado: { bajas: number; cantidad: number };
    contaminado: { bajas: number; cantidad: number };
    rechazado: { bajas: number; cantidad: number };
    otro: { bajas: number; cantidad: number };
  };
}

export interface AlertaVencimiento {
  id_inventario: string;
  id_producto: string;
  nombre_producto: string;
  cantidad_disponible: number;
  fecha_caducidad: string;
  dias_para_vencer: number;
  deposito: {
    id: string;
    nombre: string;
  };
  unidad_simbolo?: string;
  prioridad: PrioridadAlerta;
  estado: 'vencido' | 'proximo_vencer';
}

export interface AlertasVencimientoResponse {
  success: boolean;
  configuracion: {
    dias_umbral: number;
    solo_vencidos?: boolean;
  };
  estadisticas: {
    total: number;
    total_vencidos: number;
    total_proximos: number;
    cantidad_total_vencidos: number;
    cantidad_total_proximos: number;
    por_prioridad: {
      vencidos: number;
      alta: number;
      media: number;
      baja: number;
    };
  };
  alertas: AlertaVencimiento[];
}
