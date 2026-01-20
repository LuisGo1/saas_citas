import { createClient } from "@/utils/supabase/client";

export interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface AppointmentConflict {
  appointment_time: string;
  service_id: string;
  staff_id?: string;
}

export interface AvailableTimeSlot {
  time: string;
  available: boolean;
  reason?: string; // 'conflict', 'outside_business_hours', etc.
}

/**
 * Get business availability for a specific day of the week
 */
export async function getBusinessAvailability(businessId: string, dayOfWeek: number): Promise<AvailabilitySlot[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time')
    .eq('business_id', businessId)
    .eq('day_of_week', dayOfWeek)
    .order('start_time');

  if (error) {
    console.error('Error fetching availability:', error);
    return [];
  }

  return data || [];
}

/**
 * Get existing appointments for a specific date and optionally staff
 */
export async function getAppointmentConflicts(
  businessId: string,
  date: string,
  staffId?: string
): Promise<AppointmentConflict[]> {
  const supabase = createClient();

  let query = supabase
    .from('appointments')
    .select('appointment_time, service_id, staff_id')
    .eq('business_id', businessId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }

  return data || [];
}

/**
 * Generate available time slots for a specific date and staff
 */
export async function getAvailableTimeSlots(
  businessId: string,
  date: string,
  staffId?: string,
  serviceDurationMinutes: number = 60
): Promise<AvailableTimeSlot[]> {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Get business availability for this day
  const availability = await getBusinessAvailability(businessId, dayOfWeek);

  if (availability.length === 0) {
    // No availability configured for this day
    return [];
  }

  // Get existing appointments
  const conflicts = await getAppointmentConflicts(businessId, date, staffId);

  const availableSlots: AvailableTimeSlot[] = [];

  // For each availability block
  for (const block of availability) {
    const startTime = new Date(`${date}T${block.start_time}`);
    const endTime = new Date(`${date}T${block.end_time}`);

    // Generate 30-minute intervals
    let currentTime = new Date(startTime);

    while (currentTime.getTime() + serviceDurationMinutes * 60000 <= endTime.getTime()) {
      const timeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
      const slotEndTime = new Date(currentTime.getTime() + serviceDurationMinutes * 60000);

      // Check for conflicts
      const hasConflict = conflicts.some(appointment => {
        const appointmentTime = new Date(`${date}T${appointment.appointment_time}`);
        // Check if the new appointment would overlap with existing one
        return (
          (currentTime >= appointmentTime && currentTime < new Date(appointmentTime.getTime() + serviceDurationMinutes * 60000)) ||
          (slotEndTime > appointmentTime && slotEndTime <= new Date(appointmentTime.getTime() + serviceDurationMinutes * 60000)) ||
          (currentTime <= appointmentTime && slotEndTime > new Date(appointmentTime.getTime() + serviceDurationMinutes * 60000))
        );
      });

      availableSlots.push({
        time: timeString,
        available: !hasConflict,
        reason: hasConflict ? 'conflict' : undefined
      });

      // Move to next 30-minute slot
      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }
  }

  return availableSlots;
}

/**
 * Check if a specific time slot is available
 */
export async function isTimeSlotAvailable(
  businessId: string,
  date: string,
  time: string,
  serviceDurationMinutes: number = 60,
  staffId?: string
): Promise<{ available: boolean; reason?: string }> {
  const slots = await getAvailableTimeSlots(businessId, date, staffId, serviceDurationMinutes);
  const slot = slots.find(s => s.time === time);

  if (!slot) {
    return { available: false, reason: 'outside_business_hours' };
  }

  return { available: slot.available, reason: slot.reason };
}