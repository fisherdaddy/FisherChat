import React, { useState, useEffect } from 'react';
import { configService } from '../services/config';
import { apiService } from '../services/api';
import ErrorMessage from './ErrorMessage';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const config = configService.getConfig();
      setApiKey(config.api.key);
      setBaseUrl(config.api.baseUrl);
      setTheme(config.theme);
    } catch (error) {
      setError('Failed to load settings');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await configService.updateConfig({
        api: {
          key: apiKey,
          baseUrl,
        },
        theme,
      });

      apiService.setConfig({
        apiKey,
        baseUrl,
      });

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-secondary-dark rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
        {error && (
          <div className="mb-4">
            <ErrorMessage
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-gray-700 border-transparent focus:border-primary focus:ring-2 focus:ring-primary text-white px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-300">
              API Base URL
            </label>
            <input
              type="text"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-gray-700 border-transparent focus:border-primary focus:ring-2 focus:ring-primary text-white px-4 py-2"
            />
          </div>
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-300">
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="mt-1 block w-full rounded-lg bg-gray-700 border-transparent focus:border-primary focus:ring-2 focus:ring-primary text-white px-4 py-2"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 