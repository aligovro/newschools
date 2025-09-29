// Типы для Redux store
import { store } from '@/store';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

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

// Типы для состояния приложения
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
}

export interface AppState {
    isLoading: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    sidebarOpen: boolean;
    notifications: Notification[];
    currentPage: string;
}

// Типы для API ответов
export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

// Типы для ошибок
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status: number;
}

// Типы для форм
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordData {
    email: string;
}

export interface ChangePasswordData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface ProfileData {
    name: string;
    email: string;
}

// Типы для организаций
export interface Organization {
    id: number;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
}

// Типы для проектов
export interface Project {
    id: number;
    title: string;
    description: string;
    goal_amount: number;
    current_amount: number;
    deadline: string;
    status: 'active' | 'completed' | 'cancelled';
    organization_id: number;
    created_at: string;
    updated_at: string;
}

// Типы для пожертвований
export interface Donation {
    id: number;
    amount: number;
    donor_name: string;
    donor_email: string;
    message?: string;
    project_id: number;
    status: 'pending' | 'completed' | 'failed';
    payment_method: string;
    created_at: string;
    updated_at: string;
}

// Типы для платежей
export interface PaymentMethod {
    id: number;
    name: string;
    type: 'card' | 'bank_transfer' | 'digital_wallet';
    is_active: boolean;
    config: Record<string, unknown>;
}

export interface PaymentTransaction {
    id: number;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_method: string;
    transaction_id?: string;
    created_at: string;
    updated_at: string;
}
