import { Button } from '@/components/ui/button';
import { User, UserFilters } from '@/types/user';
import { Plus, Settings, Shield, Users } from 'lucide-react';
import React, { useState } from 'react';
import UserFiltersComponent from './UserFilters';
import UserForm from './UserForm';
import UserTable from './UserTable';

interface UserManagementProps {
    initialUsers: any;
    initialRoles: any[];
    initialPermissions: any[];
    initialFilters: any;
}

const UserManagement: React.FC<UserManagementProps> = ({
    initialUsers,
    initialRoles,
    initialPermissions,
    initialFilters,
}) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [filters, setFilters] = useState<UserFilters>(
        initialFilters || {
            per_page: 15,
            page: 1,
        },
    );

    // Используем данные из props
    const users = initialUsers?.data || [];
    const roles = initialRoles || [];
    const permissions = initialPermissions || [];
    const pagination = initialUsers?.meta || {
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 15,
    };
    const isLoading = false; // Данные уже загружены на сервере
    const error = null; // Нет ошибок, так как данные загружены на сервере

    const handleCreateUser = () => {
        setEditingUser(null);
        setShowCreateForm(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowCreateForm(true);
    };

    const handleCloseForm = () => {
        setShowCreateForm(false);
        setEditingUser(null);
    };

    const handleFiltersChange = (newFilters: UserFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handlePerPageChange = (perPage: number) => {
        setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }));
    };

    return (
        <div className="space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Управление пользователями
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Создание, редактирование и управление пользователями
                        системы
                    </p>
                </div>
                <Button
                    onClick={handleCreateUser}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Создать пользователя
                </Button>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Всего пользователей
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {pagination.total || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <Shield className="h-8 w-8 text-green-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Ролей
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {roles.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <Settings className="h-8 w-8 text-purple-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Разрешений
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {permissions.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {pagination.current_page}
                            </span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Страница
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                из {pagination.last_page}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Фильтры */}
            <UserFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                roles={roles}
            />

            {/* Таблица пользователей */}
            <UserTable
                users={users}
                isLoading={isLoading}
                onEdit={handleEditUser}
                pagination={pagination}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
            />

            {/* Форма создания/редактирования */}
            {showCreateForm && (
                <UserForm
                    user={editingUser}
                    roles={roles}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
};

export default UserManagement;
