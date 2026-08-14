
import { useState, useEffect } from 'react';

// Progress type definition
export interface RegistrationProgress {
  isRegistered: boolean;
  phoneNumber: string;
  isCodeSent: boolean;
}

export const useRegistrationProgress = () => {
  // Load saved progress from localStorage
  const loadSavedProgress = (): RegistrationProgress => {
    if (typeof window === 'undefined') {
      return { isRegistered: false, phoneNumber: "", isCodeSent: false };
    }
    try {
      const savedProgress = localStorage.getItem('registration_progress');
      if (savedProgress) {
        return JSON.parse(savedProgress);
      }
    } catch (error) {
      console.error("Error loading saved progress:", error);
    }
    
    return {
      isRegistered: false,
      phoneNumber: "",
      isCodeSent: false
    };
  };

  const [progress, setProgress] = useState<RegistrationProgress>(loadSavedProgress());

  // Save progress to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('registration_progress', JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, [progress]);

  return {
    progress,
    setProgress,
    updateProgress: (updates: Partial<RegistrationProgress>) => {
      setProgress(prev => ({
        ...prev,
        ...updates
      }));
    },
    resetProgress: () => {
      localStorage.removeItem('registration_progress');
      setProgress({
        isRegistered: false,
        phoneNumber: "",
        isCodeSent: false
      });
    }
  };
};
