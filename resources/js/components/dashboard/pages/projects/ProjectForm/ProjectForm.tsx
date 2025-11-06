import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index as projectIndex } from '@/routes/organizations/projects';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GeneralTab from '../tabs/GeneralTab';
import StagesTab from '../tabs/StagesTab';
import type {
    PaymentSettings,
    ProjectFormData,
    ProjectFormProps,
    ProjectStageFormData,
    UploadedImage,
} from './types';

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
    categories,
    projectCategories = [],
    project,
    isEdit = false,
}: ProjectFormProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'stages'>('general');
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
            category: project?.category || '',
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

    // Payment settings state
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(
        useMemo(() => {
            const raw = project?.payment_settings;
            if (raw && typeof raw === 'object') {
                return {
                    gateway: raw.gateway ?? 'yookassa',
                    enabled_gateways: (Array.isArray(raw.enabled_gateways)
                        ? (raw.enabled_gateways as string[])
                        : raw.gateway
                          ? [raw.gateway as string]
                          : ['yookassa']) as Array<
                        'yookassa' | 'tinkoff' | 'sbp'
                    >,
                    credentials: raw.credentials ?? {},
                    options: raw.options ?? {},
                    donation_min_amount: Number(raw.donation_min_amount) || 100,
                    donation_max_amount: Number(raw.donation_max_amount) || 0,
                    currency: raw.currency ?? 'RUB',
                    test_mode: Boolean(raw.test_mode ?? true),
                };
            }
            return {
                gateway: 'yookassa',
                credentials: {},
                options: {},
                donation_min_amount: 100,
                donation_max_amount: 0,
                currency: 'RUB',
                test_mode: true,
            };
        }, [project]),
    );

    // Callbacks for data changes
    const handleDataChange = useCallback(
        (key: keyof ProjectFormData, value: unknown) => {
            (setData as any)(key, value);
        },
        [setData],
    );

    const handlePaymentChange = useCallback(
        (key: keyof PaymentSettings, value: unknown) => {
            setPaymentSettings((prev) => ({ ...prev, [key]: value }));
        },
        [],
    );

    const handleCredentialChange = useCallback((key: string, value: string) => {
        setPaymentSettings((prev) => ({
            ...prev,
            credentials: { ...(prev.credentials || {}), [key]: value },
        }));
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

    // Generate slug from title (only when creating)
    useEffect(() => {
        if (!isEdit && data.title && !data.slug) {
            const slug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            (setData as any)('slug', slug);
        }
    }, [data.title, data.slug, setData, isEdit]);

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

        console.log(
            '🎬 Submitting stages with files:',
            stages.map((s) => ({
                title: s.title,
                hasImageFile: !!s.imageFile,
                hasGalleryFiles:
                    s.galleryFiles?.filter((img) => img.file).length || 0,
            })),
        );

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
                console.log(`✅ Added stage ${index} image file`);
            }

            const newGalleryFiles =
                stageState?.galleryFiles
                    ?.filter((img) => img.file)
                    .map((img) => img.file!) || [];

            if (newGalleryFiles.length > 0) {
                stageData.gallery_files = newGalleryFiles;
                console.log(
                    `Stage ${index}: Adding ${newGalleryFiles.length} gallery files`,
                );
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

        console.log(
            '🎬 Saving only stages with files:',
            stages.map((s) => ({
                title: s.title,
                hasImageFile: !!s.imageFile,
                newGalleryFiles:
                    s.galleryFiles?.filter((g) => g.file).length || 0,
            })),
        );

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

    const hasErrors = Object.keys(errors).length > 0;

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
                            categories={categories}
                            projectCategories={projectCategories}
                            paymentSettings={paymentSettings}
                            onDataChange={handleDataChange}
                            onPaymentChange={handlePaymentChange}
                            onCredentialChange={handleCredentialChange}
                            projectImage={projectImage}
                            projectImages={projectImages}
                            onProjectImageChange={setProjectImage}
                            onProjectImagesChange={setProjectImages}
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
                                !!hasErrors ||
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
