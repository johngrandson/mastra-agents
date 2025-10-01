import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Schema definitions for workflow data flow
const bookingInputSchema = z.object({
  patientName: z.string().min(2).describe('Patient full name'),
  specialty: z
    .string()
    .describe('Dental specialty (orthodontics, implantology, periodontics, endodontics, cosmetic)'),
  preferredDate: z.string().describe('Preferred appointment date in YYYY-MM-DD format'),
  patientContact: z.string().describe('Patient contact (email or phone number)'),
});

const availabilitySchema = z.object({
  patientName: z.string(),
  specialty: z.string(),
  preferredDate: z.string(),
  patientContact: z.string(),
  availableSlots: z.array(
    z.object({
      dentistId: z.string(),
      dentistName: z.string(),
      dateTime: z.string(),
      available: z.boolean(),
    })
  ),
  message: z.string(),
});

const selectedSlotSchema = z.object({
  patientName: z.string(),
  patientContact: z.string(),
  specialty: z.string(),
  selectedSlot: z.object({
    dentistId: z.string(),
    dentistName: z.string(),
    dateTime: z.string(),
  }),
});

const confirmationSchema = z.object({
  appointmentId: z.string(),
  patientName: z.string(),
  dentistName: z.string(),
  specialty: z.string(),
  dateTime: z.string(),
  status: z.string(),
  confirmationSent: z.boolean(),
  confirmationMethod: z.string(),
  confirmationMessage: z.string(),
});

/**
 * Step 1: Validate Input
 * Validates all required patient information and appointment preferences
 */
const validateInput = createStep({
  id: 'validate-input',
  description: 'Validates patient information and appointment preferences',
  inputSchema: bookingInputSchema,
  outputSchema: bookingInputSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data is required');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(inputData.preferredDate)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    // Validate date is in the future
    const preferredDate = new Date(inputData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preferredDate < today) {
      throw new Error('Preferred date must be in the future');
    }

    // Validate specialty
    const validSpecialties = [
      'orthodontics',
      'implantology',
      'periodontics',
      'endodontics',
      'cosmetic',
    ];
    if (!validSpecialties.includes(inputData.specialty.toLowerCase())) {
      throw new Error(`Invalid dental specialty. Must be one of: ${validSpecialties.join(', ')}`);
    }

    // Validate contact (basic email or phone format)
    const isValidContact =
      inputData.patientContact.includes('@') || /^\+?[\d\s-()]+$/.test(inputData.patientContact);

    if (!isValidContact) {
      throw new Error('Invalid contact information. Provide a valid email or phone number');
    }

    return {
      patientName: inputData.patientName.trim(),
      specialty: inputData.specialty.toLowerCase(),
      preferredDate: inputData.preferredDate,
      patientContact: inputData.patientContact.trim(),
    };
  },
});

/**
 * Step 2: Check Availability
 * Queries available dental appointment slots at Ortofaccia for the requested specialty and date
 */
const checkAvailability = createStep({
  id: 'check-availability',
  description: 'Checks available dental appointment slots at Ortofaccia for the specialty and date',
  inputSchema: bookingInputSchema,
  outputSchema: availabilitySchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    // Import the tool function to check availability
    const { checkAvailabilityTool } = await import('../tools/booking');

    const availabilityResult = await checkAvailabilityTool.execute({
      context: {
        specialty: inputData.specialty,
        preferredDate: inputData.preferredDate,
      },
      runtimeContext: {} as any,
      suspend: async () => {},
    });

    if (availabilityResult.availableSlots.length === 0) {
      throw new Error(
        `No available slots found for ${inputData.specialty} on ${inputData.preferredDate}. Please try a different date.`
      );
    }

    return {
      patientName: inputData.patientName,
      specialty: inputData.specialty,
      preferredDate: inputData.preferredDate,
      patientContact: inputData.patientContact,
      availableSlots: availabilityResult.availableSlots,
      message: availabilityResult.message,
    };
  },
});

/**
 * Step 3: Confirm Booking with Agent
 * Uses the booking agent to interact with patient and select time slot
 */
