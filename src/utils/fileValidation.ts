
// File validation utilities for secure uploads
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_UPLOAD = 5;

export interface FileValidationError {
  type: 'invalid_type' | 'too_large' | 'too_many_files' | 'invalid_name';
  message: string;
  file?: string;
}

export const validateFiles = (files: File[]): FileValidationError[] => {
  const errors: FileValidationError[] = [];

  // Check file count
  if (files.length > MAX_FILES_PER_UPLOAD) {
    errors.push({
      type: 'too_many_files',
      message: `Μπορείτε να ανεβάσετε μέχρι ${MAX_FILES_PER_UPLOAD} αρχεία`
    });
  }

  files.forEach((file) => {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push({
        type: 'invalid_type',
        message: `Μη έγκυρος τύπος αρχείου: ${file.name}. Επιτρέπονται μόνο εικόνες.`,
        file: file.name
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push({
        type: 'too_large',
        message: `Το αρχείο ${file.name} είναι πολύ μεγάλο. Μέγιστο μέγεθος: 5MB`,
        file: file.name
      });
    }

    // Validate filename (prevent path traversal)
    if (file.name.includes('../') || file.name.includes('..\\') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push({
        type: 'invalid_name',
        message: `Μη έγκυρο όνομα αρχείου: ${file.name}`,
        file: file.name
      });
    }
  });

  return errors;
};

export const generateSecureFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  
  return `${userId}/${timestamp}_${random}.${extension}`;
};
