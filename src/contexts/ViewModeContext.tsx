
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ViewModeContextType {
  isMobileView: boolean;
  toggleMobileView: () => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  isMobileView: false,
  toggleMobileView: () => {},
});

export const useViewMode = () => useContext(ViewModeContext);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileView, setIsMobileView] = useState(false);

  // Load saved preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('mobile-view');
    if (savedViewMode === 'true') {
      setIsMobileView(true);
    }
  }, []);

  const toggleMobileView = () => {
    const newValue = !isMobileView;
    setIsMobileView(newValue);
    localStorage.setItem('mobile-view', newValue.toString());
  };

  return (
    <ViewModeContext.Provider value={{ isMobileView, toggleMobileView }}>
      {children}
    </ViewModeContext.Provider>
  );
};
