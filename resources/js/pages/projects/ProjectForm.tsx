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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import UniversalSelect from '@/components/ui/universal-select/UniversalSelect';
import AppLayout from '@/layouts/app-layout';
// import { projectsApi } from '@/lib/api/index';
import { index as projectIndex } from '@/routes/organizations/projects';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CreditCard,
    DollarSign,
    Image as ImageIcon,
    Save,
    Tag,
    Target,
} from 'lucide-react';
import React, { useState } from 'react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    type_config?: {
        categories: Record<string, string>;
    };
}

interface Project {
    id?: number;
    title: string;
    slug: string;
    short_description?: string;
    description?: string;
    category: string;
    target_amount: number;
    collected_amount?: number;
    status: 'draft' | 'active' | 'completed' | 'cancelled' | 'suspended';
    featured: boolean;
    start_date?: string;
    end_date?: string;
    image?: string;
    gallery?: string[];
    tags?: any[];
    beneficiaries?: any[];
}

interface Props {
    organization: Organization;
    categories: Record<string, string>;
    project?: Project;
    isEdit?: boolean;
}

export default function ProjectForm({
    organization,
    categories,
    project,
    isEdit = false,
}: Props) {
    const [projectImage, setProjectImage] = useState<string | File | null>(
        project?.image ? `/storage/${project.image}` : null,
    );
    const [projectImages, setProjectImages] = useState<UploadedImage[]>(
        project?.gallery?.map((image, index) => ({
            id: `${index}`,
            url: `/storage/${image}`,
            file: null,
            name: image.split('/').pop() || `image-${index + 1}.jpg`,
            size: 0,
            type: 'image/*',
            status: 'success',
        })) || [],
    );
    const [slugError, setSlugError] = useState<string>('');

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        progress,
        transform,
    } = useForm({
        title: project?.title || '',
        slug: project?.slug || '',
        short_description: project?.short_description || '',
        description: project?.description || '',
        category: project?.category || '',
        target_amount: project ? project.target_amount / 100 : null,
        start_date: project?.start_date || null,
        end_date: project?.end_date || null,
        featured: project?.featured || false,
        status: project?.status || 'draft',
        tags: project?.tags || [],
        beneficiaries: project?.beneficiaries || [],
        progress_updates: [],
        image: null,
        gallery: [],
        existing_gallery: project?.gallery || [],
        // Включаем платежные настройки в основную форму,
        // чтобы они отправлялись одной нижней кнопкой сохранения
        payment_settings: ((project as any)?.payment_settings as any) || {},
    });

    // Синхронизация image с useForm (отправляем только если новый файл)
    React.useEffect(() => {
        setData('image', projectImage instanceof File ? projectImage : null);
    }, [projectImage, setData]);

    // Синхронизация gallery с useForm
    React.useEffect(() => {
        const toRelative = (url: string) =>
            url.startsWith('/storage/') ? url.replace('/storage/', '') : url;

        const existing = projectImages
            .filter((img) => !img.file)
            .map((img) => toRelative(img.url));

        const files = projectImages
            .filter((img) => img.file)
            .map((img) => img.file!);

        setData('existing_gallery', existing);
        setData('gallery', files);
    }, [projectImages, setData]);

    // Генерация slug из названия (только при создании)
    React.useEffect(() => {
        if (!isEdit && data.title && !data.slug) {
            const slug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setData('slug', slug);
        }
    }, [data.title, data.slug, setData, isEdit]);

    const categoryOptions = Object.entries(categories).map(
        ([value, label]) => ({
            value,
            label,
        }),
    );

    const statusOptions = [
        { value: 'draft', label: 'Черновик' },
        { value: 'active', label: 'Активный' },
        { value: 'completed', label: 'Завершен' },
        { value: 'cancelled', label: 'Отменен' },
        { value: 'suspended', label: 'Приостановлен' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Нормализуем платежные настройки, чтобы false не терялся при FormData
        const normalizedPayment = {
            ...paymentSettings,
            test_mode: paymentSettings.test_mode ? 1 : 0,
            donation_min_amount: Number(
                paymentSettings.donation_min_amount ?? 0,
            ),
            donation_max_amount: Number(
                paymentSettings.donation_max_amount ?? 0,
            ),
            currency: (paymentSettings.currency || 'RUB').toUpperCase(),
        } as const;

        if (isEdit && project?.id) {
            transform((form) => ({
                ...form,
                _method: 'PUT',
                payment_settings: normalizedPayment,
            }));
            post(
                `/dashboard/organizations/${organization.id}/projects/${project.id}`,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        // Перенаправление будет выполнено сервером
                    },
                },
            );
        } else {
            transform((form) => ({
                ...form,
                payment_settings: normalizedPayment,
            }));
            post(`/dashboard/organizations/${organization.id}/projects`, {
                forceFormData: true,
                onSuccess: () => {
                    // Перенаправление будет выполнено сервером
                },
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: organization.name,
            href: `/dashboard/organizations/${organization.id}`,
        },
        {
            title: 'Проекты',
            href: projectIndex.url({ organization: organization.id }),
        },
        {
            title: isEdit ? 'Редактировать проект' : 'Создать проект',
            href: '#',
        },
    ];

    const hasErrors = Object.keys(errors).length > 0 || slugError;

    // Payment settings (edit mode)
    type PaymentSettingsData = {
        gateway?: 'sbp' | 'yookassa' | 'tinkoff';
        credentials?: Record<string, string>;
        options?: Record<string, any>;
        donation_min_amount?: number;
        donation_max_amount?: number;
        currency?: string;
        test_mode?: boolean;
    };

    const initialPayment: PaymentSettingsData = React.useMemo(() => {
        const raw = (project as any)?.payment_settings as any;

        const toBoolean = (v: unknown): boolean => {
            if (typeof v === 'boolean') return v;
            if (typeof v === 'number') return v !== 0;
            if (typeof v === 'string') {
                const val = v.toLowerCase();
                return (
                    val === '1' ||
                    val === 'true' ||
                    val === 'on' ||
                    val === 'yes'
                );
            }
            return false;
        };

        const toNumber = (v: unknown, fallback: number = 0): number => {
            if (v === null || v === undefined || v === '') return fallback;
            const n = Number(v);
            return Number.isFinite(n) ? n : fallback;
        };

        if (raw && typeof raw === 'object') {
            return {
                gateway: raw.gateway ?? 'yookassa',
                credentials: raw.credentials ?? {},
                options: raw.options ?? {},
                donation_min_amount: toNumber(raw.donation_min_amount, 100),
                donation_max_amount: toNumber(raw.donation_max_amount, 0),
                currency: raw.currency ?? 'RUB',
                test_mode: toBoolean(raw.test_mode ?? true),
            } as PaymentSettingsData;
        }
        return {} as PaymentSettingsData;
    }, [project]);

    const [paymentSettings, setPaymentSettings] =
        React.useState<PaymentSettingsData>({
            gateway: initialPayment.gateway ?? 'yookassa',
            credentials: initialPayment.credentials ?? {},
            options: initialPayment.options ?? {},
            donation_min_amount: initialPayment.donation_min_amount ?? 100,
            donation_max_amount: initialPayment.donation_max_amount ?? 0,
            currency: initialPayment.currency ?? 'RUB',
            test_mode: initialPayment.test_mode ?? true,
        });
    // Убираем отдельное состояние ошибок/сохранения для платежей,
    // сохраняем вместе с основной формой

    const updatePayment = React.useCallback(
        (key: keyof PaymentSettingsData, value: any) => {
            setPaymentSettings((prev) => ({ ...prev, [key]: value }));
        },
        [],
    );

    const updatePaymentCredential = React.useCallback(
        (key: string, value: string) => {
            setPaymentSettings((prev) => ({
                ...prev,
                credentials: { ...(prev.credentials || {}), [key]: value },
            }));
        },
        [],
    );

    // Синхронизируем платежные настройки с формой, чтобы они ушли в submit
    React.useEffect(() => {
        setData('payment_settings', paymentSettings as any);
    }, [paymentSettings, setData]);

    // Удалена отдельная логика сохранения платежных настроек

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Редактировать проект' : 'Создать проект'} />

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
                                {isEdit
                                    ? 'Редактировать проект'
                                    : 'Создать проект'}
                            </h1>
                            <p className="create-organization__subtitle">
                                {isEdit
                                    ? `Обновление информации о проекте "${project?.title}"`
                                    : `Создать новый проект для ${organization.name}`}
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
                                <Target className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Основная информация
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__field-group create-organization__field-group--two-columns">
                                    <div className="create-organization__field">
                                        <Label htmlFor="title">
                                            Название проекта
                                            <span className="create-organization__required">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            placeholder="Введите название проекта"
                                            className={
                                                errors.title
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="create-organization__field">
                                        <Label htmlFor="slug">URL slug</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) =>
                                                setData('slug', e.target.value)
                                            }
                                            placeholder="url-slug"
                                            disabled={!isEdit}
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

                                <div className="create-organization__field-group create-organization__field-group--two-columns">
                                    <div className="create-organization__field">
                                        <UniversalSelect
                                            options={categoryOptions}
                                            value={data.category}
                                            onChange={(value) =>
                                                setData(
                                                    'category',
                                                    value as string,
                                                )
                                            }
                                            label="Категория"
                                            required
                                            placeholder="Выберите категорию"
                                            error={errors.category}
                                        />
                                    </div>

                                    <div className="create-organization__field">
                                        <UniversalSelect
                                            options={statusOptions}
                                            value={data.status}
                                            onChange={(value) =>
                                                setData('status', value as any)
                                            }
                                            label="Статус"
                                            placeholder="Выберите статус"
                                            error={errors.status}
                                        />
                                    </div>
                                </div>

                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <Label htmlFor="short_description">
                                            Краткое описание
                                        </Label>
                                        <Textarea
                                            id="short_description"
                                            value={data.short_description}
                                            onChange={(e) =>
                                                setData(
                                                    'short_description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Краткое описание проекта"
                                            rows={2}
                                            className={
                                                errors.short_description
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.short_description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.short_description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <Label htmlFor="description">
                                            Описание проекта
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
                                            placeholder="Подробное описание проекта"
                                            rows={8}
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

                        {/* Финансовая информация */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <DollarSign className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Финансовая информация
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <Label htmlFor="target_amount">
                                            Целевая сумма (руб.)
                                        </Label>
                                        <Input
                                            id="target_amount"
                                            type="number"
                                            step="0.01"
                                            value={data.target_amount || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'target_amount',
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                )
                                            }
                                            placeholder="Введите целевую сумму"
                                            className={
                                                errors.target_amount
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.target_amount && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.target_amount}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Платежные настройки проекта */}
                        {
                            <div className="create-organization__section">
                                <div className="create-organization__section-header flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="create-organization__section-icon" />
                                        <h2 className="create-organization__section-title">
                                            Платежные настройки
                                        </h2>
                                    </div>
                                </div>
                                <div className="create-organization__section-content space-y-6">
                                    <div className="create-organization__field-group create-organization__field-group--three-columns grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="create-organization__field">
                                            <Label>Платежный шлюз</Label>
                                            <Select
                                                value={
                                                    paymentSettings.gateway ||
                                                    'yookassa'
                                                }
                                                onValueChange={(v) =>
                                                    updatePayment(
                                                        'gateway',
                                                        v as any,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите шлюз" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="yookassa">
                                                        ЮKassa
                                                    </SelectItem>
                                                    <SelectItem value="tinkoff">
                                                        Tinkoff
                                                    </SelectItem>
                                                    <SelectItem value="sbp">
                                                        СБП
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="create-organization__field">
                                            <Label htmlFor="currency">
                                                Валюта
                                            </Label>
                                            <Input
                                                id="currency"
                                                value={
                                                    paymentSettings.currency ||
                                                    'RUB'
                                                }
                                                onChange={(e) =>
                                                    updatePayment(
                                                        'currency',
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="create-organization__field flex items-center gap-3">
                                            <Switch
                                                checked={
                                                    !!paymentSettings.test_mode
                                                }
                                                onCheckedChange={(v) =>
                                                    updatePayment(
                                                        'test_mode',
                                                        v,
                                                    )
                                                }
                                                id="test-mode"
                                            />
                                            <Label htmlFor="test-mode">
                                                Тестовый режим
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Credentials by gateway */}
                                    {paymentSettings.gateway === 'yookassa' && (
                                        <div className="create-organization__field-group create-organization__field-group--two-columns">
                                            <div className="create-organization__field">
                                                <Label htmlFor="yk-shop">
                                                    Shop ID
                                                </Label>
                                                <Input
                                                    id="yk-shop"
                                                    value={
                                                        paymentSettings
                                                            .credentials
                                                            ?.shop_id || ''
                                                    }
                                                    onChange={(e) =>
                                                        updatePaymentCredential(
                                                            'shop_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="create-organization__field">
                                                <Label htmlFor="yk-key">
                                                    Secret Key
                                                </Label>
                                                <Input
                                                    id="yk-key"
                                                    value={
                                                        paymentSettings
                                                            .credentials
                                                            ?.secret_key || ''
                                                    }
                                                    onChange={(e) =>
                                                        updatePaymentCredential(
                                                            'secret_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentSettings.gateway === 'tinkoff' && (
                                        <div className="create-organization__field-group create-organization__field-group--two-columns">
                                            <div className="create-organization__field">
                                                <Label htmlFor="tk-terminal">
                                                    Terminal Key
                                                </Label>
                                                <Input
                                                    id="tk-terminal"
                                                    value={
                                                        paymentSettings
                                                            .credentials
                                                            ?.terminal_key || ''
                                                    }
                                                    onChange={(e) =>
                                                        updatePaymentCredential(
                                                            'terminal_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="create-organization__field">
                                                <Label htmlFor="tk-password">
                                                    Password
                                                </Label>
                                                <Input
                                                    id="tk-password"
                                                    value={
                                                        paymentSettings
                                                            .credentials
                                                            ?.password || ''
                                                    }
                                                    onChange={(e) =>
                                                        updatePaymentCredential(
                                                            'password',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentSettings.gateway === 'sbp' && (
                                        <div className="create-organization__field-group create-organization__field-group--two-columns">
                                            <div className="create-organization__field">
                                                <Label htmlFor="sbp-merchant">
                                                    Merchant ID
                                                </Label>
                                                <Input
                                                    id="sbp-merchant"
                                                    value={
                                                        paymentSettings
                                                            .credentials
                                                            ?.merchant_id || ''
                                                    }
                                                    onChange={(e) =>
                                                        updatePaymentCredential(
                                                            'merchant_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="create-organization__field">
                                                <Label htmlFor="sbp-secret">
                                                    Secret Key
                                                </Label>
                                                <Input
                                                    id="sbp-secret"
                                                    value={
                                                        paymentSettings
                                                            .credentials
                                                            ?.secret_key || ''
                                                    }
                                                    onChange={(e) =>
                                                        updatePaymentCredential(
                                                            'secret_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="create-organization__field-group create-organization__field-group--two-columns">
                                        <div className="create-organization__field">
                                            <Label htmlFor="min-amount">
                                                Мин. сумма пожертвования (в
                                                копейках)
                                            </Label>
                                            <Input
                                                id="min-amount"
                                                type="number"
                                                value={
                                                    paymentSettings.donation_min_amount ??
                                                    0
                                                }
                                                onChange={(e) =>
                                                    updatePayment(
                                                        'donation_min_amount',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="create-organization__field">
                                            <Label htmlFor="max-amount">
                                                Макс. сумма пожертвования (0 =
                                                без ограничений)
                                            </Label>
                                            <Input
                                                id="max-amount"
                                                type="number"
                                                value={
                                                    paymentSettings.donation_max_amount ??
                                                    0
                                                }
                                                onChange={(e) =>
                                                    updatePayment(
                                                        'donation_max_amount',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        {/* Даты */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Calendar className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Даты проекта
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__field-group create-organization__field-group--two-columns">
                                    <div className="create-organization__field">
                                        <Label htmlFor="start_date">
                                            Дата начала
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'start_date',
                                                    e.target.value || null,
                                                )
                                            }
                                            className={
                                                errors.start_date
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.start_date && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.start_date}
                                            </p>
                                        )}
                                    </div>

                                    <div className="create-organization__field">
                                        <Label htmlFor="end_date">
                                            Дата окончания
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'end_date',
                                                    e.target.value || null,
                                                )
                                            }
                                            min={data.start_date || undefined}
                                            className={
                                                errors.end_date
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.end_date && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.end_date}
                                            </p>
                                        )}
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
                                <ImageIcon className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Медиа
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <LogoUploader
                                            value={projectImage}
                                            onChange={(file) => {
                                                setProjectImage(file);
                                                setData('image', file);
                                            }}
                                            label="Основное изображение"
                                            maxSize={5 * 1024 * 1024}
                                            aspectRatio={null}
                                            showCropControls={true}
                                            defaultValue={
                                                project?.image
                                                    ? `/storage/${project.image}`
                                                    : undefined
                                            }
                                            onUpload={async (file) => {
                                                return URL.createObjectURL(
                                                    file,
                                                );
                                            }}
                                        />
                                        {errors.image && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.image}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="create-organization__field-group">
                                    <div className="create-organization__field">
                                        <Label className="mb-2 block">
                                            Галерея проекта
                                        </Label>
                                        <MultiImageUploader
                                            images={projectImages}
                                            onChange={(images) => {
                                                setProjectImages(images);
                                                const files = images
                                                    .filter((img) => img.file)
                                                    .map((img) => img.file!);
                                                setData('gallery', files);
                                            }}
                                            maxFiles={10}
                                            maxSize={2 * 1024 * 1024}
                                            onUpload={async (file) => {
                                                return URL.createObjectURL(
                                                    file,
                                                );
                                            }}
                                            onDelete={(imageId) => {
                                                console.log(
                                                    'Delete image:',
                                                    imageId,
                                                );
                                            }}
                                            enableSorting={true}
                                            enableDeletion={true}
                                            showPreview={true}
                                            showFileInfo={true}
                                            layout="grid"
                                            previewSize="md"
                                        />
                                        {errors.gallery && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.gallery}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Настройки */}
                        <div className="create-organization__section">
                            <div className="create-organization__section-header">
                                <Tag className="create-organization__section-icon" />
                                <h2 className="create-organization__section-title">
                                    Настройки
                                </h2>
                            </div>
                            <div className="create-organization__section-content">
                                <div className="create-organization__checkbox-group">
                                    <Checkbox
                                        id="featured"
                                        checked={data.featured}
                                        onCheckedChange={(checked) =>
                                            setData('featured', !!checked)
                                        }
                                    />
                                    <Label
                                        htmlFor="featured"
                                        className="create-organization__checkbox-label"
                                    >
                                        Рекомендуемый проект
                                    </Label>
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
                                    {isEdit ? 'Сохранение...' : 'Создание...'}
                                </>
                            ) : isEdit ? (
                                'Сохранить изменения'
                            ) : (
                                'Создать проект'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
