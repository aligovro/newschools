import axios, {
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'js-cookie';

// Создаем экземпляр axios с базовой конфигурацией
const api: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
    withCredentials: true, // Важно для работы с cookies в SPA
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Интерцептор для запросов - добавляем токен авторизации
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Для SPA приложений с Sanctum используем cookies вместо Bearer токена
        // CSRF токен добавляется автоматически через cookies
        const csrfToken = Cookies.get('XSRF-TOKEN');
        if (csrfToken && config.headers) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Интерцептор для ответов - обрабатываем ошибки авторизации
api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error(
            'API Error:',
            error.config?.url,
            error.response?.status,
            error.response?.data,
        );
        if (error.response?.status === 401) {
            console.log('API request failed with 401 - user not authenticated');
            // Не делаем автоматический редирект, пусть компоненты сами решают что делать
        }

        return Promise.reject(error);
    },
);

// Утилиты для работы с API
export const apiClient = {
    get: <T = unknown>(
        url: string,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.get(url, config),

    post: <T = unknown>(
        url: string,
        data?: unknown,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.post(url, data, config),

    put: <T = unknown>(
        url: string,
        data?: unknown,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.put(url, data, config),

    patch: <T = unknown>(
        url: string,
        data?: unknown,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.patch(url, data, config),

    delete: <T = unknown>(
        url: string,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.delete(url, config),
};

export default api;
