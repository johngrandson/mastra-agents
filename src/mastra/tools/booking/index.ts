/**
 * Booking-related tools
 * Tools for checking availability, booking appointments, and sending confirmations
 *
 * All booking tools are now tenant-aware factory functions.
 * Each tool accepts a tenantId parameter and returns a configured tool instance.
 */

// Factory functions for tenant-aware tools
export { createCheckPatientAppointmentsTool } from './check-patient-appointments-tool';
export { createBookAppointmentTool } from './book-appointment-tool';
export { createSendConfirmationTool } from './send-confirmation-tool';

// Tools that don't need tenant-specific configuration (yet)
export { checkAvailabilityTool } from './check-availability-tool';
