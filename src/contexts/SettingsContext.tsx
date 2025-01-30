"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface Settings {
    theme: 'light' | 'dark';
    currency: {
        code: string;
        symbol: string;
        name: string;
    };
    locale: string;
    // Add more settings as needed
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>({
        theme: 'dark',
        currency: {
            code: 'USD',
            symbol: '$',
            name: 'US Dollar'
        },
        locale: 'en-US',
    });

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
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