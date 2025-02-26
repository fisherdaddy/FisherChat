import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Login from './components/Login';
import Settings from './components/Settings';
import { configService } from './services/config';
import { apiService } from './services/api';
import type { ApiConfig } from './services/api';
import { SparklesIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // 初始化配置
  useEffect(() => {
    const initApp = async () => {
      try {
        await configService.init();
        const config = await configService.getConfig();
        
        // 检查是否有必要的配置
        if (!config.api?.key) {
          setInitError('API key not configured. Please set up your API key in settings.');
          setShowSettings(true);
          setIsInitialized(true);
          return;
        }

        const apiConfig: ApiConfig = {
          apiKey: config.api.key,
          baseUrl: config.api.baseUrl,
        };
        apiService.setConfig(apiConfig);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError('Failed to initialize application. Please check your configuration.');
        setIsInitialized(true);
      }
    };

    initApp();
  }, []);

  const handleShowLogin = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
    }
  };

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg animate-pulse">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div className="text-white text-xl font-medium">加载中...</div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-6 max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <div className="text-white text-xl font-medium text-center">{initError}</div>
          <button 
            onClick={() => setShowSettings(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium"
          >
            打开设置
          </button>
        </div>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      
      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar onShowLogin={handleShowLogin} />
        <div className="flex-1 relative">
          <Chat />
        </div>
      </div>
      
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default App; 