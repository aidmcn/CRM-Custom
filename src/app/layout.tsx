import "./globals.css";
import type { Metadata } from 'next';
import { SettingsProvider } from '@/contexts/SettingsContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CRM Custom',
  description: 'Custom CRM Solution',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-900 text-white">
                <SettingsProvider>
                    <Navbar />
                    {children}
                </SettingsProvider>
            </body>
        </html>
    );
}
