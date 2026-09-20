import axios from 'axios';

// Use local backend in development, production API in production
const baseURL = import.meta.env.DEV
  ? 'http://localhost:8081/api'
  : (import.meta.env.VITE_API_URL ?? 'https://lsrc.wisdombrain.org/api');

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lsrc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock auth for local development when backend is not available
const mockUsers: Record<string, { id: string; username: string; email: string; password: string }> = {};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // If backend is not available, use mock
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend not available, using mock auth');

      // Mock register
      if (config.url === '/account/register' && config.method === 'post') {
        const { username, password, email } = config.data;
        if (mockUsers[username]) {
          return Promise.resolve({ data: { status: 'error', message: 'Username already exists' } });
        }
        mockUsers[username] = {
          id: String(Object.keys(mockUsers).length + 1),
          username,
          email,
          password,
        };
        return Promise.resolve({
          data: { status: 'success', message: 'Account registered successfully.' },
        });
      }

      // Mock login
      if (config.url === '/account/login' && config.method === 'post') {
        const { username, password } = config.data;
        const user = mockUsers[username];
        if (user && user.password === password) {
          return Promise.resolve({
            data: {
              status: 'success',
              data: { token: { token: `mock-token-${user.id}` } },
            },
          });
        }
        return Promise.resolve({
          data: { status: 'error', message: 'Invalid username or password' },
        });
      }
    }

    return Promise.reject(error);
  }
);

export type ApiError = {
  message: string;
  status?: number;
};

export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message ?? error.message,
      status: error.response?.status,
    };
  }
  return { message: 'An unexpected error occurred' };
}
