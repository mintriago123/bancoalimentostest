/**
 * @fileoverview Servicio especializado para acceso a datos de movimientos
 * Este servicio maneja toda la lógica de acceso a la base de datos, mapeo de datos
 * y transformaciones necesarias para el sistema de reportes de movimientos.
 * 
 * @author Sistema de Banco de Alimentos
 * @version 1.0.0
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  MovementItem, 
  ServiceResult 
} from '../types';
import { DEFAULT_VALUES } from '../constants';

/**
 * Logger personalizado para el servicio de datos
 */
const logger = {
  error: (message: string, error?: unknown) => {
    console.error(`[MovementDataService] ${message}`, error);
  },
  warn: (message: string, details?: unknown) => {
    console.warn(`[MovementDataService] ${message}`, details);
  },
  info: (message: string, details?: unknown) => {
    console.info(`[MovementDataService] ${message}`, details);
  }
};

/**
 * Clase de servicio principal para manejo de datos de movimientos
 * Encapsula toda la lógica de acceso a datos y proporciona una interfaz limpia
 * para consumir información de movimientos desde múltiples fuentes
 */
export class MovementDataService {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  /**
   * Obtiene el conjunto completo de movimientos desde todas las fuentes disponibles
   * Combina datos del sistema actual y sistemas legacy
   * 
   * @returns Promise con el resultado de la operación incluyendo todos los movimientos
   */
  async getAllMovements(): Promise<ServiceResult<MovementItem[]>> {
    try {
      logger.info('Iniciando carga completa de movimientos');
      
      const movements: MovementItem[] = [];
      const seenIds = new Set<string>();

      // Función helper para agregar movimientos evitando duplicados
      const addMovements = (items: MovementItem[]) => {
        for (const item of items) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            movements.push(item);
          }
        }
      };

      // Cargar movimientos del sistema actual
      const currentMovements = await this.loadCurrentMovements();
      if (currentMovements.success && currentMovements.data) {
        addMovements(currentMovements.data);
        logger.info(`Cargados ${currentMovements.data.length} movimientos actuales`);
      }

      // Cargar donaciones legacy
      const legacyDonations = await this.loadLegacyDonations();
      if (legacyDonations.success && legacyDonations.data) {
        addMovements(legacyDonations.data);
        logger.info(`Cargadas ${legacyDonations.data.length} donaciones legacy`);
      }

      // Cargar solicitudes legacy
      const legacyRequests = await this.loadLegacyRequests();
      if (legacyRequests.success && legacyRequests.data) {
        addMovements(legacyRequests.data);
        logger.info(`Cargadas ${legacyRequests.data.length} solicitudes legacy`);
      }

      // Ordenar por fecha descendente
      movements.sort((a, b) => 
        new Date(b.fecha_movimiento).getTime() - new Date(a.fecha_movimiento).getTime()
      );

      logger.info(`Carga completa finalizada: ${movements.length} movimientos totales`);

