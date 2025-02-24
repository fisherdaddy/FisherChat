import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  addMessage,
  updateMessage,
  addConversation,
  Message,
} from '../store/slices/chatSlice';
import { chatService } from '../services/chat';
import { ApiError } from '../services/api';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';
import ErrorMessage from './ErrorMessage';
import ModelSelector from './ModelSelector';

const TypingIndicator: React.FC = () => (
  <div className="flex space-x-2 p-2">
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

const Chat: React.FC = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAiMessageId, setCurrentAiMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentConversationId = useSelector((state: RootState) => state.chat.currentConversationId);
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const onProgress = (content: string) => {
    if (currentAiMessageId) {
      dispatch(updateMessage({
        conversationId: currentConversationId!,
        messageId: currentAiMessageId,
        content,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let targetConversationId = currentConversationId;
    if (!targetConversationId) {
      const newConversation = chatService.createConversation();
      dispatch(addConversation(newConversation));
      targetConversationId = newConversation.id;
    }

    setInput('');
    setIsLoading(true);
    let tempAiMessageId: string | null = null;
    
    try {
      const aiMessage = await chatService.sendMessage(targetConversationId, input.trim(), (content) => {
        if (tempAiMessageId) {
          dispatch(updateMessage({
            conversationId: targetConversationId,
            messageId: tempAiMessageId,
            content,
          }));
        }
      });
      tempAiMessageId = aiMessage.id;
      setCurrentAiMessageId(aiMessage.id);
    } finally {
      setIsLoading(false);
      setCurrentAiMessageId(null);
    }
  };

  const renderMessage = (message: Message) => (
    <div
      key={message.id}
      className={`py-6 px-4 ${message.role === 'assistant' ? 'bg-[#444654]' : ''}`}
    >
      <div className={`max-w-3xl mx-auto flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-2xl flex items-start space-x-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
            message.role === 'user' ? 'bg-[#5437DB]' : 'bg-[#19C37D]'
          }`}>
            {message.role === 'user' ? 'U' : 'A'}
          </div>
          <div className="whitespace-pre-wrap text-white">
            {message.content || (message.role === 'assistant' && message.id === currentAiMessageId && <TypingIndicator />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentConversationId) {
    return (
      <div className="flex-1 flex flex-col bg-[#343541] relative">
        {/* Header with Model Selector */}
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 bg-[#343541] border-b border-gray-700 z-10">
          <ModelSelector />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pt-12 pb-36">
          {error && (
            <div className="sticky top-0 z-10">
              <ErrorMessage message={error} onClose={() => setError(null)} />
            </div>
          )}
          <div className="max-w-3xl mx-auto">
            {/* Welcome Message */}
            <div className="py-10 px-4">
              <div className="max-w-3xl mx-auto flex justify-center">
                <div className="text-center text-gray-400">
                  <h2 className="text-2xl font-bold mb-2">FisherChat</h2>
                  <p>How can I help you today?</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#343541] via-[#343541] to-transparent">
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="给 FisherChat 发送消息..."
                    rows={1}
                    className="w-full resize-none rounded-xl bg-[#40414F] text-white placeholder-gray-400 p-3 pr-12 focus:outline-none shadow-lg"
                    style={{
                      minHeight: '44px',
                      maxHeight: '200px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-1.5 flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <MicrophoneIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className={`p-1 rounded-lg ${
                        isLoading || !input.trim()
                          ? 'text-gray-400'
                          : 'text-white bg-[#19C37D] hover:bg-[#1a8870]'
                      }`}
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#343541] relative h-full">
      {/* Header with Model Selector */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#343541] border-b border-gray-700 z-10 shrink-0">
        <ModelSelector />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {error && (
          <div className="sticky top-0 z-10">
            <ErrorMessage message={error} onClose={() => setError(null)} />
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          {(!currentConversation?.messages || currentConversation.messages.length === 0) ? (
            // Welcome Message when no messages
            <div className="py-10 px-4">
              <div className="max-w-3xl mx-auto flex justify-center">
                <div className="text-center text-gray-400">
                  <h2 className="text-2xl font-bold mb-2">FisherChat</h2>
                  <p>How can I help you today?</p>
                </div>
              </div>
            </div>
          ) : (
            // Conversation Messages
            currentConversation.messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 bg-[#343541] py-4 px-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="给 FisherChat 发送消息..."
                  rows={1}
                  className="w-full resize-none rounded-xl bg-[#40414F] text-white placeholder-gray-400 p-3 pr-12 focus:outline-none shadow-lg"
                  style={{
                    minHeight: '44px',
                    maxHeight: '200px',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="absolute right-2 bottom-1.5 flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <MicrophoneIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`p-1 rounded-lg ${
                      isLoading || !input.trim()
                        ? 'text-gray-400'
                        : 'text-white bg-[#19C37D] hover:bg-[#1a8870]'
                    }`}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 