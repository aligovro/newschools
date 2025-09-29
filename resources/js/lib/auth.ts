import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Token management
export const tokenManager = {
    getToken(): string | null {
        return localStorage.getItem('access_token');
    },

    setToken(token: string): void {
        localStorage.setItem('access_token', token);
    },

    removeToken(): void {
        localStorage.removeItem('access_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};

// Add request interceptor to include token
apiClient.interceptors.request.use(
    (config) => {
        const token = tokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await apiClient.post('/refresh');
                const { access_token } = refreshResponse.data;

                tokenManager.setToken(access_token);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                tokenManager.removeToken();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

// Auth service
export const authService = {
    async login(email: string, password: string) {
        const response = await apiClient.post('/login', { email, password });
        const { access_token, user } = response.data;

        tokenManager.setToken(access_token);
        return { user, access_token };
    },

    async logout() {
        try {
            await apiClient.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            tokenManager.removeToken();
        }
    },

    async getCurrentUser() {
        const response = await apiClient.get('/user');
        return response.data.user;
    },

    async refreshToken() {
        const response = await apiClient.post('/refresh');
        const { access_token } = response.data;
        tokenManager.setToken(access_token);
        return access_token;
    },
};

// Export the configured axios instance
export default apiClient;
