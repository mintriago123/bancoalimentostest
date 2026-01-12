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
import { sendNotification } from '@/modules/shared/services/notificationClient';

const logger = {
  info: (message: string, details?: unknown) => console.info(`[DonationActionService] ${message}`, details),
  warn: (message: string, details?: unknown) => console.warn(`[DonationActionService] ${message}`, details),
  error: (message: string, error?: unknown) => {
    console.error(`[DonationActionService] ${message}`, error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
      console.error('Message:', error.message);
    } else if (error && typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  }
};

const NO_ROWS_CODE = 'PGRST116';

// Cache para prevenir procesamiento simultáneo de la misma donación
const processingCache = new Map<number, Promise<ServiceResult<{ message: string; warning?: boolean }>>>();

export const createDonationActionService = (supabaseClient: SupabaseClient) => {
  const updateDonationEstado = async (
    donation: Donation,
    nuevoEstado: DonationEstado
  ): Promise<ServiceResult<{ message: string; warning?: boolean }>> => {
    // Prevenir procesamiento duplicado de la misma donación
    const cacheKey = donation.id;
    
    if (processingCache.has(cacheKey)) {
      logger.warn('⚠️ Intento de procesamiento duplicado detectado y bloqueado', { 
        donacionId: donation.id, 
        estado: nuevoEstado 
      });
      return processingCache.get(cacheKey)!;
    }
    
    const processPromise = (async () => {
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

      // NOTA: El trigger de BD (trigger_crear_producto) se encarga automáticamente
      // de agregar la donación al inventario cuando el estado cambia a "Entregada"
      // No necesitamos hacerlo manualmente aquí (esto previene duplicaciones)
      
      if (nuevoEstado === 'Entregada') {
        logger.info('✅ Donación marcada como Entregada - El trigger de BD actualizará el inventario automáticamente', { 
          donationId: donation.id, 
          estadoAnterior: donation.estado, 
          estadoNuevo: nuevoEstado 
        });
      }

      await notificarCambioEstadoDonacion(donation, nuevoEstado);

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
    } finally {
      // Limpiar cache después de 2 segundos para permitir reintentos
      setTimeout(() => processingCache.delete(cacheKey), 2000);
    }
    })();
    
    processingCache.set(cacheKey, processPromise);
    return processPromise;
  };

  const notificarCambioEstadoDonacion = async (donation: Donation, nuevoEstado: DonationEstado) => {
    try {
      const titulo = `Estado de tu donación: ${nuevoEstado}`;
      const mensaje = (() => {
        switch (nuevoEstado) {
          case 'Recogida':
            return `Tu donación de ${donation.tipo_producto} ha sido recogida por nuestro equipo.`;
          case 'Entregada':
            return `Gracias por tu aporte. La donación de ${donation.tipo_producto} ha sido entregada y registrada en el inventario.`;
          case 'Cancelada':
            return 'Tu donación fue cancelada. Si fue un error, contáctanos para coordinar nuevamente.';
          default:
            return `El estado de tu donación de ${donation.tipo_producto} ahora es ${nuevoEstado}.`;
        }
      })();

      await sendNotification({
        titulo,
        mensaje,
        categoria: 'donacion',
        tipo:
          nuevoEstado === 'Cancelada'
            ? 'warning'
            : nuevoEstado === 'Entregada'
              ? 'success'
              : 'info',
        destinatarioId: donation.user_id ?? undefined,
        urlAccion: '/donante/donaciones',
        metadatos: {
          donacionId: donation.id,
          nuevoEstado,
        },
      });
    } catch (error) {
      logger.error('Error enviando notificación de donación', error);
    }
  };

  /* =====================================================
   * FUNCIONES DESACTIVADAS - AHORA LAS MANEJA EL TRIGGER DE BD
   * =====================================================
   * El trigger "trigger_crear_producto" en la base de datos
   * se encarga automáticamente de:
   * 1. Crear/actualizar productos donados
   * 2. Actualizar el inventario
   * 3. Garantizar integridad transaccional
   * 
   * Estas funciones se mantienen comentadas por si se necesitan en el futuro
   * ===================================================== */

  /* DESACTIVADO - El trigger de BD maneja esto automáticamente  const integrateWithInventory = async (donation: Donation): Promise<DonationInventoryIntegrationResult> => {
    try {
      const startTime = Date.now();
      logger.info('🚀 Iniciando integración con inventario', { 
        donationId: donation.id, 
        tipoProducto: donation.tipo_producto,
        cantidad: donation.cantidad,
        timestamp: new Date().toISOString()
      });
      
      const productoId = await obtenerOCrearProducto(donation);
      logger.info('✅ Producto obtenido/creado', { productoId, elapsed: `${Date.now() - startTime}ms` });
      
      const depositoId = await obtenerOCrearDeposito();
      logger.info('✅ Depósito obtenido/creado', { depositoId, elapsed: `${Date.now() - startTime}ms` });
      
      await actualizarInventario(productoId, depositoId, donation);
      logger.info('✅ Inventario actualizado exitosamente', { 
        productoId, 
        depositoId, 
        cantidad: donation.cantidad,
        elapsed: `${Date.now() - startTime}ms`,
        completedAt: new Date().toISOString()
      });

      return { productoId, depositoId };
    } catch (error) {
      logger.error('Error integrando donación con inventario', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Detalle del error de integración:', { 
        errorMessage, 
        donationId: donation.id,
        tipoProducto: donation.tipo_producto,
        cantidad: donation.cantidad
      });
      return {
        error: SYSTEM_MESSAGES.integrationWarning,
        productoId: undefined,
        depositoId: undefined
      };
    }
  };

  const obtenerOCrearProducto = async (donation: Donation): Promise<number> => {
    try {
      // BÚSQUEDA MÁS ROBUSTA: Por nombre de producto y unidad_id (más confiable que símbolo)
      // Esto evita crear duplicados por diferencias en la categoría/descripción
      const { data: existingProduct, error: searchError } = await supabaseClient
        .from('productos_donados')
        .select('id_producto')
        .eq('nombre_producto', donation.tipo_producto)
        .eq('unidad_id', donation.unidad_id)
        .maybeSingle();

      if (searchError && searchError.code !== NO_ROWS_CODE) {
        logger.error('Error buscando producto existente', searchError);
        throw new Error(`Error al buscar producto: ${searchError.message}`);
      }

      if (existingProduct) {
        logger.info('Producto existente encontrado', { 
          productoId: existingProduct.id_producto,
          nombreProducto: donation.tipo_producto 
        });
        return existingProduct.id_producto;
      }

      // Buscar alimento_id en el catálogo para vincular
      let alimentoId: number | null = null;
      try {
        const { data: alimentoData } = await supabaseClient
          .from('alimentos')
          .select('id')
          .ilike('nombre', donation.tipo_producto)
          .limit(1)
          .maybeSingle();
        
        if (alimentoData) {
          alimentoId = alimentoData.id;
          logger.info('Alimento encontrado en catálogo', { 
            alimentoId,
            nombreAlimento: donation.tipo_producto 
          });
        }
      } catch (err) {
        logger.warn('No se pudo vincular con catálogo de alimentos', err);
        // Continuar sin alimento_id
      }

      // Si no existe, crear nuevo producto
      const { data: newProduct, error: insertError } = await supabaseClient
        .from('productos_donados')
        .insert({
          nombre_producto: donation.tipo_producto,
          descripcion: donation.categoria_comida,
          unidad_medida: donation.unidad_simbolo,
          unidad_id: donation.unidad_id, // ✅ Guardar el ID de la unidad para conversiones
          fecha_caducidad: donation.fecha_vencimiento ?? null,
          fecha_donacion: new Date().toISOString(),
          id_usuario: donation.user_id,
          alimento_id: alimentoId // ✅ Vincular con catálogo de alimentos
        })
        .select('id_producto')
        .single();

      if (insertError || !newProduct) {
        logger.error('Error creando nuevo producto', insertError);
        throw new Error(`Error al crear producto: ${insertError?.message || 'Producto no retornado'}`);
      }

      logger.info('Nuevo producto creado', { 
        productoId: newProduct.id_producto,
        nombreProducto: donation.tipo_producto,
        alimentoId: alimentoId || 'sin vincular'
      });
      return newProduct.id_producto;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al obtener o crear producto');
    }
  };
  */

  /* DESACTIVADO - El trigger de BD maneja esto automáticamente
  const obtenerOCrearDeposito = async (): Promise<string> => {
    try {
      const { data: depositoPrincipal, error } = await supabaseClient
        .from('depositos')
        .select('id_deposito')
        .limit(1)
        .maybeSingle();

      if (!error && depositoPrincipal) {
        return depositoPrincipal.id_deposito;
      }

      if (error && error.code !== NO_ROWS_CODE) {
        logger.error('Error buscando depósito existente', error);
        throw new Error(`Error al buscar depósito: ${error.message}`);
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
        logger.error('Error creando nuevo depósito', insertError);
        throw new Error(`Error al crear depósito: ${insertError?.message || 'Depósito no retornado'}`);
      }

      return newDeposito.id_deposito;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al obtener o crear depósito');
    }
  };

  const actualizarInventario = async (productoId: number, depositoId: string, donation: Donation) => {
    try {
      logger.info('🔍 Buscando inventario existente', { 
        productoId, 
        depositoId,
        donacionId: donation.id,
        cantidad: donation.cantidad
      });
      
      const { data: existingInventory, error: inventoryError } = await supabaseClient
        .from('inventario')
        .select('id_inventario, cantidad_disponible')
        .eq('id_producto', productoId)
        .eq('id_deposito', depositoId)
        .maybeSingle();

      if (inventoryError && inventoryError.code !== NO_ROWS_CODE) {
        logger.error('Error buscando inventario existente', inventoryError);
        throw new Error(`Error al buscar inventario: ${inventoryError.message}`);
      }

      if (existingInventory) {
        const cantidadAnterior = existingInventory.cantidad_disponible ?? 0;
        const nuevaCantidad = cantidadAnterior + donation.cantidad;
        
        logger.info('📦 Actualizando inventario existente', {
          inventarioId: existingInventory.id_inventario,
          cantidadAnterior,
          cantidadAgregar: donation.cantidad,
          nuevaCantidad,
          producto: donation.tipo_producto
        });
        
        const { error: updateError } = await supabaseClient
          .from('inventario')
          .update({
            cantidad_disponible: nuevaCantidad,
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('id_inventario', existingInventory.id_inventario);

        if (updateError) {
          logger.error('Error actualizando cantidad en inventario', updateError);
          throw new Error(`Error al actualizar inventario: ${updateError.message}`);
        }

        logger.info(SYSTEM_MESSAGES.inventoryIncrement(donation.cantidad, donation.unidad_simbolo, donation.tipo_producto));
        return;
      }
      
      logger.info('➕ Creando nuevo registro de inventario', { 
        productoId, 
        depositoId,
        cantidad: donation.cantidad,
        producto: donation.tipo_producto
      });

      const { error: insertError } = await supabaseClient
        .from('inventario')
        .insert({
          id_deposito: depositoId,
          id_producto: productoId,
          cantidad_disponible: donation.cantidad,
          fecha_actualizacion: new Date().toISOString()
        });

      if (insertError) {
        logger.error('Error creando registro de inventario', insertError);
        logger.error('Detalles del error de inserción:', {
          depositoId,
          productoId,
          cantidad: donation.cantidad,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          errorDetails: insertError.details
        });
        throw new Error(`Error al crear registro de inventario: ${insertError.message}`);
      }

      logger.info(SYSTEM_MESSAGES.inventoryCreate(donation.cantidad, donation.unidad_simbolo, donation.tipo_producto));
      logger.info('✅ Registro de inventario creado exitosamente:', {
        depositoId,
        productoId,
        cantidad: donation.cantidad,
        producto: donation.tipo_producto
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al actualizar inventario');
    }
  };
  */

  /* DESACTIVADO - El trigger de BD maneja esto automáticamente
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
  */

  return {
    updateDonationEstado
  };
};
