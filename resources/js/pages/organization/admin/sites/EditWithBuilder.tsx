import { SettingsContent } from '@/components/site-builder/layout';
import { SiteBuilder } from '@/components/site-builder/SiteBuilder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, Globe, Save, Settings, Share } from 'lucide-react';
import { useState } from 'react';
import * as yup from 'yup';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface SiteWidget {
    id: number;
    name: string;
    config: any;
    settings: any;
    sort_order: number;
    is_active: boolean;
    is_visible: boolean;
    widget: {
        id: number;
        name: string;
        slug: string;
        category: string;
        icon: string;
        fields_config: any;
        settings_config: any;
    };
    position: {
        id: number;
        name: string;
        slug: string;
        description: string;
    };
}

interface SitePage {
    id: number;
    title: string;
    slug: string;
    content: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

interface OrganizationSite {
    id: number;
    name: string;
    slug: string;
    description: string;
    template: string;
    status: 'draft' | 'published' | 'archived';
    is_public: boolean;
    is_maintenance_mode: boolean;
    layout_config: any;
    theme_config: any;
    content_blocks: any[];
    navigation_config: any;
    seo_config: any;
    created_at: string;
    updated_at: string;
    url?: string;
    widgets: SiteWidget[];
    pages: SitePage[];
}

interface Props {
    organization: Organization;
    site: OrganizationSite;
}

export default function EditWithBuilder({ organization, site }: Props) {
    console.log('EditWithBuilder - organization:', organization);
    console.log('EditWithBuilder - site:', site);
    console.log('EditWithBuilder - site.id:', site?.id);

    const [activeTab, setActiveTab] = useState<
        'builder' | 'preview' | 'settings'
    >('builder');
    const [isSaving, setIsSaving] = useState(false);
    const [widgets, setWidgets] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<{
        [key: string]: string[];
    }>({});

    // Схема валидации для виджетов - проверяем только критичные поля
    const widgetSchema = yup
        .object()
        .shape({
            id: yup.number().required(),
            name: yup.string().required(),
            slug: yup.string().required(),
            config: yup.object().default({}),
            settings: yup.object().default({}),
            position_name: yup.string().required(),
            order: yup.number().required(),
            is_active: yup.boolean().default(true),
            is_visible: yup.boolean().default(true),
        })
        .test('widget-validation', function (value) {
            const errors: string[] = [];

            // Проверяем только если виджет реально добавлен (не пустой)
            if (value && value.id) {
                if (!value.name || value.name.trim() === '') {
                    errors.push(`Виджет ${value.id}: Название обязательно`);
                }
                if (!value.slug || value.slug.trim() === '') {
                    errors.push(`Виджет ${value.id}: Slug обязателен`);
                }
                if (!value.position_name || value.position_name.trim() === '') {
                    errors.push(`Виджет ${value.id}: Позиция обязательна`);
                }
                if (
                    value.order === undefined ||
                    value.order === null ||
                    value.order < 0
                ) {
                    errors.push(`Виджет ${value.id}: Порядок обязателен`);
                }
            }

            if (errors.length > 0) {
                return this.createError({ message: errors.join('; ') });
            }

            return true;
        });

    const widgetsSchema = yup.array().of(widgetSchema);

    // Функция для проверки наличия ошибок в вкладке
    const hasErrorsInTab = (tab: string) => {
        return validationErrors[tab] && validationErrors[tab].length > 0;
    };

    // Настройки сайта с хуком
    const { siteSettings, updateSetting } = useSiteSettings({
        initialSettings: {
            title: site.name || '',
            description: site.description || '',
            seoTitle: site.seo_config?.title || '',
            seoDescription: site.seo_config?.description || '',
            seoKeywords: site.seo_config?.keywords || '',
        },
    });

    const handleSiteSettingChange = (key: string, value: string) => {
        updateSetting(key as keyof typeof siteSettings, value);
    };

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true);
            // Здесь будет логика сохранения настроек
            console.log('Saving settings:', siteSettings);
            // TODO: Добавить API вызов для сохранения настроек
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Организации',
            href: '/dashboard/organizations',
        },
        {
            title: organization.name,
            href: `/dashboard/organization/${organization.id}/admin`,
        },
        {
            title: 'Сайты',
            href: `/dashboard/organization/${organization.id}/admin/sites`,
        },
        {
            title: site.name,
            href: `/dashboard/organization/${organization.id}/admin/sites/${site.id}/builder`,
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="default">Опубликован</Badge>;
            case 'draft':
                return <Badge variant="secondary">Черновик</Badge>;
            case 'archived':
                return <Badge variant="destructive">Архив</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Проверяем, что site.id существует
            if (!site?.id) {
                throw new Error('Site ID is not defined');
            }

            // Валидируем виджеты только если они есть
            if (widgets.length > 0) {
                try {
                    await widgetsSchema.validate(widgets, {
                        abortEarly: false,
                    });
                    // Очищаем ошибки если валидация прошла успешно
                    setValidationErrors({});
                } catch (validationError) {
                    if (validationError instanceof yup.ValidationError) {
                        const errors: string[] = [];

                        validationError.inner.forEach((error) => {
                            if (error.message) {
                                // Разбиваем сообщения по точкам с запятой для получения отдельных ошибок
                                const errorMessages = error.message.split('; ');
                                errors.push(...errorMessages);
                            }
                        });

                        console.error('Validation errors:', errors);
                        setValidationErrors({ builder: errors });
                        setIsSaving(false);
                        return;
                    }
                }
            } else {
                // Если виджетов нет, очищаем ошибки
                setValidationErrors({});
            }

            // Сохраняем конфигурацию виджетов
            const content = {
                widgets: widgets,
            };

            console.log('Site ID:', site.id);
            console.log('Saving content:', content);

            // Используем Inertia.js для отправки данных
            router.post(
                `/sites/${site.id}/save-config`,
                {
                    widgets: content.widgets || [],
                },
                {
                    onSuccess: () => {
                        console.log('Site configuration saved successfully');
                        setValidationErrors({});
                        // Можно добавить toast уведомление вместо alert
                    },
                    onError: (errors) => {
                        console.error('Error saving:', errors);
                        alert(
                            'Ошибка при сохранении: ' + JSON.stringify(errors),
                        );
                    },
                    onFinish: () => {
                        setIsSaving(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error saving:', error);
            alert('Ошибка при сохранении конфигурации');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreview = async () => {
        try {
            // Получаем URL для предпросмотра
            const response = await fetch(`/api/sites/${site.id}/preview`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get preview URL');
            }

            const result = await response.json();
            console.log('Preview URL:', result.data.preview_url);

            // Открываем предпросмотр в новой вкладке
            window.open(result.data.preview_url, '_blank');
        } catch (error) {
            console.error('Error getting preview:', error);
            alert('Ошибка при получении предпросмотра');
        }
    };

    const handleWidgetsChange = (newWidgets: any[]) => {
        setWidgets(newWidgets);
    };

    const handleAddWidget = async (widgetData: any) => {
        try {
            // Здесь будет логика добавления виджета через API
            console.log('Adding widget:', widgetData);
            // await addWidgetToSite(site.id, widgetData);
        } catch (error) {
            console.error('Error adding widget:', error);
        }
    };

    const tabs = [
        {
            id: 'builder',
            label: 'Конструктор',
            icon: Settings,
        },
        {
            id: 'preview',
            label: 'Предпросмотр',
            icon: Eye,
        },
        {
            id: 'settings',
            label: 'Настройки',
            icon: Globe,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Конструктор - ${site.name}`} />

            <div className="flex h-screen flex-col">
                {/* Header */}
                <div className="border-b bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`/dashboard/organization/${organization.id}/admin/sites`}
                            >
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Назад к сайтам
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold">
                                    {site.name}
                                </h1>
                                <div className="mt-1 flex items-center space-x-2">
                                    {getStatusBadge(site.status)}
                                    {site.is_maintenance_mode && (
                                        <Badge variant="destructive">
                                            Тех. работы
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Предпросмотр
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share className="mr-2 h-4 w-4" />
                                Поделиться
                            </Button>
                            <Button
                                size="sm"
                                disabled={isSaving}
                                onClick={() => handleSave({})}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex items-center space-x-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    } ${
                                        hasErrorsInTab(tab.id)
                                            ? 'border-2 border-red-500'
                                            : ''
                                    }`}
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
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'builder' && (
                        <SiteBuilder
                            siteId={site.id}
                            template={site.template}
                            initialWidgets={site.widgets_config || []}
                            onWidgetsChange={handleWidgetsChange}
                            validationErrors={validationErrors['builder'] || []}
                        />
                    )}

                    {activeTab === 'preview' && (
                        <div className="bg-muted flex h-full items-center justify-center">
                            <div className="text-center">
                                <Eye className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">
                                    Предварительный просмотр
                                </h3>
                                <p className="mb-4 text-muted-foreground">
                                    Здесь будет отображаться предварительный
                                    просмотр сайта
                                </p>
                                {site.url && (
                                    <Button asChild>
                                        <a
                                            href={site.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Globe className="mr-2 h-4 w-4" />
                                            Открыть сайт
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <SettingsContent
                            siteSettings={siteSettings}
                            site={site}
                            isSaving={isSaving}
                            onSettingChange={handleSiteSettingChange}
                            onSaveSettings={handleSaveSettings}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
