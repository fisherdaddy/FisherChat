import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
}

const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  isLoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
      state.currentConversationId = action.payload.id;
    },
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.messages.push(action.payload.message);
        conversation.updatedAt = Date.now();
        if (conversation.messages.length === 1 && action.payload.message.role === 'user') {
          conversation.title = action.payload.message.content.slice(0, 30) + (action.payload.message.content.length > 30 ? '...' : '');
        }
      }
    },
    updateMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string; content: string }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        const message = conversation.messages.find(m => m.id === action.payload.messageId);
        if (message) {
          message.content = action.payload.content;
          conversation.updatedAt = Date.now();
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(c => c.id !== action.payload);
      if (state.currentConversationId === action.payload) {
        state.currentConversationId = state.conversations[0]?.id || null;
      }
    },
  },
});

export const {
  setCurrentConversation,
  addConversation,
  addMessage,
  updateMessage,
  setLoading,
  deleteConversation,
} = chatSlice.actions;

export default chatSlice.reducer; 