"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  currency: string;
  locale: string;
  dateFormat: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  currency: 'EUR',
  locale: 'de-DE',
  dateFormat: 'dd/MM/yyyy'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(current => ({ ...current, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 