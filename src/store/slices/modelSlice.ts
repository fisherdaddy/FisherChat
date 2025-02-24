import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultConfig } from '../../config';

export interface Model {
  id: string;
  name: string;
}

// 从 config 中获取可用模型列表
export const availableModels: Model[] = defaultConfig.model.availableModels;

interface ModelState {
  selectedModel: Model;
}

const initialState: ModelState = {
  // 使用 config 中的默认模型
  selectedModel: availableModels.find(model => model.id === defaultConfig.model.defaultModel) || availableModels[0],
};

const modelSlice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    setSelectedModel: (state, action: PayloadAction<Model>) => {
      state.selectedModel = action.payload;
    },
  },
});

export const { setSelectedModel } = modelSlice.actions;
export default modelSlice.reducer; 