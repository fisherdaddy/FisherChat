import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import Store from 'electron-store';

// 设置应用程序名称
app.name = 'FisherChat';

// 配置应用
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('enable-logging');
app.commandLine.appendSwitch('v', '1');

// 禁用硬件加速
app.disableHardwareAcceleration();

// 配置网络服务
app.on('ready', () => {
  // 配置网络服务重启策略
  app.configureHostResolver({
    enableBuiltInResolver: true,
    secureDnsMode: 'off'
  });
});

// 添加错误处理
app.on('render-process-gone', (event, webContents, details) => {
  console.error('Render process gone:', details);
  // 尝试重新加载页面
  if (!webContents.isDestroyed()) {
    webContents.reload();
  }
});

app.on('child-process-gone', (event, details) => {
  console.error('Child process gone:', details);
  // 如果是关键进程崩溃，尝试重启应用
  if (details.type === 'GPU' || details.type === 'Utility') {
    console.log('Attempting to recover from process crash...');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.reload();
    }
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// 创建配置存储实例
const store = new Store();

// 保存对主窗口的引用
let mainWindow: BrowserWindow | null = null;

// 确保应用程序只有一个实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 如果尝试启动第二个实例，则聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // IPC 处理程序
  ipcMain.handle('store:get', (_event, key) => {
    return store.get(key);
  });

  ipcMain.handle('store:set', (_event, key, value) => {
    store.set(key, value);
  });

  ipcMain.handle('store:remove', (_event, key) => {
    store.delete(key);
  });

  // 获取正确的预加载脚本路径
  const PRELOAD_PATH = app.isPackaged 
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../dist-electron/preload.js');

  // 设置 Content Security Policy
  const setContentSecurityPolicy = () => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const isDev = process.env.NODE_ENV === 'development';
      const cspDirectives = [
        "default-src 'self'",
        isDev ? "script-src 'self' 'unsafe-inline' http://localhost:5173 ws://localhost:5173" : "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: http:",
        // 允许连接到所有域名，不做限制
        "connect-src *",
        "font-src 'self' data:",
        "media-src 'self'",
        "worker-src 'self' blob:",
        "frame-src 'self'"
      ];

      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': cspDirectives.join('; ')
        }
      });
    });
  };

  // 创建主窗口
  const createWindow = () => {
    // 如果窗口已经存在，就不再创建新窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      return;
    }

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: 'FisherChat',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        preload: PRELOAD_PATH,
        backgroundThrottling: false,
        devTools: process.env.NODE_ENV === 'development',
        spellcheck: false,
        enableWebSQL: false,
        autoplayPolicy: 'document-user-activation-required',
        disableDialogs: true,
        navigateOnDragDrop: false
      },
      backgroundColor: '#ffffff',
      show: false,
      autoHideMenuBar: true,
      enableLargerThanScreen: false
    });

    // 禁用窗口菜单
    mainWindow.setMenu(null);

    // 设置窗口的最小尺寸
    mainWindow.setMinimumSize(800, 600);

    // 设置窗口加载超时
    const loadTimeout = setTimeout(() => {
      if (mainWindow && !mainWindow.webContents.isLoadingMainFrame()) {
        console.log('Window load timed out, attempting to reload...');
        mainWindow.reload();
      }
    }, 30000);

    // 清除超时
    mainWindow.webContents.once('did-finish-load', () => {
      clearTimeout(loadTimeout);
    });

    // 处理窗口关闭
    mainWindow.on('close', (e) => {
      if (mainWindow) {
        e.preventDefault();
        mainWindow.hide();
      }
    });

    // 处理窗口崩溃
    mainWindow.webContents.on('crashed', () => {
      console.error('Window crashed, attempting to reload...');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
      }
    });

    if (process.env.NODE_ENV === 'development') {
      // 开发环境
      const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
      const maxRetries = 3;
      let retryCount = 0;

      const tryLoadURL = () => {
        mainWindow?.loadURL(startUrl).catch((err) => {
          console.error('Failed to load URL:', err);
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying to load URL (${retryCount}/${maxRetries})...`);
            setTimeout(tryLoadURL, 3000);
          } else {
            console.error('Failed to load URL after maximum retries');
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.loadFile(path.join(__dirname, '../public/error.html'));
            }
          }
        });
      };

      tryLoadURL();
      
      // 打开开发者工具
      mainWindow.webContents.openDevTools();
    } else {
      // 生产环境
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // 添加错误处理
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Page failed to load:', errorCode, errorDescription);
      // 如果加载失败，尝试重新加载
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          if (mainWindow) {
            const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
            mainWindow.loadURL(startUrl);
          }
        }, 3000);
      }
    });

    // 当窗口关闭时，清除引用
    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // 窗口控制
    ipcMain.on('window-minimize', () => {
      mainWindow?.minimize();
    });

    ipcMain.on('window-maximize', () => {
      if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow?.maximize();
      }
    });

    ipcMain.on('window-close', () => {
      mainWindow?.close();
    });

    // 等待内容加载完成后再显示窗口
    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
    });
  };

  // 初始化应用
  const initApp = async () => {
    await app.whenReady();
    
    // 设置安全策略
    setContentSecurityPolicy();
    
    // 创建窗口
    createWindow();

    // 在 macOS 上，当点击 dock 图标且没有其他窗口打开时，
    // 应用程序通常会重新创建一个窗口
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  };

  // 启动应用
  initApp().catch(console.error);

  // 当所有窗口关闭时退出应用
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
} 