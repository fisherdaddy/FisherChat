import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // 主进程入口文件
        entry: 'electron/main.ts',
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist-electron',
            minify: false,
          },
        },
        onstart(options) {
          options.reload();
        },
      },
      {
        // 预加载脚本入口文件
        entry: 'electron/preload.ts',
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist-electron',
            minify: false,
          },
        },
        onstart(options) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
  base: process.env.NODE_ENV === 'development' ? '/' : './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    hmr: {
      port: 5173,
    },
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    exclude: ['electron'],
  },
  clearScreen: false,
}); 