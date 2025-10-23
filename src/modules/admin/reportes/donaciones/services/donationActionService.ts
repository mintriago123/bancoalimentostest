/**
 * @fileoverview Servicio de acciones para donaciones (transiciones de estado e integración con inventario).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Donation,
  DonationEstado,
  DonationInventoryIntegrationResult,
  ServiceResult
} from '../types';
import { SYSTEM_MESSAGES } from '../constants';

const logger = {
  info: (message: string, details?: unknown) => console.info(`[DonationActionService] ${message}`, details),
  warn: (message: string, details?: unknown) => console.warn(`[DonationActionService] ${message}`, details),
  error: (message: string, error?: unknown) => console.error(`[DonationActionService] ${message}`, error)
};

const NO_ROWS_CODE = 'PGRST116';

export const createDonationActionService = (supabaseClient: SupabaseClient) => {
  const updateDonationEstado = async (
    donation: Donation,
    nuevoEstado: DonationEstado
  ): Promise<ServiceResult<{ message: string; warning?: boolean }>> => {
    try {
      const { error } = await supabaseClient
        .from('donaciones')
        .update({
          estado: nuevoEstado,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', donation.id);

      if (error) {
        logger.error('Error actualizando estado de donación', error);
        return {
          success: false,
          error: 'No fue posible actualizar el estado de la donación',
          errorDetails: error
        };
      }

      if (donation.estado === 'Recogida' && nuevoEstado === 'Entregada') {
        const integration = await integrateWithInventory(donation);
        if (integration.error) {
          return {
            success: true,
            data: {
              message: SYSTEM_MESSAGES.stateUpdateSuccess(nuevoEstado),
              warning: true
            }
          };
        }

        const movementResult = await registerDonationMovement(donation, integration.productoId!);
        if (!movementResult.success) {
          logger.warn('Estado actualizado pero el movimiento no pudo registrarse', movementResult.errorDetails);
          return {
            success: true,
            data: {
              message: SYSTEM_MESSAGES.stateUpdateSuccess(nuevoEstado),
              warning: true
            }
          };
        }

        return {
          success: true,
          data: {
            message: `${SYSTEM_MESSAGES.stateUpdateSuccess(nuevoEstado)} y agregada al inventario.`
          }
        };
      }

      return {
        success: true,
        data: {
          message: SYSTEM_MESSAGES.stateUpdateSuccess(nuevoEstado)
        }
      };
    } catch (error) {
      logger.error('Excepción al actualizar estado de donación', error);
      return {
        success: false,
        error: 'Error inesperado al actualizar la donación',
        errorDetails: error
      };
    }
  };

  const integrateWithInventory = async (donation: Donation): Promise<DonationInventoryIntegrationResult> => {
    try {
      const productoId = await obtenerOCrearProducto(donation);
      const depositoId = await obtenerOCrearDeposito();
      await actualizarInventario(productoId, depositoId, donation);

      return { productoId, depositoId };
    } catch (error) {
      logger.error('Error integrando donación con inventario', error);
      return {
        error: SYSTEM_MESSAGES.integrationWarning,
        productoId: undefined,
        depositoId: undefined
      };
    }
  };

  const obtenerOCrearProducto = async (donation: Donation): Promise<number> => {
    const { data: existingProduct, error: searchError } = await supabaseClient
      .from('productos_donados')
      .select('id_producto')
      .eq('nombre_producto', donation.tipo_producto)
      .eq('descripcion', donation.categoria_comida)
      .maybeSingle();

    if (searchError && searchError.code !== NO_ROWS_CODE) {
      throw searchError;
    }

    if (existingProduct) {
      return existingProduct.id_producto;
    }

    const { data: newProduct, error: insertError } = await supabaseClient
      .from('productos_donados')
      .insert({
        nombre_producto: donation.tipo_producto,
        descripcion: donation.categoria_comida,
        unidad_medida: donation.unidad_simbolo,
        fecha_caducidad: donation.fecha_vencimiento ?? null,
        fecha_donacion: new Date().toISOString()
      })
      .select('id_producto')
      .single();

    if (insertError || !newProduct) {
      throw insertError;
    }

    return newProduct.id_producto;
  };

  const obtenerOCrearDeposito = async (): Promise<string> => {
    const { data: depositoPrincipal, error } = await supabaseClient
      .from('depositos')
      .select('id_deposito')
      .limit(1)
      .maybeSingle();

    if (!error && depositoPrincipal) {
      return depositoPrincipal.id_deposito;
    }

    const { data: newDeposito, error: insertError } = await supabaseClient
      .from('depositos')
      .insert({
        nombre: 'Depósito Principal',
        descripcion: 'Depósito principal para donaciones'
      })
      .select('id_deposito')
      .single();

    if (insertError || !newDeposito) {
      throw insertError;
    }

    return newDeposito.id_deposito;
  };

  const actualizarInventario = async (productoId: number, depositoId: string, donation: Donation) => {
    const { data: existingInventory, error: inventoryError } = await supabaseClient
      .from('inventario')
      .select('id_inventario, cantidad_disponible')
      .eq('id_producto', productoId)
      .eq('id_deposito', depositoId)
      .maybeSingle();

    if (inventoryError && inventoryError.code !== NO_ROWS_CODE) {
      throw inventoryError;
    }

    if (existingInventory) {
      const nuevaCantidad = (existingInventory.cantidad_disponible ?? 0) + donation.cantidad;
      const { error: updateError } = await supabaseClient
        .from('inventario')
        .update({
          cantidad_disponible: nuevaCantidad,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_inventario', existingInventory.id_inventario);

      if (updateError) {
        throw updateError;
      }

      logger.info(SYSTEM_MESSAGES.inventoryIncrement(donation.cantidad, donation.unidad_simbolo, donation.tipo_producto));
      return;
    }

    const { error: insertError } = await supabaseClient
      .from('inventario')
      .insert({
        id_deposito: depositoId,
        id_producto: productoId,
        cantidad_disponible: donation.cantidad,
        fecha_actualizacion: new Date().toISOString()
      });

    if (insertError) {
      throw insertError;
    }

    logger.info(SYSTEM_MESSAGES.inventoryCreate(donation.cantidad, donation.unidad_simbolo, donation.tipo_producto));
  };

  const registerDonationMovement = async (donation: Donation, productoId: number): Promise<ServiceResult<void>> => {
    try {
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !authData?.user) {
        return {
          success: false,
          error: 'No se pudo identificar al usuario que registra la donación',
          errorDetails: authError
        };
      }

      const { data: cabecera, error: cabeceraError } = await supabaseClient
        .from('movimiento_inventario_cabecera')
        .insert({
          fecha_movimiento: new Date().toISOString(),
          id_donante: donation.user_id,
          id_solicitante: authData.user.id,
          estado_movimiento: 'donado',
          observaciones: `Donación entregada - ${donation.tipo_producto} (${donation.cantidad} ${donation.unidad_simbolo})`
        })
        .select('id_movimiento')
        .single();

      if (cabeceraError || !cabecera) {
        return {
          success: false,
          error: 'No fue posible registrar la cabecera del movimiento',
          errorDetails: cabeceraError
        };
      }

      const { error: detalleError } = await supabaseClient
        .from('movimiento_inventario_detalle')
        .insert({
          id_movimiento: cabecera.id_movimiento,
          id_producto: productoId,
          cantidad: donation.cantidad,
          tipo_transaccion: 'ingreso',
          rol_usuario: 'donante',
          observacion_detalle: `Ingreso por donación entregada - ${donation.tipo_producto}`
        });

      if (detalleError) {
        return {
          success: false,
          error: 'No fue posible registrar el detalle del movimiento',
          errorDetails: detalleError
        };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error registrando movimiento de donación', error);
      return {
        success: false,
        error: 'Error inesperado al registrar el movimiento',
        errorDetails: error
      };
    }
  };

  return {
    updateDonationEstado
  };
};
