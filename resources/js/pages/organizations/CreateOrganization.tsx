import YandexMap from '@/components/maps/YandexMap';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import MultiImageUploader, {
    UploadedImage,
} from '@/components/ui/image-uploader/MultiImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import UniversalSelect from '@/components/ui/universal-select/UniversalSelect';
import { useOrganizationsApi } from '@/hooks/useOrganizationsApi';
import { useCascadeSelectData, useSelectData } from '@/hooks/useSelectData';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Save,
    Settings,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

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

    // Преобразуем типы организаций в формат селекта
    const organizationTypeOptions = useMemo(
        () =>
            referenceData.organizationTypes.map((type) => ({
                value: type.value,
                label: type.label,
                description: type.description,
            })),
        [referenceData.organizationTypes],
    );

    const { data, setData, post, processing, errors, progress } = useForm({
        // Основные данные
        name: '',
        slug: '',
        description: '',
        type: 'school',

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
        contacts: {},
        features: {},
        is_public: true,

        // Администратор
        admin_user_id: null as number | null,

        // Настройки по умолчанию
        create_gallery: true,
        create_slider: true,
        create_site: false,
        site_template: 'default',
    });

    // Генерация slug из названия
    React.useEffect(() => {
        if (data.name && !data.slug) {
            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setData('slug', slug);
        }
    }, [data.name, data.slug, setData]);

    // Проверка доступности slug
    const checkSlugAvailability = useCallback(
        async (slug: string) => {
            if (slug.length < 3) {
                setSlugError('');
                return;
            }

            try {
                const available = await checkSlug(slug);
                setSlugError(available ? '' : 'Этот slug уже используется');
            } catch (error) {
                console.error('Error checking slug:', error);
                setSlugError('Ошибка проверки slug');
            }
        },
        [checkSlug],
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

        // Подготавливаем данные для отправки
        const formData = new FormData();

        // Основные данные
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        // Добавляем файлы
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        organizationImages.forEach((image, index) => {
            if (image.file) {
                formData.append(`images[${index}]`, image.file);
            }
        });

        post('/dashboard/organizations', {
            forceFormData: true,
            onSuccess: () => {
                // Перенаправление будет выполнено сервером
            },
        });
    };

    const selectedTypeConfig = referenceData.organizationTypes.find(
        (type) => type.value === data.type,
    );

    const hasErrors = Object.keys(errors).length > 0 || slugError;

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
                            <span>Исправьте ошибки в форме</span>
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
                                                setData('name', e.target.value)
                                            }
                                            placeholder="Введите название организации"
                                            className={
                                                errors.name
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.name}
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
                                                handleSlugChange(e.target.value)
                                            }
                                            placeholder="url-slug"
                                            className={
                                                errors.slug || slugError
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {(errors.slug || slugError) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.slug || slugError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <UniversalSelect
                                            options={organizationTypeOptions}
                                            value={data.type}
                                            onChange={(value) =>
                                                setData('type', value as string)
                                            }
                                            label="Тип организации"
                                            required
                                            placeholder="Выберите тип организации"
                                            error={errors.type}
                                        />
                                        {selectedTypeConfig && (
                                            <p className="create-organization__help-text">
                                                {selectedTypeConfig.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

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
                                                errors.description
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.description}
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
                                                errors.phone
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.phone}
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
                                                errors.email
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.email}
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
                                                errors.website
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.website && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.website}
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
                                                errors.founded_at
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.founded_at && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.founded_at}
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
                                                errors.address
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.address}
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
                                            error={errors.region_id}
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
                                            error={errors.city_id}
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
                                            error={errors.settlement_id}
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
                                        />
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
                                        />
                                    </div>
                                </div>
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
                                        id="create_gallery"
                                        checked={data.create_gallery}
                                        onCheckedChange={(checked) =>
                                            setData('create_gallery', !!checked)
                                        }
                                    />
                                    <Label
                                        htmlFor="create_gallery"
                                        className="create-organization__checkbox-label"
                                    >
                                        Создать галерею
                                    </Label>
                                </div>

                                <div className="create-organization__checkbox-group">
                                    <Checkbox
                                        id="create_slider"
                                        checked={data.create_slider}
                                        onCheckedChange={(checked) =>
                                            setData('create_slider', !!checked)
                                        }
                                    />
                                    <Label
                                        htmlFor="create_slider"
                                        className="create-organization__checkbox-label"
                                    >
                                        Создать слайдер
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
                                            error={errors.admin_user_id}
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
                            disabled={processing || !!hasErrors}
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
