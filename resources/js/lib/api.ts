import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
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
            // Не делаем автоматический редирект, пусть компоненты сами решают что делать
        }

        return Promise.reject(error);
    },
);

// Вспомогательная функция для SPA-аутентификации Sanctum: гарантируем CSRF cookie перед мутациями
async function ensureCsrfCookie(): Promise<void> {
    const token = Cookies.get('XSRF-TOKEN');
    if (!token) {
        // Важно: csrf-cookie находится на корне, вне baseURL '/api'
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    }
}

const ensureLeadingSlash = (url: string): string =>
    url.startsWith('/') ? url : `/${url}`;

// Утилиты для работы с API
export const apiClient = {
    get: <T = unknown>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> =>
        api.get<T>(ensureLeadingSlash(url), config),

    getAbsolute: <T = unknown>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> =>
        api.get<T>(ensureLeadingSlash(url), {
            ...(config ?? {}),
            baseURL: '',
        }),

    post: async <T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => {
        await ensureCsrfCookie();
        return api.post<T>(ensureLeadingSlash(url), data, config);
    },

    postAbsolute: async <T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => {
        await ensureCsrfCookie();
        return api.post<T>(ensureLeadingSlash(url), data, {
            ...(config ?? {}),
            baseURL: '',
        });
    },

    put: async <T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => {
        await ensureCsrfCookie();
        return api.put<T>(ensureLeadingSlash(url), data, config);
    },

    patch: async <T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => {
        await ensureCsrfCookie();
        return api.patch<T>(ensureLeadingSlash(url), data, config);
    },

    patchAbsolute: async <T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => {
        await ensureCsrfCookie();
        return api.patch<T>(ensureLeadingSlash(url), data, {
            ...(config ?? {}),
            baseURL: '',
        });
    },

    delete: async <T = unknown>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => {
        await ensureCsrfCookie();
        return api.delete<T>(ensureLeadingSlash(url), config);
    },

    deleteAbsolute: async <T = unknown>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> => {
        await ensureCsrfCookie();
        return api.delete<T>(ensureLeadingSlash(url), {
            ...(config ?? {}),
            baseURL: '',
        });
    },

    // Специальные методы для работы с файлами
    uploadFile: <T = unknown>(
        url: string,
        file: File,
        fieldName: string = 'file',
    ): Promise<AxiosResponse<T>> => {
        const formData = new FormData();
        formData.append(fieldName, file);

        return api.post<T>(ensureLeadingSlash(url), formData, {
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

        return api.post<T>(ensureLeadingSlash(url), formData, {
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
        const fullUrl = queryString
            ? `${ensureLeadingSlash(url)}?${queryString}`
            : ensureLeadingSlash(url);

        return api.get<T>(fullUrl);
    },
};
