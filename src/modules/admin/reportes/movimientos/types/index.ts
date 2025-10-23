/**
 * @fileoverview Definiciones de tipos TypeScript para el módulo de reportes de movimientos
 * Este archivo contiene todas las interfaces, tipos y definiciones necesarias para
 * mantener la consistencia de tipos en el sistema de reportes.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

/**
 * Representa un elemento individual de movimiento de inventario
 * que puede ser tanto un ingreso como un egreso de productos
 */
export interface MovementItem {
  /** Identificador único del movimiento */
  readonly id: string;
  
  /** Fecha y hora cuando se registró el movimiento en formato ISO */
  readonly fecha_movimiento: string;
  
  /** Tipo de movimiento que determina si es entrada o salida */
  readonly tipo_movimiento: MovementType;
  
  /** Nombre del producto involucrado en el movimiento */
  readonly nombre_producto: string;
  
  /** Unidad de medida del producto (kg, unidades, litros, etc.) */
  readonly unidad_medida: string;
  
  /** Cantidad numérica del producto movido */
  readonly cantidad: number;
  
  /** Nombre del usuario responsable del movimiento */
  readonly usuario_responsable: string;
  
  /** Rol del usuario que ejecutó el movimiento */
  readonly rol_usuario: UserRole;
  
  /** Describe el origen o contexto del movimiento */
  readonly origen_movimiento: string;
  
  /** Comentarios adicionales o notas sobre el movimiento */
  readonly observaciones: string;
}

/**
 * Tipos de movimiento permitidos en el sistema
 */
export type MovementType = 'ingreso' | 'egreso';

/**
 * Roles de usuario válidos en el sistema
 */
export type UserRole = 'ADMINISTRADOR' | 'DONANTE' | 'BENEFICIARIO' | 'COORDINADOR';

/**
 * Filtros aplicables al reporte de movimientos
 * Todos los campos son opcionales para permitir consultas flexibles
 */
export interface ReportFilters {
  /** Fecha de inicio del rango a consultar (YYYY-MM-DD) */
  fecha_inicio: string;
  
  /** Fecha de fin del rango a consultar (YYYY-MM-DD) */
  fecha_fin: string;
  
  /** Filtro por tipo de movimiento específico */
  tipo_movimiento?: MovementType;
  
  /** Texto para buscar en nombres de productos */
  producto: string;
}

/**
 * Resumen estadístico completo de los movimientos analizados
 * Proporciona métricas clave para análisis ejecutivo
 */
export interface MovementSummary {
  /** Número total de registros de movimientos */
  readonly totalRecords: number;
  
  /** Cantidad de movimientos de tipo ingreso */
  readonly totalIngresosCount: number;
  
  /** Cantidad de movimientos de tipo egreso */
  readonly totalEgresosCount: number;
  
  /** Suma total de cantidades de todos los movimientos */
  readonly totalQuantity: number;
  
  /** Suma de cantidades solo de ingresos */
  readonly totalIngresosQuantity: number;
  
  /** Suma de cantidades solo de egresos */
  readonly totalEgresosQuantity: number;
  
  /** Promedio de cantidad por movimiento */
  readonly averageQuantity: number;
  
  /** Diferencia entre ingresos y egresos (por cantidad de registros) */
  readonly balanceCount: number;
  
  /** Diferencia entre ingresos y egresos (por cantidad de productos) */
  readonly balanceQuantity: number;
  
  /** Porcentaje de ingresos sobre el total */
  readonly ingresosPercentage: number;
  
  /** Porcentaje de egresos sobre el total */
  readonly egresosPercentage: number;
  
  /** Número de productos únicos en los movimientos */
  readonly uniqueProducts: number;
  
  /** Información del producto con mayor movimiento */
  readonly topProduct?: ProductSummary;
}

/**
 * Información resumida de un producto específico
 */
export interface ProductSummary {
  /** Nombre del producto */
  readonly name: string;
  
