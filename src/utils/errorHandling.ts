
// Secure error handling utilities
export const sanitizeError = (error: any): string => {
  // Don't expose sensitive information in error messages
  if (typeof error === 'string') {
    return error.includes('password') || error.includes('token') || error.includes('key') 
      ? 'Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.' 
      : error;
  }

  if (error?.message) {
    const message = error.message.toLowerCase();
    if (message.includes('password') || message.includes('token') || message.includes('key') || message.includes('unauthorized')) {
      return 'Προέκυψε σφάλμα πιστοποίησης. Παρακαλώ συνδεθείτε ξανά.';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Πρόβλημα σύνδεσης. Παρακαλώ δοκιμάστε ξανά.';
    }
    return error.message;
  }

  return 'Προέκυψε απροσδόκητο σφάλμα. Παρακαλώ δοκιμάστε ξανά.';
};

export const logSecurityEvent = (event: string, details: any) => {
  // In production, this would send to a secure logging service
  console.warn(`Security Event: ${event}`, {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    details: typeof details === 'object' ? JSON.stringify(details) : details
  });
};
