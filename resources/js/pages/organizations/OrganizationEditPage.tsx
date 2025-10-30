import OrganizationForm from '@/components/organizations/OrganizationForm';
import { type PaymentGatewaysSettingsValue } from '@/components/payments/PaymentGatewaysSettings';
import { Button } from '@/components/ui/button';
import { UploadedImage } from '@/components/ui/image-uploader/MultiImageUploader';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

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
    organizationSettings?: any;
}

export default function OrganizationEditPage({
    organization,
    referenceData,
    organizationSettings,
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
    const [logoValue, setLogoValue] = useState<string | File | null>(
        organization.logo ? `/storage/${organization.logo}` : null,
    );
    const [galleryImages, setGalleryImages] = useState<UploadedImage[]>(
        Array.isArray((organization as any).images)
            ? ((organization as any).images as string[]).map((path, idx) => ({
                  id: `${idx}`,
                  url: `/storage/${path}`,
                  file: undefined,
                  name: path.split('/').pop() || `image-${idx + 1}.jpg`,
                  size: 0,
                  type: 'image/*',
                  status: 'success',
              }))
            : [],
    );
    const [imagesPreview, setImagesPreview] = useState<string[]>([]);

    // @ts-expect-error Deep instantiation error workaround in generic inference
    const { data, setData, post, transform, processing, errors } = useForm({
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
        existing_images: (organization as any).images || [],
        // Дополнительные данные
        founded_at: organization.founded_at || null,
        is_public: organization.is_public,
    });

    // Инициализация платежных настроек из пропов (или дефолты)
    const initialPayment: PaymentGatewaysSettingsValue = useMemo(() => {
        const ps = (organizationSettings?.payment_settings || {}) as any;
        const enabled = Array.isArray(ps.enabled_gateways)
            ? ps.enabled_gateways
            : Array.isArray(ps.enabled_methods)
              ? ps.enabled_methods
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
                    : typeof ps.min_amount === 'number'
                      ? ps.min_amount
                      : 100,
            donation_max_amount:
                typeof ps.donation_max_amount === 'number'
                    ? ps.donation_max_amount
                    : typeof ps.max_amount === 'number'
                      ? ps.max_amount
                      : 0,
        };
    }, [organizationSettings]);

    const [orgPayment, setOrgPayment] =
        useState<PaymentGatewaysSettingsValue>(initialPayment);

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

        transform((form) => ({
            ...form,
            _method: 'PUT',
            payment_settings: orgPayment,
        }));
        post(`/dashboard/organizations/${organization.id}`, {
            forceFormData: true,
            onSuccess: () => {
                window.location.href = '/dashboard/organizations';
            },
            onError: (errors: Record<string, string>) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    // Синхронизация логотипа и галереи в useForm
    useEffect(() => {
        setData('logo', logoValue instanceof File ? logoValue : null);
    }, [logoValue, setData]);

    useEffect(() => {
        const existing = galleryImages
            .filter((img) => !img.file)
            .map((img) =>
                img.url.startsWith('/storage/')
                    ? img.url.replace('/storage/', '')
                    : img.url,
            );
        const files = galleryImages
            .filter((img) => img.file)
            .map((img) => img.file!) as File[];
        setData('existing_images', existing);
        setData('images', files);
    }, [galleryImages, setData]);

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

                <OrganizationForm
                    mode="edit"
                    organization={organization as any}
                    referenceData={referenceData as any}
                    organizationSettings={organizationSettings as any}
                />
            </div>
        </AppLayout>
    );
}
