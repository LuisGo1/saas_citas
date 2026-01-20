/**
 * Validation utilities for booking forms
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ClientInfo {
  name: string;
  phone: string;
}

export interface BookingData {
  serviceId?: string;
  staffId?: string | null;
  date?: string;
  time?: string;
  clientName: string;
  clientPhone: string;
}

/**
 * Validate client name
 */
export function validateClientName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name.trim()) {
    errors.push("El nombre es obligatorio");
  } else if (name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  } else if (name.trim().length > 100) {
    errors.push("El nombre no puede tener más de 100 caracteres");
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name.trim())) {
    errors.push("El nombre solo puede contener letras, espacios, guiones y apóstrofes");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate phone number with El Salvador format support
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: string[] = [];

  if (!phone.trim()) {
    errors.push("El teléfono es obligatorio");
  } else {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check for valid El Salvador phone formats
    const elSalvadorRegex = /^(503)?[6-7]\d{7}$/; // 503 + 7 or 8 digits
    const internationalRegex = /^503[6-7]\d{7}$/; // Full international format
    const localRegex = /^[6-7]\d{7}$/; // Local format without country code

    if (cleanPhone.length === 8 && localRegex.test(cleanPhone)) {
      // Valid local format
    } else if (cleanPhone.length === 11 && internationalRegex.test(cleanPhone)) {
      // Valid international format
    } else if (cleanPhone.length === 11 && elSalvadorRegex.test(cleanPhone)) {
      // Valid with country code
    } else {
      errors.push("Formato de teléfono inválido. Use: +503XXXXXXXX o 7XXXXXXX");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate appointment date
 */
export function validateAppointmentDate(date: string): ValidationResult {
  const errors: string[] = [];

  if (!date) {
    errors.push("La fecha es obligatoria");
  } else {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errors.push("La fecha no puede ser en el pasado");
    }

    // Check if date is not too far in the future (max 6 months)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);

    if (selectedDate > maxDate) {
      errors.push("La fecha no puede ser más de 6 meses en el futuro");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate appointment time
 */
export function validateAppointmentTime(time: string): ValidationResult {
  const errors: string[] = [];

  if (!time) {
    errors.push("La hora es obligatoria");
  } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    errors.push("Formato de hora inválido");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate service selection
 */
export function validateServiceSelection(serviceId: string | undefined): ValidationResult {
  const errors: string[] = [];

  if (!serviceId) {
    errors.push("Debe seleccionar un servicio");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete booking data
 */
export function validateBookingData(data: Partial<BookingData>): ValidationResult {
  const allErrors: string[] = [];

  // Validate service
  if (data.serviceId !== undefined) {
    const serviceValidation = validateServiceSelection(data.serviceId);
    allErrors.push(...serviceValidation.errors);
  }

  // Validate date
  if (data.date) {
    const dateValidation = validateAppointmentDate(data.date);
    allErrors.push(...dateValidation.errors);
  }

  // Validate time
  if (data.time) {
    const timeValidation = validateAppointmentTime(data.time);
    allErrors.push(...timeValidation.errors);
  }

  // Validate client name
  if (data.clientName) {
    const nameValidation = validateClientName(data.clientName);
    allErrors.push(...nameValidation.errors);
  }

  // Validate phone
  if (data.clientPhone) {
    const phoneValidation = validatePhoneNumber(data.clientPhone);
    allErrors.push(...phoneValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

/**
 * Format phone number for display and WhatsApp
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 8) {
    return `+503${cleanPhone}`;
  } else if (cleanPhone.startsWith('503') && cleanPhone.length === 11) {
    return `+${cleanPhone}`;
  }

  return phone; // Return as-is if already formatted
}