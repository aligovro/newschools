import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import MainLayout from '@/layouts/MainLayout';
import { nameToInitials } from '@/utils/nameToInitials';
import { router, useForm, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    photo: string | null;
    email_verified_at: string | null;
    phone_verified_at: string | null;
}

interface ProfilePageProps {
    site: any;
    positions: any[];
    position_settings?: any[];
    user: User;
}

export default function ProfilePage({
    site,
    positions,
    position_settings = [],
    user: initialUser,
}: ProfilePageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resolvePhotoUrl = useCallback(
        (photo: string | null): string | null => {
            if (!photo) return null;
            if (photo.startsWith('http://') || photo.startsWith('https://'))
                return photo;
            if (photo.startsWith('/storage/')) return photo;
            return `/storage/${photo}`;
        },
        [],
    );

    const page = usePage<{
        flash?: { success?: string };
        user?: User;
        errors?: Record<string, string | string[]>;
    }>();
    const { flash, user: pageUser, errors: pageErrors } = page.props;

    // Используем user из props если он обновлен, иначе initialUser
    const currentUser = pageUser || initialUser;

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        resolvePhotoUrl(currentUser.photo),
    );

    const { data, setData, processing, reset } = useForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        photo: null as File | null,
        delete_photo: false,
        password: '',
        password_confirmation: '',
    });

    // Вспомогательная функция для получения первой ошибки поля (Inertia может возвращать массив или строку)
    const getFieldError = useCallback(
        (field: string): string | undefined => {
            const error = pageErrors?.[field];
            if (!error) return undefined;
            if (typeof error === 'string') return error;
            if (typeof error === 'object' && Array.isArray(error)) {
                const errorArray = error as string[];
                if (errorArray.length > 0) {
                    return String(errorArray[0]);
                }
            }
            return undefined;
        },
        [pageErrors],
    );

    // Объект ошибок для использования в форме
    const errors = {
        name: getFieldError('name'),
        email: getFieldError('email'),
        phone: getFieldError('phone'),
        photo: getFieldError('photo'),
        password: getFieldError('password'),
        password_confirmation: getFieldError('password_confirmation'),
    };

    // Обновляем форму если user изменился
    useEffect(() => {
        if (pageUser && pageUser.id === initialUser.id) {
            (reset as any)({
                name: pageUser.name || '',
                email: pageUser.email || '',
                phone: pageUser.phone || '',
                photo: null as File | null,
                delete_photo: false,
                password: '',
                password_confirmation: '',
            });
            setPhotoPreview(resolvePhotoUrl(pageUser.photo));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        pageUser?.id,
        pageUser?.name,
        pageUser?.email,
        pageUser?.phone,
        pageUser?.photo,
        reset,
        initialUser.id,
        resolvePhotoUrl,
    ]);

    const handlePhotoChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setData('photo', file);
                setData('delete_photo', false); // Отменяем удаление если загружаем новое фото
                // Создаем превью
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        },
        [setData],
    );

    const handlePhotoDelete = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();

            setData('delete_photo', true);
            setData('photo', null);
            setPhotoPreview(null);
            // Сбрасываем input файла
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Автоматически отправляем форму для удаления фото
            // Отправляем только необходимые поля, исключая пароль, чтобы избежать ошибок валидации
            router.post(
                '/profile',
                {
                    _method: 'PUT',
                    name: data.name,
                    email: data.email,
                    phone: data.phone || '',
                    delete_photo: true,
                    photo: null,
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        // Сброс полей после успешного обновления
                        setData((prev) => ({
                            ...prev,
                            password: '',
                            password_confirmation: '',
                            photo: null,
                            delete_photo: false,
                        }));
                        toast.success('Фото успешно удалено');
                    },
                    onError: (errors) => {
                        console.error('Profile update errors:', errors);
                        toast.error('Ошибка при удалении фото');
                    },
                },
            );
        },
        [setData, data],
    );

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            // Логируем данные перед отправкой
            console.log('Submitting profile data:', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                hasPhoto: !!data.photo,
                hasPassword: !!data.password,
                hasPasswordConfirmation: !!data.password_confirmation,
            });

            // Используем router.post с _method: 'PUT' для правильной отправки FormData
            router.post(
                '/profile',
                {
                    _method: 'PUT',
                    ...data,
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        // Сброс полей пароля и фото после успешного обновления
                        setData((prev) => ({
                            ...prev,
                            password: '',
                            password_confirmation: '',
                            photo: null,
                            delete_photo: false,
                        }));
                        // Photo preview будет обновлен через useEffect при обновлении pageUser
                    },
                    onError: (errors) => {
                        console.error('Profile update errors:', errors);
                        toast.error('Ошибка при обновлении профиля');
                    },
                },
            );
        },
        [setData, data],
    );

    const photoUrl = photoPreview || resolvePhotoUrl(currentUser.photo);

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle="Профиль"
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Профиль', href: '' },
            ]}
        >
            <div className="profile-page">
                <section className="profile-section w-full rounded-[20px] bg-white p-8 shadow-[0_4px_84px_0_rgba(26,26,26,0.08)]">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Левая колонка - описание */}
                        <div className="flex flex-col">
                            <h2 className="profile-section__title">
                                Редактирование профиля
                            </h2>
                            <h3 className="profile-section__subtitle">
                                Ваши данные
                            </h3>
                            <p className="profile-section__description leading-[140%] tracking-[-0.02em] text-[#1a1a1a]">
                                Обновите информацию о себе, чтобы другие
                                пользователи могли вас узнать. Вы можете
                                изменить имя, контактные данные, фото и пароль.
                            </p>
                        </div>

                        {/* Правая колонка - форма */}
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Фото профиля */}
                                <div className="profile-section__photo-group">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="profile-section__avatar h-20 w-20">
                                            {photoUrl ? (
                                                <AvatarImage
                                                    src={photoUrl}
                                                    alt={data.name}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <AvatarFallback className="profile-section__avatar-fallback">
                                                    {nameToInitials(data.name)}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <label
                                                    htmlFor="photo"
                                                    className="profile-section__photo-label cursor-pointer"
                                                >
                                                    Изменить фото
                                                </label>
                                                {photoUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handlePhotoDelete
                                                        }
                                                        className="profile-section__photo-delete"
                                                        title="Удалить фото"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                id="photo"
                                                name="photo"
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                            <p className="profile-section__photo-hint">
                                                JPG, PNG или WEBP, до 2 МБ
                                            </p>
                                        </div>
                                    </div>
                                    {errors.photo && (
                                        <p className="profile-section__error">
                                            {errors.photo}
                                        </p>
                                    )}
                                </div>

                                {/* Основные поля */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Имя */}
                                    <div className="relative">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                            }}
                                            placeholder="Иван Иванов"
                                            required
                                            className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <label
                                            htmlFor="name"
                                            className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                        >
                                            Имя
                                        </label>
                                        {errors.name && (
                                            <p className="profile-section__field-error">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => {
                                                setData(
                                                    'email',
                                                    e.target.value,
                                                );
                                            }}
                                            placeholder="example@mail.ru"
                                            className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <label
                                            htmlFor="email"
                                            className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                        >
                                            Email
                                        </label>
                                        {errors.email && (
                                            <p className="profile-section__field-error">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Телефон */}
                                <div className="relative">
                                    <RussianPhoneInput
                                        id="phone"
                                        name="phone"
                                        value={data.phone || ''}
                                        onValueChange={(value) =>
                                            setData('phone', value)
                                        }
                                        autoComplete="tel"
                                        className="phone-input--with-label"
                                    />
                                    <label
                                        htmlFor="phone"
                                        className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                    >
                                        Телефон
                                    </label>
                                    {errors.phone && (
                                        <p className="profile-section__field-error">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Пароль */}
                                <div className="profile-section__password-group">
                                    <h4 className="profile-section__password-title">
                                        Изменить пароль
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => {
                                                    setData(
                                                        'password',
                                                        e.target.value,
                                                    );
                                                }}
                                                placeholder="Новый пароль"
                                                className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <label
                                                htmlFor="password"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Новый пароль
                                            </label>
                                            {errors.password && (
                                                <p className="profile-section__field-error">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(e) => {
                                                    setData(
                                                        'password_confirmation',
                                                        e.target.value,
                                                    );
                                                }}
                                                placeholder="Подтвердите пароль"
                                                className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <label
                                                htmlFor="password_confirmation"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Подтвердите пароль
                                            </label>
                                            {errors.password_confirmation && (
                                                <p className="profile-section__field-error">
                                                    {
                                                        errors.password_confirmation
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="profile-section__password-hint">
                                        Оставьте поля пустыми, если не хотите
                                        менять пароль
                                    </p>
                                </div>

                                {/* Кнопка отправки */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="profile-section__submit-button w-full rounded-[10px] bg-gradient-to-r from-[#96bdff] to-[#3259ff] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Сохранение...'
                                        : 'Сохранить изменения'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
