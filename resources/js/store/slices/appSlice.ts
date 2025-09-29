import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Типы для состояния приложения
export interface AppState {
    isLoading: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    sidebarOpen: boolean;
    notifications: Notification[];
    currentPage: string;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
}

// Начальное состояние
const initialState: AppState = {
    isLoading: false,
    theme: 'system',
    language: 'ru',
    sidebarOpen: true,
    notifications: [],
    currentPage: '',
};

// Slice
const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setTheme: (
            state,
            action: PayloadAction<'light' | 'dark' | 'system'>,
        ) => {
            state.theme = action.payload;
        },
        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        addNotification: (
            state,
            action: PayloadAction<
                Omit<Notification, 'id' | 'timestamp' | 'read'>
            >,
        ) => {
            const notification: Notification = {
                ...action.payload,
                id: Date.now().toString(),
                timestamp: Date.now(),
                read: false,
            };
            state.notifications.unshift(notification);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload,
            );
        },
        markNotificationAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(
                (n) => n.id === action.payload,
            );
            if (notification) {
                notification.read = true;
            }
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        setCurrentPage: (state, action: PayloadAction<string>) => {
            state.currentPage = action.payload;
        },
    },
});

export const {
    setLoading,
    setTheme,
    setLanguage,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearNotifications,
    setCurrentPage,
} = appSlice.actions;

export default appSlice.reducer;
