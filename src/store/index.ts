import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import authReducer, { initAuth } from './slices/authSlice';
import modelReducer from './slices/modelSlice';
import { chatService } from '../services/chat';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    model: modelReducer,
  },
  preloadedState: {
    chat: {
      conversations: [],
      currentConversationId: null,
      isLoading: false,
    },
    auth: {
      user: null,
      isAuthenticated: false,
      token: null,
    },
  },
});

// 初始化服务
(async () => {
  try {
    // 初始化认证状态
    const authState = await initAuth();
    store.dispatch({
      type: 'auth/restoreAuth',
      payload: authState,
    });

    // 初始化聊天服务
    await chatService.init();
    store.dispatch({
      type: 'chat/setConversations',
      payload: chatService.getConversations(),
    });
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
})();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 