import React, { useState, useEffect } from 'react';
import { configService } from '../services/config';
import { apiService } from '../services/api';
import ErrorMessage from './ErrorMessage';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Cog6ToothIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <div className="mb-4">
            <ErrorMessage
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-1.5">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="block w-full rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-white px-4 py-2.5 text-sm"
              placeholder="输入你的 API Key"
            />
          </div>
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-slate-300 mb-1.5">
              API Base URL
            </label>
            <input
              type="text"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="block w-full rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-white px-4 py-2.5 text-sm"
              placeholder="输入 API 基础 URL"
            />
          </div>
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-slate-300 mb-1.5">
              主题
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="block w-full rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-white px-4 py-2.5 text-sm"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 