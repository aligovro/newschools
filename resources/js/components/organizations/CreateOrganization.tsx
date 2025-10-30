import YandexMap from '@/components/maps/YandexMap';
import PaymentGatewaysSettings, {
    type PaymentGatewaysSettingsValue,
} from '@/components/payments/PaymentGatewaysSettings';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import MultiImageUploader, {
    UploadedImage,
} from '@/components/ui/image-uploader/MultiImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import UniversalSelect from '@/components/ui/universal-select/UniversalSelect';
import { useOrganizationsApi } from '@/hooks/useOrganizationsApi';
import { useCascadeSelectData, useSelectData } from '@/hooks/useSelectData';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Save,
    Settings,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Организации',
        href: '/dashboard/organizations',
    },
    {
        title: 'Создать организацию',
        href: '/dashboard/organizations/create',
    },
];

interface Region {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface OrganizationType {
    value: string;
    label: string;
    description: string;
}

interface Props {
    referenceData: {
        organizationTypes: OrganizationType[];
        regions: Region[];
        availableUsers: User[];
    };
}

export default function CreateOrganization({ referenceData }: Props) {
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [organizationImages, setOrganizationImages] = useState<
        UploadedImage[]
    >([]);
    const [slugError, setSlugError] = useState<string>('');

    // Payment settings state (defaults)
    const [orgPayment, setOrgPayment] = useState<PaymentGatewaysSettingsValue>({
        enabled_gateways: ['yookassa'],
        credentials: {},
        currency: 'RUB',
        test_mode: true,
        donation_min_amount: 100,
        donation_max_amount: 0,
    });

    // API хуки
    const { checkSlug, uploadLogo, uploadImages } = useOrganizationsApi();

    // Данные для селектов

    const usersData = useSelectData({
        endpoint: '/dashboard/api/users',
        transformResponse: (data: unknown[]) =>
            data.map((item) => ({
                value: (item as User).id,
                label: (item as User).name,
                description: (item as User).email,
            })),
    });

    const cascadeData = useCascadeSelectData();

    const { data, setData, processing, errors, progress } = useForm({
        // Основные данные
        name: '',
        slug: '',
        description: '',
        type: 'school',
        status: 'active' as 'active' | 'inactive' | 'pending',

        // Контактная информация
        address: '',
        phone: '',
        email: '',
        website: '',
        founded_at: null as string | null,

        // Локация
        region_id: null as number | null,
        city_id: null as number | null,
        settlement_id: null as number | null,
        city_name: '',
        latitude: null as number | null,
        longitude: null as number | null,

        // Дополнительные данные
        is_public: true,

        // Администратор
        admin_user_id: null as number | null,

        // Опционально: создать сайт (оставим, но отправим корректно как 1/0)
        create_site: false,
    });

    const [dirty, setDirty] = useState<Record<string, boolean>>({});
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );

    // debounce for slug check
    const slugTimer = useRef<number | null>(null);

    const checkSlugAvailability = useCallback(
        async (slug: string) => {
            try {
                const available = await checkSlug(slug);
                setClientErrors((prev) => ({
                    ...prev,
                    slug: available ? '' : 'Этот slug уже используется',
                }));
            } catch {
                // ignore network errors for UX, let server validate
            }
        },
        [checkSlug],
    );

    const validateField = (key: string, value: unknown) => {
        const errs: Record<string, string> = {};
        if (key === 'name') {
            if (!String(value || '').trim())
                errs.name = 'Введите название организации';
        }
        if (key === 'slug') {
            const v = String(value || '').trim();
            if (!v) errs.slug = 'Введите slug';
            else if (v.length < 3) errs.slug = 'Slug слишком короткий';
            else if (!/^[a-z0-9-]+$/.test(v))
                errs.slug = 'Только латиница, цифры и дефисы';
        }
        setClientErrors((prev) => ({
            ...prev,
            ...errs,
            ...(errs[key] ? {} : { [key]: '' }),
        }));
    };

    const handleNameChange = useCallback(
        (name: string) => {
            setData('name', name);
            setDirty((d) => ({ ...d, name: true }));
            validateField('name', name);
        },
        [setData],
    );

    const handleSlugChangeLocal = useCallback(
        (slug: string) => {
            setData('slug', slug);
            setDirty((d) => ({ ...d, slug: true }));
            validateField('slug', slug);
            if (slugTimer.current) window.clearTimeout(slugTimer.current);
            slugTimer.current = window.setTimeout(() => {
                if (slug.length >= 3) {
                    checkSlugAvailability(slug);
                }
            }, 400) as unknown as number;
        },
        [setData, checkSlugAvailability],
    );

    // Обработчик изменения slug
    const handleSlugChange = useCallback(
        (slug: string) => {
            setData('slug', slug);
            if (slug.length >= 3) {
                checkSlugAvailability(slug);
            } else {
                setSlugError('');
            }
        },
        [setData, checkSlugAvailability],
    );

