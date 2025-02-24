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
  // 主题配置
  theme: 'light' | 'dark';
  // 应用配置
  app: {
    port: number;
    isDevelopment: boolean;
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
  theme: 'light',
  app: {
    port: 3000,
    isDevelopment: process.env.NODE_ENV === 'development',
  },
};

// 配置存储键
export const CONFIG_KEYS = {
  APP_CONFIG: 'app_config',
  AUTH: 'auth_state',
  CONVERSATIONS: 'conversations',
}; 