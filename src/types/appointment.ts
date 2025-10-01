/**
 * Appointment Type Definition
 *
 * Represents a scheduled appointment in the booking system.
 */
export interface Appointment {
  appointmentId: string;
  patientName: string;
  patientContact: string;
  dentistId: string;
  dentistName: string;
  specialty: string;
  dateTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}
