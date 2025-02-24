# FisherChat

<div align="center">

![FisherChat Logo](public/logo.png)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/fisherdaddy/fisherchat.svg)](https://github.com/fisherdaddy/fisherchat/stargazers)

</div>

FisherChat 是一个基于 Electron 和 React 构建的现代化桌面聊天应用程序。它提供了一个简洁、高效的聊天界面，支持跨平台使用。

## ✨ 特性

- 🚀 基于 Electron + React + Vite 构建
- 💡 TypeScript 支持
- 🎨 使用 Tailwind CSS 构建的现代化 UI
- 🔐 本地数据存储
- 🌈 跨平台支持 (Windows, macOS, Linux)
- ⚡️ 快速响应的用户界面
- 🛡 类型安全

## 🚀 快速开始

### 前置要求

- Node.js (>= 18.0.0)
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/fisherdaddy/fisherchat.git

# 进入项目目录
cd fisherchat

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run electron:dev
```

### 构建

```bash
# 构建应用
npm run build
```

## 🔨 开发指南

### 项目结构

```
fisherchat/
├── src/              # React 源代码
├── electron/         # Electron 主进程代码
├── public/           # 静态资源
├── scripts/         # 构建脚本
└── ...
```

### 技术栈

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规范
- 组件使用函数式组件和 Hooks
- 使用 Tailwind CSS 进行样式开发

## 📝 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目基于 Apache License 2.0 开源协议。查看 [LICENSE](LICENSE) 了解更多信息。

---

如果你觉得这个项目对你有帮助，欢迎给一个 ⭐️ Star！ 