const confirmBooking = createStep({
  id: 'confirm-booking',
  description: 'Uses agent to present options and confirm patient selection',
  inputSchema: availabilitySchema,
  outputSchema: selectedSlotSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Availability data not found');
    }

    const agent = mastra?.getAgent('bookingAgent');
    if (!agent) {
      throw new Error('Booking agent not found');
    }

    // Format available slots for agent presentation
    const slotsText = inputData.availableSlots
      .map(
        (slot, index) =>
          `${index + 1}. ${slot.dentistName} - ${new Date(slot.dateTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}`
      )
      .join('\n');

    const prompt = `
Patient: ${inputData.patientName}
Specialty: ${inputData.specialty}
Contact: ${inputData.patientContact}

Available appointment slots:
${slotsText}

Please present these options to the patient in a friendly manner and help them select their preferred slot.
After selection, confirm all details with the patient.

For this workflow demonstration, automatically select the first available slot.
    `;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
    }

    // For demonstration, select first available slot
    const selectedSlot = inputData.availableSlots[0];

    return {
      patientName: inputData.patientName,
      patientContact: inputData.patientContact,
      specialty: inputData.specialty,
      selectedSlot: {
        dentistId: selectedSlot.dentistId,
        dentistName: selectedSlot.dentistName,
        dateTime: selectedSlot.dateTime,
      },
    };
  },
});

/**
 * Step 4: Finalize Booking
 * Books the dental appointment at Ortofaccia and sends confirmation
 */
const finalizeBooking = createStep({
  id: 'finalize-booking',
  description: 'Books the dental appointment at Ortofaccia and sends confirmation to patient',
  inputSchema: selectedSlotSchema,
  outputSchema: confirmationSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Selected slot data not found');
    }

    // Import tools and create tenant-specific instances
    const { createBookAppointmentTool, createSendConfirmationTool } = await import(
      '../tools/booking'
    );

    // TODO: Get tenantId from workflow context - for now hardcoded to ortofaccia
    const tenantId = 'ortofaccia';
    const bookAppointmentTool = await createBookAppointmentTool(tenantId);
    const sendConfirmationTool = await createSendConfirmationTool(tenantId);

    // Book the dental appointment
    const bookingResult = await bookAppointmentTool.execute({
      context: {
        patientName: inputData.patientName,
        patientContact: inputData.patientContact,
        dentistId: inputData.selectedSlot.dentistId,
        dentistName: inputData.selectedSlot.dentistName,
        specialty: inputData.specialty,
        dateTime: inputData.selectedSlot.dateTime,
      },
      runtimeContext: {} as any,
      suspend: async () => {},
    });

    // Send confirmation
    const confirmationResult = await sendConfirmationTool.execute({
      context: {
        appointmentId: bookingResult.appointmentId,
        patientName: inputData.patientName,
        patientContact: inputData.patientContact,
        dentistName: inputData.selectedSlot.dentistName,
        specialty: inputData.specialty,
        dateTime: inputData.selectedSlot.dateTime,
      },
      runtimeContext: {} as any,
      suspend: async () => {},
    });

    return {
      appointmentId: bookingResult.appointmentId,
      patientName: inputData.patientName,
      dentistName: inputData.selectedSlot.dentistName,
      specialty: inputData.specialty,
      dateTime: inputData.selectedSlot.dateTime,
      status: bookingResult.status,
      confirmationSent: confirmationResult.sent,
      confirmationMethod: confirmationResult.method,
      confirmationMessage: confirmationResult.message,
    };
  },
});

/**
 * Booking Workflow
 * Complete workflow for dental appointment booking at Ortofaccia
 */
const bookingWorkflow = createWorkflow({
  id: 'booking-workflow',
  description: 'Complete dental appointment booking workflow for Ortofaccia Dental Clinic',
  inputSchema: bookingInputSchema,
  outputSchema: confirmationSchema,
})
  .then(validateInput)
  .then(checkAvailability)
  .then(confirmBooking)
  .then(finalizeBooking);

bookingWorkflow.commit();

export { bookingWorkflow };
