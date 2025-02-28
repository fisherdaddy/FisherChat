import React, { useState, useEffect, useRef } from 'react';
import { configService } from '../services/config';
import { apiService } from '../services/api';
import { themeService } from '../services/theme';
import { i18nService, LanguageType } from '../services/i18n';
import ErrorMessage from './ErrorMessage';
import { XMarkIcon, Cog6ToothIcon, PlusCircleIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { availableModels } from '../store/slices/modelSlice';
import ThemedSelect from './ui/ThemedSelect';

interface SettingsProps {
  onClose: () => void;
}

type TabType = 'general' | 'model' | 'shortcuts';

// Provider type to track the different model providers
type ProviderType = 'openai' | 'deepseek' | 'gemini';

// Model interface
interface Model {
  id: string;
  name: string;
}

// Provider configuration interface
interface ProviderConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  models?: Model[];
}

// Interface for multiple providers configuration
interface ProvidersConfig {
  openai: ProviderConfig;
  deepseek: ProviderConfig;
  gemini: ProviderConfig;
  [key: string]: ProviderConfig;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  // 状态
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<LanguageType>('zh');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for active provider
  const [activeProvider, setActiveProvider] = useState<ProviderType>('openai');
  
  // Add state for providers configuration
  const [providers, setProviders] = useState<ProvidersConfig>({
    openai: {
      enabled: true,
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
      ]
    },
    deepseek: {
      enabled: false,
      apiKey: '',
      baseUrl: 'https://api.deepseek.com',
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat' },
        { id: 'deepseek-coder', name: 'DeepSeek Coder' }
      ]
    },
    gemini: {
      enabled: false,
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1',
      models: [
        { id: 'gemini-pro', name: 'Gemini Pro' },
        { id: 'gemini-ultra', name: 'Gemini Ultra' }
      ]
    }
  });
  
  // 创建引用来确保内容区域的滚动
  const contentRef = useRef<HTMLDivElement>(null);
  // 为拖拽功能创建引用
  const dragRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  // 添加位置状态
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 300 });
  // 添加拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 快捷键设置
  const [shortcuts, setShortcuts] = useState({
    newChat: 'Ctrl+N',
    search: 'Ctrl+F',
    settings: 'Ctrl+,',
  });

  const selectedModel = useSelector((state: RootState) => state.model.selectedModel);

  // State for model editing
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [newModelId, setNewModelId] = useState('');

  useEffect(() => {
    try {
      const config = configService.getConfig();
      
      // Set general settings
      setTheme(config.theme);
      setLanguage(config.language);
      
      // Set up providers based on saved config
      if (config.api) {
        // For backward compatibility with older config
        setApiKey(config.api.key);
        setBaseUrl(config.api.baseUrl);
        
        // Initialize active provider based on baseUrl
        if (config.api.baseUrl.includes('openai')) {
          setActiveProvider('openai');
          setProviders(prev => ({
            ...prev,
            openai: {
              ...prev.openai,
              enabled: true,
              apiKey: config.api.key,
              baseUrl: config.api.baseUrl
            }
          }));
        } else if (config.api.baseUrl.includes('deepseek')) {
          setActiveProvider('deepseek');
          setProviders(prev => ({
            ...prev,
            deepseek: {
              ...prev.deepseek,
              enabled: true,
              apiKey: config.api.key,
              baseUrl: config.api.baseUrl
            }
          }));
        } else if (config.api.baseUrl.includes('googleapis')) {
          setActiveProvider('gemini');
          setProviders(prev => ({
            ...prev,
            gemini: {
              ...prev.gemini,
              enabled: true,
              apiKey: config.api.key,
              baseUrl: config.api.baseUrl
            }
          }));
        }
      }
      
      // Load provider-specific configurations if available
      if (config.providers) {
        setProviders(config.providers);
      }
      
      // 加载快捷键设置
      if (config.shortcuts) {
        setShortcuts(config.shortcuts);
      }
    } catch (error) {
      setError('Failed to load settings');
    }
  }, []);

  // 添加拖拽功能的事件处理器
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && settingsRef.current) {
        // 计算新位置
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // 确保窗口不会超出屏幕
        const maxX = window.innerWidth - settingsRef.current.offsetWidth;
        const maxY = window.innerHeight - settingsRef.current.offsetHeight;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 开始拖拽的处理函数
  const handleDragStart = (e: React.MouseEvent) => {
    if (settingsRef.current) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // 监听标签页切换，确保内容区域滚动到顶部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Handle provider change
  const handleProviderChange = (provider: ProviderType) => {
    setActiveProvider(provider);
  };

  // Handle provider configuration change
  const handleProviderConfigChange = (provider: ProviderType, field: string, value: string) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  // Toggle provider enabled status
  const toggleProviderEnabled = (provider: ProviderType) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Find the first enabled provider to use as the primary API
      const firstEnabledProvider = Object.entries(providers).find(
        ([_, config]) => config.enabled
      );
      
      const primaryProvider = firstEnabledProvider 
        ? firstEnabledProvider[1] 
        : providers[activeProvider];
      
      await configService.updateConfig({
        api: {
          key: primaryProvider.apiKey,
          baseUrl: primaryProvider.baseUrl,
        },
        providers: providers, // Save all providers configuration
        theme,
        language,
        shortcuts,
      });

      // 应用主题
      themeService.setTheme(theme);
      
      // 应用语言
      i18nService.setLanguage(language);

      // Set API with the primary provider
      apiService.setConfig({
        apiKey: primaryProvider.apiKey,
        baseUrl: primaryProvider.baseUrl,
      });

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // 标签页切换处理
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // 快捷键更新处理
  const handleShortcutChange = (key: keyof typeof shortcuts, value: string) => {
    setShortcuts(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 阻止点击设置窗口时事件传播到背景
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handlers for model operations
  const handleAddModel = () => {
    setIsAddingModel(true);
    setNewModelName('');
    setNewModelId('');
  };

  const handleEditModel = (modelId: string, modelName: string) => {
    setIsEditingModel(true);
    setEditingModelId(modelId);
    setNewModelName(modelName);
    setNewModelId(modelId);
  };

  const handleDeleteModel = (modelId: string) => {
    if (!providers[activeProvider].models) return;
    
    const updatedModels = providers[activeProvider].models.filter(
      model => model.id !== modelId
    );
    
    setProviders(prev => ({
      ...prev,
      [activeProvider]: {
        ...prev[activeProvider],
        models: updatedModels
      }
    }));
  };

  const handleSaveNewModel = () => {
    if (!newModelName.trim() || !newModelId.trim()) return;
    
    if (!providers[activeProvider].models) {
      setProviders(prev => ({
        ...prev,
        [activeProvider]: {
          ...prev[activeProvider],
          models: [{ id: newModelId, name: newModelName }]
        }
      }));
    } else {
      const updatedModels = [...providers[activeProvider].models];
      
      if (isEditingModel && editingModelId) {
        // Edit existing model
        const modelIndex = updatedModels.findIndex(model => model.id === editingModelId);
        if (modelIndex !== -1) {
          updatedModels[modelIndex] = { id: newModelId, name: newModelName };
        }
      } else {
        // Add new model
        updatedModels.push({ id: newModelId, name: newModelName });
      }
      
      setProviders(prev => ({
        ...prev,
        [activeProvider]: {
          ...prev[activeProvider],
          models: updatedModels
        }
      }));
    }
    
    setIsAddingModel(false);
    setIsEditingModel(false);
    setEditingModelId(null);
  };

  const handleCancelModelEdit = () => {
    setIsAddingModel(false);
    setIsEditingModel(false);
    setEditingModelId(null);
  };

  // 渲染标签页
  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <ThemedSelect
                id="theme"
                value={theme}
                onChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                options={[
                  { value: 'light', label: i18nService.t('light') },
                  { value: 'dark', label: i18nService.t('dark') },
                  { value: 'system', label: i18nService.t('system') }
                ]}
                label={i18nService.t('theme')}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemedSelect
                id="language"
                value={language}
                onChange={(value) => setLanguage(value as LanguageType)}
                options={[
                  { value: 'zh', label: i18nService.t('chinese') },
                  { value: 'en', label: i18nService.t('english') }
                ]}
                label={i18nService.t('language')}
              />
            </div>
            
            <div className="h-28"></div>
            {/* 可添加其他通用设置 */}
          </div>
        );
      
      case 'model':
        return (
          <div className="flex h-full">
            {/* Provider List - Left Side */}
            <div className="w-2/5 border-r dark:border-slate-700 border-slate-200 pr-3 space-y-1.5 overflow-y-auto">
              <h3 className="text-sm font-medium dark:text-slate-300 text-slate-700 mb-2 px-1">
                {i18nService.t('modelProviders')}
              </h3>
              {Object.entries(providers).map(([provider, config]) => (
                <div 
                  key={provider}
                  onClick={() => handleProviderChange(provider as ProviderType)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                    activeProvider === provider 
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 dark:border-blue-500/40' 
                      : 'dark:hover:bg-slate-800/70 hover:bg-slate-100/70 dark:bg-slate-900 bg-white dark:border-slate-700/70 border-slate-200/70 border'
                  }`}
                >
                  <div className="flex flex-1 items-center">
                    <div className="mr-2 flex-shrink-0 text-slate-700 dark:text-slate-300">
                      {provider === 'openai' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.051 6.051 0 0 0 6.0572-2.9631l.0467-.0934a6.0462 6.0462 0 0 0 .7475-7.0729l-.047-.0934zm-9.022 12.6081a4.4558 4.4558 0 0 1-2.8536-1.0263l.1395-.0794 4.7342-2.7301a.7948.7948 0 0 0 .3927-.6813v-6.6934l2.0037 1.1516a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4545 4.4243zm-9.6607-4.1268a4.4777 4.4777 0 0 1-.5346-3.0137l.142.0829 4.7299 2.7301a.7712.7712 0 0 0 .7806 0l5.7388-3.3074v2.3006a.0804.0804 0 0 1-.0332.0615L9.74 19.9502l-.142.0829a4.4777 4.4777 0 0 1-6.007-1.6267zM2.0786 8.10114a4.504 4.504 0 0 1 2.3741-1.9728v5.8662a.7664.7664 0 0 0 .3879.6765l5.7433 3.3066-2.0036 1.1533a.0757.0757 0 0 1-.071 0l-4.6565-2.6917-.142-.0829a4.504 4.504 0 0 1-1.6332-5.3552zm16.1248 3.8923-5.7388-3.3032 2.0037-1.145a.0757.0757 0 0 1 .071 0l4.6519 2.6917.142.0829a4.4558 4.4558 0 0 1-.73 8.0753v-5.862a.79.79 0 0 0-.3927-.6813zM17.7 7.29225l-.142-.0829-4.7299-2.7334a.7759.7759 0 0 0-.7806 0L6.2638 7.83525v-2.304a.0615.0615 0 0 1 .0332-.0568l4.6565-2.6917.142-.0829a4.5011 4.5011 0 0 1 6.6372 4.5896zM5.6879 11.9917l-2.0036-1.1516a.0757.0757 0 0 1-.038-.0568V5.23l.0427-.0615a4.4842 4.4842 0 0 1 4.4046-1.2898l-.142.0829-4.7299 2.7334a.7759.7759 0 0 0-.3784.6765zm1.0747-2.3481 2.5565-1.4745 2.5518 1.4745v2.949l-2.5518 1.4697-2.5565-1.4697z" fill="currentColor"/>
                        </svg>
                      )}
                      {provider === 'deepseek' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 4.6c0-.9933.8067-1.8 1.8-1.8h14.4c.9933 0 1.8.8067 1.8 1.8v14.4c0 .9933-.8067 1.8-1.8 1.8H4.8c-.9933 0-1.8-.8067-1.8-1.8V4.6zm9.5999 12.4c3.0928 0 5.6-2.5072 5.6-5.6 0-3.09279-2.5072-5.6-5.6-5.6-3.0928 0-5.6 2.50721-5.6 5.6 0 3.0928 2.5072 5.6 5.6 5.6z" fill="currentColor"/>
                        </svg>
                      )}
                      {provider === 'gemini' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.4375 21L5.4375 3L9.2885 3L12.5195 10.488L12.7695 10.488L15.9915 3L19.8425 3L19.8425 21L17.3425 21L17.3425 7.032L17.0925 7.032L14.1475 13.578L11.1425 13.578L8.1885 7.032L7.9385 7.032L7.9385 21L5.4375 21Z" fill="currentColor"/>
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium truncate ${
                      activeProvider === provider 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'dark:text-slate-300 text-slate-700'
                    }`}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center ml-2">
                    <div 
                      className={`w-7 h-4 rounded-full flex items-center transition-colors ${
                        config.enabled ? 'bg-blue-500' : 'dark:bg-slate-700 bg-slate-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProviderEnabled(provider as ProviderType);
                      }}
                    >
                      <div 
                        className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform ${
                          config.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Provider Settings - Right Side */}
            <div className="w-3/5 pl-4 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b dark:border-slate-700 border-slate-200">
                <h3 className="text-base font-medium dark:text-white text-slate-900">
                  {activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1)} {i18nService.t('providerSettings')}
                </h3>
                <div 
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    providers[activeProvider].enabled 
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {providers[activeProvider].enabled ? i18nService.t('enabled') : i18nService.t('disabled')}
                </div>
              </div>
              
              <div>
                <label htmlFor={`${activeProvider}-apiKey`} className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                  {i18nService.t('apiKey')}
                </label>
                <input
                  type="password"
                  id={`${activeProvider}-apiKey`}
                  value={providers[activeProvider].apiKey}
                  onChange={(e) => handleProviderConfigChange(activeProvider, 'apiKey', e.target.value)}
                  className="block w-full rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 border dark:focus:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-white text-slate-900 px-3 py-2 text-xs"
                  placeholder={i18nService.t('apiKeyPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor={`${activeProvider}-baseUrl`} className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1">
                  {i18nService.t('baseUrl')}
                </label>
                <input
                  type="text"
                  id={`${activeProvider}-baseUrl`}
                  value={providers[activeProvider].baseUrl}
                  onChange={(e) => handleProviderConfigChange(activeProvider, 'baseUrl', e.target.value)}
                  className="block w-full rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 border dark:focus:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-white text-slate-900 px-3 py-2 text-xs"
                  placeholder={i18nService.t('baseUrlPlaceholder')}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-medium dark:text-slate-300 text-slate-700">
                    {i18nService.t('availableModels')}
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddModel}
                    className="inline-flex items-center text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <PlusCircleIcon className="h-3.5 w-3.5 mr-1" />
                    {i18nService.t('addModel')}
                  </button>
                </div>
                
                {/* Model Add/Edit Form */}
                {(isAddingModel || isEditingModel) && (
                  <div className="mb-3 p-2.5 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <h4 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                      {isEditingModel ? i18nService.t('editModel') : i18nService.t('addNewModel')}
                    </h4>
                    <div className="space-y-1.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                          {i18nService.t('modelName')}
                        </label>
                        <input
                          type="text"
                          value={newModelName}
                          onChange={(e) => setNewModelName(e.target.value)}
                          className="block w-full rounded-md dark:bg-slate-700 bg-white border-slate-300 dark:border-slate-600 text-xs py-1.5"
                          placeholder="GPT-4"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                          {i18nService.t('modelId')}
                        </label>
                        <input
                          type="text"
                          value={newModelId}
                          onChange={(e) => setNewModelId(e.target.value)}
                          className="block w-full rounded-md dark:bg-slate-700 bg-white border-slate-300 dark:border-slate-600 text-xs py-1.5"
                          placeholder="gpt-4"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={handleCancelModelEdit}
                          className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        >
                          {i18nService.t('cancel')}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNewModel}
                          className="px-2 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded"
                        >
                          {i18nService.t('save')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Models List */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {providers[activeProvider].models?.map(model => (
                    <div 
                      key={model.id} 
                      className="dark:bg-slate-800/50 bg-slate-100/50 p-2 rounded-lg dark:border-slate-700 border-slate-200 border transition-colors hover:border-blue-400 dark:hover:border-blue-400 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                          <span className="dark:text-white text-slate-900 font-medium text-[11px]">{model.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md dark:text-slate-300 text-slate-600">{model.id}</span>
                          <button
                            type="button"
                            onClick={() => handleEditModel(model.id, model.name)}
                            className="p-0.5 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModel(model.id)}
                            className="p-0.5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!providers[activeProvider].models || providers[activeProvider].models.length === 0) && (
                    <div className="dark:bg-slate-800/20 bg-slate-100/20 p-2.5 rounded-lg border dark:border-slate-700/50 border-slate-200/50 text-center">
                      <p className="text-[11px] dark:text-slate-400 text-slate-500">{i18nService.t('noModelsAvailable')}</p>
                      <button
                        type="button"
                        onClick={handleAddModel}
                        className="mt-1.5 inline-flex items-center text-[11px] font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <PlusCircleIcon className="h-3 w-3 mr-1" />
                        {i18nService.t('addFirstModel')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'shortcuts':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-3">
                {i18nService.t('keyboardShortcuts')}
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-slate-300 text-slate-700">{i18nService.t('newChat')}</span>
                  <input
                    type="text"
                    value={shortcuts.newChat}
                    onChange={(e) => handleShortcutChange('newChat', e.target.value)}
                    className="w-32 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 border dark:focus:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-white text-slate-900 px-3 py-1.5 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-slate-300 text-slate-700">{i18nService.t('search')}</span>
                  <input
                    type="text"
                    value={shortcuts.search}
                    onChange={(e) => handleShortcutChange('search', e.target.value)}
                    className="w-32 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 border dark:focus:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-white text-slate-900 px-3 py-1.5 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm dark:text-slate-300 text-slate-700">{i18nService.t('openSettings')}</span>
                  <input
                    type="text"
                    value={shortcuts.settings}
                    onChange={(e) => handleShortcutChange('settings', e.target.value)}
                    className="w-32 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 border dark:focus:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:text-white text-slate-900 px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      onClick={onClose}
    >
      <div 
        ref={settingsRef}
        style={{ 
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '600px',
          maxHeight: '80vh',
        }}
        className="pointer-events-auto flex flex-col dark:bg-slate-900 bg-white rounded-xl dark:border-slate-700 border-slate-200 border shadow-xl overflow-hidden"
        onClick={handleSettingsClick}
      >
        <div 
          ref={dragRef}
          className="flex justify-between items-center px-6 py-4 dark:border-slate-800 border-slate-200 border-b cursor-move dark:bg-slate-900 bg-white"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Cog6ToothIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold dark:text-white text-slate-900">{i18nService.t('settings')}</h2>
          </div>
          
          <button
            onClick={onClose}
            className="dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 p-1.5 dark:hover:bg-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="px-6 pt-4">
            <ErrorMessage
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}
        
        {/* 标签页导航 */}
        <div className="flex px-6 dark:border-slate-700 border-slate-200 border-b shrink-0">
          <button
            onClick={() => handleTabChange('general')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent dark:text-slate-400 text-slate-500 dark:hover:text-slate-300 hover:text-slate-700'
            }`}
          >
            {i18nService.t('general')}
          </button>
          <button
            onClick={() => handleTabChange('model')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'model'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent dark:text-slate-400 text-slate-500 dark:hover:text-slate-300 hover:text-slate-700'
            }`}
          >
            {i18nService.t('model')}
          </button>
          <button
            onClick={() => handleTabChange('shortcuts')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'shortcuts'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent dark:text-slate-400 text-slate-500 dark:hover:text-slate-300 hover:text-slate-700'
            }`}
          >
            {i18nService.t('shortcuts')}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* 标签页内容 - 使用固定高度并添加滚动 */}
          <div 
            ref={contentRef}
            className="px-6 py-5 flex-1 overflow-y-auto"
          >
            {renderTabContent()}
          </div>
          
          {/* 底部按钮 - 固定在底部 */}
          <div className="flex justify-end space-x-4 p-4 dark:border-slate-800 border-slate-200 border-t dark:bg-slate-900 bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 dark:text-slate-300 text-slate-600 dark:hover:text-white hover:text-slate-900 rounded-lg dark:hover:bg-slate-800 hover:bg-slate-100 transition-colors text-sm font-medium"
            >
              {i18nService.t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? i18nService.t('saving') : i18nService.t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 