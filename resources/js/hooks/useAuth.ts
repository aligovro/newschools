import { useAppDispatch, useAppSelector } from '@/store';
import {
    clearError,
    fetchUser,
    loginUser,
    logoutUser,
    registerUser,
} from '@/store/slices/authSlice';
import { useCallback } from 'react';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
        (state) => state.auth,
    );

    const login = useCallback(
        (credentials: { login: string; password: string; remember?: boolean }) =>
            dispatch(loginUser(credentials)),
        [dispatch],
    );

    const register = useCallback(
        (userData: {
            name: string;
            email?: string | null;
            phone?: string | null;
            password: string;
            password_confirmation: string;
            organization_id?: number;
            site_id?: number;
        }) => dispatch(registerUser(userData)),
        [dispatch],
    );

    const logout = useCallback(() => {
        return dispatch(logoutUser());
    }, [dispatch]);

    const getUser = useCallback(() => {
        return dispatch(fetchUser());
    }, [dispatch]);

    const clearAuthError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        getUser,
        clearAuthError,
    };
};
