import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsers } from '@/hooks/useUsers';
import { CreateUserForm, Role, UpdateUserForm, User } from '@/types/user';
import { Shield, User as UserIcon, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface UserFormProps {
    user?: User | null;
    roles: Role[];
    onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, roles, onClose }) => {
    const { createNewUser, updateExistingUser, isCreating, isUpdating } =
        useUsers();

    const [formData, setFormData] = useState<CreateUserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                roles: user.roles.map((role) => role.name),
            });
        }
    }, [user]);

    const handleInputChange = (field: keyof CreateUserForm, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleRoleToggle = (roleName: string) => {
        setFormData((prev) => ({
            ...prev,
            roles: prev.roles.includes(roleName)
                ? prev.roles.filter((r) => r !== roleName)
                : [...prev.roles, roleName],
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Имя обязательно';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный email';
        }

        if (!isEditing) {
            if (!formData.password) {
                newErrors.password = 'Пароль обязателен';
            } else if (formData.password.length < 8) {
                newErrors.password =
                    'Пароль должен содержать минимум 8 символов';
            }

            if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Пароли не совпадают';
            }
        } else if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Пароль должен содержать минимум 8 символов';
        } else if (
            formData.password &&
            formData.password !== formData.password_confirmation
        ) {
            newErrors.password_confirmation = 'Пароли не совпадают';
        }

        if (formData.roles.length === 0) {
            newErrors.roles = 'Выберите хотя бы одну роль';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            if (isEditing) {
                const updateData: UpdateUserForm = {
                    name: formData.name,
                    email: formData.email,
                    roles: formData.roles,
                };

                if (formData.password) {
                    updateData.password = formData.password;
                    updateData.password_confirmation =
                        formData.password_confirmation;
                }

                await updateExistingUser(user!.id, updateData);
            } else {
                await createNewUser(formData);
            }

            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setIsSubmitting(false);
        }
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

    const getRoleDescription = (roleName: string) => {
        const descriptions: Record<string, string> = {
            super_admin: 'Полный доступ ко всем функциям системы',
            admin: 'Управление пользователями и организациями',
            organization_admin: 'Управление конкретной организацией',
            moderator: 'Модерация контента и пользователей',
            editor: 'Создание и редактирование контента',
            user: 'Базовые права пользователя',
        };
        return descriptions[roleName] || '';
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <UserIcon className="h-5 w-5" />
                                Редактирование пользователя
                            </>
                        ) : (
                            <>
                                <UserIcon className="h-5 w-5" />
                                Создание пользователя
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Измените информацию о пользователе и его роли'
                            : 'Заполните форму для создания нового пользователя'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Основная информация */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Основная информация
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="name">Имя *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Введите имя пользователя"
                                    className={
                                        errors.name ? 'border-red-500' : ''
                                    }
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="user@example.com"
                                    className={
                                        errors.email ? 'border-red-500' : ''
                                    }
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Пароль */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="password">
                                    {isEditing ? 'Новый пароль' : 'Пароль *'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        isEditing
                                            ? 'Оставьте пустым, чтобы не менять'
                                            : 'Минимум 8 символов'
                                    }
                                    className={
                                        errors.password ? 'border-red-500' : ''
                                    }
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">
                                    {isEditing
                                        ? 'Подтверждение пароля'
                                        : 'Подтверждение пароля *'}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={formData.password_confirmation}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Повторите пароль"
                                    className={
                                        errors.password_confirmation
                                            ? 'border-red-500'
                                            : ''
                                    }
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Роли */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Роли пользователя
                            </h3>
                        </div>

                        {errors.roles && (
                            <p className="text-sm text-red-500">
                                {errors.roles}
                            </p>
                        )}

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    className="flex cursor-pointer items-start space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                    onClick={() => handleRoleToggle(role.name)}
                                >
                                    <Checkbox
                                        checked={formData.roles.includes(
                                            role.name,
                                        )}
                                        onChange={() =>
                                            handleRoleToggle(role.name)
                                        }
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {getRoleDisplayName(role.name)}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {role.name}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {getRoleDescription(role.name)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Выбранные роли */}
                        {formData.roles.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                    Выбранные роли:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.roles.map((roleName) => (
                                        <Badge
                                            key={roleName}
                                            variant="default"
                                            className="flex items-center gap-1"
                                        >
                                            {getRoleDisplayName(roleName)}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRoleToggle(roleName);
                                                }}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isCreating || isUpdating}
                        >
                            {isSubmitting || isCreating || isUpdating
                                ? 'Сохранение...'
                                : isEditing
                                  ? 'Сохранить изменения'
                                  : 'Создать пользователя'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UserForm;
