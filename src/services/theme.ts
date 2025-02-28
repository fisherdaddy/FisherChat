import { configService } from './config';

type ThemeType = 'light' | 'dark' | 'system';

class ThemeService {
  private mediaQuery: MediaQueryList | null = null;
  private currentTheme: ThemeType = 'system';

  constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
  }

  // 初始化主题
  initialize(): void {
    try {
      const config = configService.getConfig();
      this.setTheme(config.theme);
      
      // 监听系统主题变化
      if (this.mediaQuery) {
        this.mediaQuery.addEventListener('change', (e) => {
          if (this.currentTheme === 'system') {
            this.applyTheme(e.matches ? 'dark' : 'light');
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      // 默认使用系统主题
      this.setTheme('system');
    }
  }

  // 设置主题
  setTheme(theme: ThemeType): void {
    console.log(`Setting theme to: ${theme}`);
    this.currentTheme = theme;
    
    if (theme === 'system') {
      // 如果是系统主题，则根据系统设置应用
      const isDarkMode = this.mediaQuery?.matches;
      console.log(`System theme detected, using: ${isDarkMode ? 'dark' : 'light'}`);
      this.applyTheme(isDarkMode ? 'dark' : 'light');
    } else {
      // 直接应用指定主题
      this.applyTheme(theme);
    }
  }

  // 获取当前主题
  getTheme(): ThemeType {
    return this.currentTheme;
  }

  // 获取当前有效主题（实际应用的明/暗主题）
  getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  // 应用主题到DOM
  private applyTheme(theme: 'light' | 'dark'): void {
    console.log(`Applying theme: ${theme}`);
    const root = document.documentElement;
    
    if (theme === 'dark') {
      // Apply dark theme to HTML element (for Tailwind)
      root.classList.add('dark');
      root.classList.remove('light');
      
      // Make sure theme is consistent across entire DOM
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      
      // Set background and text colors
      root.style.backgroundColor = '#0f172a'; // slate-900
      document.body.style.backgroundColor = '#0f172a'; // slate-900
      document.body.style.color = 'white';
    } else {
      // Apply light theme to HTML element (for Tailwind)
      root.classList.remove('dark');
      root.classList.add('light');
      
      // Make sure theme is consistent across entire DOM
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      
      // Set background and text colors
      root.style.backgroundColor = '#f8fafc'; // slate-50
      document.body.style.backgroundColor = '#f8fafc'; // slate-50
      document.body.style.color = '#0f172a'; // slate-900
    }
    
    // Update CSS variables for color transition animations
    root.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease');
    document.body.style.transition = 'var(--theme-transition)';
    
    // Ensure #root element also gets the theme
    const rootElement = document.getElementById('root');
    if (rootElement) {
      if (theme === 'dark') {
        rootElement.classList.add('dark');
        rootElement.classList.remove('light');
        rootElement.style.backgroundColor = '#0f172a'; // slate-900
      } else {
        rootElement.classList.remove('dark');
        rootElement.classList.add('light');
        rootElement.style.backgroundColor = '#f8fafc'; // slate-50
      }
    }
  }
}

export const themeService = new ThemeService(); 