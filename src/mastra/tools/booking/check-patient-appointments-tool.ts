import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { InMemoryAppointmentRepository } from '../../../repositories/appointment';
import { getCurrentDateTime } from '../../../utils/date-time';
import { getTenant } from '../../../config';

// Get repository instance
const appointmentRepository = new InMemoryAppointmentRepository();

/**
 * Factory function to create check patient appointments tool for a specific tenant
 */
export async function createCheckPatientAppointmentsTool(tenantId: string) {
  const tenant = getTenant(tenantId);

  return createTool({
    id: 'check-patient-appointments',
    description: `Check if a patient already has future appointments booked at ${tenant.name}. Use this BEFORE booking a new appointment to prevent duplicate bookings.`,
    inputSchema: z.object({
      patientContact: z.string().describe('Patient contact (email or phone number)'),
    }),
    outputSchema: z.object({
      hasActiveAppointments: z
        .boolean()
        .describe('Whether patient has any future active appointments'),
      appointments: z
        .array(
          z.object({
            appointmentId: z.string(),
            patientName: z.string(),
            dentistName: z.string(),
            specialty: z.string(),
            dateTime: z.string(),
            status: z.enum(['confirmed', 'pending', 'cancelled']),
          })
        )
        .describe('List of future active appointments'),
      count: z.number().describe('Number of future active appointments'),
      message: z.string().describe('Human-readable message'),
    }),
    execute: async ({ context }) => {
      // Get current datetime for comparison
      const { isoDateTime } = getCurrentDateTime(tenant.business.timezone);

      const futureAppointments = await appointmentRepository.getFutureAppointments(
        context.patientContact,
        isoDateTime
      );

      const hasActiveAppointments = futureAppointments.length > 0;

      return {
        hasActiveAppointments,
        appointments: futureAppointments.map(apt => ({
          appointmentId: apt.appointmentId,
          patientName: apt.patientName,
          dentistName: apt.dentistName,
          specialty: apt.specialty,
          dateTime: apt.dateTime,
          status: apt.status,
        })),
        count: futureAppointments.length,
        message: hasActiveAppointments
          ? `Paciente já possui ${futureAppointments.length} consulta(s) agendada(s) na ${tenant.name}`
          : 'Paciente não possui consultas futuras agendadas',
      };
    },
  });
}
