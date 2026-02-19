import { Button } from '@/components/ui/button';
import { FormStatusBanner } from '@/components/common/forms/FormStatusBanner';
import AppLayout from '@/layouts/app-layout';
import { index as projectIndex } from '@/routes/organizations/projects';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GeneralTab from '../tabs/GeneralTab';
import StagesTab from '../tabs/StagesTab';
import type {
    PaymentSettings,
    ProjectFormData,
    ProjectFormProps,
    ProjectStageFormData,
    SlugValidationState,
    UploadedImage,
} from './types';
import {
    ALLOWED_PAYMENT_GATEWAYS,
    normalizePaymentSettings,
} from '@/lib/payments/normalizePaymentSettings';
import { slugify } from '@/lib/helpers';
import { useDebounce } from '@/hooks/useDebounce';

type StageRequestPayload = {
    id?: number;
    title: string;
    description: string;
    target_amount: number;
    existing_image?: string;
    gallery: string[];
    image_file?: File;
    gallery_files?: File[];
    remove_image?: boolean;
};

export default function ProjectForm({
    organization,
    projectCategories = [],
    defaultPaymentSettings,
    project,
    isEdit = false,
}: ProjectFormProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'stages'>('general');
    const page = usePage<{
        flash?: {
            success?: string;
            error?: string;
        };
    }>();
    const [projectImage, setProjectImage] = useState<string | File | null>(
        project?.image ? `/storage/${project.image}` : null,
    );
    const [projectImages, setProjectImages] = useState<UploadedImage[]>(
        project?.gallery?.map((image, index) => ({
            id: `${index}`,
            url: `/storage/${image}`,
            file: undefined,
            name: image.split('/').pop() || `image-${index + 1}.jpg`,
            size: 0,
            type: 'image/*',
            status: 'success',
        })) || [],
    );
    const [stages, setStages] = useState<ProjectStageFormData[]>(
        project?.stages?.map((stage) => {
            const targetRub = stage.target_amount_rubles;
            const targetCents = stage.target_amount;

            const rawTarget =
                targetRub !== undefined && targetRub !== null
                    ? Number(targetRub)
                    : targetCents !== undefined && targetCents !== null
                      ? Number(targetCents) / 100
                      : 0;

            const galleryItems = stage.gallery || [];

            return {
                id: stage.id,
                title: stage.title || '',
                description: stage.description || '',
                target_amount: rawTarget,
                image: stage.image ? `/storage/${stage.image}` : undefined,
                imageFile: null,
                gallery: galleryItems.map((img: string) => `/storage/${img}`),
                galleryFiles: galleryItems.map((img: string, idx: number) => ({
                    id: `${stage.id}-${idx}`,
                    url: `/storage/${img}`,
                    file: undefined,
                    name: img.split('/').pop() || `image-${idx + 1}.jpg`,
                    size: 0,
                    type: 'image/*',
                    status: 'success',
                })),
            };
        }) || [],
    );

    // Re-sync stages from server after redirects or prop updates (preserve media after save)
    useEffect(() => {
        if (isEdit && project?.stages) {
            const nextStages: ProjectStageFormData[] = project.stages.map(
                (stage) => {
                    const targetRub = (stage as any).target_amount_rubles;
                    const targetCents = stage.target_amount as any;

                    const rawTarget =
                        targetRub !== undefined && targetRub !== null
                            ? Number(targetRub)
                            : targetCents !== undefined && targetCents !== null
                              ? Number(targetCents) / 100
                              : 0;

                    const galleryItems = stage.gallery || [];

                    return {
                        id: stage.id,
                        title: stage.title || '',
                        description: stage.description || '',
                        target_amount: rawTarget,
                        image: stage.image
                            ? `/storage/${stage.image}`
                            : undefined,
                        imageFile: null,
                        gallery: galleryItems.map(
                            (img: string) => `/storage/${img}`,
                        ),
                        galleryFiles: galleryItems.map(
                            (img: string, idx: number) => ({
                                id: `${stage.id}-${idx}`,
                                url: `/storage/${img}`,
                                file: undefined,
                                name:
                                    img.split('/').pop() ||
                                    `image-${idx + 1}.jpg`,
                                size: 0,
                                type: 'image/*',
                                status: 'success',
                            }),
                        ),
                    } as ProjectStageFormData;
                },
            );
            setStages(nextStages);
        }
    }, [isEdit, project?.stages]);

    const initialFormData: ProjectFormData = useMemo(
        () => ({
            title: project?.title || '',
            slug: project?.slug || '',
            short_description: project?.short_description || '',
            description: project?.description || '',
            category_ids: project?.categories?.map((cat) => cat.id) || [],
            target_amount: project ? project.target_amount / 100 : null,
            start_date: project?.start_date || null,
            end_date: project?.end_date || null,
            featured: project?.featured || false,
            status: project?.status || 'draft',
            tags: (project?.tags as string[]) || [],
            beneficiaries: (project?.beneficiaries as string[]) || [],
            progress_updates: [],
            image: null,
            gallery: [],
            existing_gallery: project?.gallery || [],
            has_stages: project?.has_stages || false,
            stages: [],
            payment_settings: project?.payment_settings || {},
        }),
        [project],
    );

    const { data, setData, processing, errors, progress } = useForm(
        initialFormData as any,
    );

    const [autoGenerateSlug, setAutoGenerateSlug] = useState(!isEdit);
    const [isSlugGenerating, setIsSlugGenerating] = useState(false);
    const [slugValidation, setSlugValidation] = useState<SlugValidationState>({
        isUnique: true,
        isValid: true,
    });
    const debouncedSlug = useDebounce(data.slug, 500);

    const basePaymentSettings = useMemo(
        () =>
            normalizePaymentSettings(
                (project?.payment_settings as Partial<PaymentSettings> | null) ??
                    (defaultPaymentSettings as Partial<PaymentSettings> | null) ??
                    null,
            ),
        [project?.payment_settings, defaultPaymentSettings],
    );

    // Payment settings state
    const [paymentSettings, setPaymentSettings] =
        useState<PaymentSettings>(basePaymentSettings as PaymentSettings);

    useEffect(() => {
        setPaymentSettings(basePaymentSettings as PaymentSettings);
    }, [basePaymentSettings]);

    // Callbacks for data changes
    const handleDataChange = useCallback(
        (key: keyof ProjectFormData, value: unknown) => {
            (setData as any)(key, value);
        },
        [setData],
    );

    const handlePaymentChange = useCallback(
        (key: keyof PaymentSettings, value: unknown) => {
            setPaymentSettings((prev) => {
                if (key === 'enabled_gateways' && Array.isArray(value)) {
                    const normalized = (value as Array<string>)
                        .map((gateway) =>
                            ALLOWED_PAYMENT_GATEWAYS.includes(gateway as any)
                                ? (gateway as 'yookassa' | 'tinkoff' | 'sbp')
                                : null,
                        )
                        .filter(
                            (gateway): gateway is 'yookassa' | 'tinkoff' | 'sbp' =>
                                !!gateway,
                        );

                    const nextGateways =
                        normalized.length > 0 ? normalized : ['yookassa'];

                    return {
                        ...prev,
                        gateway: nextGateways[0],
                        enabled_gateways: nextGateways,
                    };
                }

                if (key === 'credentials' && value && typeof value === 'object') {
                    return {
                        ...prev,
                        credentials:
                            value as Record<string, Record<string, string>>,
                    };
                }

                return { ...prev, [key]: value } as PaymentSettings;
            });
        },
        [],
    );

    const handleCredentialChange = useCallback((key: string, value: string) => {
        const [gateway, credentialKey] = key.split('.');
        if (!gateway || !credentialKey) {
            return;
        }

        setPaymentSettings((prev) => {
            const credentials = { ...(prev.credentials ?? {}) };
            const gatewayCredentials = { ...(credentials[gateway] ?? {}) };
            gatewayCredentials[credentialKey] = value;
            credentials[gateway] = gatewayCredentials;

            return {
                ...prev,
                credentials,
            };
        });
    }, []);

    // Sync payment settings with form
    useEffect(() => {
        (setData as any)('payment_settings', paymentSettings);
    }, [paymentSettings, setData]);

    // Sync stages with form
    useEffect(() => {
        const toRelative = (value: string) =>
            value.startsWith('/storage/')
                ? value.replace('/storage/', '')
                : value;

        const preparedStages: ProjectStageFormData[] = stages.map((stage) => {
            const existingImage =
                !stage.imageFile &&
                typeof stage.image === 'string' &&
                !stage.removeImage
                    ? toRelative(stage.image)
                    : undefined;

            const galleryEntries = (stage.gallery || [])
                .filter((img): img is string => typeof img === 'string')
                .map(toRelative);

            return {
                id: stage.id,
                title: stage.title,
                description: stage.description,
                target_amount: stage.target_amount || 0,
                existing_image: existingImage,
                gallery: galleryEntries,
                removeImage: !!stage.removeImage,
            };
        });

        (setData as any)('stages', preparedStages);
    }, [stages, setData]);

    // Sync image with form
    useEffect(() => {
        (setData as any)(
            'image',
            projectImage instanceof File ? projectImage : null,
        );
    }, [projectImage, setData]);

    // Sync gallery with form
    useEffect(() => {
        const toRelative = (url: string) =>
            url.startsWith('/storage/') ? url.replace('/storage/', '') : url;

        const existing = projectImages
            .filter((img) => !img.file)
            .map((img) => toRelative(img.url));

        const files = projectImages
            .filter((img) => img.file)
            .map((img) => img.file!);

        (setData as any)('existing_gallery', existing);
        (setData as any)('gallery', files);
    }, [projectImages, setData]);

    const regenerateSlug = useCallback(() => {
        const generated = data.title?.trim()
            ? slugify(data.title)
            : '';
        (setData as any)('slug', generated);
    }, [data.title, setData]);

    useEffect(() => {
        if (!autoGenerateSlug) return;
        const generated = data.title?.trim()
            ? slugify(data.title)
            : '';
        if (generated !== data.slug) {
            (setData as any)('slug', generated);
        }
    }, [data.title, autoGenerateSlug, data.slug, setData]);

    useEffect(() => {
        const currentSlug = (debouncedSlug || '').trim();
        if (!currentSlug) {
            setSlugValidation({
                isUnique: true,
                isValid: false,
                suggestedSlug: undefined,
            });
            return;
        }

        if (!/^[a-z0-9-]+$/.test(currentSlug) || currentSlug.length < 3) {
            setSlugValidation({
                isUnique: false,
                isValid: false,
                suggestedSlug: undefined,
            });
            return;
        }

        let cancelled = false;
        setIsSlugGenerating(true);
        const payload: {
            text: string;
            table: string;
            column: string;
            exclude_id?: number;
        } = {
            text: currentSlug,
            table: 'projects',
            column: 'slug',
        };

        if (isEdit && project?.id) {
            payload.exclude_id = project.id;
        }

        fetch('/api/slug/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Validation failed');
                }
                return response.json();
            })
            .then((result) => {
                if (cancelled) return;
                setSlugValidation({
                    isUnique: result.is_unique,
                    isValid: true,
                    suggestedSlug: result.suggested_slug,
                });
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Ошибка валидации slug проекта:', error);
                setSlugValidation({
                    isUnique: true,
                    isValid: true,
                    suggestedSlug: undefined,
                });
            })
            .finally(() => {
                if (!cancelled) {
                    setIsSlugGenerating(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedSlug, isEdit, project?.id]);

    const handleSlugChange = useCallback(
        (value: string) => {
            setAutoGenerateSlug(false);
            (setData as any)('slug', value);
        },
        [setData],
    );

    const handleAutoGenerateSlugChange = useCallback((checked: boolean) => {
        setAutoGenerateSlug(checked);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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
            enabled_gateways: (
                paymentSettings.enabled_gateways || ['yookassa']
            ).filter((g) => ['yookassa', 'tinkoff', 'sbp'].includes(String(g))),
        } as const;

        const url =
            isEdit && project?.id
                ? `/dashboard/organizations/${organization.id}/projects/${project.id}`
                : `/dashboard/organizations/${organization.id}/projects`;

        const sanitizedStages: StageRequestPayload[] = (data.stages ?? []).map(
            (stage: ProjectStageFormData) => ({
                id: stage.id,
                title: stage.title,
                description: stage.description,
                target_amount: stage.target_amount || 0,
                existing_image: stage.existing_image,
                gallery: stage.gallery || [],
                remove_image: stage.removeImage ? true : undefined,
            }),
        );

        sanitizedStages.forEach((stageData, index) => {
            const stageState = stages[index];

            if (stageState?.imageFile) {
                stageData.image_file = stageState.imageFile;
            }

            const newGalleryFiles =
                stageState?.galleryFiles
                    ?.filter((img) => img.file)
                    .map((img) => img.file!) || [];

            if (newGalleryFiles.length > 0) {
                stageData.gallery_files = newGalleryFiles;
            }
        });

        const payload: Record<string, unknown> = {
            ...data,
            payment_settings: normalizedPayment,
            stages: sanitizedStages,
        };

        if (isEdit && project?.id) {
            payload._method = 'PUT';
        }

        router.post(url, payload as any, {
            forceFormData: true,
            onSuccess: () => {
                // Redirect будет с сервера
            },
        });
    };

    const handleSubmitStages = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEdit || !project?.id) return;

        const url = `/dashboard/organizations/${organization.id}/projects/${project.id}/stages`;

        const sanitizedStages: StageRequestPayload[] = (data.stages ?? []).map(
            (stage: ProjectStageFormData) => ({
                id: stage.id,
                title: stage.title,
                description: stage.description,
                target_amount: stage.target_amount || 0,
                existing_image: stage.existing_image,
                gallery: stage.gallery || [],
                remove_image: stage.removeImage ? true : undefined,
            }),
        );

        sanitizedStages.forEach((stageData, index) => {
            const stageState = stages[index];
            if (stageState?.imageFile) {
                stageData.image_file = stageState.imageFile;
            }
            const newGalleryFiles =
                stageState?.galleryFiles
                    ?.filter((img) => img.file)
                    .map((img) => img.file!) || [];
            if (newGalleryFiles.length > 0) {
                stageData.gallery_files = newGalleryFiles;
            }
        });

        const payload: Record<string, unknown> = {
            stages: sanitizedStages,
        };

        // Duplicate files under underscore keys for maximum Laravel compatibility
        sanitizedStages.forEach((stage, index) => {
            if ((stage as any).image_file instanceof File) {
                (payload as any)[`stages_${index}_image`] = (stage as any)
                    .image_file as File;
            }
            const gf = (stage as any).gallery_files as File[] | undefined;
            if (gf && gf.length) {
                gf.forEach((file: File, i: number) => {
                    (payload as any)[`stages_${index}_gallery_${i}`] = file;
                });
            }
        });

        router.post(url, payload as any, {
            forceFormData: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Админ панель',
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

                    <FormStatusBanner
                        flash={page.props.flash as any}
                        errors={errors as any}
                        defaultErrorMessage="Исправьте ошибки в форме"
                        className="mt-4"
                    />
                </div>

                {/* Tabs */}
                <div className="mb-4 flex border-b">
                    <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`mr-4 pb-2 ${activeTab === 'general' ? 'border-b-2 border-primary font-semibold' : 'text-muted-foreground'}`}
                    >
                        Общее
                    </button>
                    <button
                        type="button"
                        onClick={() => isEdit && setActiveTab('stages')}
                        disabled={!isEdit}
                        className={`pb-2 ${activeTab === 'stages' ? 'border-b-2 border-primary font-semibold' : 'text-muted-foreground'} ${!isEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        Этапы
                    </button>
                </div>

                <form
                    onSubmit={
                        activeTab === 'general'
                            ? handleSubmit
                            : handleSubmitStages
                    }
                    className="create-organization__form"
                >
                    {/* Tab content */}
                    {activeTab === 'general' ? (
                        <GeneralTab
                            data={data}
                            errors={errors}
                            projectCategories={projectCategories}
                            paymentSettings={paymentSettings}
                            onDataChange={handleDataChange}
                            onPaymentChange={handlePaymentChange}
                            onCredentialChange={handleCredentialChange}
                            projectImage={projectImage}
                            projectImages={projectImages}
                            onProjectImageChange={setProjectImage}
                            onProjectImagesChange={setProjectImages}
                            slug={data.slug}
                            autoGenerateSlug={autoGenerateSlug}
                            isSlugGenerating={isSlugGenerating}
                            slugValidation={slugValidation}
                            onSlugChange={handleSlugChange}
                            onAutoGenerateSlugChange={handleAutoGenerateSlugChange}
                            onRegenerateSlug={regenerateSlug}
                            organization={organization}
                            projectId={project?.id}
                        />
                    ) : (
                        <StagesTab
                            data={data}
                            stages={stages}
                            onStagesChange={setStages}
                            onDataChange={handleDataChange}
                        />
                    )}

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
                            disabled={
                                processing ||
                                (activeTab === 'stages' && !isEdit)
                            }
                            className="create-organization__button create-organization__button--primary"
                        >
                            <Save className="create-organization__button-icon" />
                            {processing ? (
                                <>
                                    <div className="create-organization__loading" />
                                    {activeTab === 'stages'
                                        ? 'Сохранение этапов...'
                                        : isEdit
                                          ? 'Сохранение...'
                                          : 'Создание...'}
                                </>
                            ) : activeTab === 'stages' ? (
                                'Сохранить этапы'
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
