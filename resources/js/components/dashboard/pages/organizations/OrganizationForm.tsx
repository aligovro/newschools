import YandexMap from '@/components/maps/YandexMap';
import PaymentGatewaysSettings, {
    type PaymentGatewaysSettingsValue,
} from '@/components/dashboard/payments/PaymentGatewaysSettings';
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
import {
    useCascadeSelectData,
    useGeoSelectData,
} from '@/hooks/useGeoSelectData';
import { router, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { OrganizationFormProps, Status } from './types';

export default function OrganizationForm({
    mode,
    organization,
    referenceData,
    organizationSettings,
}: OrganizationFormProps) {
    const isEdit = mode === 'edit' && !!organization?.id;

    const [name, setName] = useState(organization?.name ?? '');
    const [slug, setSlug] = useState(organization?.slug ?? '');
    const [description, setDescription] = useState(
        organization?.description ?? '',
    );
    const [type, setType] = useState<string>(organization?.type ?? 'school');
    const [status, setStatus] = useState<Status>(
        (organization?.status as Status) ?? 'active',
    );
    const [address, setAddress] = useState(organization?.address ?? '');
    const [phone, setPhone] = useState(organization?.phone ?? '');
    const [email, setEmail] = useState(organization?.email ?? '');
    const [website, setWebsite] = useState(organization?.website ?? '');
    const [isPublic, setIsPublic] = useState<boolean>(
        organization?.is_public ?? true,
    );
    // Client-side validation helpers
    const [dirty, setDirty] = useState<Record<string, boolean>>({});
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );
    const page = usePage<{
        flash?: { success?: string; error?: string };
        errors?: Record<string, string>;
    }>();
    const flashSuccess = page.props.flash?.success;
    const flashError = page.props.flash?.error;
    const serverErrors: Record<string, string> = page.props.errors || {};
    // Локация (как в форме создания)
    const [regionId, setRegionId] = useState<number | null>(
        organization?.region?.id ?? null,
    );
    const [cityId, setCityId] = useState<number | null>(
        organization?.city?.id ?? null,
    );
    const [cityName, _setCityName] = useState<string>('');
    const [latitude, setLatitude] = useState<number | null>(
        organization?.latitude ?? null,
    );
    const [longitude, setLongitude] = useState<number | null>(
        organization?.longitude ?? null,
    );
    const [mapCenter, setMapCenter] = useState<[number, number]>([
        organization?.latitude ?? 55.751244,
        organization?.longitude ?? 37.618423,
    ]);

    const fetchRegionCenter = useCallback(
        async (id: number) => {
            try {
                const res = await fetch(`/dashboard/api/regions/${id}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data?.latitude && data?.longitude) {
                    setMapCenter([
                        Number(data.latitude),
                        Number(data.longitude),
                    ]);
                    if (!latitude || !longitude) {
                        setLatitude(Number(data.latitude));
                        setLongitude(Number(data.longitude));
                    }
                }
            } catch {
                // ignore
            }
        },
        [latitude, longitude],
    );

    const fetchCityCenter = useCallback(
        async (id: number) => {
            try {
                const res = await fetch(`/dashboard/api/cities/${id}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data?.latitude && data?.longitude) {
                    setMapCenter([
                        Number(data.latitude),
                        Number(data.longitude),
                    ]);
                    if (!latitude || !longitude) {
                        setLatitude(Number(data.latitude));
                        setLongitude(Number(data.longitude));
                    }
                }
            } catch {
                // ignore
            }
        },
        [latitude, longitude],
    );

    const cascadeData = useCascadeSelectData();
    const usersData = useGeoSelectData({
        endpoint: '/dashboard/api/users',
        transformResponse: (data: unknown[]) =>
            data.map((item: any) => ({
                value: item.id,
                label: item.name,
                description: item.email,
            })),
    });
    const [adminUserId, setAdminUserId] = useState<number | null>(
        (organization as any)?.admin_user_id ?? null,
    );
    const [regionLoaded, setRegionLoaded] = useState(false);
    const [cityLoaded, setCityLoaded] = useState(false);

    // Prefill cascading selects (load cities and settlements lists)
    useEffect(() => {
        if (regionId) {
            // Установим регион в каскадном хука и сразу подгрузим его города
            cascadeData.handleRegionChange(regionId);
            if (cascadeData.cities?.setExtraParams) {
                cascadeData.cities.setExtraParams({ region_id: regionId });
                cascadeData.cities.refresh();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (cityId) {
            // Установим город после того, как регион зафиксирован
            cascadeData.handleCityChange(cityId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Сформировать список опций для регионов с приоритетом сохраненного региона
    const regionOptions = useMemo(() => {
        const opts = cascadeData.regions.options || [];
        if (
            regionId &&
            organization?.region &&
            opts.every((o: any) => o.value !== regionId)
        ) {
            return [
                {
                    value: organization.region.id,
                    label: organization.region.name,
                    description: organization.region.code
                        ? `Код: ${organization.region.code}`
                        : undefined,
                },
                ...opts,
            ];
        }
        return opts;
    }, [cascadeData.regions.options, regionId, organization?.region]);

    // УДАЛЕНЫ эффекты ensureRegionInOptions / ensureCityInOptions, чтобы не мутировать options напрямую

    const [logoValue, setLogoValue] = useState<string | File | null>(
        organization?.logo ? `/storage/${organization.logo}` : null,
    );
    const initialGallery: UploadedImage[] = useMemo(
        () =>
            Array.isArray(organization?.images)
                ? organization!.images!.map((path, idx) => ({
                      id: `${idx}`,
                      url: `/storage/${path}`,
                      file: undefined,
                      name: path.split('/').pop() || `image-${idx + 1}.jpg`,
                      size: 0,
                      type: 'image/*',
                      status: 'success',
                  }))
                : [],
        [organization?.images],
    );
    const [galleryImages, setGalleryImages] =
        useState<UploadedImage[]>(initialGallery);

    const initialPayments: PaymentGatewaysSettingsValue = useMemo(() => {
        const ps = (organizationSettings?.payment_settings || {}) as any;
        const enabled = Array.isArray(ps.enabled_gateways)
            ? ps.enabled_gateways
            : ps.gateway
              ? [ps.gateway]
              : ['yookassa'];
        return {
            enabled_gateways: enabled,
            credentials: ps.credentials || {},
            currency: ps.currency || 'RUB',
            test_mode: typeof ps.test_mode === 'boolean' ? ps.test_mode : true,
            donation_min_amount:
                typeof ps.donation_min_amount === 'number'
                    ? ps.donation_min_amount
                    : 100,
            donation_max_amount:
                typeof ps.donation_max_amount === 'number'
                    ? ps.donation_max_amount
                    : 0,
        };
    }, [organizationSettings]);
    const [orgPayment, setOrgPayment] =
        useState<PaymentGatewaysSettingsValue>(initialPayments);

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

    const fieldError = (key: string): string | undefined => {
        if (clientErrors[key]) return clientErrors[key];
        if (dirty[key]) return undefined;
        return serverErrors[key];
    };

    const onSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            // minimal client-side validation
            validateField('name', name);
            validateField('slug', slug);
            const hasClientErrors = Boolean(
                (clientErrors.name && clientErrors.name.length) ||
                    (clientErrors.slug && clientErrors.slug.length) ||
                    !String(name || '').trim() ||
                    !String(slug || '').trim() ||
                    (String(slug || '').trim().length > 0 &&
                        (String(slug || '').trim().length < 3 ||
                            !/^[a-z0-9-]+$/.test(String(slug || '').trim()))),
            );
            if (hasClientErrors) return;
            const formData = new FormData();
            const append = (k: string, v: unknown) => {
                if (v === undefined || v === null) return;
                if (typeof v === 'boolean') formData.append(k, v ? '1' : '0');
                else formData.append(k, String(v));
            };

            append('name', name);
            append('slug', slug);
            append('description', description);
            append('type', type);
            append('status', status);
            append('address', address);
            append('phone', phone);
            append('email', email);
            append('website', website);
            append('is_public', isPublic);
            // Локация
            append('region_id', regionId);
            append('city_id', cityId);
            append('city_name', cityName);
            append('latitude', latitude);
            append('longitude', longitude);
            append('admin_user_id', adminUserId);
            formData.append('payment_settings', JSON.stringify(orgPayment));

            if (logoValue instanceof File) formData.append('logo', logoValue);

            // Отправляем существующие изображения (без файла) и новые файлы
            const existingImages: string[] = [];
            galleryImages.forEach((img, i) => {
                if (img.file) {
                    // Новый файл
                    formData.append(`images[${i}]`, img.file);
                } else if (img.url) {
                    // Существующее изображение - сохраняем путь
                    const path = img.url.startsWith('/storage/')
                        ? img.url.replace('/storage/', '')
                        : img.url;
                    existingImages.push(path);
                }
            });

            // Отправляем массив существующих изображений
            if (existingImages.length > 0) {
                existingImages.forEach((path, i) => {
                    formData.append(`existing_images[${i}]`, path);
                });
            }

            const url = isEdit
                ? `/dashboard/organizations/${organization!.id}`
                : '/dashboard/organizations';

            // Для PUT используем _method в payload (как в форме проекта)
            if (isEdit) {
                formData.append('_method', 'PUT');
            }

            router.post(url, formData as any, {
                forceFormData: true,
            });
        },
        [
            address,
            adminUserId,
            description,
            email,
            galleryImages,
            isEdit,
            isPublic,
            logoValue,
            name,
            orgPayment,
            organization,
            phone,
            slug,
            status,
            type,
            website,
            cityId,
            cityName,
            latitude,
            longitude,
            regionId,
            clientErrors,
        ],
    );

    const terminology = (page.props as any).terminology || {};

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {(flashSuccess || flashError) && (
                <div
                    className={
                        flashSuccess
                            ? 'rounded-md border border-green-200 bg-green-50 p-3 text-green-800'
                            : 'rounded-md border border-red-200 bg-red-50 p-3 text-red-800'
                    }
                >
                    {flashSuccess || flashError}
                </div>
            )}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-lg border bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="org-name">
                                    Название организации *
                                </Label>
                                <Input
                                    id="org-name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setDirty((d) => ({ ...d, name: true }));
                                        validateField('name', e.target.value);
                                    }}
                                />
                                {fieldError('name') && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {fieldError('name')}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="org-slug">URL slug *</Label>
                                <Input
                                    id="org-slug"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlug(e.target.value);
                                        setDirty((d) => ({ ...d, slug: true }));
                                        validateField('slug', e.target.value);
                                    }}
                                />
                                {fieldError('slug') && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {fieldError('slug')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Тип организации *</Label>
                                <Select
                                    value={type}
                                    onValueChange={(v) => setType(v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите тип" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {referenceData.organizationTypes.map(
                                            (t) => (
                                                <SelectItem
                                                    key={t.value}
                                                    value={t.value}
                                                >
                                                    {t.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Статус *</Label>
                                <Select
                                    value={status}
                                    onValueChange={(v) =>
                                        setStatus(v as Status)
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
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="org-desc">Описание</Label>
                            <Textarea
                                id="org-desc"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="org-phone">Телефон</Label>
                                <Input
                                    id="org-phone"
                                    value={phone ?? ''}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="org-email">Email</Label>
                                <Input
                                    id="org-email"
                                    type="email"
                                    value={email ?? ''}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="org-website">Веб-сайт</Label>
                                <Input
                                    id="org-website"
                                    value={website ?? ''}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="org-address">Адрес</Label>
                            <Textarea
                                id="org-address"
                                rows={2}
                                value={address ?? ''}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                        <Label className="mb-2 block">Локация</Label>
                        <div className="mb-4 text-sm text-gray-600">
                            Перетащите карту или выберите точку для организации.
                            Координаты сохраняются ниже.
                        </div>
                        <div className="mb-4">
                            <YandexMap
                                center={mapCenter}
                                zoom={12}
                                markers={
                                    latitude && longitude
                                        ? [
                                              {
                                                  id: 'org',
                                                  position: [
                                                      latitude,
                                                      longitude,
                                                  ],
                                                  hint: name || 'Организация',
                                                  balloon:
                                                      name || 'Организация',
                                              },
                                          ]
                                        : []
                                }
                                allowMarkerClick={true}
                                draggableMarker={true}
                                onClick={(coords) => {
                                    setLatitude(coords[0]);
                                    setLongitude(coords[1]);
                                }}
                                onBoundsChange={() => {}}
                            />
                        </div>
                        <div className="mb-2 text-xs text-gray-500">
                            Кликните на карте, чтобы установить метку, или
                            перетащите метку для изменения координат
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <UniversalSelect
                                    {...cascadeData.regions}
                                    value={regionId}
                                    options={regionOptions}
                                    onChange={(value) => {
                                        setRegionId(value as number);
                                        setCityId(null);
                                        cascadeData.handleRegionChange(
                                            value as number,
                                        );
                                        // Запрашиваем координаты региона и центрируем карту
                                        if (value)
                                            fetchRegionCenter(value as number);
                                    }}
                                    error={undefined}
                                    label="Регион"
                                    placeholder="Выберите регион"
                                    searchable
                                    clearable
                                    onSearch={cascadeData.regions.setSearch}
                                    searchValue={cascadeData.regions.search}
                                />
                            </div>
                            <div>
                                <UniversalSelect
                                    {...cascadeData.cities}
                                    onChange={(value) => {
                                        setCityId(value as number);
                                        cascadeData.handleCityChange(
                                            value as number,
                                        );
                                        // Запрашиваем координаты города и центрируем карту
                                        if (value)
                                            fetchCityCenter(value as number);
                                    }}
                                    error={undefined}
                                    label="Город"
                                    placeholder="Выберите город"
                                    searchable
                                    clearable
                                    onSearch={cascadeData.cities.setSearch}
                                    searchValue={cascadeData.cities.search}
                                />
                            </div>
                            <div>
                                <Label htmlFor="org-address">Адрес</Label>
                                <Input
                                    id="org-address"
                                    value={address ?? ''}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder={`Введите адрес ${terminology.organization?.singular_genitive || 'организации'}`}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="latitude">Широта</Label>
                                <Input
                                    id="latitude"
                                    value={latitude ?? ''}
                                    onChange={(e) =>
                                        setLatitude(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        )
                                    }
                                    placeholder="Например: 55.751244"
                                />
                            </div>
                            <div>
                                <Label htmlFor="longitude">Долгота</Label>
                                <Input
                                    id="longitude"
                                    value={longitude ?? ''}
                                    onChange={(e) =>
                                        setLongitude(
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

                    <div className="rounded-lg border bg-white p-4">
                        <Label className="mb-2 block">
                            Платежные настройки
                        </Label>
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

                <div className="space-y-6">
                    <div className="rounded-lg border bg-white p-4">
                        <Label className="mb-2 block">
                            Логотип организации
                        </Label>
                        <LogoUploader
                            value={logoValue}
                            onChange={(file) => setLogoValue(file)}
                            label="Логотип"
                            maxSize={10 * 1024 * 1024}
                            aspectRatio={null}
                            showCropControls={true}
                            onUpload={async (file) => URL.createObjectURL(file)}
                        />
                        <div className="mt-4">
                            <Label className="mb-2 block">Галерея</Label>
                            <MultiImageUploader
                                images={galleryImages}
                                onChange={setGalleryImages}
                                maxFiles={20}
                                maxSize={10 * 1024 * 1024}
                                enableSorting
                                enableDeletion
                                showPreview
                                showFileInfo
                                layout="grid"
                                previewSize="md"
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_public"
                                checked={!!isPublic}
                                onCheckedChange={(checked) =>
                                    setIsPublic(!!checked)
                                }
                            />
                            <Label htmlFor="is_public">
                                Публичная организация
                            </Label>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                        <Label className="mb-2 block">Администратор</Label>
                        <UniversalSelect
                            {...usersData}
                            value={adminUserId}
                            onChange={(value) =>
                                setAdminUserId(value as number)
                            }
                            error={undefined}
                            label="Назначить администратора"
                            placeholder="Выберите пользователя"
                            searchable
                            clearable
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                            Администратор может быть назначен позже
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="submit">
                            {isEdit
                                ? 'Сохранить изменения'
                                : 'Создать организацию'}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
