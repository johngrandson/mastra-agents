/**
 * Date and time utility functions
 */

/**
 * Brazilian timezone constants
 */
export const TIMEZONES = {
  BRASILIA: 'America/Sao_Paulo',
  MANAUS: 'America/Manaus',
  FORTALEZA: 'America/Fortaleza',
  RECIFE: 'America/Recife',
  BELEM: 'America/Belem',
} as const;

/**
 * Days of week in Portuguese
 */
const DAYS_OF_WEEK_PT = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
} as const;

/**
 * Get current date and time in a specific timezone
 * @param timezone - IANA timezone string (e.g., "America/Fortaleza")
 * @returns Current date/time info
 */
export function getCurrentDateTime(timezone: string = TIMEZONES.BRASILIA) {
  const now = new Date();

  // Format date and time using Intl API
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateParts = dateFormatter.formatToParts(now);
  const timeParts = timeFormatter.formatToParts(now);

  const day = dateParts.find(p => p.type === 'day')?.value || '';
  const month = dateParts.find(p => p.type === 'month')?.value || '';
  const year = dateParts.find(p => p.type === 'year')?.value || '';

  const hour = timeParts.find(p => p.type === 'hour')?.value || '';
  const minute = timeParts.find(p => p.type === 'minute')?.value || '';

  const isoDate = `${year}-${month}-${day}`;
  const isoTime = `${hour}:${minute}:00`;

  // Get day of week
  const dayOfWeek = now.toLocaleDateString('pt-BR', {
    timeZone: timezone,
    weekday: 'long',
  });

  return {
    date: `${day}/${month}/${year}`,
    time: `${hour}:${minute}`,
    isoDate,
    isoTime,
    isoDateTime: `${isoDate}T${isoTime}`,
    dayOfWeek,
    timezone,
  };
}

/**
 * Get day of week in Portuguese
 * @param date - Date string in YYYY-MM-DD format
 * @returns Day of week in Portuguese (e.g., "Segunda-feira")
 */
export function getDayOfWeek(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayIndex = dateObj.getDay() as keyof typeof DAYS_OF_WEEK_PT;
  return DAYS_OF_WEEK_PT[dayIndex];
}

/**
 * Check if a date is a business day (Monday-Friday)
 * @param date - Date string in YYYY-MM-DD format
 * @returns true if Monday-Friday, false otherwise
 */
export function isBusinessDay(date: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // 1 = Monday, 5 = Friday
}

/**
 * Extract date part (YYYY-MM-DD) from ISO datetime string
 * @param dateTime - ISO datetime string (e.g., "2024-03-15T09:00:00" or "2024-03-15")
 * @returns Date part only (e.g., "2024-03-15")
 */
export function extractDate(dateTime: string): string {
  return dateTime.split('T')[0];
}

/**
 * Extract time part (HH:mm) from ISO datetime string
 * @param dateTime - ISO datetime string (e.g., "2024-03-15T09:00:00")
 * @returns Time part in HH:mm format (e.g., "09:00")
 */
export function extractTime(dateTime: string): string {
  const timePart = dateTime.split('T')[1];
  if (!timePart) {
    throw new Error(`Invalid datetime format: ${dateTime}. Expected format: YYYY-MM-DDTHH:mm:ss`);
  }
  return timePart.substring(0, 5);
}

/**
 * Combine date and time into ISO datetime string
 * @param date - Date in YYYY-MM-DD format
 * @param time - Time in HH:mm format
 * @returns ISO datetime string (e.g., "2024-03-15T09:00:00")
 */
export function combineDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/**
 * Format ISO datetime to Brazilian format
 * @param dateTime - ISO datetime string
 * @returns Formatted string (e.g., "15/03/2024 às 09:00")
 */
export function formatDateTimeBR(dateTime: string): string {
  const date = extractDate(dateTime);
  const time = extractTime(dateTime);
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} às ${time}`;
}
