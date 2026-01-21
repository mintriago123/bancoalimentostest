/**
 * @fileoverview Tipos para el sistema de comprobantes electrónicos
 */

export interface DatosUsuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  documento?: string;
}

export interface DatosPedido {
  id: string;
  tipo: 'solicitud' | 'donacion';
  tipoAlimento: string;
  cantidad: number;
  unidad: string;
  estado: string;
  fechaCreacion: string;
  fechaAprobacion?: string;
  comentarioAdmin?: string;
}

export interface DatosComprobante {
  codigoComprobante: string;
  fechaEmision: string;
  fechaVencimiento: string;
  usuario: DatosUsuario;
  pedido: DatosPedido;
  descripcionProyecto: string;
  instrucciones: string[];
  firmaEntrega?: string;
  firmaRecepcion?: string;
}

export interface QRPayload {
  c: string; // código comprobante
  t: 'S' | 'D'; // tipo: Solicitud o Donación
  u: string; // usuario id
  p: string; // pedido id
  f: string; // fecha emisión (timestamp)
  v: string; // checksum para validación
}
