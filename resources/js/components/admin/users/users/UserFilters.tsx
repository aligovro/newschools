import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Role, UserFilters as UserFiltersType } from '@/types/user';
import { Search, X } from 'lucide-react';
import React from 'react';

interface UserFiltersProps {
    filters: UserFiltersType;
    onFiltersChange: (filters: UserFiltersType) => void;
    roles: Role[];
}

const UserFilters: React.FC<UserFiltersProps> = ({
    filters,
    onFiltersChange,
    roles,
}) => {
    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, search: value || undefined });
    };

    const handleRoleChange = (value: string) => {
        onFiltersChange({
            ...filters,
            role: value === 'all' ? undefined : value,
        });
    };

    const handleSortChange = (value: string) => {
        const [sort_by, sort_direction] = value.split('_');
        onFiltersChange({
            ...filters,
            sort_by: sort_by as any,
            sort_direction: sort_direction as 'asc' | 'desc',
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            per_page: filters.per_page,
            page: 1,
        });
    };

    const hasActiveFilters = filters.search || filters.role || filters.sort_by;

    return (
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Фильтры и поиск
                </h3>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Очистить
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Поиск */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                        placeholder="Поиск по имени или email..."
                        value={filters.search || ''}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Роль */}
                <Select
                    value={filters.role || 'all'}
                    onValueChange={handleRoleChange}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все роли</SelectItem>
                        {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                                {getRoleDisplayName(role.name)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Сортировка */}
                <Select
                    value={`${filters.sort_by || 'created_at'}_${filters.sort_direction || 'desc'}`}
                    onValueChange={handleSortChange}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name_asc">Имя (А-Я)</SelectItem>
                        <SelectItem value="name_desc">Имя (Я-А)</SelectItem>
                        <SelectItem value="email_asc">Email (А-Я)</SelectItem>
                        <SelectItem value="email_desc">Email (Я-А)</SelectItem>
                        <SelectItem value="created_at_asc">
                            Дата создания (старые)
                        </SelectItem>
                        <SelectItem value="created_at_desc">
                            Дата создания (новые)
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Количество на странице */}
                <Select
                    value={filters.per_page?.toString() || '15'}
                    onValueChange={(value) =>
                        onFiltersChange({
                            ...filters,
                            per_page: Number(value),
                            page: 1,
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="На странице" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Активные фильтры */}
            {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Активные фильтры:
                    </span>

                    {filters.search && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Поиск: "{filters.search}"
                        </span>
                    )}

                    {filters.role && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                            Роль: {getRoleDisplayName(filters.role)}
                        </span>
                    )}

                    {filters.sort_by && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Сортировка:{' '}
                            {getSortDisplayName(
                                filters.sort_by,
                                filters.sort_direction,
                            )}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

const getRoleDisplayName = (roleName: string) => {
    const roleNames: Record<string, string> = {
        super_admin: 'Супер админ',
        admin: 'Администратор',
        organization_admin: 'Админ организации',
        moderator: 'Модератор',
        editor: 'Редактор',
        user: 'Пользователь',
    };
    return roleNames[roleName] || roleName;
};

const getSortDisplayName = (sortBy: string, direction?: string) => {
    const sortNames: Record<string, string> = {
        name: 'Имя',
        email: 'Email',
        created_at: 'Дата создания',
    };

    const dir = direction === 'asc' ? '↑' : '↓';
    return `${sortNames[sortBy] || sortBy} ${dir}`;
};

export default UserFilters;
