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
    <div className={`bg-[#202123] flex flex-col ${isCollapsed ? 'w-[60px]' : 'w-[260px]'} transition-all duration-300 h-full`}>
      {/* Search and Collapse Section */}
      <div className="flex items-center space-x-2 p-2 shrink-0">
        <div className={`relative flex-1 ${isCollapsed ? 'hidden' : 'block'}`}>
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="搜索历史对话"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#2d2d30] text-white rounded-md text-sm focus:outline-none"
          />
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-800 rounded-md"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-2 shrink-0">
        <button
          onClick={handleNewChat}
          className={`flex items-center space-x-2 w-full p-2 bg-[#2d2d30] hover:bg-gray-800 rounded-md text-gray-300 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <PlusIcon className="h-5 w-5" />
          {!isCollapsed && <span>新建对话</span>}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => handleSelectConversation(conversation.id)}
            className={`p-2 mx-2 my-1 flex items-center space-x-2 cursor-pointer rounded-md ${
              conversation.id === currentConversationId
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <ChatBubbleLeftIcon className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <span className="truncate text-sm">{conversation.title || 'New Chat'}</span>
            )}
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="border-t border-gray-700 p-2 shrink-0">
        <button
          onClick={onShowLogin}
          className={`flex items-center space-x-2 w-full p-2 hover:bg-gray-800 rounded-md text-gray-300 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <UserCircleIcon className="h-5 w-5" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span>User</span>
              {!isAuthenticated && <span className="text-xs text-gray-500">点击登录</span>}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 