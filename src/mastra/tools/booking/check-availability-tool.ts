import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { isSlotBooked } from './booking-state';
import { extractDate, combineDateTime } from '../../../utils/date-time';

interface Dentist {
  id: string;
  name: string;
  specialty: string;
}

interface TimeSlot {
  dentistId: string;
  dentistName: string;
  dateTime: string;
  available: boolean;
}

// Real dentists at Ortofaccia - Manaíra, João Pessoa - PB
const dentists: Dentist[] = [
  { id: '1', name: 'Dra. Larissa Lucena', specialty: 'general' },
  { id: '2', name: 'Dra. Larissa Lucena', specialty: 'cosmetic' },
  { id: '3', name: 'Dra. Maria Julia', specialty: 'general' },
  { id: '4', name: 'Dra. Maria Julia', specialty: 'orthodontics' },
  { id: '5', name: 'Dra. Maria Julia', specialty: 'cosmetic' },
  { id: '6', name: 'Dra. Joelma Porto', specialty: 'general' },
  { id: '7', name: 'Dra. Joelma Porto', specialty: 'prosthetics' },
  { id: '8', name: 'Dra. Joelma Porto', specialty: 'surgery' },
];

// Hash map for O(1) lookup by specialty
const dentistsBySpecialty = dentists.reduce(
  (acc, dentist) => {
    const specialty = dentist.specialty.toLowerCase();
    if (!acc[specialty]) {
      acc[specialty] = [];
    }
    acc[specialty].push(dentist);
    return acc;
  },
  {} as Record<string, Dentist[]>
);

export const checkAvailabilityTool = createTool({
  id: 'check-availability',
  description:
    'Check available appointment slots for a specific dental specialty and date at Ortofaccia in Manaíra, João Pessoa - PB.',
  inputSchema: z.object({
    specialty: z
      .string()
      .describe('Dental specialty (general, orthodontics, cosmetic, prosthetics, surgery)'),
    preferredDate: z.string(),
  }),
  outputSchema: z.object({
    availableSlots: z.array(
      z.object({
        dentistId: z.string(),
        dentistName: z.string(),
        dateTime: z.string(),
        available: z.boolean(),
      })
    ),
    message: z.string(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    return await checkAvailability(context.specialty, context.preferredDate);
  },
});

const checkAvailability = async (
  specialty: string,
  preferredDate: string
): Promise<{ availableSlots: TimeSlot[]; message: string; error?: string }> => {
  const normalizedSpecialty = specialty.toLowerCase();
  const matchingDentists = dentistsBySpecialty[normalizedSpecialty];

  if (!matchingDentists || matchingDentists.length === 0) {
    return {
      availableSlots: [],
      message: `Nenhum dentista encontrado para a especialidade: ${specialty} na Ortofaccia`,
    };
  }

  const dateOnly = extractDate(preferredDate);

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const availableSlots: TimeSlot[] = [];

  for (const dentist of matchingDentists) {
    for (const time of timeSlots) {
      // Check if slot is already booked
      const alreadyBooked = isSlotBooked(dentist.id, dateOnly, time);

      // Only add slot if not booked (simulate 70% availability for non-booked slots)
      if (!alreadyBooked && Math.random() > 0.3) {
        availableSlots.push({
          dentistId: dentist.id,
          dentistName: dentist.name,
          dateTime: combineDateTime(dateOnly, time),
          available: true,
        });
      }
    }
  }

  if (availableSlots.length === 0) {
    return {
      availableSlots: [],
      message: `Nenhum horário disponível para ${specialty} em ${preferredDate} na Ortofaccia. Tente outra data dentro da janela de 2-7 dias úteis.`,
    };
  }

  return {
    availableSlots,
    message: `Encontrados ${availableSlots.length} horários disponíveis para ${specialty} na Ortofaccia. Capacidade da clínica: ~15 consultas/dia.`,
  };
};
