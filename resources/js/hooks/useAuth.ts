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
        (credentials: { email: string; password: string }) => {
            return dispatch(loginUser(credentials));
        },
        [dispatch],
    );

    const register = useCallback(
        (userData: {
            name: string;
            email: string;
            password: string;
            password_confirmation: string;
        }) => {
            return dispatch(registerUser(userData));
        },
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
