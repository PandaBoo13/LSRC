// src/api/axiosConfig.ts
import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// ==================== HOST CONFIG ====================
/** Host backend — đổi 1 chỗ duy nhất khi deploy */
export const API_HOST = 'http://localhost:8080';
export const API_BASE_URL = `${API_HOST}/api`;

// ==================== TYPES ====================
interface QueueItem {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}

interface ApiResponse<T = any> {
    status?: string;
    message?: string;
    error?: string;
    data?: T;
}

// ==================== CREATE INSTANCE ====================
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,           // ✅ dùng biến
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// ==================== STATE ====================
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

// ==================== HELPERS ====================
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const extractErrorMessage = (response: any): string => {
    return response?.data?.message || response?.data?.error || 'Có lỗi xảy ra';
};

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log('🔵 Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request Error:', error.message);
        return Promise.reject(error);
    }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
    (response) => {
        if (response.data?.status === 'error') {
            const error = new Error(extractErrorMessage(response)) as AxiosError;
            error.response = response;
            return Promise.reject(error);
        }
        return response;
    },
    async (error: AxiosError) => {
        if (error.response?.data) {
            error.message = extractErrorMessage(error.response);
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || originalRequest?._retry || !originalRequest) {
            return Promise.reject(error);
        }

        const authUrls = ['/auth/login', '/auth/refresh-token', '/auth/register', '/auth/logout'];
        if (authUrls.some(url => originalRequest.url?.includes(url))) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            console.log('⏳ Đang refresh token, đưa request vào hàng đợi:', originalRequest.url);
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                console.log('🔄 Retry request từ hàng đợi:', originalRequest.url);
                return api(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            console.log('⚠️ Access token hết hạn, đang gọi refresh-token...');
            await api.post('/auth/refresh-token');
            console.log('✅ Refresh thành công, cookie mới đã được set');

            processQueue(null);
            isRefreshing = false;

            return api(originalRequest);
        } catch (refreshError) {
            console.error('❌ Refresh thất bại - Refresh token không tồn tại hoặc hết hạn');
            processQueue(refreshError);
            isRefreshing = false;

            if (typeof window !== 'undefined') {
                console.log('🔴 Chuyển hướng về trang login...');
                // window.location.href = '/login';
            }

            return Promise.reject(refreshError);
        }
    }
);

export default api;