  /** Cantidad total movida de este producto */
  readonly quantity: number;
}

/**
 * Configuración de tema para exportación de reportes
 * Define colores y estilos para documentos Excel generados
 */
export interface ExportTheme {
  /** Color de fondo para títulos principales */
  readonly titleBg: string;
  
  /** Color de fuente para títulos principales */
  readonly titleFont: string;
  
  /** Color primario de acento */
  readonly accentPrimary: string;
  
  /** Color secundario de acento */
  readonly accentSecondary: string;
  
  /** Color para valores positivos/ingresos */
  readonly positive: string;
  
  /** Color para valores negativos/egresos */
  readonly negative: string;
  
  /** Color para etiquetas de metadatos */
  readonly metadataLabel: string;
  
  /** Color para valores de metadatos */
  readonly metadataValue: string;
  
  /** Color base para filas de tabla */
  readonly zebraBase: string;
  
  /** Color alternativo para filas de tabla */
  readonly zebraAlt: string;
  
  /** Color de fondo para encabezados de tabla */
  readonly tableHeaderBg: string;
  
  /** Color de fuente para encabezados de tabla */
  readonly tableHeaderFont: string;
  
  /** Color para bordes de tabla */
  readonly tableBorder: string;
  
  /** Color de fondo para valores de resumen */
  readonly summaryValueBg: string;
  
  /** Color para bordes de resumen */
  readonly summaryBorder: string;
}

/**
 * Estructura para rangos de celdas fusionadas en Excel
 */
export interface WorksheetMerge {
  /** Celda de inicio del rango */
  s: { r: number; c: number };
  
  /** Celda final del rango */
  e: { r: number; c: number };
}

/**
 * Opciones para registrar filas en hojas de cálculo
 */
export interface RowRegistrationOptions {
  /** Si la fila debe fusionarse horizontalmente */
  mergeAcross?: boolean;
  
  /** Rangos específicos para fusionar */
  merges?: Array<{ start: number; end: number }>;
}

/**
 * Estados posibles de carga de datos
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Información de estado de la aplicación
 */
export interface AppState {
  /** Estado actual de carga */
  loadingState: LoadingState;
  
  /** Mensaje de error si existe */
  errorMessage?: string;
  
  /** Timestamp de la última actualización exitosa */
  lastUpdate?: string;
}

/**
 * Estructura de datos raw de movimientos desde Supabase
 * Representa la estructura directa de la base de datos
 */
export interface RawMovementData {
  id_movimiento: string;
  fecha_movimiento: string;
  observaciones?: string;
  donante?: {
    nombre: string;
    rol: string;
  };
  solicitante?: {
    nombre: string;
    rol: string;
  };
  movimiento_inventario_detalle: Array<{
    cantidad: number;
    tipo_transaccion: 'ingreso' | 'egreso';
    rol_usuario: string;
    observacion_detalle?: string;
    productos_donados?: {
      nombre_producto: string;
      unidad_medida: string;
    };
  }>;
}

/**
 * Estructura de datos raw de donaciones legacy
 */
export interface RawLegacyDonation {
  id: string;
  creado_en: string;
  tipo_producto?: string;
  unidad_simbolo?: string;
  cantidad?: number;
  observaciones?: string;
  estado: string;
  usuarios?: {
    nombre: string;
    rol: string;
  };
}

/**
 * Estructura de datos raw de solicitudes legacy
 */
export interface RawLegacyRequest {
  id: string;
  created_at: string;
  tipo_alimento?: string;
  cantidad?: number;
  comentarios?: string;
  usuarios?: {
    nombre: string;
    rol: string;
  };
}

/**
 * Resultado de operaciones de servicio
 */
export interface ServiceResult<T> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  
  /** Datos retornados en caso de éxito */
  data?: T;
  
  /** Mensaje de error en caso de fallo */
  error?: string;
  
  /** Detalles adicionales del error */
  errorDetails?: unknown;
}