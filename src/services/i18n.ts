import { configService } from './config';

// 支持的语言类型
export type LanguageType = 'zh' | 'en';

// 语言文本映射
const translations: Record<LanguageType, Record<string, string>> = {
  zh: {
    // 通用
    save: '保存',
    cancel: '取消',
    saving: '保存中...',
    user: '用户',
    login: '登录',
    inDevelopment: '正在开发中',
    
    // 设置
    settings: '设置',
    general: '通用',
    model: '模型',
    shortcuts: '快捷键',
    theme: '主题',
    language: '语言',
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    chinese: '中文',
    english: 'English',
    
    // API设置
    apiKey: 'API Key',
    apiKeyPlaceholder: '输入你的 API Key',
    baseUrl: 'API Base URL',
    baseUrlPlaceholder: '输入 API 基础 URL',
    currentModel: '当前模型',
    availableModels: '可用模型列表',
    modelSwitchHint: '在聊天界面可以切换使用的模型',
    
    // 模型提供商设置
    enabled: '已启用',
    disabled: '已禁用',
    providerSettings: '提供商设置',
    modelProviders: '模型提供商',
    addModel: '添加模型',
    editModel: '编辑模型',
    addNewModel: '添加新模型',
    modelName: '模型名称',
    modelId: '模型ID',
    noModelsAvailable: '暂无可用模型',
    addFirstModel: '添加第一个模型',
    
    // 快捷键
    keyboardShortcuts: '键盘快捷键',
    newChat: '新建对话',
    search: '搜索',
    openSettings: '打开设置',
    
    // 错误信息
    failedToLoadSettings: '加载设置失败',
    failedToSaveSettings: '保存设置失败',
    
    // 加载状态
    loading: '加载中...',
    
    // 侧边栏
    conversations: '对话',
    noConversations: '暂无对话',
    createNewChat: '新建对话',
    deleteConversation: '删除对话',
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除这个对话吗？此操作不可撤销。',
    searchConversations: '搜索对话...',
    
    // 聊天窗口
    sendMessage: '发送消息',
    typeMessage: '输入消息...',
    regenerateResponse: '重新生成回复',
    copyToClipboard: '复制到剪贴板',
    messageCopied: '消息已复制',
    clearConversation: '清空对话',
    confirmClearConversation: '确定要清空当前对话吗？此操作不可撤销。',
    today: '今天',
    yesterday: '昨天',
    daysAgo: '天前',
    justNow: '刚刚',
    minutesAgo: '分钟前',
    hoursAgo: '小时前',
    welcomeMessage: '我能帮你做什么呢？',
    thinking: '思考中...',
    editMessage: '编辑消息',
    emptyMessage: '空消息',
    
    // 模型选择
    selectModel: '选择模型',
    
    // 错误提示
    errorOccurred: '发生错误',
    tryAgain: '请重试',
    networkError: '网络错误',
    apiKeyRequired: '需要设置API密钥',
    configureApiKey: '请在设置中配置您的API密钥',
    
    // 初始化
    initializationError: '初始化应用程序失败。请检查您的配置。',
    apiKeyNotConfigured: 'API密钥未配置。请在设置中设置您的API密钥。'
  },
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    user: 'User',
    login: 'Login',
    inDevelopment: 'In development',
    
    // Settings
    settings: 'Settings',
    general: 'General',
    model: 'Model',
    shortcuts: 'Shortcuts',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    chinese: 'Chinese',
    english: 'English',
    
    // API Settings
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter your API Key',
    baseUrl: 'API Base URL',
    baseUrlPlaceholder: 'Enter API Base URL',
    currentModel: 'Current Model',
    availableModels: 'Available Models',
    modelSwitchHint: 'You can switch models in the chat interface',
    
    // Model Provider Settings
    enabled: 'Enabled',
    disabled: 'Disabled',
    providerSettings: 'Provider Settings',
    modelProviders: 'Model Providers',
    addModel: 'Add Model',
    editModel: 'Edit Model',
    addNewModel: 'Add New Model',
    modelName: 'Model Name',
    modelId: 'Model ID',
    noModelsAvailable: 'No models available',
    addFirstModel: 'Add First Model',
    
    // Shortcuts
    keyboardShortcuts: 'Keyboard Shortcuts',
    newChat: 'New Chat',
    search: 'Search',
    openSettings: 'Open Settings',
    
    // Error Messages
    failedToLoadSettings: 'Failed to load settings',
    failedToSaveSettings: 'Failed to save settings',
    
    // Loading State
    loading: 'Loading...',
    
    // Sidebar
    conversations: 'Conversations',
    noConversations: 'No conversations',
    createNewChat: 'New Chat',
    deleteConversation: 'Delete Conversation',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this conversation? This action cannot be undone.',
    searchConversations: 'Search conversations...',
    
    // Chat Window
    sendMessage: 'Send Message',
    typeMessage: 'Type a message...',
    regenerateResponse: 'Regenerate Response',
    copyToClipboard: 'Copy to Clipboard',
    messageCopied: 'Message copied',
    clearConversation: 'Clear Conversation',
    confirmClearConversation: 'Are you sure you want to clear the current conversation? This action cannot be undone.',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    welcomeMessage: 'How can I help you today?',
    thinking: 'Thinking...',
    editMessage: 'Edit message',
    emptyMessage: 'Empty message',
    
    // Model Selection
    selectModel: 'Select Model',
    
    // Error Messages
    errorOccurred: 'An error occurred',
    tryAgain: 'Please try again',
    networkError: 'Network error',
    apiKeyRequired: 'API Key Required',
    configureApiKey: 'Please configure your API key in settings',
    
    // Initialization
    initializationError: 'Failed to initialize application. Please check your configuration.',
    apiKeyNotConfigured: 'API key not configured. Please set up your API key in settings.'
  }
};

class I18nService {
  private currentLanguage: LanguageType = 'zh';
  
  constructor() {
    // 默认使用中文
    this.currentLanguage = 'zh';
  }
  
  // 初始化语言设置
  initialize(): void {
    try {
      const config = configService.getConfig();
      if (config.language && (config.language === 'zh' || config.language === 'en')) {
        this.currentLanguage = config.language;
      } else {
        // 如果配置中没有语言设置或语言设置无效，默认使用中文
        this.currentLanguage = 'zh';
        
        // 更新配置以保存默认语言设置
        configService.updateConfig({
          ...config,
          language: 'zh'
        });
      }
    } catch (error) {
      console.error('Failed to initialize language:', error);
      // 默认使用中文
      this.currentLanguage = 'zh';
    }
  }
  
  // 设置语言
  setLanguage(language: LanguageType): void {
    this.currentLanguage = language;
    
    // 更新配置
    try {
      const config = configService.getConfig();
      configService.updateConfig({
        ...config,
        language
      });
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  }
  
  // 获取当前语言
  getLanguage(): LanguageType {
    return this.currentLanguage;
  }
  
  // 获取翻译文本
  t(key: string): string {
    const translation = translations[this.currentLanguage][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${this.currentLanguage}`);
      // 尝试从另一种语言获取
      const fallbackTranslation = translations[this.currentLanguage === 'zh' ? 'en' : 'zh'][key];
      return fallbackTranslation || key;
    }
    return translation;
  }
}

export const i18nService = new I18nService(); 