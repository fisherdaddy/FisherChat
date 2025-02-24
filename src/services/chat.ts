import { v4 as uuidv4 } from 'uuid';
import { localStore } from './store';
import { apiService, ApiError } from './api';
import { Message, Conversation } from '../store/slices/chatSlice';
import { store } from '../store';
import { addMessage, updateMessage } from '../store/slices/chatSlice';

const CONVERSATIONS_KEY = 'conversations';

export class ChatError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ChatError';
  }
}

class ChatService {
  private conversations: Conversation[] = [];

  async init() {
    try {
      const storedConversations = await localStore.getItem<Conversation[]>(CONVERSATIONS_KEY);
      if (storedConversations) {
        this.conversations = storedConversations;
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  getConversations(): Conversation[] {
    return this.conversations;
  }

  private async saveConversations() {
    try {
      await localStore.setItem(CONVERSATIONS_KEY, this.conversations);
    } catch (error) {
      console.error('Failed to save conversations:', error);
      throw new ChatError('Failed to save conversation data');
    }
  }

  createConversation(title: string = 'New Chat'): Conversation {
    const conversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations.unshift(conversation);
    this.saveConversations().catch(error => {
      console.error('Failed to save conversation:', error);
    });
    
    return conversation;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    onProgress?: (content: string) => void
  ): Promise<Message> {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'Error: Conversation not found',
        role: 'assistant',
        timestamp: Date.now(),
      };
      store.dispatch(addMessage({ conversationId, message: errorMessage }));
      return errorMessage;
    }

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };

    const aiMessage: Message = {
      id: uuidv4(),
      content: '',
      role: 'assistant',
      timestamp: Date.now(),
    };

    // 添加用户消息和空的 AI 消息到 Redux store
    store.dispatch(addMessage({ conversationId, message: userMessage }));
    store.dispatch(addMessage({ conversationId, message: aiMessage }));
    
    // 创建新的消息数组
    this.conversations = this.conversations.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: [...c.messages, userMessage, aiMessage],
          updatedAt: Date.now()
        };
      }
      return c;
    });
    
    await this.saveConversations();

    try {
      const response = await apiService.chat(content, (progressContent) => {
        // 更新 AI 消息内容
        store.dispatch(updateMessage({
          conversationId,
          messageId: aiMessage.id,
          content: progressContent,
        }));

        // 更新本地存储中的消息内容
        const message = conversation.messages.find(m => m.id === aiMessage.id);
        if (message) {
          message.content = progressContent;
        }

        onProgress?.(progressContent);
      });

      // 修改这部分代码，创建新的对象而不是直接修改
      this.conversations = this.conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.map(m => 
              m.id === aiMessage.id ? { ...m, content: response } : m
            ),
            updatedAt: Date.now()
          };
        }
        return c;
      });
      
      await this.saveConversations();
      return aiMessage;
    } catch (error) {
      const errorContent = error instanceof ApiError 
        ? `抱歉，请求出现错误：${error.message}`
        : '抱歉，服务出现异常，请稍后再试。';

      // 同样修改错误处理部分
      this.conversations = this.conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.map(m => 
              m.id === aiMessage.id ? { ...m, content: errorContent } : m
            ),
            updatedAt: Date.now()
          };
        }
        return c;
      });
      
      await this.saveConversations();
      return aiMessage;
    }
  }

  async deleteConversation(conversationId: string) {
    try {
      this.conversations = this.conversations.filter(c => c.id !== conversationId);
      await this.saveConversations();
    } catch (error) {
      throw new ChatError('Failed to delete conversation');
    }
  }

  async updateConversationTitle(conversationId: string, title: string) {
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.title = title;
        conversation.updatedAt = Date.now();
        await this.saveConversations();
      } else {
        throw new ChatError('Conversation not found');
      }
    } catch (error) {
      if (error instanceof ChatError) {
        throw error;
      }
      throw new ChatError('Failed to update conversation title');
    }
  }
}

export const chatService = new ChatService(); 