import { apiClient } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    assignRole,
    clearError,
    createUser,
    deleteUser,
    fetchPermissions,
    fetchRoles,
    removeRole,
    setCurrentUser,
    updateUser,
} from '@/store/slices/usersSlice';
import {
    CreateUserForm,
    Permission,
    Role,
    RoleFilters,
    UpdateUserForm,
    User,
    UserFilters,
} from '@/types/user';
import { useCallback } from 'react';

export const useUsers = () => {
    const dispatch = useAppDispatch();
    const {
        users,
        roles,
        permissions,
        currentUser,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error,
        pagination,
    } = useAppSelector((state) => state.users);

    // Загрузка пользователей
    const loadUsers = useCallback(async (filters: UserFilters = {}) => {
        try {
            console.log('Loading users with filters:', filters);
            const response = await apiClient.get('/users', { params: filters });
            console.log('Users loaded successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error loading users:', error);
            console.error('Error response:', error.response);
            throw error;
        }
    }, []);

    // Создание пользователя
    const createNewUser = useCallback(
        (userData: CreateUserForm) => {
            return dispatch(createUser(userData));
        },
        [dispatch],
    );

    // Обновление пользователя
    const updateExistingUser = useCallback(
        (userId: number, userData: UpdateUserForm) => {
            return dispatch(updateUser({ id: userId, ...userData }));
        },
        [dispatch],
    );

    // Удаление пользователя
    const deleteExistingUser = useCallback(
        (userId: number) => {
            return dispatch(deleteUser(userId));
        },
        [dispatch],
    );

    // Загрузка ролей
    const loadRoles = useCallback(
        (filters: RoleFilters = {}) => {
            return dispatch(fetchRoles(filters));
        },
        [dispatch],
    );

    // Загрузка разрешений
    const loadPermissions = useCallback(() => {
        return dispatch(fetchPermissions());
    }, [dispatch]);

    // Назначение роли
    const assignUserRole = useCallback(
        (userId: number, role: string) => {
            return dispatch(assignRole({ userId, role }));
        },
        [dispatch],
    );

    // Удаление роли
    const removeUserRole = useCallback(
        (userId: number, role: string) => {
            return dispatch(removeRole({ userId, role }));
        },
        [dispatch],
    );

    // Очистка ошибок
    const clearUsersError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Установка текущего пользователя
    const setCurrentUserData = useCallback(
        (user: User | null) => {
            dispatch(setCurrentUser(user));
        },
        [dispatch],
    );

    // Проверка прав пользователя
    const hasPermission = useCallback(
        (permission: string): boolean => {
            if (!currentUser) return false;
            return currentUser.permissions.some((p) => p.name === permission);
        },
        [currentUser],
    );

    // Проверка роли пользователя
    const hasRole = useCallback(
        (role: string): boolean => {
            if (!currentUser) return false;
            return currentUser.roles.some((r) => r.name === role);
        },
        [currentUser],
    );

    // Получение пользователя по ID
    const getUserById = useCallback(
        (userId: number): User | undefined => {
            return users.find((user) => user.id === userId);
        },
        [users],
    );

    // Получение роли по имени
    const getRoleByName = useCallback(
        (roleName: string): Role | undefined => {
            return roles.find((role) => role.name === roleName);
        },
        [roles],
    );

    // Получение разрешения по имени
    const getPermissionByName = useCallback(
        (permissionName: string): Permission | undefined => {
            return permissions.find(
                (permission) => permission.name === permissionName,
            );
        },
        [permissions],
    );

    return {
        // Состояние
        users,
        roles,
        permissions,
        currentUser,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error,
        pagination,

        // Действия
        loadUsers,
        createNewUser,
        updateExistingUser,
        deleteExistingUser,
        loadRoles,
        loadPermissions,
        assignUserRole,
        removeUserRole,
        clearUsersError,
        setCurrentUserData,

        // Утилиты
        hasPermission,
        hasRole,
        getUserById,
        getRoleByName,
        getPermissionByName,
    };
};