    // Обработчик загрузки логотипа
    const handleLogoUpload = useCallback(
        async (file: File): Promise<string> => {
            try {
                const url = await uploadLogo(file);
                setLogoFile(file);
                return url;
            } catch (error) {
                console.error('Logo upload error:', error);
                throw error;
            }
        },
        [uploadLogo],
    );

    // Обработчик загрузки изображений организации
    const handleImagesUpload = useCallback(
        async (file: File): Promise<string> => {
            try {
                const url = await uploadImages(file);
                return url;
            } catch (error) {
                console.error('Images upload error:', error);
                throw error;
            }
        },
        [uploadImages],
    );

    // Обработчик удаления изображения
    const handleImageDelete = useCallback(async (imageId: string) => {
        // Здесь можно добавить логику удаления с сервера
        console.log('Delete image:', imageId);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Подготавливаем данные для отправки (только ожидаемые бэком поля)
        const formData = new FormData();

        const append = (key: string, value: unknown) => {
            if (value === undefined || value === null) return;
            if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            } else if (typeof value === 'number') {
                formData.append(key, String(value));
            } else {
                formData.append(key, String(value));
            }
        };

        // Основные поля
        append('name', data.name);
        append('slug', data.slug);
        append('description', data.description);
        append('type', data.type);
        append('status', data.status);

        // Контакты
        append('address', data.address);
        append('phone', data.phone);
        append('email', data.email);
        append('website', data.website);
        append('founded_at', data.founded_at);

        // Локация
        append('region_id', data.region_id);
        append('city_id', data.city_id);
        append('settlement_id', data.settlement_id);
        append('city_name', data.city_name);
        append('latitude', data.latitude);
        append('longitude', data.longitude);

        // Флаги
        append('is_public', data.is_public);
        append('admin_user_id', data.admin_user_id);
        append('create_site', data.create_site);

        // Платежные настройки
        formData.append('payment_settings', JSON.stringify(orgPayment));

        // Добавляем файлы
        if (logoFile) {
            formData.append('logo', logoFile);
        }
        organizationImages.forEach((image, index) => {
            if (image.file) {
                formData.append(`images[${index}]`, image.file);
            }
        });

        router.post('/dashboard/organizations', formData as unknown as any, {
            forceFormData: true,
        });
    };

    // selected type description no longer shown; remove unused variable

    // Backend error visibility (flash + general error + field errors)
    const page = usePage<{
        flash?: { error?: string };
        errors?: Record<string, string>;
    }>();
    const flashError = page.props.flash?.error;
    const pageErrors: Record<string, string> = page.props.errors || {};
    const generalError = pageErrors.general;

    const hasErrors =
        !!flashError ||
        !!generalError ||
        Object.keys(pageErrors).length > 0 ||
        slugError;

    // Prefer client error; hide server error if field is dirty
    const fieldError = (key: string): string | undefined => {
        if (clientErrors[key]) return clientErrors[key];
        if (dirty[key]) return undefined;
        return (
            (pageErrors as Record<string, string>)[key] || (errors as any)[key]
        );
    };

