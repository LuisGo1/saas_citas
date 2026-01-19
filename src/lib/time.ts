/**
 * Time formatting utilities for El Salvador locale (AM/PM format)
 */

/**
 * Converts a 24-hour time string (HH:MM) to 12-hour AM/PM format.
 * @param time24 - Time in 24-hour format (e.g., "14:30", "09:00")
 * @returns Time in 12-hour format (e.g., "02:30 PM", "09:00 AM")
 */
export function formatToAmPm(time24: string): string {
    if (!time24 || typeof time24 !== 'string') return time24;

    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';

    if (isNaN(hours)) return time24;

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11

    return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
}

/**
 * Converts a 12-hour time string with AM/PM to 24-hour format.
 * @param time12 - Time in 12-hour format (e.g., "02:30 PM")
 * @returns Time in 24-hour format (e.g., "14:30")
 */
export function formatTo24h(time12: string): string {
    if (!time12) return time12;

    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return time12;

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}
