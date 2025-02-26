import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { addConversation, setCurrentConversation } from '../store/slices/chatSlice';
import { chatService } from '../services/chat';

interface SidebarProps {
  onShowLogin: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onShowLogin }) => {
  const dispatch = useDispatch();
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const currentConversationId = useSelector((state: RootState) => state.chat.currentConversationId);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredConversations = conversations
    .filter(conversation =>
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className={`bg-slate-950 flex flex-col ${isCollapsed ? 'w-[60px]' : 'w-[260px]'} transition-all duration-300 h-full border-r border-slate-800`}>
      {/* Search and Collapse Section */}
      <div className="flex items-center space-x-2 p-2 shrink-0">
        <div className={`relative flex-1 ${isCollapsed ? 'hidden' : 'block'}`}>
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="搜索历史对话"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
          />
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
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
          className={`flex items-center space-x-2 w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <PlusIcon className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">新建对话</span>}
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
                ? 'bg-slate-800/80 text-white'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
              <ChatBubbleLeftIcon className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <span className="truncate text-sm">{conversation.title || 'New Chat'}</span>
            )}
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="border-t border-slate-800 p-2 shrink-0">
        <button
          onClick={onShowLogin}
          className={`flex items-center space-x-2 w-full p-2.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <UserCircleIcon className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span className="font-medium">User</span>
              {!isAuthenticated && <span className="text-xs text-slate-400">点击登录</span>}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 