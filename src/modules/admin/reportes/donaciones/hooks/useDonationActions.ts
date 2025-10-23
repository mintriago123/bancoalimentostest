/**
 * @fileoverview Hook para acciones sobre donaciones (cambio de estado e integración).
 */

import { useCallback, useMemo, useState } from 'react';
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

  const service = useMemo(
    () => createDonationActionService(supabaseClient),
    [supabaseClient]
  );

  const updateEstado = useCallback(async (donation: Donation, nuevoEstado: DonationEstado) => {
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
      setProcessingId(undefined);
    }
  }, [service]);

  return {
    processingId,
    lastError,
    updateEstado
  };
};
