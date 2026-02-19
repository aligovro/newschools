import {
    Avatar,
    AvatarImage,
    AvatarUserFallback,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types/user';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import React from 'react';

interface UserTableProps {
    users: User[];
    isLoading: boolean;
    onEdit: (user: User) => void;
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
    users,
    isLoading,
    onEdit,
    pagination,
    onPageChange,
    onPerPageChange,
}) => {
    const { deleteExistingUser, assignUserRole, removeUserRole } = useUsers();

    const handleDelete = async (userId: number) => {
        if (
            window.confirm('Вы уверены, что хотите удалить этого пользователя?')
        ) {
            await deleteExistingUser(userId);
        }
    };

    const handleRoleToggle = async (user: User, roleName: string) => {
        const hasRole = user.roles.some((role) => role.name === roleName);

        if (hasRole) {
            await removeUserRole(user.id, roleName);
        } else {
            await assignUserRole(user.id, roleName);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadgeVariant = (roleName: string) => {
        switch (roleName) {
            case 'super_admin':
                return 'destructive';
            case 'organization_admin':
                return 'secondary';
            case 'graduate':
                return 'outline';
            case 'sponsor':
                return 'outline';
            case 'user':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getRoleDisplayName = (roleName: string) => {
        const roleNames: Record<string, string> = {
            super_admin: 'Супер админ',
            organization_admin: 'Администратор школы',
            graduate: 'Выпускник',
            sponsor: 'Спонсор',
            user: 'Пользователь',
        };
        return roleNames[roleName] || roleName;
    };

    if (isLoading) {
        return (
            <div className="rounded-lg bg-white shadow">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600">
                        Загрузка пользователей...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-white shadow">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Пользователь</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Роли</TableHead>
                            <TableHead>Создан</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-8 text-center text-gray-500"
                                >
                                    Пользователи не найдены
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={user.photo || undefined}
                                                    alt={user.name}
                                                />
                                                <AvatarUserFallback />
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {user.id}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-900">
                                            {user.email}
                                        </div>
                                        {user.email_verified_at && (
                                            <div className="text-xs text-green-600">
                                                ✓ Подтвержден
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={role.id}
                                                    variant={getRoleBadgeVariant(
                                                        role.name,
                                                    )}
                                                    className="text-xs"
                                                >
                                                    {getRoleDisplayName(
                                                        role.name,
                                                    )}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-900">
                                            {formatDate(user.created_at)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.email_verified_at
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="text-xs"
                                        >
                                            {user.email_verified_at
                                                ? 'Активен'
                                                : 'Не подтвержден'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(user)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Редактировать
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDelete(user.id)
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Удалить
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Пагинация */}
            {pagination.last_page > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Показано{' '}
                            {(pagination.current_page - 1) *
                                pagination.per_page +
                                1}{' '}
                            -{' '}
                            {Math.min(
                                pagination.current_page * pagination.per_page,
                                pagination.total,
                            )}{' '}
                            из {pagination.total} пользователей
                        </div>

                        <div className="flex items-center space-x-2">
                            <select
                                value={pagination.per_page}
                                onChange={(e) =>
                                    onPerPageChange(Number(e.target.value))
                                }
                                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>

                            <div className="flex space-x-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        onPageChange(
                                            pagination.current_page - 1,
                                        )
                                    }
                                    disabled={pagination.current_page === 1}
                                >
                                    Назад
                                </Button>

                                <span className="px-3 py-1 text-sm text-gray-700">
                                    {pagination.current_page} из{' '}
                                    {pagination.last_page}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        onPageChange(
                                            pagination.current_page + 1,
                                        )
                                    }
                                    disabled={
                                        pagination.current_page ===
                                        pagination.last_page
                                    }
                                >
                                    Вперед
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTable;
