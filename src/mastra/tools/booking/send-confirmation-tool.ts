import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getTenant } from '../../../config';

interface ConfirmationResult {
  sent: boolean;
  method: string;
  recipient: string;
  message: string;
  sentAt: string;
}

/**
 * Factory function to create send confirmation tool for a specific tenant
 */
export async function createSendConfirmationTool(tenantId: string) {
  const tenant = getTenant(tenantId);

  return createTool({
    id: 'send-confirmation',
    description: `Send appointment confirmation message to patient via email or SMS for ${tenant.name}`,
    inputSchema: z.object({
      appointmentId: z.string().describe('Appointment ID'),
      patientName: z.string().describe('Patient name'),
      patientContact: z.string().describe('Patient contact (email or phone)'),
      dentistName: z.string().describe('Dentist name'),
      specialty: z.string().describe('Dental specialty'),
      dateTime: z.string().describe('Appointment date and time'),
    }),
    outputSchema: z.object({
      sent: z.boolean(),
      method: z.string(),
      recipient: z.string(),
      message: z.string(),
      sentAt: z.string(),
    }),
    execute: async ({ context }) => {
      return await sendConfirmation(
        tenant,
        context.appointmentId,
        context.patientName,
        context.patientContact,
        context.dentistName,
        context.specialty,
        context.dateTime
      );
    },
  });
}

const sendConfirmation = async (
  tenant: Awaited<ReturnType<typeof getTenant>>,
  appointmentId: string,
  patientName: string,
  patientContact: string,
  dentistName: string,
  specialty: string,
  dateTime: string
): Promise<ConfirmationResult> => {
  // Determine contact method based on format
  const isEmail = patientContact.includes('@');
  const contactMethod = isEmail ? 'email' : 'sms';

  // Format date and time for better readability
  const formattedDateTime = formatDateTime(dateTime);

  // Create confirmation message
  const confirmationMessage = createConfirmationMessage(
    tenant,
    patientName,
    dentistName,
    specialty,
    formattedDateTime,
    appointmentId
  );

  // Simulate sending confirmation (in real implementation, integrate with email/SMS service)
  await simulateSendingConfirmation();

  // Log confirmation for debugging
  console.log(`[CONFIRMATION SENT]`);
  console.log(`Method: ${contactMethod}`);
  console.log(`To: ${patientContact}`);
  console.log(`Message:\n${confirmationMessage}`);
  console.log('---');

  return {
    sent: true,
    method: contactMethod,
    recipient: patientContact,
    message: confirmationMessage,
    sentAt: new Date().toISOString(),
  };
};

const formatDateTime = (isoDateTime: string): string => {
  try {
    const date = new Date(isoDateTime);
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    const formattedDate = date.toLocaleDateString('pt-BR', dateOptions);
    const formattedTime = date.toLocaleTimeString('pt-BR', timeOptions);

    return `${formattedDate} às ${formattedTime}`;
  } catch (_error) {
    return isoDateTime;
  }
};

const createConfirmationMessage = (
  tenant: Awaited<ReturnType<typeof getTenant>>,
  patientName: string,
  dentistName: string,
  specialty: string,
  dateTime: string,
  appointmentId: string
): string => {
  const specialtyMap: Record<string, string> = {
    general: 'Clínico Geral',
    orthodontics: 'Ortodontia',
    implantology: 'Implantodontia',
    periodontics: 'Periodontia',
    endodontics: 'Endodontia',
    cosmetic: 'Estética Dental',
    prosthetics: 'Próteses Dentárias',
    surgery: 'Cirurgia Odontológica',
  };

  const formattedSpecialty =
    specialtyMap[specialty.toLowerCase()] || specialty.charAt(0).toUpperCase() + specialty.slice(1);

  return `
    Olá ${patientName},

    Sua consulta na ${tenant.name} foi confirmada! 🦷✨

    Detalhes da Consulta:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📋 ID da Consulta: ${appointmentId}
    👨‍⚕️ Dentista: ${dentistName}
    🦷 Especialidade: ${formattedSpecialty}
    📅 Data & Hora: ${dateTime}
    📍 Localização: ${tenant.business.location}

    Lembrete Importante:
    • Chegue 15 minutos antes da consulta
    • leve um documento de identificação válido e sua carteira de convênio (se aplicável)
    • Se precisar cancelar ou remarcar, entre em contato conosco pelo menos 24 horas antes
    • Para primeiros pacientes, chegue 30 minutos antes para finalizar o cadastro

    Preparação:
    • Lave os dentes antes da consulta
    • leve uma lista de qualquer medicamento que esteja tomando
    • Informe-nos de quaisquer alterações na sua história médica

    Informações de Contato:
    📞 Telefone: ${tenant.business.phone}
    📱 WhatsApp: ${tenant.business.phone}
    📍 Localização: ${tenant.business.location}

    Obrigado por escolher a ${tenant.name}!
    Esperamos ver seu sorriso! 😊

    Atenciosamente,
    ${tenant.name}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();
};

// Configuration: Simulated failure rate for confirmation sending (0-1 range)
// In production, this would be replaced with actual email/SMS service integration
const simulateSendingConfirmation = async (): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
};
