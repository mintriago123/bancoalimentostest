/**
 * @fileoverview Hook para acciones de inventario (ajustes manuales).
 */

import { useCallback, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createInventoryActionService } from '../services/inventoryActionService';
import type { InventarioItem } from '../types';
import { SYSTEM_MESSAGES } from '../constants';

interface UpdateResult {
  success: boolean;
  message: string;
}

interface UseInventoryActionsResult {
  processingId?: string;
  lastError?: string;
  updateCantidad: (item: InventarioItem, nuevaCantidad: number) => Promise<UpdateResult>;
}

export const useInventoryActions = (supabaseClient: SupabaseClient): UseInventoryActionsResult => {
  const [processingId, setProcessingId] = useState<string | undefined>();
  const [lastError, setLastError] = useState<string | undefined>();

  const service = useMemo(
    () => createInventoryActionService(supabaseClient),
    [supabaseClient]
  );

  const updateCantidad = useCallback(async (item: InventarioItem, nuevaCantidad: number) => {
    setProcessingId(item.id_inventario);
    setLastError(undefined);

    try {
      const result = await service.updateCantidad(item, nuevaCantidad);

      if (result.success && result.data) {
        return {
          success: true,
          message: result.data.message
        };
      }

      const message = result.error ?? SYSTEM_MESSAGES.loadError;
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
    updateCantidad
  };
};
