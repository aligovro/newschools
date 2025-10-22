import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Типы для аутентификации
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
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
        credentials: { email: string; password: string },
        { rejectWithValue },
    ) => {
        try {
            const response = await axios.post('/api/auth/login', credentials);
            const { token, user } = response.data;

            // Сохраняем токен в localStorage
            localStorage.setItem('token', token);

            return { token, user };
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
            email: string;
            password: string;
            password_confirmation: string;
            organization_id?: number;
            site_id?: number;
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            // Устанавливаем заголовок авторизации по умолчанию
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { token, user };
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
            await axios.post('/api/auth/logout');
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
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Токен не найден');
            }

            const response = await axios.get('/api/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error: any) {
            localStorage.removeItem('token');
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
        setCredentials: (
            state,
            action: PayloadAction<{ token: string; user: User }>,
        ) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
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
                state.token = action.payload.token;
                state.error = null;
                // Устанавливаем заголовок авторизации по умолчанию для axios
                (axios.defaults.headers.common as any)['Authorization'] =
                    `Bearer ${action.payload.token}`;
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
                state.token = action.payload.token;
                state.error = null;
                (axios.defaults.headers.common as any)['Authorization'] =
                    `Bearer ${action.payload.token}`;
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
            // Сбрасываем заголовок авторизации
            delete (axios.defaults.headers.common as any)['Authorization'];
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
