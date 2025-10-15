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
    ): Promise<AxiosResponse<T>> => api.get<T>(url, config),

    post: <T = unknown>(
        url: string,
        data?: unknown,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.post<T>(url, data, config),

    put: <T = unknown>(
        url: string,
        data?: unknown,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.put<T>(url, data, config),

    patch: <T = unknown>(
        url: string,
        data?: unknown,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.patch<T>(url, data, config),

    delete: <T = unknown>(
        url: string,
        config?: Record<string, unknown>,
    ): Promise<AxiosResponse<T>> => api.delete<T>(url, config),

    // Специальные методы для работы с файлами
    uploadFile: <T = unknown>(
        url: string,
        file: File,
        fieldName: string = 'file',
    ): Promise<AxiosResponse<T>> => {
        const formData = new FormData();
        formData.append(fieldName, file);

        return api.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    uploadMultipleFiles: <T = unknown>(
        url: string,
        files: File[],
        fieldName: string = 'files',
    ): Promise<AxiosResponse<T>> => {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`${fieldName}[${index}]`, file);
        });

        return api.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Методы для работы с пагинацией
    getPaginated: <T = unknown>(
        url: string,
        params: {
            page?: number;
            per_page?: number;
            search?: string;
            [key: string]: unknown;
        } = {},
    ): Promise<AxiosResponse<T>> => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        return api.get<T>(fullUrl);
    },
};
