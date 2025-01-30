"use client";
import { useSettings } from '@/contexts/SettingsContext';

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const LOCALES = [
  { code: 'de-DE', name: 'German' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
];

const DATE_FORMATS = [
  { code: 'dd/MM/yyyy', name: 'DD/MM/YYYY' },
  { code: 'MM/dd/yyyy', name: 'MM/DD/YYYY' },
  { code: 'yyyy-MM-dd', name: 'YYYY-MM-DD' },
];

export default function Settings() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-20">
      <h1 className="text-3xl font-bold text-gray-300 mb-8">Settings</h1>
      
      <div className="bg-gray-900 rounded-lg p-6 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Currency</h2>
          <select
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
            className="bg-gray-800 text-white px-4 py-2 rounded-md w-full max-w-xs"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Number Format</h2>
          <select
            value={settings.locale}
            onChange={(e) => updateSettings({ locale: e.target.value })}
            className="bg-gray-800 text-white px-4 py-2 rounded-md w-full max-w-xs"
          >
            {LOCALES.map((locale) => (
              <option key={locale.code} value={locale.code}>
                {locale.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Date Format</h2>
          <select
            value={settings.dateFormat}
            onChange={(e) => updateSettings({ dateFormat: e.target.value })}
            className="bg-gray-800 text-white px-4 py-2 rounded-md w-full max-w-xs"
          >
            {DATE_FORMATS.map((format) => (
              <option key={format.code} value={format.code}>
                {format.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 