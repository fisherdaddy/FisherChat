import { store } from '../store';

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private config: ApiConfig | null = null;

  setConfig(config: ApiConfig) {
    this.config = config;
  }

  async chat(message: string, onProgress?: (content: string) => void): Promise<string> {
    if (!this.config) {
      throw new ApiError('API configuration not set. Please configure your API settings in the settings menu.');
    }

    if (!this.config.apiKey) {
      throw new ApiError('API key is not configured. Please set your API key in the settings menu.');
    }

    try {
      const selectedModel = store.getState().model.selectedModel;

      console.log('>>>>>', this.config.baseUrl);

      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          // 'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [{ role: 'user', content: message }],
          stream: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        let errorMessage = 'API request failed';
        if (data.error?.message) {
          errorMessage = data.error.message;
        }
        throw new ApiError(errorMessage, response.status, data);
      }

      if (!response.body) {
        throw new ApiError('No response received from the API. Please try again.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onProgress?.(fullContent);
              }
            } catch (e) {
              console.warn('Failed to parse SSE message:', e);
            }
          }
        }
      }

      if (!fullContent) {
        throw new ApiError('No content received from the API. Please try again.');
      }

      return fullContent;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError('Network error. Please check your internet connection and try again.');
      }

      throw new ApiError('An unexpected error occurred while calling the API. Please try again.');
    }
  }
}

export const apiService = new ApiService(); 