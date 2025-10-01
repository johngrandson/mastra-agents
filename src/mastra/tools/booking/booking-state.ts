/**
 * Shared state for managing booked appointment slots
 * Key: "dentistId:date" (e.g., "1:2024-03-15")
 * Value: Set of booked time slots (e.g., Set(["09:00", "14:00"]))
 */
const bookedSlots: Map<string, Set<string>> = new Map();

/**
 * Check if a specific slot is already booked
 */
export function isSlotBooked(dentistId: string, date: string, time: string): boolean {
  const key = `${dentistId}:${date}`;
  const slots = bookedSlots.get(key);
  return slots?.has(time) ?? false;
}

/**
 * Mark a slot as booked
 */
export function markSlotAsBooked(dentistId: string, date: string, time: string): void {
  const key = `${dentistId}:${date}`;

  if (!bookedSlots.has(key)) {
    bookedSlots.set(key, new Set());
  }

  bookedSlots.get(key)!.add(time);
}

/**
 * Get all booked slots for a specific dentist and date
 */
export function getBookedSlots(dentistId: string, date: string): string[] {
  const key = `${dentistId}:${date}`;
  return Array.from(bookedSlots.get(key) ?? []);
}

/**
 * Clear all booked slots (for testing)
 */
export function clearAllBookedSlots(): void {
  bookedSlots.clear();
}
