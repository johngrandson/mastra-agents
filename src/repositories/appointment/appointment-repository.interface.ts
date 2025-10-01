import { Appointment } from '../../mastra/tools/booking/appointment-state';

/**
 * Appointment Repository Interface
 * Following Dependency Inversion Principle (DIP)
 *
 * This interface defines the contract for appointment persistence,
 * allowing easy switching between implementations (in-memory, Redis, etc.)
 */
export interface IAppointmentRepository {
  /**
   * Save an appointment
   */
  save(appointment: Appointment): Promise<void>;

  /**
   * Find appointment by ID
   */
  findById(appointmentId: string): Promise<Appointment | undefined>;

  /**
   * Find all appointments for a patient by contact
   */
  findByPatientContact(patientContact: string): Promise<Appointment[]>;

  /**
   * Get future active appointments for a patient
   * @param patientContact - Patient contact (email or phone)
   * @param currentDateTime - Current datetime in ISO format
   * @returns List of future confirmed/pending appointments
   */
  getFutureAppointments(patientContact: string, currentDateTime: string): Promise<Appointment[]>;

  /**
   * Cancel an appointment
   * @returns true if cancelled successfully, false if not found
   */
  cancel(appointmentId: string): Promise<boolean>;

  /**
   * Get all appointments (for testing/debugging)
   */
  getAll(): Promise<Appointment[]>;

  /**
   * Clear all appointments (for testing)
   */
  clear(): Promise<void>;
}
