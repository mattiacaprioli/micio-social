import React, { createContext, useContext, useRef } from 'react';

interface RefreshContextType {
  homeRefreshRef: React.MutableRefObject<(() => void) | null>;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const homeRefreshRef = useRef<(() => void) | null>(null);

  return (
    <RefreshContext.Provider value={{ homeRefreshRef }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};
