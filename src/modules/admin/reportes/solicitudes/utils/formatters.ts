/**
 * @fileoverview Utilidades de formato para solicitudes.
 */

import { formatDateTime as formatDateTimeUtil } from '@/lib/dateUtils';

export const formatDateTime = (value?: string | null) => {
  return formatDateTimeUtil(value);
};
