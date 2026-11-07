import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  colors: {
    primary: '#FFFF00',
    secondary: '#FFAE00',
    background: '#242424',
    text: '#EEEEEE',
    headerBackground: '#454545',
  },
  theme: 'system',
};

const LayoutContext = createContext(DEFAULT_SETTINGS);

export const LayoutProvider = ({ children }) => {
  const [appearance, setAppearance] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const appAppearanceSettings = JSON.parse(localStorage.getItem('appAppearanceSettings'));
      if (appAppearanceSettings) setAppearance(appAppearanceSettings);
    } catch {}
  }, []);

  return (
    <LayoutContext.Provider value={appearance}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);

export default LayoutContext;