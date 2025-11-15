import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import MultiImageUploader, {
    type UploadedImage,
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
import UniversalSelect, {
    type SelectOption,
} from '@/components/ui/universal-select/UniversalSelect';
import AppLayout from '@/layouts/app-layout';
import type { NewsItem } from '@/lib/api/news';
import { newsApi } from '@/lib/api/news';
import { uploadFile } from '@/utils/uploadFile';
import { Head, Link, useForm } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ContextPayload {
    mode: 'global' | 'organization';
    organization: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

interface DefaultsPayload {
    status: string;
    visibility: string;
    type: string;
    starts_at?: string | null;
    ends_at?: string | null;
}

interface LookupsPayload {
    organizations: Array<{
        id: number;
        name: string;
    }>;
}

interface PermissionsPayload {
    canManage: boolean;
}

interface NewsFormProps {
    context: ContextPayload;
    news: NewsItem | null;
    defaults: DefaultsPayload;
    lookups: LookupsPayload;
    permissions: PermissionsPayload;
}

type FormMode = 'create' | 'edit';

interface NewsFormState {
    organization_id: number | null;
    title: string;
    subtitle: string;
    slug: string;
    excerpt: string;
    content: string;
    status: string;
    visibility: string;
    type: string;
    is_featured: boolean;
    tags: string[];
    tags_input: string;
    image: string;
    gallery: string[];
    starts_at: string;
    ends_at: string;
    timezone: string;
    location_name: string;
    location_address: string;
    location_latitude: string;
    location_longitude: string;
    registration_url: string;
    registration_required: boolean;
    target_type: 'organization' | 'project' | 'site' | '';
    target_id: number | null;
    is_main_site: boolean;
}

const statusOptions = [
    { value: 'draft', label: 'Черновик' },
    { value: 'scheduled', label: 'Запланировано' },
    { value: 'published', label: 'Опубликовано' },
    { value: 'archived', label: 'Архив' },
];

const visibilityOptions = [
    { value: 'public', label: 'Публично' },
    { value: 'organization', label: 'Для организации' },
    { value: 'private', label: 'Приватно' },
];

const typeOptions = [
    { value: 'event', label: 'Событие' },
    { value: 'news', label: 'Новость' },
    { value: 'announcement', label: 'Анонс' },
];

const mapGalleryToUploaded = (items: string[]): UploadedImage[] =>
    items.map((item, index) => ({
        id: `gallery-${index}-${item}`,
        url: item,
        name: item.split('/').pop() ?? `gallery-${index + 1}`,
        size: 0,
        type: 'image/jpeg',
        status: 'success',
    }));

const extractGalleryUrls = (items: UploadedImage[]): string[] =>
    items
        .filter((image) => image.status === 'success' && Boolean(image.url))
        .map((image) => image.url);

function toDateTimeLocal(value?: string | null): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString();
}

function extractTargetType(
    target?: NewsItem['target'],
): 'organization' | 'project' | 'site' | '' {
    if (!target) return '';
    if (!target.type) return '';

    const type = target.type.toLowerCase();
    if (type.includes('organization')) return 'organization';
    if (type.includes('project')) return 'project';
    if (type.includes('site')) return 'site';

    return '';
}

export default function NewsForm({
    context,
    news,
    defaults,
    lookups,
    permissions,
}: NewsFormProps) {
    const mode: FormMode = news ? 'edit' : 'create';

    const startingTargetType =
        extractTargetType(news?.target) ||
        (context.mode === 'organization' ? 'organization' : '');

    const isMainSiteFromNews = Boolean(
        news &&
            news.organization_id === null &&
            (news.newsable_type || news.target?.type || '')
                ?.toLowerCase()
                .includes('site'),
    );

    const startingTargetId = news
        ? (news.target?.id ?? news.newsable_id ?? null)
        : context.mode === 'organization'
          ? (context.organization?.id ?? null)
          : null;

    const initialOrganizationId = news
        ? (news.organization_id ?? null)
        : (context.organization?.id ?? lookups.organizations[0]?.id ?? null);

    const initialState: NewsFormState = {
        organization_id: initialOrganizationId,
        title: news?.title ?? '',
        subtitle: news?.subtitle ?? '',
        slug: news?.slug ?? '',
        excerpt: news?.excerpt ?? '',
        content: news?.content ?? '',
        status: news?.status ?? defaults.status,
        visibility: news?.visibility ?? defaults.visibility,
        type: news?.type ?? defaults.type,
        is_featured: news?.is_featured ?? false,
        tags: news?.tags ?? [],
        tags_input: news?.tags?.join(', ') ?? '',
        image: news?.image ?? '',
        gallery: news?.gallery ?? [],
        starts_at: toDateTimeLocal(news?.starts_at),
        ends_at: toDateTimeLocal(news?.ends_at),
        timezone: news?.timezone ?? 'Europe/Moscow',
        location_name: news?.location?.name ?? '',
        location_address: news?.location?.address ?? '',
        location_latitude: news?.location?.latitude
            ? String(news.location.latitude)
            : '',
        location_longitude: news?.location?.longitude
            ? String(news.location.longitude)
            : '',
        registration_url: news?.registration_url ?? '',
        registration_required: news?.registration_required ?? false,
        target_type: isMainSiteFromNews ? 'site' : startingTargetType,
        target_id: startingTargetId,
        is_main_site: isMainSiteFromNews,
    };

    const {
        data,
        setData,
        errors,
        processing,
        post,
        put,
        transform,
        setError,
        clearErrors,
    } = useForm<NewsFormState>(initialState);

    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [galleryItems, setGalleryItems] = useState<UploadedImage[]>(() =>
        mapGalleryToUploaded(initialState.gallery),
    );
    const [targetOptions, setTargetOptions] = useState<SelectOption[]>([]);
    const [targetLoading, setTargetLoading] = useState(false);
    const [targetHasMore, setTargetHasMore] = useState(false);
    const [targetSearch, setTargetSearch] = useState('');
    const [mainSiteInfo, setMainSiteInfo] = useState<{
        site_id: number;
        site_name: string;
    } | null>(null);
    const targetMetaRef = useRef<
        Map<
            string,
            {
                organization_id: number | null;
                organization_name?: string | null;
            }
        >
    >(new Map());
    const targetPageRef = useRef(1);
    const previousTargetRef = useRef<{
        type: NewsFormState['target_type'];
        id: number | null;
        organization_id: number | null;
    } | null>(null);

    const breadcrumbs = useMemo(() => {
        const result = [
            {
                title: 'Админ панель',
                href: '/dashboard',
            },
        ];

        if (context.mode === 'organization' && context.organization) {
            result.push({
                title: 'Школы',
                href: '/dashboard/organizations',
            });
            result.push({
                title: context.organization.name,
                href: `/dashboard/organizations/${context.organization.id}`,
            });
        }

        result.push({
            title: 'События и новости',
            href:
                context.mode === 'global'
                    ? '/dashboard/news'
                    : `/dashboard/organizations/${context.organization?.id}/news`,
        });

        result.push({
            title:
                mode === 'create'
                    ? 'Создание материала'
                    : `Редактирование — ${news?.title}`,
            href: '#',
        });

        return result;
    }, [context, mode, news]);

    useEffect(() => {
        if (
            mode === 'create' &&
            context.mode === 'organization' &&
            context.organization
        ) {
            if (!data.target_type) {
                setData('target_type', 'organization');
            }
            if (!data.target_id) {
                setData('target_id', context.organization.id);
            }
            if (!data.organization_id) {
                setData('organization_id', context.organization.id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        mode,
        context.mode,
        context.organization,
        data.target_type,
        data.target_id,
        data.organization_id,
    ]);

    const canManage = permissions.canManage ?? false;
    const canUseMainSite = canManage && context.mode !== 'organization';

    useEffect(() => {
        if (!canUseMainSite) {
            setMainSiteInfo(null);
            return;
        }

        let active = true;

        (async () => {
            try {
                const info = await newsApi.mainSite();
                if (!active) {
                    return;
                }
                setMainSiteInfo(info);

                if (info && data.is_main_site) {
                    setData('target_type', 'site');
                    if (data.target_id !== info.site_id) {
                        setData('target_id', info.site_id);
                    }
                }
            } catch {
                if (active) {
                    setMainSiteInfo(null);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [canUseMainSite, data.is_main_site, data.target_id, setData]);

    useEffect(() => {
        if (!data.is_main_site) {
            previousTargetRef.current = {
                type: data.target_type,
                id: data.target_id,
                organization_id: data.organization_id,
            };
        }
    }, [
        data.is_main_site,
        data.target_id,
        data.target_type,
        data.organization_id,
    ]);

    useEffect(() => {
        setGalleryItems(mapGalleryToUploaded(initialState.gallery));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [news?.id]);

    const handleGalleryChange = (items: UploadedImage[]) => {
        setGalleryItems(items);
        const urls = extractGalleryUrls(items);
        setData('gallery', urls);
    };

    const handleGalleryUpload = async (file: File): Promise<string> => {
        setUploadingGallery(true);
        try {
            const response = await uploadFile(file, 'news-gallery');
            const url =
                response.data?.gallery ||
                response.data?.original ||
                response.url;

            if (!url) {
                throw new Error('Не удалось получить ссылку на изображение');
            }

            return url;
        } finally {
            setUploadingGallery(false);
        }
    };

    const fetchTargets = useCallback(
        async (page = 1, searchValue = '', append = false) => {
            if (!data.target_type || data.is_main_site) {
                return;
            }

            setTargetLoading(true);
            try {
                if (!append) {
                    targetMetaRef.current.clear();
                }

                const response = await newsApi.targets({
                    type: data.target_type,
                    page,
                    per_page: 10,
                    search: searchValue || undefined,
                });

                const mappedOptions = response.data.map((item) => {
                    targetMetaRef.current.set(String(item.value), item.meta);
                    return {
                        value: item.value,
                        label: item.label,
                        description:
                            item.description ??
                            item.meta?.organization_name ??
                            undefined,
                    } satisfies SelectOption;
                });

                setTargetOptions((prev) =>
                    append ? [...prev, ...mappedOptions] : mappedOptions,
                );
                setTargetHasMore(response.meta.has_more);
                targetPageRef.current = response.meta.current_page;

                if (
                    data.target_id &&
                    !targetMetaRef.current.has(String(data.target_id)) &&
                    news?.target
                ) {
                    targetMetaRef.current.set(String(data.target_id), {
                        organization_id:
                            data.organization_id ??
                            news?.organization?.id ??
                            null,
                        organization_name: news?.organization?.name,
                    });
                    setTargetOptions((prev) => [
                        {
                            value: data.target_id as number,
                            label:
                                news.target?.name ??
                                `#${data.target_id as number}`,
                            description:
                                news.target?.slug ??
                                news.organization?.name ??
                                undefined,
                        },
                        ...prev,
                    ]);
                }
            } catch {
                if (!append) {
                    setTargetOptions([]);
                    setTargetHasMore(false);
                }
            } finally {
                setTargetLoading(false);
            }
        },
        [
            data.target_id,
            data.target_type,
            data.organization_id,
            data.is_main_site,
            news?.organization,
            news?.target,
        ],
    );

    useEffect(() => {
        targetMetaRef.current.clear();
        setTargetOptions([]);
        setTargetHasMore(false);
        if (!data.target_type || data.is_main_site) {
            return;
        }

        let isCancelled = false;

        const timer = setTimeout(
            () => {
                if (isCancelled) return;
                fetchTargets(1, targetSearch, false);
            },
            targetSearch ? 250 : 0,
        );

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [data.is_main_site, data.target_type, fetchTargets, targetSearch]);

    const handleMainSiteToggle = useCallback(
        (checked: boolean) => {
            if (!canUseMainSite || !mainSiteInfo) {
                return;
            }

            if (checked) {
                previousTargetRef.current = {
                    type: data.target_type,
                    id: data.target_id,
                    organization_id: data.organization_id,
                };
                setData('is_main_site', true);
                setData('target_type', 'site');
                setData('target_id', mainSiteInfo.site_id);
                setData('organization_id', null);
                setTargetOptions([
                    {
                        value: mainSiteInfo.site_id,
                        label: mainSiteInfo.site_name,
                        description: 'Главный сайт',
                    },
                ]);
                setTargetHasMore(false);
                setTargetSearch('');
                targetMetaRef.current.clear();
            } else {
                setData('is_main_site', false);
                const previous = previousTargetRef.current;
                const fallbackType =
                    previous?.type ??
                    (context.mode === 'organization' ? 'organization' : '');
                const fallbackId =
                    previous?.id ??
                    (context.mode === 'organization'
                        ? (context.organization?.id ?? null)
                        : null);
                const fallbackOrganizationId =
                    previous?.organization_id ??
                    (context.mode === 'organization'
                        ? (context.organization?.id ?? null)
                        : data.organization_id);

                setData('target_type', fallbackType);
                setData('target_id', fallbackId);
                setData('organization_id', fallbackOrganizationId ?? null);
                setTargetOptions([]);
                setTargetHasMore(false);
                setTargetSearch('');
                targetMetaRef.current.clear();
            }
        },
        [
            canUseMainSite,
            context.mode,
            context.organization,
            data.organization_id,
            data.target_id,
            data.target_type,
            mainSiteInfo,
            setData,
        ],
    );

    const handleLoadMoreTargets = useCallback(() => {
        if (
            targetLoading ||
            !targetHasMore ||
            !data.target_type ||
            data.is_main_site ||
            targetMetaRef.current.size === 0
        ) {
            return;
        }
        const nextPage = targetPageRef.current + 1;
        fetchTargets(nextPage, targetSearch, true);
    }, [
        data.is_main_site,
        data.target_type,
        fetchTargets,
        targetHasMore,
        targetLoading,
        targetSearch,
    ]);

    const handleTargetTypeChange = useCallback(
        (value: string) => {
            const mapped =
                value === 'none'
                    ? ''
                    : (value as 'organization' | 'project' | 'site');
            setData('is_main_site', false);
            setData('target_type', mapped);
            setData('target_id', null);
            setTargetSearch('');

            if (mapped === 'organization') {
                setData(
                    'organization_id',
                    context.mode === 'organization'
                        ? (context.organization?.id ?? null)
                        : null,
                );
            }

            targetMetaRef.current.clear();
            setTargetOptions([]);
            setTargetHasMore(false);
        },
        [context.mode, context.organization, setData],
    );

    const handleTargetSelect = useCallback(
        (value: string | number | null) => {
            if (data.is_main_site) {
                return;
            }

            if (!value) {
                setData('target_id', null);
                if (data.target_type === 'organization') {
                    setData(
                        'organization_id',
                        context.mode === 'organization'
                            ? (context.organization?.id ?? null)
                            : null,
                    );
                }
                return;
            }

            const numericValue =
                typeof value === 'string' ? Number(value) : value;
            setData('target_id', numericValue);

            if (data.target_type === 'organization') {
                setData('organization_id', numericValue);
                return;
            }

            const meta =
                targetMetaRef.current.get(String(value)) ??
                (news?.organization?.id
                    ? {
                          organization_id: news.organization.id,
                          organization_name: news.organization?.name,
                      }
                    : undefined);

            if (meta?.organization_id) {
                setData('organization_id', meta.organization_id);
            }
        },
        [
            context.mode,
            context.organization,
            data.is_main_site,
            data.target_type,
            news,
            setData,
        ],
    );

    const targetPlaceholder = useMemo(() => {
        switch (data.target_type) {
            case 'organization':
                return 'Выберите организацию';
            case 'project':
                return 'Выберите проект';
            case 'site':
                return 'Выберите сайт';
            default:
                return 'Сначала выберите тип сущности';
        }
    }, [data.target_type]);

    const cancelPath =
        context.mode === 'global'
            ? '/dashboard/news'
            : `/dashboard/organizations/${context.organization?.id}/news`;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!canManage) {
            return;
        }

        clearErrors();

        const galleryUrls = extractGalleryUrls(galleryItems);

        transform((form) => {
            const payload = { ...form };

            payload.tags = form.tags_input
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean);

            payload.starts_at = form.starts_at
                ? (fromDateTimeLocal(form.starts_at) ?? '')
                : '';
            payload.ends_at = form.ends_at
                ? (fromDateTimeLocal(form.ends_at) ?? '')
                : '';

            return {
                organization_id: form.is_main_site
                    ? null
                    : (form.organization_id ?? null),
                title: form.title,
                subtitle: form.subtitle || null,
                slug: form.slug || null,
                excerpt: form.excerpt || null,
                content: form.content || null,
                status: form.status,
                visibility: form.visibility,
                type: form.type,
                is_featured: form.is_featured,
                tags: payload.tags,
                image: form.image || null,
                gallery: galleryUrls,
                starts_at: payload.starts_at || null,
                ends_at: payload.ends_at || null,
                timezone: form.timezone || null,
                location: {
                    name: form.location_name || null,
                    address: form.location_address || null,
                    latitude: form.location_latitude
                        ? Number(form.location_latitude)
                        : null,
                    longitude: form.location_longitude
                        ? Number(form.location_longitude)
                        : null,
                },
                registration: {
                    url: form.registration_url || null,
                    required: form.registration_required,
                },
                target:
                    form.target_type && form.target_id
                        ? {
                              type: form.target_type,
                              id: form.target_id,
                          }
                        : null,
                is_main_site: form.is_main_site,
            };
        });

        if (mode === 'create') {
            const action =
                context.mode === 'global'
                    ? '/dashboard/news'
                    : `/dashboard/organizations/${context.organization?.id}/news`;

            post(action, {
                onError: (formErrors) => {
                    if (formErrors.organization_id) {
                        setError('organization_id', formErrors.organization_id);
                    }
                },
                preserveScroll: true,
            });
        } else if (news) {
            const action =
                context.mode === 'global'
                    ? `/dashboard/news/${news.id}`
                    : `/dashboard/organizations/${context.organization?.id}/news/${news.id}`;

            put(action, {
                preserveScroll: true,
            });
        }
    };

    const handleImageUpload = (result: { url: string }) => {
        if (result.url) {
            setData('image', result.url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    mode === 'create'
                        ? 'Создание материала'
                        : 'Редактирование материала'
                }
            />

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="space-y-6 lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Основная информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {canUseMainSite && (
                                    <div className="bg-muted/40 flex items-start justify-between rounded-lg border px-3 py-3">
                                        <div className="pr-4">
                                            <p className="text-sm font-medium">
                                                Новость главного сайта
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Публикует материал на главной
                                                витрине без привязки к
                                                конкретной организации.
                                            </p>
                                            {!mainSiteInfo && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Главный сайт не настроен или
                                                    недоступен — обратитесь к
                                                    администратору.
                                                </p>
                                            )}
                                        </div>
                                        <Switch
                                            id="is_main_site"
                                            checked={data.is_main_site}
                                            onCheckedChange={
                                                handleMainSiteToggle
                                            }
                                            disabled={
                                                !canUseMainSite ||
                                                !mainSiteInfo ||
                                                processing
                                            }
                                        />
                                    </div>
                                )}

                                {!data.is_main_site && (
                                    <div className="space-y-3">
                                        <Label htmlFor="target_type">
                                            Привязать к сущности
                                        </Label>
                                        <Select
                                            value={data.target_type || 'none'}
                                            onValueChange={
                                                handleTargetTypeChange
                                            }
                                            disabled={!canManage}
                                        >
                                            <SelectTrigger id="target_type">
                                                <SelectValue placeholder="Выберите тип сущности" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Не привязывать
                                                </SelectItem>
                                                <SelectItem value="organization">
                                                    Организация
                                                </SelectItem>
                                                <SelectItem value="project">
                                                    Проект
                                                </SelectItem>
                                                <SelectItem value="site">
                                                    Сайт
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {data.target_type && (
                                            <UniversalSelect
                                                options={targetOptions}
                                                value={data.target_id}
                                                onChange={handleTargetSelect}
                                                placeholder={targetPlaceholder}
                                                searchable
                                                clearable
                                                onSearchChange={setTargetSearch}
                                                searchValue={targetSearch}
                                                loading={targetLoading}
                                                hasMore={targetHasMore}
                                                onLoadMore={
                                                    handleLoadMoreTargets
                                                }
                                                emptyMessage={
                                                    targetLoading
                                                        ? 'Загрузка...'
                                                        : 'Ничего не найдено'
                                                }
                                                disabled={!canManage}
                                            />
                                        )}
                                    </div>
                                )}
                                {data.is_main_site &&
                                    canUseMainSite &&
                                    mainSiteInfo && (
                                        <div className="bg-muted/40 rounded-lg border px-3 py-2 text-sm">
                                            Новость будет опубликована на{' '}
                                            <span className="font-medium">
                                                {mainSiteInfo.site_name}
                                            </span>
                                            .
                                        </div>
                                    )}
                                {!data.is_main_site &&
                                    errors.organization_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.organization_id}
                                        </p>
                                    )}

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">
                                            Заголовок *
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(event) =>
                                                setData(
                                                    'title',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            placeholder="Введите заголовок"
                                            disabled={!canManage}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subtitle">
                                            Подзаголовок
                                        </Label>
                                        <Input
                                            id="subtitle"
                                            value={data.subtitle}
                                            onChange={(event) =>
                                                setData(
                                                    'subtitle',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Краткое пояснение"
                                            disabled={!canManage}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">
                                        Краткое описание
                                    </Label>
                                    <textarea
                                        id="excerpt"
                                        className="focus:ring-primary/20 min-h-[120px] w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2"
                                        value={data.excerpt}
                                        onChange={(event) =>
                                            setData(
                                                'excerpt',
                                                event.target.value,
                                            )
                                        }
                                        disabled={!canManage}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Контент</Label>
                                    <textarea
                                        id="content"
                                        className="focus:ring-primary/20 min-h-[240px] w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2"
                                        value={data.content}
                                        onChange={(event) =>
                                            setData(
                                                'content',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Основной текст события или новости"
                                        disabled={!canManage}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Дополнительные сведения</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="starts_at">
                                            Дата и время начала
                                        </Label>
                                        <Input
                                            id="starts_at"
                                            type="datetime-local"
                                            value={data.starts_at}
                                            onChange={(event) =>
                                                setData(
                                                    'starts_at',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={!canManage}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ends_at">
                                            Дата и время окончания
                                        </Label>
                                        <Input
                                            id="ends_at"
                                            type="datetime-local"
                                            min={data.starts_at || undefined}
                                            value={data.ends_at}
                                            onChange={(event) =>
                                                setData(
                                                    'ends_at',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={!canManage}
                                        />
                                        {errors.ends_at && (
                                            <p className="text-sm text-destructive">
                                                {errors.ends_at}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone">
                                        Часовой пояс
                                    </Label>
                                    <Input
                                        id="timezone"
                                        value={data.timezone}
                                        onChange={(event) =>
                                            setData(
                                                'timezone',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Например: Europe/Moscow"
                                        disabled={!canManage}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="location_name">
                                            Место проведения
                                        </Label>
                                        <Input
                                            id="location_name"
                                            value={data.location_name}
                                            onChange={(event) =>
                                                setData(
                                                    'location_name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Название площадки"
                                            disabled={!canManage}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location_address">
                                            Адрес
                                        </Label>
                                        <Input
                                            id="location_address"
                                            value={data.location_address}
                                            onChange={(event) =>
                                                setData(
                                                    'location_address',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Город, улица, дом"
                                            disabled={!canManage}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="location_latitude">
                                            Широта
                                        </Label>
                                        <Input
                                            id="location_latitude"
                                            value={data.location_latitude}
                                            onChange={(event) =>
                                                setData(
                                                    'location_latitude',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="55.751244"
                                            disabled={!canManage}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location_longitude">
                                            Долгота
                                        </Label>
                                        <Input
                                            id="location_longitude"
                                            value={data.location_longitude}
                                            onChange={(event) =>
                                                setData(
                                                    'location_longitude',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="37.618423"
                                            disabled={!canManage}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="registration_url">
                                            Ссылка на регистрацию
                                        </Label>
                                        <Input
                                            id="registration_url"
                                            value={data.registration_url}
                                            onChange={(event) =>
                                                setData(
                                                    'registration_url',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="https://..."
                                            disabled={!canManage}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 pt-6">
                                        <Switch
                                            id="registration_required"
                                            checked={data.registration_required}
                                            onCheckedChange={(value) =>
                                                setData(
                                                    'registration_required',
                                                    value,
                                                )
                                            }
                                            disabled={!canManage}
                                        />
                                        <Label
                                            htmlFor="registration_required"
                                            className="font-normal"
                                        >
                                            Требуется регистрация
                                        </Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Теги</Label>
                                    <Input
                                        id="tags"
                                        value={data.tags_input}
                                        onChange={(event) =>
                                            setData(
                                                'tags_input',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Укажите теги через запятую"
                                        disabled={!canManage}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6 lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Публикация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Статус *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
                                        }
                                        disabled={!canManage}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Выберите статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="visibility">
                                        Видимость *
                                    </Label>
                                    <Select
                                        value={data.visibility}
                                        onValueChange={(value) =>
                                            setData('visibility', value)
                                        }
                                        disabled={!canManage}
                                    >
                                        <SelectTrigger id="visibility">
                                            <SelectValue placeholder="Выберите видимость" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {visibilityOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Тип *</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData('type', value)
                                        }
                                        disabled={!canManage}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {typeOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="bg-muted/40 flex items-start justify-between rounded-lg border px-3 py-2">
                                    <div className="pr-4">
                                        <p className="text-sm font-medium">
                                            Избранный материал
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Показывать событие на витринах и в
                                            подборках.
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(value) =>
                                            setData('is_featured', value)
                                        }
                                        disabled={!canManage}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Медиа</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Основное изображение</Label>
                                    <ImageUpload
                                        type="news-cover"
                                        currentImage={data.image || undefined}
                                        onUpload={handleImageUpload}
                                        onRemove={() => setData('image', '')}
                                        disabled={!canManage}
                                    />
                                    {errors.image && (
                                        <p className="text-sm text-destructive">
                                            {errors.image}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Галерея</Label>
                                    <MultiImageUploader
                                        images={galleryItems}
                                        onChange={handleGalleryChange}
                                        onUpload={handleGalleryUpload}
                                        maxFiles={12}
                                        disabled={
                                            uploadingGallery || !canManage
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        asChild
                        disabled={processing}
                    >
                        <Link href={cancelPath}>Отменить</Link>
                    </Button>
                    <Button type="submit" disabled={processing || !canManage}>
                        {mode === 'create' ? 'Создать' : 'Сохранить'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
