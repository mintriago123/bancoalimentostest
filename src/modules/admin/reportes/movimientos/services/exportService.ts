/**
 * @fileoverview Servicio especializado para exportación de reportes a Excel
 * Este servicio maneja toda la lógica compleja de generación de archivos XLSX
 * con formato profesional, incluyendo estilos, gráficos y metadatos.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import ExcelJS from 'exceljs';
import type { 
  MovementItem, 
  MovementSummary, 
  ExportTheme, 
  WorksheetMerge, 
  RowRegistrationOptions 
} from '../types';
import { 
  EXPORT_HEADERS, 
  EXPORT_COLUMN_WIDTHS, 
  EXPORT_THEME, 
  EXPORT_CONFIG, 
  EXCEL_ROW_HEIGHTS, 
  MOVEMENT_TYPE_LABELS 
} from '../constants';
import { formatDate, formatNumber, padRowToColumnCount, generateExportFilename } from '../utils/formatters';

/**
 * Logger especializado para el servicio de exportación
 */
const exportLogger = {
  info: (message: string, details?: unknown) => {
    console.info(`[ExportService] ${message}`, details);
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ExportService] ${message}`, error);
  },
  warn: (message: string, details?: unknown) => {
    console.warn(`[ExportService] ${message}`, details);
  }
};

/**
 * Información de fila de datos para aplicar estilos
 */
interface DataRowInfo {
  readonly index: number;
  readonly tipo: MovementItem['tipo_movimiento'];
}

/**
 * Clase principal del servicio de exportación de reportes
 * Encapsula toda la lógica de generación de archivos Excel profesionales
 */
export class ExportService {
  private readonly theme: ExportTheme;
  private readonly columnCount: number;

  constructor(theme: ExportTheme = EXPORT_THEME) {
    this.theme = theme;
    this.columnCount = EXPORT_HEADERS.length;
  }

  /**
   * Exporta el reporte completo de movimientos a formato Excel
   * 
   * @param data - Datos de movimientos filtrados
   * @param summary - Resumen estadístico de los datos
   * @param filterDescriptions - Descripciones de filtros aplicados
   * @param lastUpdate - Timestamp de última actualización
   * @returns Promise que resuelve cuando la exportación se completa
   */
  async exportMovementsReport(
    data: MovementItem[],
    summary: MovementSummary,
    filterDescriptions: string[],
    lastUpdate?: string
  ): Promise<void> {
    try {
      exportLogger.info('Iniciando exportación de reporte de movimientos', {
        recordCount: data.length,
        filtersCount: filterDescriptions.length
      });

      // Crear libro de trabajo con ExcelJS
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Banco de Alimentos';
      workbook.created = new Date();
      
      // Crear hoja de trabajo
      const worksheet = workbook.addWorksheet(EXPORT_CONFIG.worksheetName);

      // Construir estructura del reporte
      const workbookData = this.buildWorkbookStructure(data, summary, filterDescriptions, lastUpdate);
      
      // Agregar filas al worksheet
      workbookData.rows.forEach(row => {
        worksheet.addRow(row);
      });
      
      // Aplicar configuración de columnas y filas
      this.configureWorksheetLayout(worksheet, workbookData);
      
      // Aplicar estilos
      this.applyWorksheetStyles(worksheet, workbookData);
      
      // Generar archivo
      const filename = generateExportFilename(EXPORT_CONFIG.filePrefix, EXPORT_CONFIG.fileExtension);
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Crear blob y descargar
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      exportLogger.info('Exportación completada exitosamente', { filename });

    } catch (error) {
      exportLogger.error('Error durante la exportación', error);
      throw new Error('Error al generar el archivo de exportación');
    }
  }

  /**
   * Construye la estructura completa del libro de trabajo
   * 
   * @param data - Datos de movimientos
   * @param summary - Resumen estadístico
   * @param filterDescriptions - Descripciones de filtros
   * @param lastUpdate - Timestamp de última actualización
   * @returns Estructura del libro con filas y metadatos
   */
  private buildWorkbookStructure(
    data: MovementItem[],
    summary: MovementSummary,
    filterDescriptions: string[],
    lastUpdate?: string
  ) {
    const workbookRows: (string | number)[][] = [];
    const merges: WorksheetMerge[] = [];
    const dataRowInfo: DataRowInfo[] = [];

    const registerRow = (
      row: (string | number)[],
      options?: RowRegistrationOptions
    ): number => {
      const paddedRow = padRowToColumnCount(row, this.columnCount);
      const rowIndex = workbookRows.length;
      workbookRows.push(paddedRow);

      // Manejar fusiones de celdas
      if (options?.mergeAcross) {
        merges.push({
          s: { r: rowIndex, c: 0 },
          e: { r: rowIndex, c: this.columnCount - 1 }
        });
      }

      if (options?.merges) {
        for (const range of options.merges) {
          merges.push({
            s: { r: rowIndex, c: range.start },
            e: { r: rowIndex, c: range.end }
          });
        }
      }

      return rowIndex;
    };

    // Construir secciones del reporte
    const headerInfo = this.buildHeaderSection(registerRow);
    const summaryInfo = this.buildSummarySection(registerRow, summary);
    const metadataInfo = this.buildMetadataSection(registerRow, summary, lastUpdate);
    const filtersInfo = this.buildFiltersSection(registerRow, filterDescriptions);
    const tableInfo = this.buildTableSection(registerRow, data, dataRowInfo);
    const footerInfo = this.buildFooterSection(registerRow, summary);

    return {
      rows: workbookRows,
      merges,
      dataRowInfo,
      sections: {
        header: headerInfo,
        summary: summaryInfo,
        metadata: metadataInfo,
        filters: filtersInfo,
        table: tableInfo,
        footer: footerInfo
      }
    };
  }

  /**
   * Construye la sección de encabezado del reporte
   */
  private buildHeaderSection(registerRow: (row: (string | number)[], options?: RowRegistrationOptions) => number) {
    const titleRowIndex = registerRow(['Banco de Alimentos · Reporte de Movimientos'], {
      mergeAcross: true
    });
    
    const subtitleRowIndex = registerRow(
      ['Análisis ejecutivo del flujo de entradas y salidas de inventario'],
      { mergeAcross: true }
    );
    
    registerRow([''], { mergeAcross: true }); // Separador

    return {
      titleRowIndex,
      subtitleRowIndex
    };
  }

  /**
   * Construye la sección de resumen ejecutivo
   */
  private buildSummarySection(
    registerRow: (row: (string | number)[], options?: RowRegistrationOptions) => number,
    summary: MovementSummary
  ) {
    const kpiCardMerges = [
      { start: 0, end: 2 },
      { start: 3, end: 5 },
      { start: 6, end: 7 }
    ];

    const executiveHeaderRowIndex = registerRow(['Resumen Ejecutivo'], { mergeAcross: true });
    
    const kpiTitleRowIndex = registerRow(
      ['Movimientos Totales', '', '', 'Ingresos', '', '', 'Egresos', ''],
      { merges: kpiCardMerges }
    );
    
    const kpiValueRowIndex = registerRow(
      [
        formatNumber(summary.totalRecords),
        '',
        '',
        formatNumber(summary.totalIngresosCount),
        '',
        '',
        formatNumber(summary.totalEgresosCount),
        ''
      ],
      { merges: kpiCardMerges }
    );
    
    const kpiSupportRowIndex = registerRow(
      [
        'Total de registros',
        '',
        '',
        `${summary.ingresosPercentage.toFixed(1)}% del total`,
        '',
        '',
        `${summary.egresosPercentage.toFixed(1)}% del total`,
        ''
      ],
      { merges: kpiCardMerges }
    );

    registerRow([''], { mergeAcross: true }); // Separador

    return {
      executiveHeaderRowIndex,
      kpiTitleRowIndex,
      kpiValueRowIndex,
      kpiSupportRowIndex,
      kpiCardMerges
    };
  }

  /**
   * Construye la sección de metadatos del reporte
   */
  private buildMetadataSection(
    registerRow: (row: (string | number)[], options?: RowRegistrationOptions) => number,
    summary: MovementSummary,
    lastUpdate?: string
  ) {
    const now = new Date();
    
    const metadataHeaderRowIndex = registerRow(['Información del Reporte'], {
      mergeAcross: true
    });
    
    const metadataRowIndex = registerRow([
      'Generado el',
      formatDate(now.toISOString()),
      'Última actualización',
      lastUpdate ? formatDate(lastUpdate) : 'No disponible',
      'Registros exportados',
      formatNumber(summary.totalRecords),
      'Productos únicos',
      formatNumber(summary.uniqueProducts)
    ]);

    registerRow([''], { mergeAcross: true }); // Separador

    return {
      metadataHeaderRowIndex,
      metadataRowIndex
    };
  }

  /**
   * Construye la sección de filtros aplicados
   */
  private buildFiltersSection(
    registerRow: (row: (string | number)[], options?: RowRegistrationOptions) => number,
    filterDescriptions: string[]
  ) {
    const filtersHeaderRowIndex = filterDescriptions.length > 0
      ? registerRow(['Filtros Aplicados'], { mergeAcross: true })
      : registerRow(['Filtros Aplicados', 'Ninguno']);

    const filterDetailRowIndexes: number[] = [];

    if (filterDescriptions.length > 0) {
      for (const item of filterDescriptions) {
        filterDetailRowIndexes.push(registerRow([item], { mergeAcross: true }));
      }
    }

    registerRow([''], { mergeAcross: true }); // Separador

    return {
      filtersHeaderRowIndex,
      filterDetailRowIndexes
    };
  }

  /**
   * Construye la sección de tabla de datos
   */
  private buildTableSection(
    registerRow: (row: (string | number)[], options?: RowRegistrationOptions) => number,
    data: MovementItem[],
    dataRowInfo: DataRowInfo[]
  ) {
    const tableHeaderRowIndex = registerRow([...EXPORT_HEADERS]);

    if (data.length === 0) {
      const noDataRowIndex = registerRow(['Sin movimientos disponibles con los filtros aplicados'], {
        mergeAcross: true
      });
      
      dataRowInfo.push({
        index: noDataRowIndex,
        tipo: 'ingreso'
      });
    } else {
      for (const item of data) {
        const rowIndex = registerRow([
          formatDate(item.fecha_movimiento),
          MOVEMENT_TYPE_LABELS[item.tipo_movimiento],
          item.nombre_producto,
          item.unidad_medida,
          item.cantidad,
          `${item.usuario_responsable}\n(${item.rol_usuario})`,
          item.origen_movimiento,
          item.observaciones
        ]);
        
        dataRowInfo.push({ 
          index: rowIndex, 
          tipo: item.tipo_movimiento 
        });
      }
    }

    registerRow([''], { mergeAcross: true }); // Separador

    return {
      tableHeaderRowIndex,
      hasData: data.length > 0
    };
  }

  /**
   * Construye la sección de resumen final
   */
  private buildFooterSection(
    registerRow: (row: (string | number)[], options?: RowRegistrationOptions) => number,
    summary: MovementSummary
  ) {
    const summaryHeaderRowIndex = registerRow(['Resumen Numérico'], { mergeAcross: true });

    const totalMovimientosRow = registerRow(['Total movimientos', summary.totalRecords]);
    const totalIngresosRow = registerRow(['Total ingresos (registros)', summary.totalIngresosCount]);
    const totalEgresosRow = registerRow(['Total egresos (registros)', summary.totalEgresosCount]);
    const productosUnicosRow = registerRow(['Productos únicos', summary.uniqueProducts]);

    return {
      summaryHeaderRowIndex,
      summaryRows: [totalMovimientosRow, totalIngresosRow, totalEgresosRow, productosUnicosRow]
    };
  }

  /**
   * Configura el layout de la hoja de trabajo (columnas, filas, etc.)
   */
  private configureWorksheetLayout(worksheet: ExcelJS.Worksheet, workbookData: Record<string, unknown>) {
    // Configurar anchos de columna
    worksheet.columns = EXPORT_COLUMN_WIDTHS.map((width, index) => ({
      width: width,
      key: `col${index + 1}`
    }));

    // Configurar alturas de fila básicas
    worksheet.eachRow((row) => {
      row.height = EXCEL_ROW_HEIGHTS.default;
    });

    // Configurar fusiones de celdas
    const merges = workbookData.merges as WorksheetMerge[];
    if (merges && merges.length > 0) {
      merges.forEach(merge => {
        worksheet.mergeCells(
          merge.s.r + 1, // ExcelJS usa índices basados en 1
          merge.s.c + 1,
          merge.e.r + 1,
          merge.e.c + 1
        );
      });
    }

    exportLogger.info('Layout de hoja de trabajo configurado');
  }

  /**
   * Aplica estilos profesionales a la hoja de trabajo con ExcelJS
   */
  private applyWorksheetStyles(worksheet: ExcelJS.Worksheet, workbookData: Record<string, unknown>): void {
    exportLogger.info('Aplicando estilos al documento Excel');
    
    const sections = workbookData.sections as Record<string, { tableHeaderRowIndex?: number; [key: string]: unknown }>;
    
    // Aplicar estilos a encabezados de tabla
    if (sections?.table?.tableHeaderRowIndex !== undefined) {
      const headerRowIndex = sections.table.tableHeaderRowIndex + 1; // ExcelJS usa índices basados en 1
      const headerRow = worksheet.getRow(headerRowIndex);
      
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' },
          size: 11
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
    
    // Aplicar estilos alternados a las filas de datos
    const dataRowInfo = workbookData.dataRowInfo as DataRowInfo[];
    if (dataRowInfo && dataRowInfo.length > 0) {
      dataRowInfo.forEach((rowInfo, index) => {
        const row = worksheet.getRow(rowInfo.index + 1);
        const isEven = index % 2 === 0;
        
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEven ? 'FFF2F2F2' : 'FFFFFFFF' }
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
          };
        });
      });
    }
  }
}

/**
 * Factory function para crear instancias del servicio de exportación
 * 
 * @param theme - Tema personalizado opcional para la exportación
 * @returns Instancia configurada del servicio de exportación
 */
export const createExportService = (theme?: ExportTheme): ExportService => {
  return new ExportService(theme);
};