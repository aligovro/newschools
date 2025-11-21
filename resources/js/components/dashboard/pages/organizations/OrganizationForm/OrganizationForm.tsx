import { FormStatusBanner } from '@/components/common/forms/FormStatusBanner';
import { Button } from '@/components/ui/button';
import { useCascadeSelectData } from '@/hooks/useGeoSelectData';
import { useOrganizationSlug } from '@/hooks/useOrganizationSlug';
import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OrganizationFormProps, Status } from '../types';
import { useAdminUser } from './hooks/useAdminUser';
import { useLocation } from './hooks/useLocation';
import { useOrganizationFormState } from './hooks/useOrganizationFormState';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { ContactInfoSection } from './sections/ContactInfoSection';
import { LocationSection } from './sections/LocationSection';
import { MediaSection } from './sections/MediaSection';
import { NeedsSection } from './sections/NeedsSection';
import { PaymentSettingsSection } from './sections/PaymentSettingsSection';
import { SettingsSection } from './sections/SettingsSection';

export default function OrganizationForm({
    mode,
    organization,
    referenceData,
    organizationSettings,
    defaultPaymentSettings,
}: OrganizationFormProps) {
    const isEdit = mode === 'edit' && !!organization?.id;

    const page = usePage<{
        flash?: { success?: string; error?: string };
        errors?: Record<string, string>;
        terminology?: {
            organization?: {
                singular_genitive?: string;
            };
        };
    }>();

    const serverErrors: Record<string, string> = page.props.errors || {};
    const terminology = page.props.terminology || {};

    // Состояние формы
    const formState = useOrganizationFormState({
        organization,
        organizationSettings,
        isEdit,
        defaultPaymentSettings,
    });

    // Slug
    const {
        slug,
        setSlug,
        isGenerating: isSlugGenerating,
        validation: slugValidation,
        generateSlug: regenerateSlug,
    } = useOrganizationSlug(
        formState.type,
        organization?.id,
        organization?.slug,
        isEdit,
    );

    const [autoGenerateSlug, setAutoGenerateSlug] = useState(!isEdit);

    // Локация
    const location = useLocation({
        organization,
        initialRegionId: organization?.region?.id ?? null,
        initialCityId: organization?.locality?.id ?? null,
    });

    // Администратор
    const adminUser = useAdminUser({ organization });

    // Каскадные селекты
    const cascadeData = useCascadeSelectData();

    // Валидация
    const [dirty, setDirty] = useState<Record<string, boolean>>({});
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );

    const validateField = useCallback(
        (key: string, value: unknown) => {
            const errs: Record<string, string> = {};
            if (key === 'name') {
                if (!String(value || '').trim())
                    errs.name = 'Введите название организации';
            }
            if (key === 'slug') {
                const v = String(value || '').trim();
                if (v && v.length < 3) {
                    errs.slug = 'Slug слишком короткий';
                } else if (v && !/^[a-z0-9-]+$/.test(v)) {
                    errs.slug = 'Только латиница, цифры и дефисы';
                } else if (
                    v &&
                    !slugValidation.isUnique &&
                    slugValidation.isValid
                ) {
                    errs.slug = 'Такой slug уже существует';
                }
            }
            setClientErrors((prev) => ({
                ...prev,
                ...errs,
                ...(errs[key] ? {} : { [key]: '' }),
            }));
        },
        [slugValidation],
    );

    const fieldError = useCallback(
        (key: string): string | undefined => {
            if (clientErrors[key]) return clientErrors[key];
            if (dirty[key]) return undefined;
            return serverErrors[key];
        },
        [clientErrors, dirty, serverErrors],
    );

    // Инициализация каскадных селектов
    useEffect(() => {
        if (location.regionId) {
            cascadeData.handleRegionChange(location.regionId);
            if (cascadeData.localities?.setExtraParams) {
                cascadeData.localities.setExtraParams({
                    region_id: location.regionId,
                });
                cascadeData.localities.refresh();
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (location.cityId) {
            cascadeData.handleCityChange(location.cityId);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Опции регионов с приоритетом сохраненного
    const regionOptions = useMemo(() => {
        const opts = cascadeData.regions.options || [];
        const seen = new Set<number>();
        const uniqueOpts: Array<{
            value: number;
            label: string;
            description?: string;
        }> = [];

        if (
            location.regionId &&
            organization?.region &&
            !opts.some((o: any) => o.value === location.regionId)
        ) {
            uniqueOpts.push({
                value: organization.region.id,
                label: organization.region.name,
                description: organization.region.code
                    ? `Код: ${organization.region.code}`
                    : undefined,
            });
            seen.add(organization.region.id);
        }

        opts.forEach((opt: any) => {
            const value = opt.value;
            if (!seen.has(value)) {
                seen.add(value);
                uniqueOpts.push(opt);
            }
        });

        return uniqueOpts;
    }, [cascadeData.regions.options, location.regionId, organization?.region]);

    // Обработчики изменений
    const handleNameChange = useCallback(
        (value: string) => {
            formState.setName(value);
            setDirty((d) => ({ ...d, name: true }));
            validateField('name', value);
        },
        [formState, validateField],
    );

    const handleSlugChange = useCallback(
        (value: string) => {
            setSlug(value);
            setDirty((d) => ({ ...d, slug: true }));
            validateField('slug', value);
        },
        [setSlug, validateField],
    );

    const handleRegionChange = useCallback(
        (id: number | null) => {
            location.setRegionId(id);
            if (id) {
                location.setCityId(null);
                cascadeData.handleRegionChange(id);
            }
        },
        [location, cascadeData],
    );

    const handleCityChange = useCallback(
        (id: number | null) => {
            location.setCityId(id);
            if (id) {
                cascadeData.handleCityChange(id);
            }
        },
        [location, cascadeData],
    );

    const handleMapClick = useCallback(
        (coords: [number, number]) => {
            location.setLatitude(coords[0]);
            location.setLongitude(coords[1]);
        },
        [location],
    );

    // Отправка формы
    const onSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            validateField('name', formState.name);
            validateField('slug', slug);

            const finalSlug =
                autoGenerateSlug && !String(slug || '').trim()
                    ? formState.type
                    : String(slug || '').trim();

            const hasClientErrors = Boolean(
                (clientErrors.name && clientErrors.name.length) ||
                    (clientErrors.slug && clientErrors.slug.length) ||
                    !String(formState.name || '').trim() ||
                    (!autoGenerateSlug && !finalSlug) ||
                    (finalSlug &&
                        finalSlug.length > 0 &&
                        (finalSlug.length < 3 ||
                            !/^[a-z0-9-]+$/.test(finalSlug))) ||
                    (finalSlug &&
                        !slugValidation.isUnique &&
                        slugValidation.isValid),
            );

            if (hasClientErrors) return;

            const formData = new FormData();
            const append = (k: string, v: unknown) => {
                if (v === undefined || v === null) return;
                if (typeof v === 'boolean') formData.append(k, v ? '1' : '0');
                else formData.append(k, String(v));
            };

            append('name', formState.name);
            if (autoGenerateSlug && !String(slug || '').trim()) {
                append('slug', formState.type);
            } else {
                append('slug', slug);
            }
            append('description', formState.description);
            append('type', formState.type);
            append('status', formState.status);
            append('address', location.address);
            append('phone', formState.phone);
            append('email', formState.email);
            append('website', formState.website);
            append('is_public', formState.isPublic);
            append('region_id', location.regionId);
            append('locality_id', location.cityId);
            append('city_name', location.cityName);
            append('latitude', location.latitude);
            append('longitude', location.longitude);
            append('admin_user_id', adminUser.adminUserId);
            formData.append(
                'payment_settings',
                JSON.stringify(formState.paymentSettings),
            );
            formData.append(
                'needs_target_amount',
                formState.needsTargetAmount ?? '',
            );

            if (formState.logoValue instanceof File)
                formData.append('logo', formState.logoValue);

            const existingImages: string[] = [];
            formState.galleryImages.forEach((img, i) => {
                if (img.file) {
                    formData.append(`images[${i}]`, img.file);
                } else if (img.url) {
                    const path = img.url.startsWith('/storage/')
                        ? img.url.replace('/storage/', '')
                        : img.url;
                    existingImages.push(path);
                }
            });

            if (existingImages.length > 0) {
                existingImages.forEach((path, i) => {
                    formData.append(`existing_images[${i}]`, path);
                });
            }

            const url = isEdit
                ? `/dashboard/organizations/${organization!.id}`
                : '/dashboard/organizations';

            if (isEdit) {
                formData.append('_method', 'PUT');
            }

            router.post(url, formData as any, {
                forceFormData: true,
            });
        },
        [
            formState,
            slug,
            autoGenerateSlug,
            location,
            adminUser.adminUserId,
            clientErrors,
            slugValidation,
            isEdit,
            organization,
            validateField,
        ],
    );

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <FormStatusBanner
                flash={page.props.flash as any}
                errors={serverErrors}
                defaultErrorMessage="Исправьте ошибки в форме перед сохранением"
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <BasicInfoSection
                        name={formState.name}
                        slug={slug}
                        description={formState.description}
                        type={formState.type}
                        status={formState.status}
                        autoGenerateSlug={autoGenerateSlug}
                        isSlugGenerating={isSlugGenerating}
                        slugValidation={slugValidation}
                        referenceData={referenceData}
                        errors={{
                            name: fieldError('name'),
                            slug: fieldError('slug'),
                            type: fieldError('type'),
                            status: fieldError('status'),
                        }}
                        onNameChange={handleNameChange}
                        onSlugChange={handleSlugChange}
                        onDescriptionChange={formState.setDescription}
                        onTypeChange={formState.setType}
                        onStatusChange={(v) => formState.setStatus(v as Status)}
                        onAutoGenerateSlugChange={setAutoGenerateSlug}
                        onRegenerateSlug={regenerateSlug}
                    />

                    <ContactInfoSection
                        phone={formState.phone}
                        email={formState.email}
                        website={formState.website}
                        onPhoneChange={formState.setPhone}
                        onEmailChange={formState.setEmail}
                        onWebsiteChange={formState.setWebsite}
                        errors={{
                            phone: fieldError('phone'),
                            email: fieldError('email'),
                            website: fieldError('website'),
                        }}
                    />

                    <NeedsSection
                        targetAmount={formState.needsTargetAmount}
                        collectedAmount={formState.needsCollectedAmount}
                        onTargetChange={formState.setNeedsTargetAmount}
                    />

                    <LocationSection
                        name={formState.name}
                        regionId={location.regionId}
                        cityId={location.cityId}
                        address={location.address}
                        latitude={location.latitude}
                        longitude={location.longitude}
                        mapCenter={location.mapCenter}
                        mapZoom={location.mapZoom}
                        cascadeData={cascadeData}
                        regionOptions={regionOptions}
                        terminology={terminology}
                        errors={{
                            region_id: fieldError('region_id'),
                            locality_id: fieldError('locality_id'),
                            address: fieldError('address'),
                            latitude: fieldError('latitude'),
                            longitude: fieldError('longitude'),
                            city_name: fieldError('city_name'),
                        }}
                        onRegionChange={handleRegionChange}
                        onCityChange={handleCityChange}
                        onAddressChange={location.setAddress}
                        onAddressBlur={location.geocodeAddress}
                        onLatitudeChange={location.setLatitude}
                        onLongitudeChange={location.setLongitude}
                        onMapClick={handleMapClick}
                    />

                    <PaymentSettingsSection
                        value={formState.paymentSettings}
                        onChange={(k, v) =>
                            formState.setPaymentSettings((prev) => ({
                                ...prev,
                                [k]: v,
                            }))
                        }
                    />
                </div>

                <div className="space-y-6">
                    <MediaSection
                        logoValue={formState.logoValue}
                        galleryImages={formState.galleryImages}
                        onLogoChange={formState.setLogoValue}
                        onGalleryChange={formState.setGalleryImages}
                    />

                    <SettingsSection
                        isPublic={formState.isPublic}
                        adminUserId={adminUser.adminUserId}
                        usersOptions={adminUser.usersOptions}
                        usersLoading={adminUser.loading}
                        usersHasMore={adminUser.hasMore}
                        usersLoadingMore={adminUser.loadingMore}
                        usersSearch={adminUser.search}
                        onIsPublicChange={formState.setIsPublic}
                        onAdminUserIdChange={adminUser.setAdminUserId}
                        onUsersSearchChange={adminUser.setSearch}
                        onUsersLoadMore={adminUser.loadMore}
                        errors={{
                            admin_user_id: fieldError('admin_user_id'),
                        }}
                    />

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
