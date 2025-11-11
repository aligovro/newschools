import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Типы для аутентификации
export interface User {
    id: number;
    name: string;
    email: string | null;
    phone?: string | null;
    photo?: string | null;
    email_verified_at?: string | null;
    phone_verified_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Начальное состояние
const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async thunks для API запросов
export const loginUser = createAsyncThunk(
    'auth/login',
    async (
        credentials: { login: string; password: string },
        { rejectWithValue },
    ) => {
        try {
            // Используем веб-авторизацию через сессии
            const response = await axios.post('/api/auth/login', credentials, {
                withCredentials: true, // Важно для работы с cookies/сессиями
            });
            const { user } = response.data;

            // После авторизации получаем пользователя из сессии
            const userResponse = await axios.get('/api/auth/me', {
                withCredentials: true,
            });

            return { user: userResponse.data || user };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Ошибка входа',
            );
        }
    },
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (
        userData: {
            name: string;
            email?: string | null;
            phone?: string | null;
            password: string;
            password_confirmation: string;
            organization_id?: number;
            site_id?: number;
        },
        { rejectWithValue },
    ) => {
        try {
            // Используем веб-авторизацию через сессии
            const response = await axios.post('/api/auth/register', userData, {
                withCredentials: true, // Важно для работы с cookies/сессиями
            });
            const { user } = response.data;

            // После регистрации получаем пользователя из сессии
            const userResponse = await axios.get('/api/auth/me', {
                withCredentials: true,
            });

            return { user: userResponse.data || user };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Ошибка регистрации',
            );
        }
    },
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axios.post(
                '/api/auth/logout',
                {},
                {
                    withCredentials: true, // Важно для работы с cookies/сессиями
                },
            );
            localStorage.removeItem('token');
            return true;
        } catch (error: any) {
            localStorage.removeItem('token');
            return true; // Все равно выходим, даже если запрос не удался
        }
    },
);

export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            // Получаем пользователя из веб-сессии
            const response = await axios.get('/api/auth/me', {
                withCredentials: true, // Важно для работы с cookies/сессиями
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                    'Ошибка получения данных пользователя',
            );
        }
    },
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action: PayloadAction<{ user: User }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = null; // Токены больше не используются
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload as string;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = null; // Токены больше не используются
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload as string;
            });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;
        });

        // Fetch User
        builder
            .addCase(fetchUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
