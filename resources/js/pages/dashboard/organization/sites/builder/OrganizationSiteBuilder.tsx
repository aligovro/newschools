import { SiteBuilder } from '@/components/dashboard/site-builder/constructor/SiteBuilder';
import { SettingsContent } from '@/components/dashboard/site-builder/layout';
import SlugGenerator from '@/components/SlugGenerator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { sitesApi } from '@/lib/api/index';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, Globe, Save, Settings } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import PreviewTab from './tabs/PreviewTab';
import type { Organization, OrganizationSite, SiteWidget } from './types';

interface Props {
    organization: Organization;
    site: OrganizationSite;
    mode?: 'create' | 'edit';
}

const TabsHeader = memo(function TabsHeader({
    tabs,
    activeTab,
    onTabClick,
    hasErrorsInTab,
}: {
    tabs: Array<{
        id: 'settings' | 'builder' | 'preview';
        label: string;
        icon: any;
    }>;
    activeTab: 'settings' | 'builder' | 'preview';
    onTabClick: (tab: 'settings' | 'builder' | 'preview') => void;
    hasErrorsInTab: (tab: string) => boolean;
}) {
    return (
        <div className="mt-4 flex items-center space-x-6">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabClick(tab.id)}
                        className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        } ${hasErrorsInTab(tab.id) ? 'border-2 border-red-500' : ''}`}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        {hasErrorsInTab(tab.id) && (
                            <span className="ml-1 h-2 w-2 rounded-full bg-red-500"></span>
                        )}
                    </button>
                );
            })}
        </div>
    );
});

export default function OrganizationSiteBuilder({
    organization,
    site,
    mode,
}: Props) {
    const isCreateMode = !site?.id || mode === 'create';

    const getInitialTab = (): 'settings' | 'builder' | 'preview' => {
        if (typeof window === 'undefined') return 'settings';
        if (isCreateMode) return 'settings';
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'settings' || tab === 'builder' || tab === 'preview') {
            return tab;
        }
        return 'settings';
    };

    const [activeTab, setActiveTab] = useState<
        'builder' | 'preview' | 'settings'
    >(getInitialTab());

    const updateUrlTab = useCallback(
        (tab: 'settings' | 'builder' | 'preview') => {
            if (typeof window === 'undefined') return;
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        },
        [],
    );

    const handleTabClick = useCallback(
        (tab: 'settings' | 'builder' | 'preview') => {
            setActiveTab(tab);
            updateUrlTab(tab);
        },
        [updateUrlTab],
    );

    useEffect(() => {
        const onPopState = () => {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab === 'settings' || tab === 'builder' || tab === 'preview') {
                setActiveTab(tab);
            }
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    // Глобическая кнопка сохранения отключена: у каждой настройки свой отдельный save
    const [widgets, setWidgets] = useState<SiteWidget[]>(site.widgets || []);
    const [_isWidgetsLoading, setIsWidgetsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string[]>
    >({});

    const widgetSchema = useMemo(
        () =>
            yup
                .object()
                .shape({
                    id: yup.mixed().required(),
                    name: yup.string().required(),
                    widget_slug: yup.string().required(),
                    config: yup.object().default({}),
                    settings: yup.object().default({}),
                    position_name: yup.string().required(),
                    order: yup.number().required(),
                    is_active: yup.boolean().default(true),
                    is_visible: yup.boolean().default(true),
                })
                .test('widget-validation', function (value) {
                    const errors: string[] = [];
                    const v: any = value;
                    if (v && v.id) {
                        if (!v.name || v.name.trim() === '')
                            errors.push(`Виджет ${v.id}: Название обязательно`);
                        if (!v.widget_slug || v.widget_slug.trim() === '')
                            errors.push(
                                `Виджет ${v.id}: Widget slug обязателен`,
                            );
                        if (!v.position_name || v.position_name.trim() === '')
                            errors.push(`Виджет ${v.id}: Позиция обязательна`);
                        if (
                            v.order === undefined ||
                            v.order === null ||
                            v.order < 0
                        )
                            errors.push(`Виджет ${v.id}: Порядок обязателен`);
                    }
                    if (errors.length > 0)
                        return this.createError({ message: errors.join('; ') });
                    return true;
                }),
        [],
    );

    const widgetsSchema = useMemo(
        () => yup.array().of(widgetSchema),
        [widgetSchema],
    );

    const hasErrorsInTab = useCallback(
        (tab: string) => {
            return !!(
                validationErrors[tab] && validationErrors[tab].length > 0
            );
        },
        [validationErrors],
    );

    // Проверяем, является ли это главным сайтом (organization.id === 0 означает главный сайт)
    const isMainSite = organization.id === 0 || site.site_type === 'main';

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Админ панель', href: '/dashboard' },
            { title: 'Школы', href: '/dashboard/organizations' },
            isMainSite
                ? {
                      title: 'Сайты',
                      href: '/dashboard/sites',
                  }
                : {
                      title: organization.name,
                      href: `/dashboard/organizations/${organization.id}`,
                  },
            isMainSite
                ? {
                      title: site.name,
                      href: `/dashboard/sites/${site.id}`,
                  }
                : {
                      title: 'Сайты',
                      href: `/dashboard/organizations/${organization.id}/sites`,
                  },
            isCreateMode
                ? {
                      title: 'Создать сайт',
                      href: isMainSite
                          ? '/dashboard/sites/create'
                          : `/dashboard/organizations/${organization.id}/sites/create`,
                  }
                : {
                      title: site.name,
                      href: isMainSite
                          ? `/dashboard/sites/${site.id}/builder`
                          : `/dashboard/organizations/${organization.id}/sites/${site.id}/builder`,
                  },
        ],
        [
            organization.id,
            organization.name,
            isCreateMode,
            site.id,
            site.name,
            site.site_type,
            isMainSite,
        ],
    );

    // const handleSave = useCallback(async () => { ... }, []) // удалено

    const _handlePreview = useCallback(async () => {
        try {
            if (!site.id) return;
            const result = await sitesApi.getPreviewUrl(site.id);
            window.open(result.preview_url, '_blank');
        } catch (error) {
            console.error('Error getting preview:', error);
            alert('Ошибка при получении предпросмотра');
        }
    }, [site.id]);

    const handleWidgetsChange = useCallback(
        (newWidgets: any[], isLoading: boolean) => {
            setWidgets(newWidgets as SiteWidget[]);
            setIsWidgetsLoading(isLoading);
        },
        [],
    );

    const tabs = useMemo(
        () =>
            isCreateMode
                ? [
                      {
                          id: 'settings',
                          label: 'Настройки',
                          icon: Settings,
                      } as const,
                  ]
                : ([
                      { id: 'settings', label: 'Настройки', icon: Settings },
                      { id: 'builder', label: 'Конструктор', icon: Globe },
                      { id: 'preview', label: 'Предпросмотр', icon: Eye },
                  ] as const),
        [isCreateMode],
    );

    // Create form (create mode only)
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: isCreating,
        errors: createErrors,
    } = useForm({
        name: '',
        slug: '',
        description: '',
        template: 'default',
    });

    const handleCreateSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const createUrl = isMainSite
                ? '/dashboard/sites'
                : `/dashboard/organizations/${organization.id}/sites`;
            postCreate(createUrl);
        },
        [organization.id, postCreate, isMainSite],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    isCreateMode
                        ? `Создать сайт - ${organization.name}`
                        : `Конструктор - ${site.name}`
                }
            />
            <div className="flex h-screen flex-col">
                <div className="border-b bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={
                                    isMainSite
                                        ? '/dashboard/sites'
                                        : `/dashboard/organizations/${organization.id}/sites`
                                }
                            >
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Назад к сайтам
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold">
                                    {isCreateMode ? 'Создать сайт' : site.name}
                                </h1>
                                {!isCreateMode && (
                                    <div className="mt-1 flex items-center space-x-2">
                                        <Badge variant="secondary">
                                            {site.status === 'published'
                                                ? 'Опубликован'
                                                : site.status === 'draft'
                                                  ? 'Черновик'
                                                  : 'Архив'}
                                        </Badge>
                                        {site.is_maintenance_mode && (
                                            <Badge variant="destructive">
                                                Тех. работы
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isCreateMode ? (
                                <Button
                                    size="sm"
                                    disabled={isCreating || !createData.name}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const createUrl = isMainSite
                                            ? '/dashboard/sites'
                                            : `/dashboard/organizations/${organization.id}/sites`;
                                        postCreate(createUrl);
                                    }}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {isCreating
                                        ? 'Создание...'
                                        : 'Создать сайт'}
                                </Button>
                            ) : (
                                <TabsHeader
                                    tabs={tabs as any}
                                    activeTab={activeTab}
                                    onTabClick={handleTabClick}
                                    hasErrorsInTab={hasErrorsInTab}
                                />
                            )}
                        </div>
                    </div>
                    {/* Tabs moved to the header right side */}
                </div>

                <div className="flex-1 overflow-hidden">
                    {isCreateMode ? (
                        <div className="h-full overflow-auto bg-white p-6">
                            <form
                                onSubmit={handleCreateSubmit}
                                className="mx-auto max-w-3xl space-y-6"
                            >
                                <div className="space-y-2">
                                    <SlugGenerator
                                        value={createData.slug}
                                        onChange={(slug) =>
                                            setCreateData('slug', slug)
                                        }
                                        onNameChange={(name) =>
                                            setCreateData('name', name)
                                        }
                                        placeholder="Введите название сайта"
                                        table="sites"
                                        column="slug"
                                    />
                                    {createErrors.name && (
                                        <p className="text-sm text-red-500">
                                            {createErrors.name}
                                        </p>
                                    )}
                                    {createErrors.slug && (
                                        <p className="text-sm text-red-500">
                                            {createErrors.slug}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Описание
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={createData.description}
                                        onChange={(e) =>
                                            setCreateData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Краткое описание сайта"
                                        rows={3}
                                        className={
                                            createErrors.description
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {createErrors.description && (
                                        <p className="text-sm text-red-500">
                                            {createErrors.description}
                                        </p>
                                    )}
                                </div>
                                <input
                                    type="hidden"
                                    name="template"
                                    value={createData.template}
                                />
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="submit"
                                        disabled={
                                            isCreating || !createData.name
                                        }
                                    >
                                        {isCreating
                                            ? 'Создание...'
                                            : 'Создать сайт'}
                                    </Button>
                                    <Link
                                        href={
                                            isMainSite
                                                ? '/dashboard/sites'
                                                : `/dashboard/organizations/${organization.id}/sites`
                                        }
                                    >
                                        <Button type="button" variant="outline">
                                            Отмена
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'builder' && site.id && (
                                <SiteBuilder
                                    siteId={site.id}
                                    template={
                                        site.template as unknown as Record<
                                            string,
                                            unknown
                                        >
                                    }
                                    initialLayoutConfig={
                                        site.layout_config || {}
                                    }
                                    initialWidgets={widgets as any}
                                    onWidgetsChange={handleWidgetsChange}
                                    validationErrors={
                                        validationErrors['builder'] || []
                                    }
                                />
                            )}
                            {activeTab === 'preview' && site.id && (
                                <PreviewTab site={site} />
                            )}
                            {activeTab === 'settings' && (
                                <SettingsContent site={site as any} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
