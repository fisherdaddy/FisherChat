import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Settings from './components/Settings';
import { configService } from './services/config';
import { apiService } from './services/api';
import { themeService } from './services/theme';
import { chatService } from './services/chat';
import { addConversation } from './store/slices/chatSlice';
import type { ApiConfig } from './services/api';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { i18nService } from './services/i18n';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const currentConversationId = useSelector((state: RootState) => state.chat.currentConversationId);
  const conversations = useSelector((state: RootState) => state.chat.conversations);

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 初始化配置
        await configService.init();
        
        // 初始化主题
        themeService.initialize();
        
        // 初始化语言
        i18nService.initialize();
        
        const config = await configService.getConfig();
        
        // 检查是否有必要的配置
        if (!config.api?.key) {
          setInitError(i18nService.t('apiKeyNotConfigured'));
          setShowSettings(true);
          setIsInitialized(true);
          return;
        }

        const apiConfig: ApiConfig = {
          apiKey: config.api.key,
          baseUrl: config.api.baseUrl,
        };
        apiService.setConfig(apiConfig);
        
        // 初始化聊天服务
        await chatService.init();
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(i18nService.t('initializationError'));
        setIsInitialized(true);
      }
    };

    initializeApp();

    // 添加DOMContentLoaded事件处理程序，确保DOM完全加载后应用主题
    const handleDOMLoaded = () => {
      const config = configService.getConfig();
      themeService.setTheme(config.theme);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMLoaded);
    } else {
      handleDOMLoaded();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMLoaded);
    };
  }, []);

  // 确保应用初始化后，如果没有对话，创建一个新的空对话
  useEffect(() => {
    if (isInitialized && !initError && conversations.length === 0) {
      const newConversation = chatService.createConversation();
      dispatch(addConversation(newConversation));
    }
  }, [isInitialized, initError, conversations.length, dispatch]);

  // 监听主题变化
  useEffect(() => {
    // 为了确保主题应用在所有主题交互之后
    const applyThemeTimeoutId = setTimeout(() => {
      const config = configService.getConfig();
      themeService.setTheme(config.theme);
    }, 100);

    return () => {
      clearTimeout(applyThemeTimeoutId);
    };
  }, [isInitialized]);

  const handleShowLogin = () => {
    // Login is handled directly in the Sidebar component with a notification
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    
    // 设置窗口关闭后，重新应用主题
    const config = configService.getConfig();
    themeService.setTheme(config.theme);
  };

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-slate-900 bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg animate-pulse">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div className="dark:text-white text-slate-900 text-xl font-medium">{i18nService.t('loading')}</div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center dark:bg-slate-900 bg-slate-50">
        <div className="flex flex-col items-center space-y-6 max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <div className="dark:text-white text-slate-900 text-xl font-medium text-center">{initError}</div>
          <button 
            onClick={() => setShowSettings(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium"
          >
            {i18nService.t('openSettings')}
          </button>
        </div>
        {showSettings && <Settings onClose={handleCloseSettings} />}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col dark:bg-slate-900 bg-slate-50">
      
      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar onShowLogin={handleShowLogin} onShowSettings={handleShowSettings} />
        <div className="flex-1 relative dark:bg-slate-900 bg-slate-50">
          <Chat />
        </div>
      </div>
      
      {/* 设置窗口显示在所有主内容之上，但不影响主界面的交互 */}
      {showSettings && <Settings onClose={handleCloseSettings} />}
    </div>
  );
};

export default App; 