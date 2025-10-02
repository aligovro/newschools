import { SettingsContent } from '@/components/site-builder/layout';
import { SiteBuilder } from '@/components/site-builder/SiteBuilder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteSettings } from '@/hooks';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Eye, Layout, Settings, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    status: string;
    layout_config?: Record<string, unknown>;
    template: any;
}

interface SiteConstructorProps {
    organization: Organization;
    site: Site;
    colorSchemes: any[];
}

export const SiteConstructorOptimized: React.FC<SiteConstructorProps> = ({
    organization,
    site,
    colorSchemes,
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [siteContent, setSiteContent] = useState(site.layout_config || {});
    const [activeTab, setActiveTab] = useState('builder');

    // Настройки сайта с хуком
    const { siteSettings, updateSetting } = useSiteSettings({
        initialSettings: {
            title: site.name || '',
            description: site.description || '',
            seoTitle: site.seo_title || '',
            seoDescription: site.seo_description || '',
            seoKeywords: site.seo_keywords || '',
        },
    });

    const handleSave = (content: Record<string, unknown>) => {
        setIsSaving(true);
        setSiteContent(content);
        // Логика сохранения
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Контент сохранен');
        }, 1000);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            // Логика публикации
            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.success('Сайт опубликован');
        } catch (error) {
            toast.error('Ошибка при публикации');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        setIsPublishing(true);
        try {
            // Логика снятия с публикации
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Сайт снят с публикации');
        } catch (error) {
            toast.error('Ошибка при снятии с публикации');
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePreview = async () => {
        try {
            // Сначала сохраняем конфигурацию виджетов
            const response = await fetch(`/api/sites/${site.id}/save-config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    widgets: siteContent,
                }),
            });

            if (response.ok) {
                // Открываем предпросмотр
                const previewUrl = route('sites.preview', { slug: site.slug });
                window.open(previewUrl, '_blank');
            } else {
                throw new Error('Failed to save configuration');
            }
        } catch (error) {
            console.error('Error preparing preview:', error);
            toast.error('Ошибка при подготовке предпросмотра');
        }
    };

    const handleAddWidget = (widget: any, position: string) => {
        console.log('Adding widget:', widget, 'to position:', position);
    };

    const handleSiteSettingChange = (key: string, value: string) => {
        updateSetting(key as keyof typeof siteSettings, value);
    };

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true);
            const response = await fetch(
                route('organizations.sites.builder.save', {
                    organization: organization.id,
                    site: site.id,
                }),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        name: siteSettings.title,
                        description: siteSettings.description,
                        seo_title: siteSettings.seoTitle,
                        seo_description: siteSettings.seoDescription,
                        seo_keywords: siteSettings.seoKeywords,
                        theme_config: {
                            colorScheme: siteSettings.colorScheme,
                            font: siteSettings.font,
                            fontSize: siteSettings.fontSize,
                            layout: siteSettings.layout,
                            headerStyle: siteSettings.headerStyle,
                            footerStyle: siteSettings.footerStyle,
                        },
                    }),
                },
            );

            if (response.ok) {
                toast.success('Настройки сохранены');
            } else {
                toast.error('Ошибка при сохранении настроек');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Ошибка при сохранении настроек');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head title={`Конструктор сайта - ${site.name}`} />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="border-b bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                'organizations.sites.index',
                                                organization.id,
                                            ),
                                        )
                                    }
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Назад к сайтам
                                </Button>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        {site.name}
                                    </h1>
                                    <div className="flex items-center space-x-2">
                                        <Badge
                                            variant={
                                                site.status === 'published'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {site.status === 'published'
                                                ? 'Опубликован'
                                                : 'Черновик'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreview}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Предпросмотр
                                </Button>

                                {site.status === 'published' ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleUnpublish}
                                        disabled={isPublishing}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        {isPublishing
                                            ? 'Снятие...'
                                            : 'Снять с публикации'}
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={handlePublish}
                                        disabled={isPublishing}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {isPublishing
                                            ? 'Публикация...'
                                            : 'Опубликовать'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="h-[calc(100vh-4rem)]">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="h-full"
                    >
                        <div className="border-b bg-white px-6 py-4">
                            <TabsList>
                                <TabsTrigger
                                    value="builder"
                                    className="flex items-center space-x-2"
                                >
                                    <Layout className="h-4 w-4" />
                                    <span>Конструктор</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="settings"
                                    className="flex items-center space-x-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Настройки</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {activeTab === 'builder' && (
                            <SiteBuilder
                                initialContent={siteContent}
                                onSave={handleSave}
                                onPreview={handlePreview}
                                template={site.template}
                                onAddWidget={handleAddWidget}
                                className="h-full"
                            />
                        )}

                        {activeTab === 'settings' && (
                            <SettingsContent
                                siteSettings={siteSettings}
                                isSaving={isSaving}
                                onSettingChange={handleSiteSettingChange}
                                onSaveSettings={handleSaveSettings}
                            />
                        )}
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default SiteConstructorOptimized;
