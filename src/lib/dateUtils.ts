import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// Zona horaria por defecto (Ecuador - GMT-5)
const DEFAULT_TIMEZONE = 'America/Guayaquil';

/**
 * Obtiene la zona horaria del navegador del usuario
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_TIMEZONE;
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
}

/**
 * Formatea una fecha UTC a la zona horaria del usuario
 */
export function formatDateInUserTimezone(
  date: string | Date | null | undefined,
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string {
  if (!date) return '-';
  
  try {
    let dateStr = date;
    
    // Si es string y no tiene 'Z' al final ni offset de zona horaria, añadir 'Z' para indicar UTC
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
      dateStr = dateStr + 'Z';
    }
    
    const dateObj = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    const timezone = getUserTimezone();
    
    return formatInTimeZone(dateObj, timezone, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '-';
  }
}

/**
 * Formatea una fecha en formato YYYY-MM-DD (sin zona horaria) directamente
 * Útil para fechas de inputs de tipo "date" que no tienen información de hora
 */
export function formatLocalDate(
  dateStr: string | null | undefined,
  formatStr: string = 'dd/MM/yyyy'
): string {
  if (!dateStr) return '-';
  
  try {
    // Para fechas sin hora (YYYY-MM-DD), crear la fecha en la zona horaria local
    const [year, month, day] = dateStr.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return format(localDate, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha local:', error);
    return '-';
  }
}

/**
 * Formatea una fecha de manera corta (dd/MM/yyyy)
 * Usa formatLocalDate para fechas sin hora (YYYY-MM-DD)
 */
export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  // Si es un string en formato YYYY-MM-DD (sin hora), usar formatLocalDate
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return formatLocalDate(date, 'dd/MM/yyyy');
  }
  
  // Si tiene información de hora o es un Date object, usar formatDateInUserTimezone
  return formatDateInUserTimezone(date, 'dd/MM/yyyy');
}

/**
 * Formatea una fecha con hora (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDateInUserTimezone(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Formatea una fecha de manera larga (ej: "15 de enero de 2024")
 */
export function formatLongDate(date: string | Date | null | undefined): string {
  return formatDateInUserTimezone(date, "d 'de' MMMM 'de' yyyy");
}

/**
 * Formatea la hora (HH:mm)
 */
export function formatTime(date: string | Date | null | undefined): string {
  return formatDateInUserTimezone(date, 'HH:mm');
}

/**
 * Formatea una fecha relativa (ej: "hace 2 horas")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const timezone = getUserTimezone();
    const zonedDate = toZonedTime(dateObj, timezone);
    
    return formatDistanceToNow(zonedDate, { 
      addSuffix: true, 
      locale: es 
    });
  } catch (error) {
    console.error('Error formateando fecha relativa:', error);
    return '-';
  }
}

/**
 * Convierte una fecha local a UTC (para enviar a la base de datos)
 */
export function toUTC(date: Date): string {
  return date.toISOString();
}

/**
 * Parsea una fecha ISO string a objeto Date en la zona horaria del usuario
 */
export function parseDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  
  try {
    const timezone = getUserTimezone();
    return toZonedTime(parseISO(dateString), timezone);
  } catch (error) {
    console.error('Error parseando fecha:', error);
    return new Date();
  }
}

/**
 * Formatea una fecha para inputs de tipo datetime-local
 * Retorna formato: YYYY-MM-DDTHH:mm
 */
export function formatForDateTimeInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const timezone = getUserTimezone();
    return formatInTimeZone(dateObj, timezone, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error formateando fecha para input:', error);
    return '';
  }
}

/**
 * Formatea una fecha para inputs de tipo date
 * Retorna formato: YYYY-MM-DD
 */
export function formatForDateInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const timezone = getUserTimezone();
    return formatInTimeZone(dateObj, timezone, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formateando fecha para input:', error);
    return '';
  }
}
