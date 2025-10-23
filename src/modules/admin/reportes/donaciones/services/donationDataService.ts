/**
 * @fileoverview Servicio de datos para donaciones.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Donation,
  ServiceResult,
  SupabaseDonationRow,
  SupabaseAlimentoRow
} from '../types';

const logger = {
  info: (message: string, details?: unknown) => console.info(`[DonationDataService] ${message}`, details),
  error: (message: string, error?: unknown) => console.error(`[DonationDataService] ${message}`, error)
};

export const createDonationDataService = (supabaseClient: SupabaseClient) => {
  const fetchDonations = async (): Promise<ServiceResult<Donation[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('donaciones')
        .select(`
          *,
          alimento:alimento_id (
            id,
            nombre,
            categoria
          )
        `)
        .order('id', { ascending: false });

      if (error) {
        logger.error('Error consultando donaciones', error);
        return {
          success: false,
          error: 'No fue posible obtener las donaciones',
          errorDetails: error
        };
      }

      const donations = ((data ?? []) as SupabaseDonationRow[] & { alimento?: SupabaseAlimentoRow | null }[])
        .map(mapDonationRowToDomain);

      return {
        success: true,
        data: donations
      };
    } catch (error) {
      logger.error('Excepción obteniendo donaciones', error);
      return {
        success: false,
        error: 'Error inesperado al obtener donaciones',
        errorDetails: error
      };
    }
  };

  return {
    fetchDonations
  };
};

type SupabaseDonationWithAlimento = SupabaseDonationRow & {
  alimento?: SupabaseAlimentoRow | null;
};

const mapDonationRowToDomain = (row: SupabaseDonationWithAlimento): Donation => ({
  id: row.id,
  user_id: row.user_id,
  nombre_donante: row.nombre_donante,
  ruc_donante: row.ruc_donante ?? undefined,
  cedula_donante: row.cedula_donante ?? undefined,
  direccion_donante_completa: row.direccion_donante_completa ?? undefined,
  telefono: row.telefono,
  email: row.email,
  representante_donante: row.representante_donante ?? undefined,
  tipo_persona_donante: row.tipo_persona_donante,
  alimento_id: row.alimento_id ?? undefined,
  tipo_producto: row.tipo_producto,
  categoria_comida: row.categoria_comida,
  es_producto_personalizado: row.es_producto_personalizado,
  cantidad: row.cantidad,
  unidad_id: row.unidad_id,
  unidad_nombre: row.unidad_nombre,
  unidad_simbolo: row.unidad_simbolo,
  fecha_vencimiento: row.fecha_vencimiento ?? undefined,
  fecha_disponible: row.fecha_disponible,
  direccion_entrega: row.direccion_entrega,
  horario_preferido: row.horario_preferido ?? undefined,
  observaciones: row.observaciones ?? undefined,
  impacto_estimado_personas: row.impacto_estimado_personas ?? undefined,
  impacto_equivalente: row.impacto_equivalente ?? undefined,
  estado: row.estado,
  creado_en: row.creado_en,
  actualizado_en: row.actualizado_en,
  alimento: row.alimento
    ? {
        nombre: row.alimento.nombre ?? 'Producto',
        categoria: row.alimento.categoria ?? 'Sin categoría'
      }
    : null
});
