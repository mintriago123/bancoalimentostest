/**
 * @fileoverview Constantes y configuraciones para el sistema de reportes de movimientos
 * Este archivo centraliza todas las constantes, configuraciones de tema, etiquetas
 * y valores predeterminados utilizados en el módulo de reportes.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import type { 
  ReportFilters, 
  ExportTheme, 
  MovementType, 
  UserRole 
} from '../types';

/**
 * Encabezados para exportación de reportes Excel
 * Orden y nombres de las columnas en el archivo exportado
 */
export const EXPORT_HEADERS = [
  'Fecha',
  'Tipo',
  'Producto', 
  'Unidad',
  'Cantidad',
  'Usuario',
  'Origen',
  'Observaciones'
] as const;

/**
 * Anchos de columna para archivos Excel (en caracteres)
 * Corresponde a cada encabezado en EXPORT_HEADERS
 */
export const EXPORT_COLUMN_WIDTHS = [22, 14, 32, 12, 12, 30, 28, 48] as const;

/**
 * Configuración de tema completa para exportación de documentos
 * Define todos los colores utilizados en los reportes Excel
 */
export const EXPORT_THEME: ExportTheme = {
  // Colores principales
  titleBg: 'FF0F172A',
  titleFont: 'FFFFFFFF',
  accentPrimary: 'FF2563EB',
  accentSecondary: 'FF38BDF8',
  
  // Colores de estado
  positive: 'FF16A34A',
  negative: 'FFDC2626',
  
  // Colores de texto y metadata
  metadataLabel: 'FF1F2937',
  metadataValue: 'FF1F2937',
  
  // Colores de tabla
  zebraBase: 'FFFFFFFF',
  zebraAlt: 'FFF8FAFC',
  tableHeaderBg: 'FF111827',
  tableHeaderFont: 'FFFFFFFF',
  tableBorder: 'FFE5E7EB',
  
  // Colores de resumen
  summaryValueBg: 'FFFFFFFF',
  summaryBorder: 'FFBFDBFE'
} as const;

/**
 * Filtros iniciales por defecto para reportes
 * Estado limpio sin filtros aplicados
 */
export const INITIAL_FILTERS: ReportFilters = {
  fecha_inicio: '',
  fecha_fin: '',
  tipo_movimiento: undefined,
  producto: ''
} as const;

/**
 * Etiquetas legibles para tipos de movimiento
 * Mapeo de valores técnicos a texto amigable para el usuario
 */
export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  ingreso: 'Ingreso',
  egreso: 'Egreso'
} as const;

/**
 * Clases CSS para badges de tipos de movimiento
 * Estilos Tailwind para identificación visual rápida
 */
export const MOVEMENT_BADGE_STYLES: Record<MovementType, string> = {
  ingreso: 'bg-green-100 text-green-800 border-green-200',
  egreso: 'bg-red-100 text-red-800 border-red-200'
} as const;

/**
 * Roles de usuario válidos en el sistema
 * Lista completa de roles permitidos
 */
export const USER_ROLES: ReadonlyArray<UserRole> = [
  'ADMINISTRADOR',
  'DONANTE', 
  'BENEFICIARIO',
  'COORDINADOR'
] as const;

/**
 * Configuración de localización para formato de números y fechas
 */
export const LOCALE_CONFIG = {
  /** Configuración regional para España */
  locale: 'es-ES',
  
  /** Opciones de formato para números */
  numberFormat: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  
  /** Opciones de formato para fechas */
  dateFormat: {
    year: 'numeric' as const,
    month: '2-digit' as const,
    day: '2-digit' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const
  }
} as const;

/**
 * Configuraciones para paginación y límites de datos
 */
export const DATA_LIMITS = {
  /** Número máximo de registros por página */
  maxRecordsPerPage: 100,
  
  /** Número máximo de registros para exportación sin advertencia */
  exportWarningThreshold: 1000,
  
  /** Límite máximo absoluto de registros */
  absoluteMaxRecords: 10000
} as const;

/**
 * Mensajes de estado y errores del sistema
 */
export const SYSTEM_MESSAGES = {
  // Estados de carga
  loading: 'Cargando reporte...',
  refreshing: 'Actualizando datos...',
  exporting: 'Generando archivo Excel...',
  
  // Estados de éxito
  loadSuccess: 'Reporte cargado correctamente',
  exportSuccess: 'Reporte exportado exitosamente',
  
  // Estados de error
  loadError: 'Error al cargar el reporte',
  exportError: 'Error al exportar el reporte',
  networkError: 'Error de conexión',
  permissionError: 'Sin permisos suficientes',
  
  // Estados sin datos
  noData: 'No hay movimientos',
  noFilteredData: 'No se encontraron movimientos con los filtros aplicados',
  noFiltersActive: 'Sin filtros activos',
  
  // Validaciones
  invalidDateRange: 'El rango de fechas no es válido',
  dateRangeRequired: 'Debe especificar al menos una fecha'
} as const;

/**
 * Configuración de nombres de archivos de exportación
 */
export const EXPORT_CONFIG = {
  /** Prefijo para archivos de reporte */
  filePrefix: 'reporte_movimientos_',
  
  /** Extensión de archivo */
  fileExtension: '.xlsx',
  
  /** Nombre de la hoja de trabajo */
  worksheetName: 'Movimientos',
  
  /** Configuraciones de compresión */
  compression: true
} as const;

/**
 * Configuración de altura de filas para Excel (en puntos)
 */
export const EXCEL_ROW_HEIGHTS = {
  title: 38,
  subtitle: 24,
  kpiValue: 28,
  tableHeader: 26,
  sectionHeader: 24,
  default: 20
} as const;

/**
 * Valores por defecto para datos faltantes
 */
export const DEFAULT_VALUES = {
  unknownUser: 'Usuario desconocido',
  unknownProduct: 'Producto sin nombre',
  defaultUnit: 'unidad',
  noObservations: 'Sin observaciones',
  emptyDate: '—',
  fallbackQuantity: 0
} as const;

/**
 * Configuración de tiempo para actualizaciones automáticas
 */
export const AUTO_REFRESH_CONFIG = {
  /** Intervalo de actualización automática en milisegundos (5 minutos) */
  interval: 5 * 60 * 1000,
  
  /** Indica si la actualización automática está habilitada por defecto */
  enabled: false,
  
  /** Tiempo máximo de espera para operaciones de carga (30 segundos) */
  timeout: 30 * 1000
} as const;

/**
 * Rutas de navegación relacionadas con reportes
 */
export const NAVIGATION_ROUTES = {
  inicio: '/admin/dashboard',
  movements: '/admin/reportes/movimientos',
  donations: '/admin/reportes/donaciones',
  inventory: '/admin/reportes/inventario'
} as const;