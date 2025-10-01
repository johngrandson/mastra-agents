import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { isSlotBooked, markSlotAsBooked } from './booking-state';
import {
  extractDate,
  extractTime,
  formatDateTimeBR,
  getCurrentDateTime,
} from '../../../utils/date-time';
import { InMemoryAppointmentRepository } from '../../../repositories/appointment';
import { getTenant } from '../../../config';

// Get repository instance
const appointmentRepository = new InMemoryAppointmentRepository();

/**
 * Factory function to create book appointment tool for a specific tenant
 */
export async function createBookAppointmentTool(tenantId: string) {
  const tenant = await getTenant(tenantId);

  return createTool({
    id: 'book-appointment',
    description: `Book an appointment at ${tenant.name} with a dentist at a specific date and time`,
    inputSchema: z.object({
      patientName: z.string().describe('Patient full name'),
      patientContact: z.string().describe('Patient contact (email or phone)'),
      dentistId: z.string().describe('Dentist ID'),
      dentistName: z.string().describe('Dentist name'),
      specialty: z.string().describe('Dental specialty'),
      dateTime: z.string().describe('Appointment date and time in ISO format'),
    }),
    outputSchema: z.object({
      appointmentId: z.string(),
      patientName: z.string(),
      dentistName: z.string(),
      specialty: z.string(),
      dateTime: z.string(),
      status: z.enum(['confirmed', 'pending', 'cancelled']),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      return await bookAppointment(
        tenant,
        context.patientName,
        context.patientContact,
        context.dentistId,
        context.dentistName,
        context.specialty,
        context.dateTime
      );
    },
  });
}

const bookAppointment = async (
  tenant: Awaited<ReturnType<typeof getTenant>>,
  patientName: string,
  patientContact: string,
  dentistId: string,
  dentistName: string,
  specialty: string,
  dateTime: string
): Promise<{
  appointmentId: string;
  patientName: string;
  dentistName: string;
  specialty: string;
  dateTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  message: string;
}> => {
  const date = extractDate(dateTime);
  const time = extractTime(dateTime);

  // Check if patient already has future appointments
  const { isoDateTime: now } = getCurrentDateTime(tenant.business.timezone);
  const existingAppointments = await appointmentRepository.getFutureAppointments(
    patientContact,
    now
  );

  if (existingAppointments.length > 0) {
    const existing = existingAppointments[0];
    const formattedDate = formatDateTimeBR(existing.dateTime);
    throw new Error(
      `Você já possui uma consulta agendada na ${tenant.name} para ${formattedDate} com ${existing.dentistName}. Por favor, cancele ou aguarde esta consulta antes de agendar outra.`
    );
  }

  // Check if slot is already booked
  if (isSlotBooked(dentistId, date, time)) {
    throw new Error(
      `Desculpe, o horário ${time} com ${dentistName} em ${date} não está mais disponível. Por favor, escolha outro horário da lista de opções disponíveis.`
    );
  }

  // Generate unique appointment ID with tenant prefix
  const appointmentId = `${tenant.prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create appointment object
  const appointment = {
    appointmentId,
    patientName,
    patientContact,
    dentistId,
    dentistName,
    specialty,
    dateTime,
    status: 'confirmed' as const,
    createdAt: new Date().toISOString(),
  };

  // Store appointment
  await appointmentRepository.save(appointment);

  // Mark slot as booked
  markSlotAsBooked(dentistId, date, time);

  return {
    appointmentId,
    patientName,
    dentistName,
    specialty,
    dateTime,
    status: 'confirmed',
    message: `Consulta agendada com sucesso na ${tenant.name} com ${dentistName} em ${formatDateTimeBR(dateTime)}`,
  };
};

// Export repository functions for backward compatibility if needed
export const getAllAppointments = () => appointmentRepository.getAll();
export const getAppointmentById = (id: string) => appointmentRepository.findById(id);
