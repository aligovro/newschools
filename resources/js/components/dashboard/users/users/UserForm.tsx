import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
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
import UniversalSelect, {
    SelectOption,
} from '@/components/ui/universal-select/UniversalSelect';
import { useUsers } from '@/hooks/useUsers';
import { apiClient } from '@/lib/api';
import { CreateUserForm, Role, UpdateUserForm, User } from '@/types/user';
import { router, usePage } from '@inertiajs/react';
import { Building2, Shield, User as UserIcon, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface UserFormProps {
    user?: User | null;
    roles: Role[];
    onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, roles, onClose }) => {
    const { createNewUser, updateExistingUser, isCreating, isUpdating } =
        useUsers();

    // Получаем текущего пользователя и терминологию из Inertia props
    const { props } = usePage<{
        auth?: { user?: any };
        terminology?: {
            organization?: {
                singular_nominative?: string;
                singular_genitive?: string;
                singular_accusative?: string;
                plural_nominative?: string;
            };
        };
    }>();
    const currentUser = props.auth?.user || null;
    const terminology = props.terminology || {};
    const orgTerm = terminology.organization || {};

    const isSuperAdmin =
        currentUser?.roles?.some((r: any) => r.name === 'super_admin') || false;
    const isOrgAdmin =
        currentUser?.roles?.some((r: any) => r.name === 'organization_admin') ||
        false;
    const currentUserOrganizationId =
        currentUser?.organizations?.[0]?.id || null;

    const [formData, setFormData] = useState<
        CreateUserForm & { organization_id?: number | null }
    >({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
        photo: null,
        organization_id: null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Состояние для выбора организации
    const [organizationSearch, setOrganizationSearch] = useState('');
    const [organizationOptions, setOrganizationOptions] = useState<
        SelectOption[]
    >([]);
    const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);

    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            // Получаем organization_id из связей пользователя
            const userOrganizationId =
                (user as any).organizations?.[0]?.id || null;
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                roles: user.roles.map((role) => role.name),
                photo: user.photo || null,
                organization_id: userOrganizationId,
            });
            setPhotoPreview(user.photo || null);
        } else {
            setPhotoPreview(null);
            // Для organization_admin автоматически устанавливаем его организацию при создании
            // Но это будет происходить при выборе роли, поэтому здесь не устанавливаем
        }
    }, [user, isOrgAdmin, currentUserOrganizationId]);

    const handleInputChange = (field: keyof CreateUserForm, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleRoleToggle = (roleName: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        console.log('=== handleRoleToggle ===');
        console.log('roleName:', roleName);
        console.log('Current formData.roles:', formData.roles);

        setFormData((prev) => {
            const newRoles = prev.roles.includes(roleName)
                ? prev.roles.filter((r) => r !== roleName)
                : [...prev.roles, roleName];

            console.log('New roles after toggle:', newRoles);

            // Если убираем роль организации, убираем и organization_id
            const organizationRoles = [
                'organization_admin',
                'graduate',
                'sponsor',
            ];
            const hasOrgRole = newRoles.some((r) =>
                organizationRoles.includes(r),
            );
            const newOrganizationId = hasOrgRole ? prev.organization_id : null;

            console.log('hasOrgRole:', hasOrgRole);
            console.log('isOrgAdmin:', isOrgAdmin);
            console.log(
                'currentUserOrganizationId:',
                currentUserOrganizationId,
            );

            // Если organization_admin и текущий пользователь - админ организации, автоматически ставим его организацию
            // Для organization_admin всегда используем его организацию
            if (
                newRoles.includes('organization_admin') &&
                isOrgAdmin &&
                currentUserOrganizationId
            ) {
                console.log('Auto-setting organization_id for org admin');
                return {
                    ...prev,
                    roles: newRoles,
                    organization_id: currentUserOrganizationId,
                };
            }

            // Если убираем все роли организации, очищаем organization_id
            // Если добавляем роль организации и текущий пользователь - organization_admin, используем его организацию
            let finalOrganizationId = newOrganizationId;
            if (hasOrgRole && isOrgAdmin && currentUserOrganizationId) {
                // Для organization_admin всегда используем его организацию
                finalOrganizationId = currentUserOrganizationId;
            } else if (hasOrgRole && isSuperAdmin) {
                // Для super_admin оставляем выбранную организацию или null (пользователь должен выбрать)
                finalOrganizationId = prev.organization_id;
            } else if (!hasOrgRole) {
                // Если нет ролей организации, очищаем
                finalOrganizationId = null;
            }

            const newState = {
                ...prev,
                roles: newRoles,
                organization_id: finalOrganizationId,
            };

            console.log('Final state:', newState);

            return newState;
        });
    };

    // Проверяем, нужен ли выбор организации
    // Выбор организации нужен ТОЛЬКО для super_admin при выборе ролей организации
    // Для organization_admin - организация подставляется автоматически, селект не показываем
    const organizationRoles = ['organization_admin', 'graduate', 'sponsor'];
    const hasOrganizationRole = formData.roles.some((r) =>
        organizationRoles.includes(r),
    );
    // Показываем селект только для super_admin (не для organization_admin) и только если выбрана хотя бы одна роль организации
    const showOrganizationSelect = isSuperAdmin && hasOrganizationRole;

    // Загрузка организаций для селекта
    const loadOrganizations = useCallback(
        async (search: string = '') => {
            setIsLoadingOrganizations(true);
            try {
                console.log('Loading organizations with search:', search);
                const response = await apiClient.get('/organizations', {
                    params: {
                        search: search || undefined,
                        per_page: 50,
                        page: 1,
                    },
                });

                console.log('Organizations response:', response.data);

                // Проверяем разные форматы ответа
                let orgs = [];
                if (response.data?.data) {
                    orgs = response.data.data;
                } else if (Array.isArray(response.data)) {
                    orgs = response.data;
                } else if (response.data?.data?.data) {
                    orgs = response.data.data.data;
                }

                console.log('Parsed organizations:', orgs);

                const options: SelectOption[] = orgs.map((org: any) => ({
                    value: org.id,
                    label: org.name,
                    description: org.address || org.email || '',
                }));

                // Если есть выбранная организация, но её нет в списке - загружаем её отдельно
                if (
                    formData.organization_id &&
                    !options.find(
                        (opt) => opt.value === formData.organization_id,
                    )
                ) {
                    try {
                        const orgResponse = await apiClient.get(
                            `/organizations/${formData.organization_id}`,
                        );
                        const selectedOrg =
                            orgResponse.data?.data || orgResponse.data;
                        if (selectedOrg) {
                            options.unshift({
                                value: selectedOrg.id,
                                label: selectedOrg.name,
                                description:
                                    selectedOrg.address ||
                                    selectedOrg.email ||
                                    '',
                            });
                            console.log(
                                'Added selected organization to options:',
                                selectedOrg,
                            );
                        }
                    } catch (orgError) {
                        console.error(
                            'Error loading selected organization:',
                            orgError,
                        );
                    }
                }

                console.log('Organization options:', options);
                setOrganizationOptions(options);
            } catch (error: any) {
                console.error('Error loading organizations:', error);
                console.error('Error response:', error.response);
                setOrganizationOptions([]);
            } finally {
                setIsLoadingOrganizations(false);
            }
        },
        [formData.organization_id],
    );

    // Загрузка организаций при показе селекта или при редактировании пользователя с организацией
    useEffect(() => {
        if (showOrganizationSelect) {
            // Загружаем организации сразу при показе селекта (без задержки, если нет поиска)
            if (!organizationSearch) {
                loadOrganizations('');
            }

            // Если редактируем пользователя и у него есть организация, загружаем её в опции
            if (
                isEditing &&
                user &&
                formData.organization_id &&
                organizationOptions.length === 0
            ) {
                // Загружаем организации чтобы найти выбранную
                loadOrganizations('');
            }
        }
    }, [
        showOrganizationSelect,
        loadOrganizations,
        isEditing,
        user,
        formData.organization_id,
        organizationSearch,
        organizationOptions.length,
    ]);

    // Загрузка организаций при изменении поиска с debounce
    useEffect(() => {
        if (showOrganizationSelect && organizationSearch) {
            const timeoutId = setTimeout(() => {
                loadOrganizations(organizationSearch);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [organizationSearch, showOrganizationSelect, loadOrganizations]);

    const handlePhotoUpload = async (file: File, serverUrl?: string) => {
        // Если есть serverUrl, используем его
        if (serverUrl) {
            setFormData((prev) => ({ ...prev, photo: serverUrl }));
            setPhotoPreview(serverUrl);
        } else {
            // Загружаем фото на сервер
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('photo', file);

                const response = await apiClient.post(
                    '/users/upload-photo',
                    uploadFormData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                );

                const photoUrl =
                    response.data?.url ||
                    response.data?.photo ||
                    response.data?.data?.url;
                if (photoUrl) {
                    setFormData((prev) => ({ ...prev, photo: photoUrl }));
                    setPhotoPreview(photoUrl);
                } else {
                    // Если сервер не вернул URL, используем data URL как fallback
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        setPhotoPreview(result);
                        setFormData((prev) => ({ ...prev, photo: result }));
                    };
                    reader.readAsDataURL(file);
                }
            } catch (error) {
                console.error('Error uploading photo:', error);
                // Fallback на data URL
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    setPhotoPreview(result);
                    setFormData((prev) => ({ ...prev, photo: result }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handlePhotoCrop = async (croppedImage: string) => {
        // Если это data URL (начинается с data:), конвертируем в файл и загружаем
        if (croppedImage.startsWith('data:')) {
            try {
                // Конвертируем data URL в Blob и затем в File
                const response = await fetch(croppedImage);
                const blob = await response.blob();
                const file = new File([blob], 'photo.jpg', { type: blob.type });

                // Загружаем на сервер
                const uploadFormData = new FormData();
                uploadFormData.append('photo', file);

                const uploadResponse = await apiClient.post(
                    '/users/upload-photo',
                    uploadFormData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                );

                const photoUrl =
                    uploadResponse.data?.url ||
                    uploadResponse.data?.photo ||
                    uploadResponse.data?.data?.url;
                if (photoUrl) {
                    setFormData((prev) => ({ ...prev, photo: photoUrl }));
                    setPhotoPreview(photoUrl);
                } else {
                    // Fallback на data URL если загрузка не удалась
                    setFormData((prev) => ({ ...prev, photo: croppedImage }));
                    setPhotoPreview(croppedImage);
                }
            } catch (error) {
                console.error('Error uploading cropped photo:', error);
                // Fallback на data URL
                setFormData((prev) => ({ ...prev, photo: croppedImage }));
                setPhotoPreview(croppedImage);
            }
        } else {
            // Если это уже URL, просто сохраняем
            setFormData((prev) => ({ ...prev, photo: croppedImage }));
            setPhotoPreview(croppedImage);
        }
    };

    const handlePhotoDelete = () => {
        setFormData((prev) => ({ ...prev, photo: null }));
        setPhotoPreview(null);
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

        // Проверка выбора организации для ролей организации
        // Проверяем ТОЛЬКО для super_admin (для organization_admin организация устанавливается автоматически)
        if (isSuperAdmin && hasOrganizationRole && !formData.organization_id) {
            newErrors.organization_id = `Необходимо выбрать ${orgTerm.singular_accusative || orgTerm.singular_nominative || 'организацию'}`;
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
                const updateData: UpdateUserForm & {
                    organization_id?: number;
                } = {
                    name: formData.name,
                    email: formData.email,
                    roles: formData.roles,
                    photo: formData.photo || undefined,
                };

                if (formData.password) {
                    updateData.password = formData.password;
                    updateData.password_confirmation =
                        formData.password_confirmation;
                }

                // Добавляем organization_id если есть роль организации
                if (formData.organization_id) {
                    updateData.organization_id = formData.organization_id;
                }

                await updateExistingUser(user!.id, updateData);
            } else {
                // Для organization_admin автоматически используем его организацию
                // Для super_admin используем выбранную организацию
                let finalOrganizationId = formData.organization_id;

                // Если текущий пользователь - organization_admin, всегда используем его организацию
                if (isOrgAdmin && currentUserOrganizationId) {
                    const hasOrgRole = formData.roles.some((r) =>
                        organizationRoles.includes(r),
                    );
                    if (hasOrgRole) {
                        finalOrganizationId = currentUserOrganizationId;
                    }
                }

                const createData: CreateUserForm & {
                    organization_id?: number;
                } = {
                    ...formData,
                    organization_id: finalOrganizationId || undefined,
                };

                await createNewUser(createData);
            }

            // Закрываем форму и перезагружаем данные
            onClose();
            router.reload({ only: ['users'] });
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setIsSubmitting(false);
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

    const getRoleDescription = (roleName: string) => {
        const descriptions: Record<string, string> = {
            super_admin: 'Полный доступ ко всем функциям системы',
            organization_admin: 'Управление конкретной школой',
            graduate: 'Выпускник школы',
            sponsor: 'Спонсор школы',
            user: 'Базовые права пользователя',
        };
        return descriptions[roleName] || '';
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-[95vw] max-w-[1400px] overflow-y-auto sm:!max-w-[1400px] md:!max-w-[1400px] lg:!max-w-[1400px] xl:!max-w-[1400px]">
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
                        <h3 className="text-lg font-medium text-gray-900">
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

                        {/* Фото пользователя */}
                        <div>
                            <Label>Фото пользователя</Label>
                            <div className="mt-2">
                                <ImageUploader
                                    onImageUpload={handlePhotoUpload}
                                    onImageCrop={handlePhotoCrop}
                                    onImageDelete={handlePhotoDelete}
                                    existingImageUrl={photoPreview || undefined}
                                    aspectRatio={1}
                                    imageType="avatar"
                                    maxSize={5 * 1024 * 1024}
                                    className="w-full"
                                    hidePreview={false}
                                />
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

                    {/* Выбор организации для ролей организации (только для super_admin) - показывается ПЕРЕД ролями */}
                    {showOrganizationSelect && (
                        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Building2 className="h-4 w-4" />
                                Выберите{' '}
                                {orgTerm.singular_accusative ||
                                    orgTerm.singular_nominative ||
                                    'организацию'}
                                <span className="text-red-500">*</span>
                            </Label>
                            <p className="mt-1 text-xs text-gray-600">
                                Для ролей:{' '}
                                {formData.roles
                                    .filter((r) =>
                                        organizationRoles.includes(r),
                                    )
                                    .map((r) => getRoleDisplayName(r))
                                    .join(', ') ||
                                    'organization_admin, graduate, sponsor'}
                            </p>
                            <div className="mt-3">
                                <UniversalSelect
                                    options={organizationOptions}
                                    value={formData.organization_id || null}
                                    onChange={(value) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            organization_id: value as
                                                | number
                                                | null,
                                        }));
                                    }}
                                    placeholder={`Начните вводить название ${orgTerm.singular_genitive || 'организации'}...`}
                                    searchPlaceholder={`Поиск ${orgTerm.singular_genitive || 'организации'}...`}
                                    searchable={true}
                                    loading={isLoadingOrganizations}
                                    onSearchChange={setOrganizationSearch}
                                    searchValue={organizationSearch}
                                    clearable={true}
                                    className="w-full"
                                    emptyMessage={`${orgTerm.plural_nominative || 'Организации'} не найдены`}
                                    required={true}
                                />
                            </div>
                            {!formData.organization_id && (
                                <p className="mt-2 text-xs text-red-600">
                                    Необходимо выбрать{' '}
                                    {orgTerm.singular_accusative ||
                                        orgTerm.singular_nominative ||
                                        'организацию'}
                                </p>
                            )}
                            {errors.organization_id && (
                                <p className="mt-2 text-xs text-red-600">
                                    {errors.organization_id}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Роли */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <h3 className="text-lg font-medium text-gray-900">
                                Роли пользователя
                            </h3>
                        </div>

                        {errors.roles && (
                            <p className="text-sm text-red-500">
                                {errors.roles}
                            </p>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            {roles.map((role) => {
                                const isSelected = formData.roles.includes(
                                    role.name,
                                );
                                const isOrganizationRole =
                                    organizationRoles.includes(role.name);

                                return (
                                    <div key={role.id} className="space-y-2">
                                        <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                    if (
                                                        checked !== isSelected
                                                    ) {
                                                        handleRoleToggle(
                                                            role.name,
                                                        );
                                                    }
                                                }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {getRoleDisplayName(
                                                            role.name,
                                                        )}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {getRoleDescription(
                                                        role.name,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Выбранные роли */}
                        {formData.roles.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-sm text-gray-600">
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
