import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { addConversation, setCurrentConversation } from '../store/slices/chatSlice';
import { chatService } from '../services/chat';
import { i18nService } from '../services/i18n';

interface SidebarProps {
  onShowLogin: () => void;
  onShowSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onShowLogin, onShowSettings }) => {
  const dispatch = useDispatch();
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const currentConversationId = useSelector((state: RootState) => state.chat.currentConversationId);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // 创建引用来跟踪用户菜单的DOM元素
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  // 添加登录按钮的引用
  const loginButtonRef = useRef<HTMLButtonElement>(null);

  // 添加点击外部区域关闭菜单的功能
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUserMenu && 
        userMenuRef.current && 
        userButtonRef.current && 
        !userMenuRef.current.contains(event.target as Node) && 
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    // 添加全局点击事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    
    // 组件卸载时移除事件监听器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleNewChat = () => {
    // 检查是否存在空的对话（没有任何消息的对话）
    const emptyConversation = conversations.find(c => c.messages.length === 0);
    
    if (emptyConversation) {
      // 如果存在空对话，直接切换到该对话
      dispatch(setCurrentConversation(emptyConversation.id));
    } else {
      // 如果不存在空对话，创建新对话
      const newConversation = chatService.createConversation();
      dispatch(addConversation(newConversation));
    }
  };

  const handleSelectConversation = (id: string) => {
    dispatch(setCurrentConversation(id));
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLoginClick = () => {
    setShowUserMenu(false);
    
    // Create the notification
    const notification = document.createElement('div');
    notification.className = 'fixed bg-slate-800 text-white py-2 px-4 rounded-lg shadow-lg z-50';
    notification.innerText = i18nService.t('inDevelopment');
    
    // Position the notification
    if (loginButtonRef.current) {
      const buttonRect = loginButtonRef.current.getBoundingClientRect();
      notification.style.left = `${buttonRect.left}px`;
      notification.style.top = `${buttonRect.top - 40}px`;
      notification.style.width = `${buttonRect.width}px`;
      notification.style.textAlign = 'center';
    } else if (userButtonRef.current) {
      const buttonRect = userButtonRef.current.getBoundingClientRect();
      notification.style.left = `${buttonRect.left}px`;
      notification.style.top = `${buttonRect.top - 40}px`;
      notification.style.width = `${buttonRect.width}px`;
      notification.style.textAlign = 'center';
    }
    
    // Add animation
    notification.style.animation = 'fadeInOut 2s ease-in-out forwards';
    
    // Add the animation styles
    if (!document.getElementById('notificationAnimation')) {
      const style = document.createElement('style');
      style.id = 'notificationAnimation';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(20px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 2000);
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    onShowSettings();
  };

  const filteredConversations = conversations
    .filter(conversation =>
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className={`dark:bg-slate-900 bg-slate-100 flex flex-col ${isCollapsed ? 'w-[60px]' : 'w-[260px]'} transition-all duration-300 h-full border-r dark:border-slate-800 border-slate-300`}>
      {/* Search and Collapse Section */}
      <div className="flex items-center space-x-2 p-2 shrink-0 dark:bg-slate-900 bg-slate-100">
        <div className={`relative flex-1 ${isCollapsed ? 'hidden' : 'block'}`}>
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 dark:text-slate-400 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder={i18nService.t('searchConversations')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 dark:bg-slate-800 bg-white dark:text-white text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 border-slate-300 border"
          />
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 dark:hover:bg-slate-800 hover:bg-slate-200 rounded-lg dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-2 shrink-0">
        <button
          onClick={handleNewChat}
          className={`flex items-center space-x-2 w-full p-2.5 dark:bg-slate-800 bg-white dark:hover:bg-slate-700 hover:bg-slate-200 dark:border-slate-700 border-slate-300 border rounded-lg dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <PlusIcon className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">{i18nService.t('createNewChat')}</span>}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => handleSelectConversation(conversation.id)}
            className={`p-2 mx-2 my-1 flex items-center space-x-2 cursor-pointer rounded-lg transition-colors ${
              conversation.id === currentConversationId
                ? 'dark:bg-slate-800/80 bg-slate-200/80 dark:text-white text-slate-900'
                : 'dark:text-slate-300 text-slate-700 dark:hover:bg-slate-800/50 hover:bg-slate-200/50'
            }`}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
              <ChatBubbleLeftIcon className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <span className="truncate text-sm">{conversation.title || i18nService.t('newChat')}</span>
            )}
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="p-2 shrink-0 relative dark:bg-slate-900 bg-slate-100">
        <button
          ref={userButtonRef}
          onClick={handleUserClick}
          className={`flex items-center space-x-2 w-full p-2.5 rounded-lg dark:text-slate-300 text-slate-700 dark:hover:bg-slate-800 hover:bg-slate-200 dark:hover:text-white hover:text-slate-900 transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <UserCircleIcon className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex items-center justify-between">
              <span className="font-medium">{i18nService.t('user')}</span>
            </div>
          )}
        </button>

        {/* User Menu */}
        {showUserMenu && !isCollapsed && (
          <div 
            ref={userMenuRef}
            className="absolute bottom-full mb-1 left-2 right-2 dark:bg-slate-800 bg-white rounded-lg shadow-lg dark:border-slate-700 border-slate-300 border overflow-hidden z-10"
          >
            <button
              onClick={handleSettingsClick}
              className="flex items-center space-x-3 w-full p-2.5 dark:hover:bg-slate-700 hover:bg-slate-100 dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 transition-colors"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              <span>{i18nService.t('settings')}</span>
            </button>
            <button
              ref={loginButtonRef}
              onClick={handleLoginClick}
              className="flex items-center space-x-3 w-full p-2.5 dark:hover:bg-slate-700 hover:bg-slate-100 dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 transition-colors"
            >
              <UserCircleIcon className="h-5 w-5" />
              <span>{i18nService.t('login')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 