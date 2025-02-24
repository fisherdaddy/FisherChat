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
      <div className="h-screen flex items-center justify-center bg-[#343541]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#343541]">
        <div className="text-white text-xl mb-4">{initError}</div>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#343541]">
      {/* Window Controls */}
      <div className="h-8 flex items-center px-2 bg-[#1a1a1a] z-50 draggable shrink-0">
        <div className="flex space-x-2 non-draggable">
          <button
            onClick={() => window.electron.window.close()}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff4444]"
          />
          <button
            onClick={() => window.electron.window.minimize()}
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#ffaa00]"
          />
          <button
            onClick={() => window.electron.window.maximize()}
            className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#00aa00]"
          />
        </div>
      </div>
      
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