/**
 * @fileoverview Hook para acciones sobre donaciones (cambio de estado e integración).
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Donation, DonationEstado } from '../types';
import { createDonationActionService } from '../services/donationActionService';

interface UpdateResult {
  success: boolean;
  message: string;
  warning?: boolean;
}

interface UseDonationActionsResult {
  processingId?: number;
  lastError?: string;
  updateEstado: (donation: Donation, estado: DonationEstado) => Promise<UpdateResult>;
}

export const useDonationActions = (supabaseClient: SupabaseClient): UseDonationActionsResult => {
  const [processingId, setProcessingId] = useState<number | undefined>();
  const [lastError, setLastError] = useState<string | undefined>();
  const processingRef = useRef<Set<number>>(new Set());

  const service = useMemo(
    () => createDonationActionService(supabaseClient),
    [supabaseClient]
  );

  const updateEstado = useCallback(async (donation: Donation, nuevoEstado: DonationEstado) => {
    // Prevenir ejecuciones simultáneas en el lado del cliente
    if (processingRef.current.has(donation.id)) {
      console.warn('⚠️ Intento de actualización duplicada bloqueado en el cliente', { 
        donacionId: donation.id, 
        estado: nuevoEstado 
      });
      return {
        success: false,
        message: 'Ya hay una actualización en proceso para esta donación'
      };
    }
    
    processingRef.current.add(donation.id);
    setProcessingId(donation.id);
    setLastError(undefined);

    try {
      const result = await service.updateDonationEstado(donation, nuevoEstado);

      if (result.success && result.data) {
        return {
          success: true,
          message: result.data.message,
          warning: result.data.warning
        };
      }

      const message = result.error ?? 'No fue posible actualizar la donación';
      setLastError(message);
      return {
        success: false,
        message
      };
    } finally {
      processingRef.current.delete(donation.id);
      setProcessingId(undefined);
    }
  }, [service]);

  return {
    processingId,
    lastError,
    updateEstado
  };
};
