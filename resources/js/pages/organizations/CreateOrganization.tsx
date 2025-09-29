import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Settings, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
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

interface City {
    id: number;
    name: string;
    region_id: number;
}

interface Settlement {
    id: number;
    name: string;
    city_id: number;
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
        cities: City[];
        settlements: Settlement[];
        availableUsers: User[];
    };
}

export default function CreateOrganization({ referenceData }: Props) {
    const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [imagesPreview, setImagesPreview] = useState<string[]>([]);

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

        // Локация
        region_id: null as number | null,
        city_id: null as number | null,
        settlement_id: null as number | null,
        city_name: '',
        latitude: null as number | null,
        longitude: null as number | null,

        // Медиа
        logo: null as File | null,
        images: [] as File[],

        // Дополнительные данные
        contacts: {},
        features: {},
        founded_at: null as string | null,
        is_public: true,

        // Администратор
        admin_user_id: null as number | null,

        // Настройки по умолчанию
        create_gallery: true,
        create_slider: true,
        create_site: false,
        site_template: 'default',
    });

    // Загрузка городов при выборе региона
    useEffect(() => {
        if (selectedRegion) {
            fetch(`/dashboard/api/cities-by-region?region_id=${selectedRegion}`)
                .then((response) => response.json())
                .then((data) => {
                    setCities(data);
                    setData('city_id', null);
                    setSettlements([]);
                    setData('settlement_id', null);
                })
                .catch((error) =>
                    console.error('Error loading cities:', error),
                );
        }
    }, [selectedRegion]);

    // Загрузка населенных пунктов при выборе города
    useEffect(() => {
        if (selectedCity) {
            fetch(`/dashboard/api/settlements-by-city?city_id=${selectedCity}`)
                .then((response) => response.json())
                .then((data) => {
                    setSettlements(data);
                    setData('settlement_id', null);
                })
                .catch((error) =>
                    console.error('Error loading settlements:', error),
                );
        }
    }, [selectedCity]);

    // Генерация slug из названия
    useEffect(() => {
        if (data.name && !data.slug) {
            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setData('slug', slug);
        }
    }, [data.name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/organizations', {
            forceFormData: true,
            onSuccess: () => {
                // Перенаправление будет выполнено сервером
            },
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('images', files);
            const previews: string[] = [];
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previews.push(e.target?.result as string);
                    if (previews.length === files.length) {
                        setImagesPreview(previews);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const checkSlugAvailability = async (slug: string) => {
        if (slug.length < 3) return;

        try {
            const response = await fetch('/dashboard/api/check-slug', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ slug }),
            });
            const result = await response.json();

            if (!result.available) {
                // Можно показать предупреждение пользователю
                console.warn('Slug уже используется');
            }
        } catch (error) {
            console.error('Error checking slug:', error);
        }
    };

    const selectedTypeConfig = referenceData.organizationTypes.find(
        (type) => type.value === data.type,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создать организацию" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Создать организацию
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Зарегистрировать новую организацию в системе
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Основная информация */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Building2 className="h-5 w-5" />
                                        <span>Основная информация</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name">
                                                Название организации *
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Введите название организации"
                                                className="mt-1"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="slug">
                                                URL slug
                                            </Label>
                                            <Input
                                                id="slug"
                                                value={data.slug}
                                                onChange={(e) => {
                                                    setData(
                                                        'slug',
                                                        e.target.value,
                                                    );
                                                    checkSlugAvailability(
                                                        e.target.value,
                                                    );
                                                }}
                                                placeholder="url-slug"
                                                className="mt-1"
                                            />
                                            {errors.slug && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.slug}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="type">
                                            Тип организации *
                                        </Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value) =>
                                                setData('type', value)
                                            }
                                        >
                                            {referenceData.organizationTypes.map(
                                                (type) => (
                                                    <option
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        {type.label}
                                                    </option>
                                                ),
                                            )}
                                        </Select>
                                        {selectedTypeConfig && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {selectedTypeConfig.description}
                                            </p>
                                        )}
                                        {errors.type && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>

                                    <div>
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
                                            className="mt-1"
                                            rows={3}
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Контактная информация */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Контактная информация</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="phone">
                                                Телефон
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="+7 (999) 123-45-67"
                                                className="mt-1"
                                            />
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="org@example.com"
                                                className="mt-1"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
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
                                                className="mt-1"
                                            />
                                            {errors.website && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.website}
                                                </p>
                                            )}
                                        </div>

                                        <div>
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
                                                className="mt-1"
                                            />
                                            {errors.founded_at && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.founded_at}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
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
                                            className="mt-1"
                                            rows={2}
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Локация */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Локация</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <Label htmlFor="region_id">
                                                Регион
                                            </Label>
                                            <Select
                                                value={
                                                    data.region_id?.toString() ||
                                                    ''
                                                }
                                                onValueChange={(value) => {
                                                    setSelectedRegion(
                                                        parseInt(value),
                                                    );
                                                    setData(
                                                        'region_id',
                                                        parseInt(value),
                                                    );
                                                }}
                                            >
                                                <option value="">
                                                    Выберите регион
                                                </option>
                                                {referenceData.regions.map(
                                                    (region) => (
                                                        <option
                                                            key={region.id}
                                                            value={region.id}
                                                        >
                                                            {region.name}
                                                        </option>
                                                    ),
                                                )}
                                            </Select>
                                            {errors.region_id && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.region_id}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="city_id">
                                                Город
                                            </Label>
                                            <Select
                                                value={
                                                    data.city_id?.toString() ||
                                                    ''
                                                }
                                                onValueChange={(value) => {
                                                    setSelectedCity(
                                                        parseInt(value),
                                                    );
                                                    setData(
                                                        'city_id',
                                                        parseInt(value),
                                                    );
                                                }}
                                                disabled={!selectedRegion}
                                            >
                                                <option value="">
                                                    Выберите город
                                                </option>
                                                {cities.map((city) => (
                                                    <option
                                                        key={city.id}
                                                        value={city.id}
                                                    >
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </Select>
                                            {errors.city_id && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.city_id}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="settlement_id">
                                                Населенный пункт
                                            </Label>
                                            <Select
                                                value={
                                                    data.settlement_id?.toString() ||
                                                    ''
                                                }
                                                onValueChange={(value) =>
                                                    setData(
                                                        'settlement_id',
                                                        parseInt(value),
                                                    )
                                                }
                                                disabled={!selectedCity}
                                            >
                                                <option value="">
                                                    Выберите населенный пункт
                                                </option>
                                                {settlements.map(
                                                    (settlement) => (
                                                        <option
                                                            key={settlement.id}
                                                            value={
                                                                settlement.id
                                                            }
                                                        >
                                                            {settlement.name}
                                                        </option>
                                                    ),
                                                )}
                                            </Select>
                                            {errors.settlement_id && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.settlement_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Боковая панель */}
                        <div className="space-y-6">
                            {/* Медиа */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Медиа</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="logo">Логотип</Label>
                                        <div className="mt-1">
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="logo"
                                                className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                                            >
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="h-full w-full rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            Загрузить логотип
                                                        </p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        {errors.logo && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.logo}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="images">
                                            Изображения
                                        </Label>
                                        <div className="mt-1">
                                            <Input
                                                id="images"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImagesChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="images"
                                                className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                                            >
                                                <div className="text-center">
                                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        Загрузить изображения
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                        {imagesPreview.length > 0 && (
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                {imagesPreview.map(
                                                    (preview, index) => (
                                                        <img
                                                            key={index}
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-16 w-full rounded object-cover"
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        )}
                                        {errors.images && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.images}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Настройки */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Settings className="h-5 w-5" />
                                        <span>Настройки</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_public"
                                            checked={data.is_public}
                                            onCheckedChange={(checked) =>
                                                setData('is_public', !!checked)
                                            }
                                        />
                                        <Label htmlFor="is_public">
                                            Публичная организация
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="create_gallery"
                                            checked={data.create_gallery}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'create_gallery',
                                                    !!checked,
                                                )
                                            }
                                        />
                                        <Label htmlFor="create_gallery">
                                            Создать галлерею
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="create_slider"
                                            checked={data.create_slider}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'create_slider',
                                                    !!checked,
                                                )
                                            }
                                        />
                                        <Label htmlFor="create_slider">
                                            Создать слайдер
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="create_site"
                                            checked={data.create_site}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'create_site',
                                                    !!checked,
                                                )
                                            }
                                        />
                                        <Label htmlFor="create_site">
                                            Создать сайт
                                        </Label>
                                    </div>

                                    {data.create_site && (
                                        <div>
                                            <Label htmlFor="site_template">
                                                Шаблон сайта
                                            </Label>
                                            <Select
                                                value={data.site_template}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'site_template',
                                                        value,
                                                    )
                                                }
                                            >
                                                <option value="default">
                                                    Стандартный
                                                </option>
                                                <option value="modern">
                                                    Современный
                                                </option>
                                                <option value="classic">
                                                    Классический
                                                </option>
                                            </Select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Администратор */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Администратор</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label htmlFor="admin_user_id">
                                            Назначить администратора
                                        </Label>
                                        <Select
                                            value={
                                                data.admin_user_id?.toString() ||
                                                ''
                                            }
                                            onValueChange={(value) =>
                                                setData(
                                                    'admin_user_id',
                                                    parseInt(value),
                                                )
                                            }
                                        >
                                            <option value="">
                                                Выберите пользователя
                                            </option>
                                            {referenceData.availableUsers.map(
                                                (user) => (
                                                    <option
                                                        key={user.id}
                                                        value={user.id}
                                                    >
                                                        {user.name} (
                                                        {user.email})
                                                    </option>
                                                ),
                                            )}
                                        </Select>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Администратор может быть назначен
                                            позже
                                        </p>
                                        {errors.admin_user_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.admin_user_id}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {progress && (
                        <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${progress.percentage}%` }}
                            ></div>
                        </div>
                    )}

                    {/* Submit buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Создание...' : 'Создать организацию'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
