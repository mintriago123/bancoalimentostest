/**
 * @fileoverview Servicio para acciones y ajustes manuales de inventario.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { InventarioItem, ServiceResult } from '../types';
import { createInventoryDataService } from './inventoryDataService';

const logger = {
  info: (message: string, details?: unknown) => console.info(`[InventoryActionService] ${message}`, details),
  warn: (message: string, details?: unknown) => console.warn(`[InventoryActionService] ${message}`, details),
  error: (message: string, error?: unknown) => console.error(`[InventoryActionService] ${message}`, error)
};

export const createInventoryActionService = (supabaseClient: SupabaseClient) => {
  const dataService = createInventoryDataService(supabaseClient);

  const updateCantidad = async (
    item: InventarioItem,
    nuevaCantidad: number
  ): Promise<ServiceResult<{ message: string }>> => {
    if (nuevaCantidad < 0) {
      return {
        success: false,
        error: 'La cantidad no puede ser negativa'
      };
    }

    const diferencia = nuevaCantidad - item.cantidad_disponible;
    if (diferencia === 0) {
      return {
        success: true,
        data: { message: 'No se realizaron cambios en la cantidad' }
      };
    }

    try {
      const { error } = await supabaseClient
        .from('inventario')
        .update({
          cantidad_disponible: nuevaCantidad,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_inventario', item.id_inventario);

      if (error) {
        logger.error('Error actualizando inventario', error);
        return {
          success: false,
          error: 'No se pudo actualizar el inventario',
          errorDetails: error
        };
      }

      const movimientoResult = await registrarMovimientoAjuste(item, diferencia, nuevaCantidad);
      if (!movimientoResult.success) {
        const { error: rollbackError } = await supabaseClient
          .from('inventario')
          .update({
            cantidad_disponible: item.cantidad_disponible,
            fecha_actualizacion: item.fecha_actualizacion ?? null
          })
          .eq('id_inventario', item.id_inventario);

        if (rollbackError) {
          logger.error('Error revirtiendo inventario tras falla en movimiento', rollbackError);
          return {
            success: false,
            error: `${movimientoResult.error}. Además, no se pudo revertir el ajuste. Verifica el inventario manualmente.`,
            errorDetails: movimientoResult.errorDetails ?? rollbackError
          };
        }

        return {
          success: false,
          error: `${movimientoResult.error}. Los cambios en inventario fueron revertidos.`,
          errorDetails: movimientoResult.errorDetails
        };
      }

      return {
        success: true,
        data: {
          message: diferencia > 0
            ? `Inventario incrementado en ${diferencia} unidades.`
            : `Inventario reducido en ${Math.abs(diferencia)} unidades.`
        }
      };
    } catch (error) {
      logger.error('Excepción al actualizar inventario', error);
      return {
        success: false,
        error: 'Error inesperado al actualizar inventario',
        errorDetails: error
      };
    }
  };

  const registrarMovimientoAjuste = async (
    item: InventarioItem,
    diferencia: number,
    cantidadPosterior: number
  ): Promise<ServiceResult<void>> => {
    try {
      const { data: auth, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !auth?.user) {
        logger.warn('No se pudo obtener el usuario autenticado para registrar movimiento', authError);
        return {
          success: false,
          error: 'No se pudo identificar al usuario que realiza el ajuste'
        };
      }

      const { data: cabecera, error: cabeceraError } = await supabaseClient
        .from('movimiento_inventario_cabecera')
        .insert({
          fecha_movimiento: new Date().toISOString(),
          id_donante: auth.user.id,
          id_solicitante: auth.user.id,
          estado_movimiento: 'completado',
          observaciones: `Ajuste manual de inventario - ${item.producto.nombre_producto} (${diferencia > 0 ? '+' : ''}${diferencia} unidades, nuevo stock: ${cantidadPosterior})`
        })
        .select('id_movimiento')
        .single();

      if (cabeceraError || !cabecera) {
        logger.error('Error creando cabecera para movimiento de ajuste', cabeceraError);
        return {
          success: false,
          error: 'El ajuste no pudo registrarse en el historial (cabecera)',
          errorDetails: cabeceraError
        };
      }

      const tipoTransaccion = diferencia > 0 ? 'ingreso' : 'egreso';
      const cantidad = Math.abs(diferencia);

      const { error: detalleError } = await supabaseClient
        .from('movimiento_inventario_detalle')
        .insert({
          id_movimiento: cabecera.id_movimiento,
          id_producto: item.id_producto,
          cantidad,
          tipo_transaccion: tipoTransaccion,
          rol_usuario: 'distribuidor',
          observacion_detalle: `Ajuste manual de inventario - ${tipoTransaccion === 'ingreso' ? 'Incremento' : 'Reducción'} de ${cantidad} unidades`
        });

      if (detalleError) {
        logger.error('Error creando detalle para movimiento de ajuste', detalleError);
        return {
          success: false,
          error: 'El ajuste no pudo registrarse en el historial (detalle)',
          errorDetails: detalleError
        };
      }

      logger.info('Movimiento de ajuste registrado', { item: item.id_inventario, diferencia });
      return { success: true };
    } catch (error) {
      logger.error('Error registrando movimiento de ajuste', error);
      return {
        success: false,
        error: 'Error inesperado al registrar el movimiento de ajuste',
        errorDetails: error
      };
    }
  };

  return {
    ...dataService,
    updateCantidad
  };
};