    // Client-side form validation before submit
    const validateForm = (): boolean => {
        const newErrs: Record<string, string> = {};
        if (!String(data.name || '').trim())
            newErrs.name = 'Введите название организации';
        const s = String(data.slug || '').trim();
        if (!s) newErrs.slug = 'Введите slug';
        else if (s.length < 3) newErrs.slug = 'Slug слишком короткий';
        else if (!/^[a-z0-9-]+$/.test(s))
            newErrs.slug = 'Только латиница, цифры и дефисы';
        setClientErrors((prev) => ({ ...prev, ...newErrs }));
        return Object.keys(newErrs).length === 0 && !slugError;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создать организацию" />

            <div className="create-organization">
                {/* Header */}
                <div className="create-organization__header">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад
                        </Button>
                        <div>
                            <h1 className="create-organization__title">
                                Создать организацию
                            </h1>
                            <p className="create-organization__subtitle">
                                Зарегистрировать новую организацию в системе
                            </p>
                        </div>
                    </div>

                    {hasErrors && (
                        <div className="create-organization__error-banner">
                            <AlertCircle className="h-5 w-5" />
                            <span>
                                {flashError ||
                                    generalError ||
                                    'Исправьте ошибки в форме'}
                            </span>
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="create-organization__form"
                >
                    {/* Основная информация */}
                    <div className="create-organization__main-content">
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Building2 className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Основная информация
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                {/* Название и slug */}
                                <div className="create-organization__field-group create-organization__field-group--two-columns">
                                    <div className="create-organization__field">
                                        <Label htmlFor="name">
                                            Название организации
                                            <span className="create-organization__required">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                handleNameChange(e.target.value)
                                            }
                                            placeholder="Введите название организации"
                                            className={
                                                fieldError('name')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('name') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('name')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="create-organization__field">
                                        <Label htmlFor="slug">
                                            URL slug
                                            <span className="create-organization__required">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) =>
                                                handleSlugChangeLocal(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="url-slug"
                                            className={
                                                fieldError('slug') || slugError
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {(fieldError('slug') || slugError) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('slug') ||
                                                    slugError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Тип и статус */}
                                <div className="create-organization__field-group create-organization__field-group--two-columns">
                                    <div className="create-organization__field">
                                        <Label htmlFor="type">
                                            Тип организации *
                                        </Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value) =>
                                                setData('type', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите тип организации" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {referenceData.organizationTypes.map(
                                                    (type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldError('type') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('type')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="create-organization__field">
                                        <Label htmlFor="status">Статус *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData(
                                                    'status',
                                                    value as
                                                        | 'active'
                                                        | 'inactive'
                                                        | 'pending',
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите статус" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">
                                                    Активна
                                                </SelectItem>
                                                <SelectItem value="inactive">
                                                    Неактивна
                                                </SelectItem>
                                                <SelectItem value="pending">
                                                    На рассмотрении
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldError('status') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('status')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Описание */}
                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <Label htmlFor="description">
                                            Описание
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Краткое описание организации"
                                            rows={3}
                                            className={
                                                fieldError('description')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('description') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('description')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Контактная информация */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Settings className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Контактная информация
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__field-group create-organization__field-group--two-columns">
                                    <div className="create-organization__field">
                                        <Label htmlFor="phone">Телефон</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                            placeholder="+7 (999) 123-45-67"
                                            className={
                                                fieldError('phone')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('phone') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('phone')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="create-organization__field">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="org@example.com"
                                            className={
                                                fieldError('email')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('email') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('email')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="create-organization__field-group create-organization__field-group--two-columns">
                                    <div className="create-organization__field">
                                        <Label htmlFor="website">
                                            Веб-сайт
                                        </Label>
                                        <Input
                                            id="website"
                                            value={data.website}
                                            onChange={(e) =>
                                                setData(
                                                    'website',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://example.com"
                                            className={
                                                fieldError('website')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('website') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('website')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="create-organization__field">
                                        <Label htmlFor="founded_at">
                                            Год основания
                                        </Label>
                                        <Input
                                            id="founded_at"
                                            type="date"
                                            value={data.founded_at || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'founded_at',
                                                    e.target.value,
                                                )
                                            }
                                            className={
                                                fieldError('founded_at')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('founded_at') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('founded_at')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <Label htmlFor="address">Адрес</Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Полный адрес организации"
                                            rows={2}
                                            className={
                                                fieldError('address')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('address') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('address')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Локация */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Settings className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Локация
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                {/* Карта выбора координат */}
                                <div className="mb-4">
                                    <div className="mb-2 text-sm text-gray-600">
                                        Перетащите карту или выберите точку для
                                        организации. Координаты сохраняются в
                                        поля широты и долготы.
                                    </div>
                                    <YandexMap
                                        center={[
                                            data.latitude || 55.751244,
                                            data.longitude || 37.618423,
                                        ]}
                                        zoom={12}
                                        markers={
                                            data.latitude && data.longitude
                                                ? [
                                                      {
                                                          id: 'org',
                                                          position: [
                                                              data.latitude,
                                                              data.longitude,
                                                          ],
                                                          hint: data.name,
                                                      },
                                                  ]
                                                : []
                                        }
                                        onBoundsChange={() => {}}
                                    />
                                </div>
                                <div className="create-organization__field-group create-organization__field-group--three-columns">
                                    <div className="create-organization__field">
                                        <UniversalSelect
                                            {...cascadeData.regions}
                                            value={data.region_id}
                                            onChange={(value) => {
                                                setData(
                                                    'region_id',
                                                    value as number,
                                                );
                                                setData('city_id', null);
                                                setData('settlement_id', null);
                                                cascadeData.handleRegionChange(
                                                    value as number,
                                                );
                                            }}
                                            label="Регион"
                                            placeholder="Выберите регион"
                                            searchable
                                            clearable
                                            error={fieldError('region_id')}
                                        />
                                    </div>

                                    <div className="create-organization__field">
                                        <UniversalSelect
                                            {...cascadeData.cities}
                                            value={data.city_id}
                                            onChange={(value) => {
                                                setData(
                                                    'city_id',
                                                    value as number,
                                                );
                                                setData('settlement_id', null);
                                                cascadeData.handleCityChange(
                                                    value as number,
                                                );
                                            }}
                                            label="Город"
                                            placeholder="Выберите город"
                                            searchable
                                            clearable
                                            disabled={!data.region_id}
                                            error={fieldError('city_id')}
                                        />
                                    </div>

                                    <div className="create-organization__field">
                                        <UniversalSelect
                                            {...cascadeData.settlements}
                                            value={data.settlement_id}
                                            onChange={(value) =>
                                                setData(
                                                    'settlement_id',
                                                    value as number,
                                                )
                                            }
                                            label="Населенный пункт"
                                            placeholder="Выберите населенный пункт"
                                            searchable
                                            clearable
                                            disabled={!data.city_id}
                                            error={fieldError('settlement_id')}
                                        />
                                    </div>
                                </div>
                                <div className="create-organization__field-group create-organization__field-group--two-columns">
                                    <div className="create-organization__field">
                                        <Label htmlFor="latitude">Широта</Label>
                                        <Input
                                            id="latitude"
                                            value={data.latitude ?? ''}
                                            onChange={(e) =>
                                                setData(
                                                    'latitude',
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                )
                                            }
                                            placeholder="Например: 55.751244"
                                            className={
                                                fieldError('latitude')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('latitude') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('latitude')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="create-organization__field">
                                        <Label htmlFor="longitude">
                                            Долгота
                                        </Label>
                                        <Input
                                            id="longitude"
                                            value={data.longitude ?? ''}
                                            onChange={(e) =>
                                                setData(
                                                    'longitude',
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                )
                                            }
                                            placeholder="Например: 37.618423"
                                            className={
                                                fieldError('longitude')
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {fieldError('longitude') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {fieldError('longitude')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Платежные настройки */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Settings className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Платежные настройки
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <PaymentGatewaysSettings
                                    value={orgPayment}
                                    onChange={(k, v) =>
                                        setOrgPayment((prev) => ({
                                            ...(prev || {}),
                                            [k]: v,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Боковая панель */}
                    <div className="create-organization__sidebar">
                        {/* Медиа */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Settings className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Медиа
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <LogoUploader
                                            value={logoFile}
                                            onChange={(file) => {
                                                setLogoFile(file);
                                            }}
                                            label="Логотип организации"
                                            onUpload={handleLogoUpload}
                                            maxSize={5 * 1024 * 1024} // 5MB
                                            aspectRatio={1} // Квадрат
                                            showCropControls={true}
                                        />
                                    </div>
                                </div>

                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <Label className="mb-2 block">
                                            Изображения организации
                                        </Label>
                                        <MultiImageUploader
                                            images={organizationImages}
                                            onChange={setOrganizationImages}
                                            maxFiles={10}
                                            maxSize={2 * 1024 * 1024} // 2MB
                                            onUpload={handleImagesUpload}
                                            onDelete={handleImageDelete}
                                            enableSorting={true}
                                            enableDeletion={true}
                                            showPreview={true}
                                            showFileInfo={true}
                                            layout="grid"
                                            previewSize="md"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Настройки */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Settings className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Настройки
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__checkbox-group">
                                    <Checkbox
                                        id="is_public"
                                        checked={data.is_public}
                                        onCheckedChange={(checked) =>
                                            setData('is_public', !!checked)
                                        }
                                    />
                                    <Label
                                        htmlFor="is_public"
                                        className="create-organization__checkbox-label"
                                    >
                                        Публичная организация
                                    </Label>
                                </div>

                                <div className="create-organization__checkbox-group">
                                    <Checkbox
                                        id="create_site"
                                        checked={data.create_site}
                                        onCheckedChange={(checked) =>
                                            setData('create_site', !!checked)
                                        }
                                    />
                                    <Label
                                        htmlFor="create_site"
                                        className="create-organization__checkbox-label"
                                    >
                                        Создать сайт
                                    </Label>
                                </div>

                                {/* Template selection removed: default to 'modern' */}
                            </div>
                        </div>

                        {/* Администратор */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Settings className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Администратор
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <UniversalSelect
                                            {...usersData}
                                            value={data.admin_user_id}
                                            onChange={(value) =>
                                                setData(
                                                    'admin_user_id',
                                                    value as number,
                                                )
                                            }
                                            label="Назначить администратора"
                                            placeholder="Выберите пользователя"
                                            searchable
                                            clearable
                                            error={fieldError('admin_user_id')}
                                        />
                                        <p className="create-organization__help-text">
                                            Администратор может быть назначен
                                            позже
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {progress && (
                        <div className="create-organization__progress">
                            <div
                                className="create-organization__progress-bar"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                    )}

                    {/* Submit buttons */}
                    <div className="create-organization__actions">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="create-organization__button create-organization__button--secondary"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="create-organization__button create-organization__button--primary"
                        >
                            <Save className="create-organization__button-icon" />
                            {processing ? (
                                <>
                                    <div className="create-organization__loading" />
                                    Создание...
                                </>
                            ) : (
                                'Создать организацию'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
