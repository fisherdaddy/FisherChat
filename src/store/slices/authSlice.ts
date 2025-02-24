import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { localStore } from '../../services/store';

const AUTH_KEY = 'auth_state';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // 保存到本地存储
      localStore.setItem(AUTH_KEY, {
        user: action.payload,
        isAuthenticated: !!action.payload,
        token: state.token,
      });
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      // 保存到本地存储
      localStore.setItem(AUTH_KEY, {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: action.payload,
      });
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      // 清除本地存储
      localStore.removeItem(AUTH_KEY);
    },
    // 从本地存储恢复状态
    restoreAuth: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.token = action.payload.token;
    },
  },
});

export const { setUser, setToken, logout, restoreAuth } = authSlice.actions;

// 初始化函数
export const initAuth = async () => {
  try {
    const savedAuth = await localStore.getItem<AuthState>(AUTH_KEY);
    if (savedAuth) {
      return savedAuth;
    }
  } catch (error) {
    console.error('Failed to restore auth state:', error);
  }
  return initialState;
};

export default authSlice.reducer; 