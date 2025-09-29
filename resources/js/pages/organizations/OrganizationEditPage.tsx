import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RegionSelect } from '@/components/ui/region-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Save, Settings, Upload } from 'lucide-react';
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
        title: 'Редактирование',
        href: '#',
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

interface Organization {
    id: number;
    name: string;
    slug: string;
    description?: string;
    type: string;
    status: 'active' | 'inactive' | 'pending';
    is_public: boolean;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo?: string;
    founded_at?: string;
    region?: Region;
    city?: City;
    settlement?: Settlement;
}

interface Props {
    organization: Organization;
    referenceData: {
        organizationTypes: Array<{
            value: string;
            label: string;
            description: string;
        }>;
        regions: Region[];
        cities: City[];
        settlements: Settlement[];
    };
}

export default function OrganizationEditPage({
    organization,
    referenceData,
}: Props) {
    const [selectedRegion, setSelectedRegion] = useState<number | null>(
        organization.region?.id || null,
    );
    const [selectedCity, setSelectedCity] = useState<number | null>(
        organization.city?.id || null,
    );
    const [cities, setCities] = useState<City[]>(referenceData.cities);
    const [settlements, setSettlements] = useState<Settlement[]>(
        referenceData.settlements,
    );
    const [logoPreview, setLogoPreview] = useState<string | null>(
        organization.logo || null,
    );
    const [imagesPreview, setImagesPreview] = useState<string[]>([]);

    const { data, setData, put, processing, errors } = useForm({
        // Основные данные
        name: organization.name,
        slug: organization.slug,
        description: organization.description || '',
        type: organization.type,
        status: organization.status,

        // Контактная информация
        address: organization.address || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',

        // Локация
        region_id: organization.region?.id || null,
        city_id: organization.city?.id || null,
        settlement_id: organization.settlement?.id || null,
        city_name: '',
        latitude: null as number | null,
        longitude: null as number | null,

        // Медиа
        logo: null as File | null,
        images: [] as File[],

        // Дополнительные данные
        founded_at: organization.founded_at || null,
        is_public: organization.is_public,
    });

    // Загрузка городов при выборе региона
    useEffect(() => {
        if (selectedRegion) {
            fetch(`/dashboard/api/cities-by-region?region_id=${selectedRegion}`)
                .then((response) => response.json())
                .then((data) => {
                    setCities(data);
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
                })
                .catch((error) =>
                    console.error('Error loading settlements:', error),
                );
        }
    }, [selectedCity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Отладочная информация
        console.log('Form data:', data);

        // Отправляем через Inertia.js напрямую
        put(`/dashboard/organizations/${organization.id}`, {
            onSuccess: () => {
                window.location.href = '/dashboard/organizations';
            },
            onError: (errors: Record<string, string>) => {
                console.error('Validation errors:', errors);
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

    const selectedTypeConfig = referenceData.organizationTypes.find(
        (type) => type.value === data.type,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактировать ${organization.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard/organizations">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Редактировать организацию
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Изменить данные организации
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
                                                onChange={(e) =>
                                                    setData(
                                                        'slug',
                                                        e.target.value,
                                                    )
                                                }
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

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите тип организации" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {referenceData.organizationTypes.map(
                                                        (type) => (
                                                            <SelectItem
                                                                key={type.value}
                                                                value={
                                                                    type.value
                                                                }
                                                            >
                                                                {type.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {selectedTypeConfig && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {
                                                        selectedTypeConfig.description
                                                    }
                                                </p>
                                            )}
                                            {errors.type && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.type}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="status">
                                                Статус *
                                            </Label>
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
                                            {errors.status && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.status}
                                                </p>
                                            )}
                                        </div>
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
                                            <RegionSelect
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
                                                label="Регион"
                                                placeholder="Выберите регион"
                                                error={errors.region_id}
                                            />
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
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите город" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cities.map((city) => (
                                                        <SelectItem
                                                            key={city.id}
                                                            value={city.id.toString()}
                                                        >
                                                            {city.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
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
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите населенный пункт" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {settlements.map(
                                                        (settlement) => (
                                                            <SelectItem
                                                                key={
                                                                    settlement.id
                                                                }
                                                                value={settlement.id.toString()}
                                                            >
                                                                {
                                                                    settlement.name
                                                                }
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
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
                                        <Label>Логотип организации</Label>
                                        <ImageUpload
                                            type="organization-logo"
                                            currentImage={
                                                organization.logo
                                                    ? `/storage/${organization.logo}`
                                                    : undefined
                                            }
                                            onUpload={(result) => {
                                                setData(
                                                    'logo',
                                                    result.filename,
                                                );
                                                setLogoPreview(result.url);
                                            }}
                                            onError={(error) => {
                                                console.error(
                                                    'Upload error:',
                                                    error,
                                                );
                                            }}
                                            onRemove={() => {
                                                setData('logo', null);
                                                setLogoPreview(null);
                                            }}
                                            maxSize={10}
                                        />
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
                                </CardContent>
                            </Card>
                        </div>
                    </div>

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
                            <Save className="mr-2 h-4 w-4" />
                            {processing
                                ? 'Сохранение...'
                                : 'Сохранить изменения'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
