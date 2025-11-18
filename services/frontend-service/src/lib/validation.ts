/**
 * Validation utilities and schemas
 * Client-side validation for forms and inputs
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

export const validateMaxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

export const validateNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

export const validateAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

// Form validation helpers
export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule[];
}

export const validateField = (field: FieldValidation): string | null => {
  for (const rule of field.rules) {
    if (!rule.validator(field.value)) {
      return rule.message;
    }
  }
  return null;
};

export const validateForm = (fields: Record<string, FieldValidation>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  for (const [key, field] of Object.entries(fields)) {
    const error = validateField(field);
    if (error) {
      errors[key] = error;
    }
  }
  
  return errors;
};

// Ticket validation
export const validateTicketSubject = (subject: string): string | null => {
  if (!validateRequired(subject)) {
    return 'Subject is required';
  }
  if (!validateMinLength(subject, 5)) {
    return 'Subject must be at least 5 characters';
  }
  if (!validateMaxLength(subject, 200)) {
    return 'Subject must be less than 200 characters';
  }
  return null;
};

export const validateTicketDescription = (description: string): string | null => {
  if (!validateRequired(description)) {
    return 'Description is required';
  }
  if (!validateMinLength(description, 10)) {
    return 'Description must be at least 10 characters';
  }
  if (!validateMaxLength(description, 5000)) {
    return 'Description must be less than 5000 characters';
  }
  return null;
};

