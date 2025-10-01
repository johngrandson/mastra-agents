import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getCurrentDateTime, isBusinessDay } from '../../utils/date-time';
import { getTenant } from '../../config';

export async function createCurrentDateTimeTool(tenantId: string) {
  const tenant = await getTenant(tenantId);
  const timezone = tenant.business.timezone;

  return createTool({
    id: 'current-datetime',
    description: `Get current date and time information for ${tenant.name}. Use this tool when you need to know what day it is today, what time it is now, or to validate if a date is in the future. IMPORTANT: Always use this tool before booking appointments to ensure dates are valid.`,
    inputSchema: z.object({}),
    outputSchema: z.object({
      currentDate: z.string().describe('Current date in DD/MM/YYYY format'),
      currentTime: z.string().describe('Current time in HH:mm format'),
      isoDate: z.string().describe('Current date in YYYY-MM-DD format'),
      isoDateTime: z.string().describe('Current datetime in ISO format'),
      dayOfWeek: z.string().describe('Current day of week in Portuguese'),
      isBusinessDay: z.boolean().describe('Whether current day is a business day (Mon-Fri)'),
      timezone: z.string().describe('Timezone used'),
      location: z.string().describe('Business location'),
    }),
    execute: async () => {
      const {
        date,
        time,
        isoDate,
        isoDateTime,
        dayOfWeek,
        timezone: tz,
      } = getCurrentDateTime(timezone);
      const businessDay = isBusinessDay(isoDate);

      return {
        currentDate: date,
        currentTime: time,
        isoDate,
        isoDateTime,
        dayOfWeek,
        isBusinessDay: businessDay,
        timezone: tz,
        location: tenant.business.location,
      };
    },
  });
}

// Lazy initialization for backward compatibility
let currentDateTimeToolInstance: ReturnType<typeof createCurrentDateTimeTool> | null = null;

export async function getCurrentDateTimeTool() {
  if (!currentDateTimeToolInstance) {
    currentDateTimeToolInstance = await createCurrentDateTimeTool('ortofaccia');
  }
  return currentDateTimeToolInstance;
}

// Export instance using top-level await
export const currentDateTimeTool = await createCurrentDateTimeTool('ortofaccia');
