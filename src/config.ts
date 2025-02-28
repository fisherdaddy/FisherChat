// 配置类型定义
export interface AppConfig {
  // API 配置
  api: {
    key: string;
    baseUrl: string;
  };
  // 模型配置
  model: {
    availableModels: Array<{
      id: string;
      name: string;
    }>;
    defaultModel: string;
  };
  // 多模型提供商配置
  providers?: {
    openai: {
      enabled: boolean;
      apiKey: string;
      baseUrl: string;
      models?: Array<{
        id: string;
        name: string;
      }>;
    };
    deepseek: {
      enabled: boolean;
      apiKey: string;
      baseUrl: string;
      models?: Array<{
        id: string;
        name: string;
      }>;
    };
    gemini: {
      enabled: boolean;
      apiKey: string;
      baseUrl: string;
      models?: Array<{
        id: string;
        name: string;
      }>;
    };
    [key: string]: {
      enabled: boolean;
      apiKey: string;
      baseUrl: string;
      models?: Array<{
        id: string;
        name: string;
      }>;
    };
  };
  // 主题配置
  theme: 'light' | 'dark' | 'system';
  // 语言配置
  language: 'zh' | 'en';
  // 应用配置
  app: {
    port: number;
    isDevelopment: boolean;
  };
  // 快捷键配置
  shortcuts?: {
    newChat: string;
    search: string;
    settings: string;
    [key: string]: string;
  };
}

// 默认配置
export const defaultConfig: AppConfig = {
  api: {
    key: 'sk-xxxx',
    baseUrl: 'https://api.deepseek.com',
  },
  model: {
    availableModels: [
      { id: 'deepseek-chat', name: 'deepseek-v3' },
      { id: 'deepseek-reasoner', name: 'deepseek-r1' },
    ],
    defaultModel: 'deepseek-chat',
  },
  theme: 'system',
  language: 'zh',
  app: {
    port: 3000,
    isDevelopment: process.env.NODE_ENV === 'development',
  },
  shortcuts: {
    newChat: 'Ctrl+N',
    search: 'Ctrl+F',
    settings: 'Ctrl+,',
  }
};

// 配置存储键
export const CONFIG_KEYS = {
  APP_CONFIG: 'app_config',
  AUTH: 'auth_state',
  CONVERSATIONS: 'conversations',
}; 