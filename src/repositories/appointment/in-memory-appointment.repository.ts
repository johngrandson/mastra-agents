import { IAppointmentRepository } from './appointment-repository.interface';
import { Appointment } from '../../types/appointment';

/**
 * In-Memory Implementation of Appointment Repository
 *
 * This implementation uses Map data structures with O(1) lookups.
 * Uses dual indexing: by appointmentId and by patientContact for fast queries.
 *
 * Perfect for development and testing. Will be replaced by RedisAppointmentRepository
 * in production for persistence and multi-instance support.
 */
export class InMemoryAppointmentRepository implements IAppointmentRepository {
  // Primary storage: appointmentId -> Appointment
  private appointments: Map<string, Appointment> = new Map();

  // Secondary index: patientContact -> Set<appointmentId>
  private patientIndex: Map<string, Set<string>> = new Map();

  async save(appointment: Appointment): Promise<void> {
    // Store appointment
    this.appointments.set(appointment.appointmentId, appointment);

    // Update patient index
    const normalizedContact = this.normalizeContact(appointment.patientContact);
    if (!this.patientIndex.has(normalizedContact)) {
      this.patientIndex.set(normalizedContact, new Set());
    }
    this.patientIndex.get(normalizedContact)!.add(appointment.appointmentId);
  }

  async findById(appointmentId: string): Promise<Appointment | undefined> {
    return this.appointments.get(appointmentId);
  }

  async findByPatientContact(patientContact: string): Promise<Appointment[]> {
    const normalizedContact = this.normalizeContact(patientContact);
    const appointmentIds = this.patientIndex.get(normalizedContact);

    if (!appointmentIds) {
      return [];
    }

    return Array.from(appointmentIds)
      .map(id => this.appointments.get(id))
      .filter((apt): apt is Appointment => apt !== undefined);
  }

  async getFutureAppointments(
    patientContact: string,
    currentDateTime: string
  ): Promise<Appointment[]> {
    const allAppointments = await this.findByPatientContact(patientContact);
    const currentDate = new Date(currentDateTime);

    return allAppointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      const isActive = apt.status === 'confirmed' || apt.status === 'pending';
      const isFuture = aptDate > currentDate;
      return isActive && isFuture;
    });
  }

  async cancel(appointmentId: string): Promise<boolean> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      return false;
    }

    appointment.status = 'cancelled';
    this.appointments.set(appointmentId, appointment);
    return true;
  }

  async getAll(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async clear(): Promise<void> {
    this.appointments.clear();
    this.patientIndex.clear();
  }

  /**
   * Normalize contact for consistent indexing
   */
  private normalizeContact(contact: string): string {
    return contact.toLowerCase().trim();
  }
}
