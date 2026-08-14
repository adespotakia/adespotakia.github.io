
// Input validation and sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Greek phone number validation (basic)
  const phoneRegex = /^(\+30)?[26][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateTextLength = (text: string, minLength: number = 0, maxLength: number = 1000): boolean => {
  return text.length >= minLength && text.length <= maxLength;
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const sanitizeDescription = (description: string): string => {
  return sanitizeInput(description).substring(0, 2000); // Limit description length
};