      return {
        success: true,
        data: movements
      };

    } catch (error) {
      logger.error('Error en carga completa de movimientos', error);
      return {
        success: false,
        error: 'Error al cargar los datos de movimientos',
        errorDetails: error
      };
    }
  }

  /**
   * Carga movimientos del sistema actual (movimiento_inventario_cabecera)
   * 
   * @returns Promise con movimientos del sistema actual
   */
  private async loadCurrentMovements(): Promise<ServiceResult<MovementItem[]>> {
    try {
      const { data: registros, error } = await this.supabaseClient
        .from('movimiento_inventario_cabecera')
        .select(`
          id_movimiento,
          fecha_movimiento,
          observaciones,
          donante:usuarios!id_donante(nombre, rol),
          solicitante:usuarios!id_solicitante(nombre, rol),
          movimiento_inventario_detalle!inner(
            cantidad,
            tipo_transaccion,
            rol_usuario,
            observacion_detalle,
            productos_donados!inner(
              nombre_producto,
              unidad_medida
            )
          )
        `)
        .order('fecha_movimiento', { ascending: false });

      if (error) {
        logger.error('Error en consulta de movimientos actuales', error);
        return {
          success: false,
          error: 'Error al consultar movimientos registrados',
          errorDetails: error
        };
      }

      if (!registros || registros.length === 0) {
        logger.info('No se encontraron movimientos actuales');
        return {
          success: true,
          data: []
        };
      }

      const movements = this.mapCurrentMovements(registros);
      return {
        success: true,
        data: movements
      };

    } catch (error) {
      logger.error('Error inesperado cargando movimientos actuales', error);
      return {
        success: false,
        error: 'Error inesperado al cargar movimientos',
        errorDetails: error
      };
    }
  }

  /**
   * Carga donaciones del sistema legacy
   * 
   * @returns Promise con donaciones legacy transformadas
   */
  private async loadLegacyDonations(): Promise<ServiceResult<MovementItem[]>> {
    try {
      const { data: donaciones, error } = await this.supabaseClient
        .from('donaciones')
        .select(`
          id,
          creado_en,
          tipo_producto,
          unidad_simbolo,
          cantidad,
          observaciones,
          estado,
          usuarios:user_id(nombre, rol)
        `)
        .eq('estado', 'Entregada')
        .order('creado_en', { ascending: false });

      if (error) {
        logger.error('Error en consulta de donaciones legacy', error);
        return {
          success: false,
          error: 'Error al consultar donaciones legacy',
          errorDetails: error
        };
      }

      if (!donaciones || donaciones.length === 0) {
        logger.info('No se encontraron donaciones legacy');
        return {
          success: true,
          data: []
        };
      }

      const movements = this.mapLegacyDonations(donaciones);
      return {
        success: true,
        data: movements
      };

    } catch (error) {
      logger.error('Error inesperado cargando donaciones legacy', error);
      return {
        success: false,
        error: 'Error inesperado al cargar donaciones legacy',
        errorDetails: error
      };
    }
  }

  /**
   * Carga solicitudes del sistema legacy
   * 
   * @returns Promise con solicitudes legacy transformadas
   */
  private async loadLegacyRequests(): Promise<ServiceResult<MovementItem[]>> {
    try {
      const { data: solicitudes, error } = await this.supabaseClient
        .from('solicitudes')
        .select(`
          id,
          created_at,
          tipo_alimento,
          cantidad,
          comentarios,
          usuarios:usuario_id(nombre, rol)
        `)
        .eq('estado', 'aprobada')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error en consulta de solicitudes legacy', error);
        return {
          success: false,
          error: 'Error al consultar solicitudes legacy',
          errorDetails: error
        };
      }

      if (!solicitudes || solicitudes.length === 0) {
        logger.info('No se encontraron solicitudes legacy');
        return {
          success: true,
          data: []
        };
      }

      const movements = this.mapLegacyRequests(solicitudes);
      return {
        success: true,
        data: movements
      };

    } catch (error) {
      logger.error('Error inesperado cargando solicitudes legacy', error);
      return {
        success: false,
        error: 'Error inesperado al cargar solicitudes legacy',
        errorDetails: error
      };
    }
  }

  /**
   * Mapea datos de movimientos actuales a la estructura estándar
   * 
   * @param records - Registros raw de la base de datos
   * @returns Array de MovementItem normalizados
   */
  private mapCurrentMovements(records: Record<string, unknown>[]): MovementItem[] {
    return records.flatMap((movimiento: Record<string, unknown>) => {
      const detalles = (movimiento.movimiento_inventario_detalle as Record<string, unknown>[]) || [];
      
      return detalles.map((detalle: Record<string, unknown>, index: number) => {
        const esIngreso = detalle.tipo_transaccion === 'ingreso';
        
        // Determinar usuario responsable basado en tipo de transacción
        const donante = movimiento.donante as { nombre?: string; rol?: string } | null;
        const solicitante = movimiento.solicitante as { nombre?: string; rol?: string } | null;
        
        const usuarioResponsable = esIngreso
          ? donante?.nombre || DEFAULT_VALUES.unknownUser
          : solicitante?.nombre || DEFAULT_VALUES.unknownUser;
          
        const rolUsuario = esIngreso
          ? donante?.rol || 'DONANTE'
          : solicitante?.rol || 'BENEFICIARIO';

        // Validar y limpiar datos
        const cantidad = this.validateQuantity(detalle.cantidad);
        const fechaMovimiento = this.validateDate(movimiento.fecha_movimiento);
        
        const productoDonado = detalle.productos_donados as { 
          nombre_producto?: string; 
          unidad_medida?: string; 
        } | null;

        return {
          id: `current-${movimiento.id_movimiento}-${index}`,
          fecha_movimiento: fechaMovimiento,
          tipo_movimiento: detalle.tipo_transaccion === 'ingreso' ? 'ingreso' : 'egreso',
          nombre_producto: productoDonado?.nombre_producto || DEFAULT_VALUES.unknownProduct,
          unidad_medida: productoDonado?.unidad_medida || DEFAULT_VALUES.defaultUnit,
          cantidad,
          usuario_responsable: usuarioResponsable,
          rol_usuario: rolUsuario,
          origen_movimiento: esIngreso ? 'Donación Registrada' : 'Solicitud Aprobada',
          observaciones: (detalle.observacion_detalle as string) || 
                        (movimiento.observaciones as string) || 
                        DEFAULT_VALUES.noObservations
        } as MovementItem;
      });
    });
  }

  /**
   * Mapea donaciones legacy a la estructura estándar
   * 
   * @param records - Registros raw de donaciones legacy
   * @returns Array de MovementItem normalizados
   */
  private mapLegacyDonations(records: Record<string, unknown>[]): MovementItem[] {
    return records.map((donacion: Record<string, unknown>) => {
      const cantidad = this.validateQuantity(donacion.cantidad);
      const fechaMovimiento = this.validateDate(donacion.creado_en);
      
      const usuario = donacion.usuarios as { nombre?: string; rol?: string } | null;

      return {
        id: `legacy-donation-${donacion.id}`,
        fecha_movimiento: fechaMovimiento,
        tipo_movimiento: 'ingreso',
        nombre_producto: (donacion.tipo_producto as string) || DEFAULT_VALUES.unknownProduct,
        unidad_medida: (donacion.unidad_simbolo as string) || DEFAULT_VALUES.defaultUnit,
        cantidad,
        usuario_responsable: usuario?.nombre || DEFAULT_VALUES.unknownUser,
        rol_usuario: usuario?.rol || 'DONANTE',
        origen_movimiento: 'Donación (Sistema Legacy)',
        observaciones: (donacion.observaciones as string) || 
                      `Donación legacy - Estado: ${donacion.estado}`
      } as MovementItem;
    });
  }

  /**
   * Mapea solicitudes legacy a la estructura estándar
   * 
   * @param records - Registros raw de solicitudes legacy
   * @returns Array de MovementItem normalizados
   */
  private mapLegacyRequests(records: Record<string, unknown>[]): MovementItem[] {
    return records.map((solicitud: Record<string, unknown>) => {
      const cantidad = this.validateQuantity(solicitud.cantidad);
      const fechaMovimiento = this.validateDate(solicitud.created_at);
      
      const usuario = solicitud.usuarios as { nombre?: string; rol?: string } | null;

      return {
        id: `legacy-request-${solicitud.id}`,
        fecha_movimiento: fechaMovimiento,
        tipo_movimiento: 'egreso',
        nombre_producto: (solicitud.tipo_alimento as string) || DEFAULT_VALUES.unknownProduct,
        unidad_medida: DEFAULT_VALUES.defaultUnit,
        cantidad,
        usuario_responsable: usuario?.nombre || DEFAULT_VALUES.unknownUser,
        rol_usuario: usuario?.rol || 'BENEFICIARIO',
        origen_movimiento: 'Solicitud Aprobada (Sistema Legacy)',
        observaciones: (solicitud.comentarios as string) || 'Entrega de solicitud aprobada (legacy)'
      } as MovementItem;
    });
  }

  /**
   * Valida y normaliza cantidades numéricas
   * 
   * @param cantidad - Cantidad a validar
   * @returns Cantidad válida o valor por defecto
   */
  private validateQuantity(cantidad: unknown): number {
    if (typeof cantidad === 'number' && !Number.isNaN(cantidad) && cantidad >= 0) {
      return cantidad;
    }
    
    if (typeof cantidad === 'string') {
      const parsed = Number.parseFloat(cantidad);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }

    logger.warn('Cantidad inválida detectada, usando valor por defecto', { cantidad });
    return DEFAULT_VALUES.fallbackQuantity;
  }

  /**
   * Valida y normaliza fechas
   * 
   * @param fecha - Fecha a validar
   * @returns Fecha válida en formato ISO o fecha actual
   */
  private validateDate(fecha: unknown): string {
    if (typeof fecha === 'string' && fecha.trim()) {
      const date = new Date(fecha);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    logger.warn('Fecha inválida detectada, usando fecha actual', { fecha });
    return new Date().toISOString();
  }
}

/**
 * Factory function para crear instancias del servicio de datos
 * 
 * @param supabaseClient - Cliente de Supabase configurado
 * @returns Instancia del servicio de datos de movimientos
 */
export const createMovementDataService = (supabaseClient: SupabaseClient): MovementDataService => {
  return new MovementDataService(supabaseClient);
};