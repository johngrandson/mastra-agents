/**
 * Appointment Repository Module
 *
 * Exports repository interface and implementations following
 * Dependency Inversion Principle (DIP)
 */

export { IAppointmentRepository } from './appointment-repository.interface';
export { InMemoryAppointmentRepository } from './in-memory-appointment.repository';
export { RedisAppointmentRepository } from './redis-appointment.repository';
