import { useState, useCallback } from 'react';
import {
  formatShortDate,
  formatDateTime,
  formatLongDate,
  formatTime,
  formatRelativeTime,
  formatDateInUserTimezone,
  getUserTimezone,
  formatForDateInput,
  formatForDateTimeInput,
} from '@/lib/dateUtils';

export function useDateFormatter() {
  const [formattedDate, setFormattedDate] = useState('');
  const timezone = getUserTimezone();

  // Función para formatear input manual de fechas (dd/mm/yyyy)
  const formatDateInput = (value: string): string => {
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 8) cleanValue = cleanValue.slice(0, 8);

    let dia = cleanValue.slice(0, 2);
    let mes = cleanValue.slice(2, 4);
    let anio = cleanValue.slice(4, 8);

    // Validar días
    if (dia) {
      let nDia = parseInt(dia, 10);
      if (nDia > 31) dia = '31';
      if (nDia < 1 && dia.length === 2) dia = '01';
    }

    // Validar meses
    if (mes) {
      let nMes = parseInt(mes, 10);
      if (nMes > 12) mes = '12';
      if (nMes < 1 && mes.length === 2) mes = '01';
    }

    let nuevaFecha = dia;
    if (mes) nuevaFecha += '/' + mes;
    if (anio) nuevaFecha += '/' + anio;

    return nuevaFecha;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setFormattedDate(formatted);
    return formatted;
  };

  const normalizeDate = (fecha: string): string => {
    return fecha.replace(/[-/]/g, '').trim().toLowerCase();
  };

  const validateDate = (inputDate: string, validDates: string[]): boolean => {
    if (!validDates.length || !inputDate) return false;
    return validDates.some((validDate) => 
      normalizeDate(inputDate) === normalizeDate(validDate)
    );
  };

  const resetDate = () => {
    setFormattedDate('');
  };

  // Nuevas funciones para formatear fechas de la base de datos
  const formatDate = useCallback((date: string | Date | null | undefined, formatStr?: string) => {
    if (formatStr) {
      return formatDateInUserTimezone(date, formatStr);
    }
    return formatShortDate(date);
  }, []);

  const formatDateTimeStr = useCallback((date: string | Date | null | undefined) => {
    return formatDateTime(date);
  }, []);

  const formatLongDateStr = useCallback((date: string | Date | null | undefined) => {
    return formatLongDate(date);
  }, []);

  const formatTimeStr = useCallback((date: string | Date | null | undefined) => {
    return formatTime(date);
  }, []);

  const formatRelative = useCallback((date: string | Date | null | undefined) => {
    return formatRelativeTime(date);
  }, []);

  const formatForInput = useCallback((date: Date | string | null | undefined) => {
    return formatForDateInput(date);
  }, []);

  const formatForDateTimeInputStr = useCallback((date: Date | string | null | undefined) => {
    return formatForDateTimeInput(date);
  }, []);

  return {
    // Funciones originales para inputs manuales
    formattedDate,
    formatDateInput,
    handleDateChange,
    validateDate,
    normalizeDate,
    resetDate,
    
    // Nuevas funciones para formatear fechas de la BD
    formatDate,
    formatDateTime: formatDateTimeStr,
    formatLongDate: formatLongDateStr,
    formatTime: formatTimeStr,
    formatRelativeTime: formatRelative,
    formatForInput,
    formatForDateTimeInput: formatForDateTimeInputStr,
    timezone,
  };
}
