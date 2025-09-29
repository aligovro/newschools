import { useAppDispatch, useAppSelector } from '@/store';
import {
    addNotification,
    clearNotifications,
    markNotificationAsRead,
    removeNotification,
    setCurrentPage,
    setLanguage,
    setLoading,
    setSidebarOpen,
    setTheme,
    toggleSidebar,
} from '@/store/slices/appSlice';
import { useCallback } from 'react';

export const useApp = () => {
    const dispatch = useAppDispatch();
    const {
        isLoading,
        theme,
        language,
        sidebarOpen,
        notifications,
        currentPage,
    } = useAppSelector((state) => state.app);

    const showLoading = useCallback(
        (loading: boolean) => {
            dispatch(setLoading(loading));
        },
        [dispatch],
    );

    const changeTheme = useCallback(
        (newTheme: 'light' | 'dark' | 'system') => {
            dispatch(setTheme(newTheme));
        },
        [dispatch],
    );

    const changeLanguage = useCallback(
        (newLanguage: string) => {
            dispatch(setLanguage(newLanguage));
        },
        [dispatch],
    );

    const toggleSidebarMenu = useCallback(() => {
        dispatch(toggleSidebar());
    }, [dispatch]);

    const setSidebarState = useCallback(
        (open: boolean) => {
            dispatch(setSidebarOpen(open));
        },
        [dispatch],
    );

    const showNotification = useCallback(
        (notification: {
            type: 'success' | 'error' | 'warning' | 'info';
            title: string;
            message: string;
        }) => {
            dispatch(addNotification(notification));
        },
        [dispatch],
    );

    const hideNotification = useCallback(
        (id: string) => {
            dispatch(removeNotification(id));
        },
        [dispatch],
    );

    const markAsRead = useCallback(
        (id: string) => {
            dispatch(markNotificationAsRead(id));
        },
        [dispatch],
    );

    const clearAllNotifications = useCallback(() => {
        dispatch(clearNotifications());
    }, [dispatch]);

    const navigateToPage = useCallback(
        (page: string) => {
            dispatch(setCurrentPage(page));
        },
        [dispatch],
    );

    return {
        isLoading,
        theme,
        language,
        sidebarOpen,
        notifications,
        currentPage,
        showLoading,
        changeTheme,
        changeLanguage,
        toggleSidebarMenu,
        setSidebarState,
        showNotification,
        hideNotification,
        markAsRead,
        clearAllNotifications,
        navigateToPage,
    };
};
