import { SiteBuilder } from '@/components/site-builder/SiteBuilder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, Globe, Save, Settings, Share } from 'lucide-react';
import { useState } from 'react';

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
    const [activeTab, setActiveTab] = useState<
        'builder' | 'preview' | 'settings'
    >('builder');
    const [isSaving, setIsSaving] = useState(false);

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
            href: `/organization/${organization.id}/admin`,
        },
        {
            title: 'Сайты',
            href: `/organization/${organization.id}/admin/sites`,
        },
        {
            title: site.name,
            href: `/organization/${organization.id}/admin/sites/${site.id}/builder`,
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

    const handleSave = async (content: any) => {
        setIsSaving(true);
        try {
            // Здесь будет логика сохранения через API
            console.log('Saving content:', content);
            // await saveSiteContent(site.id, content);
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreview = () => {
        setActiveTab('preview');
        // Здесь будет логика предварительного просмотра
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
                                href={`/organization/${organization.id}/admin/sites`}
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
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'builder' && (
                        <SiteBuilder
                            initialContent={{
                                blocks: site.content_blocks || [],
                                layout: site.layout_config || {},
                                theme: site.theme_config || {},
                            }}
                            onSave={handleSave}
                            onPreview={handlePreview}
                            template={site.template}
                            onAddWidget={handleAddWidget}
                            widgets={site.widgets || []}
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
                        <div className="p-6">
                            <div className="mx-auto max-w-4xl space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Основные настройки
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Название сайта
                                                </label>
                                                <input
                                                    type="text"
                                                    value={site.name}
                                                    className="mt-1 w-full rounded-md border px-3 py-2"
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">
                                                    URL-адрес
                                                </label>
                                                <input
                                                    type="text"
                                                    value={site.slug}
                                                    className="mt-1 w-full rounded-md border px-3 py-2"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">
                                                Описание
                                            </label>
                                            <textarea
                                                value={site.description}
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                                rows={3}
                                                readOnly
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>SEO настройки</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Meta заголовок
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    site.seo_config?.title || ''
                                                }
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">
                                                Meta описание
                                            </label>
                                            <textarea
                                                value={
                                                    site.seo_config
                                                        ?.description || ''
                                                }
                                                className="mt-1 w-full rounded-md border px-3 py-2"
                                                rows={3}
                                                readOnly
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end">
                                    <Link
                                        href={`/organization/${organization.id}/admin/sites/${site.id}/edit`}
                                    >
                                        <Button>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Редактировать настройки
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
