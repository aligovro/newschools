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
    status: string;
    template: string;
    layout_config?: any;
    custom_css?: string;
    custom_js?: string;
    pages?: any[];
    menus?: any[];
    media?: any[];
    sliders?: any[];
}

interface SiteConstructorProps {
    organization: Organization;
    site: Site;
    templates: any[];
    widgets: any[];
    colorSchemes: any[];
}

const SiteConstructor: React.FC<SiteConstructorProps> = ({
    organization,
    site,
    templates,
    widgets,
    colorSchemes,
}) => {
    // Отладочная информация
    console.log('SiteConstructor - site:', site);
    console.log('SiteConstructor - site.id:', site.id);
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

        router.put(
            route('organizations.sites.builder.save', {
                organization: organization.id,
                site: site.id,
            }),
            {
                layout_config: content,
                title: site.name,
                custom_css: site.custom_css || '',
                custom_js: site.custom_js || '',
            },
            {
                onSuccess: () => {
                    toast.success('Изменения сохранены');
                    setIsSaving(false);
                },
                onError: () => {
                    toast.error('Ошибка при сохранении');
                    setIsSaving(false);
                },
            },
        );
    };

    const handlePublish = () => {
        setIsPublishing(true);
        router.post(
            route('organizations.sites.builder.publish', {
                organization: organization.id,
                site: site.id,
            }),
            {},
            {
                onSuccess: () => {
                    toast.success('Сайт опубликован');
                    setIsPublishing(false);
                },
                onError: () => {
                    toast.error('Ошибка при публикации');
                    setIsPublishing(false);
                },
            },
        );
    };

    const handleUnpublish = () => {
        router.post(
            route('organizations.sites.builder.unpublish', {
                organization: organization.id,
                site: site.id,
            }),
            {},
            {
                onSuccess: () => {
                    toast.success('Сайт снят с публикации');
                },
                onError: () => {
                    toast.error('Ошибка при снятии с публикации');
                },
            },
        );
    };

    const handlePreview = async () => {
        try {
            // Сначала сохраняем текущую конфигурацию виджетов
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
                    widgets: siteContent.widgets || [],
                }),
            });

            if (response.ok) {
                // Затем открываем предпросмотр
                window.open(
                    route('sites.preview', { slug: site.slug }),
                    '_blank',
                );
            } else {
                console.error(
                    'Ошибка при сохранении конфигурации для предпросмотра',
                );
                toast.error('Ошибка при подготовке предпросмотра');
            }
        } catch (error) {
            console.error('Ошибка при сохранении конфигурации:', error);
            toast.error('Ошибка при подготовке предпросмотра');
        }
    };

    const handleAddWidget = (widget: any, position: string) => {
        // Логика добавления виджета
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
                                <div className="h-6 w-px bg-gray-300" />
                                <div>
                                    <h1 className="text-lg font-semibold">
                                        {site.name}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {organization.name} • Конструктор сайта
                                    </p>
                                </div>
                            </div>

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
                            <div className="flex-1 p-6">
                                <div className="mx-auto max-w-4xl space-y-6">
                                    {/* Основные настройки */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Основные настройки
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Название сайта
                                                </label>
                                                <input
                                                    type="text"
                                                    value={siteSettings.title}
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Введите название сайта"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Описание сайта
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={
                                                        siteSettings.description
                                                    }
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Введите описание сайта"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Настройки дизайна */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Настройки дизайна
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Цветовая схема
                                                </label>
                                                <div className="flex space-x-2">
                                                    {[
                                                        {
                                                            value: 'blue',
                                                            color: 'bg-blue-600',
                                                            name: 'Синяя',
                                                        },
                                                        {
                                                            value: 'green',
                                                            color: 'bg-green-600',
                                                            name: 'Зеленая',
                                                        },
                                                        {
                                                            value: 'purple',
                                                            color: 'bg-purple-600',
                                                            name: 'Фиолетовая',
                                                        },
                                                        {
                                                            value: 'red',
                                                            color: 'bg-red-600',
                                                            name: 'Красная',
                                                        },
                                                        {
                                                            value: 'orange',
                                                            color: 'bg-orange-600',
                                                            name: 'Оранжевая',
                                                        },
                                                        {
                                                            value: 'gray',
                                                            color: 'bg-gray-600',
                                                            name: 'Серая',
                                                        },
                                                    ].map((scheme) => (
                                                        <button
                                                            key={scheme.value}
                                                            onClick={() =>
                                                                handleSiteSettingChange(
                                                                    'colorScheme',
                                                                    scheme.value,
                                                                )
                                                            }
                                                            className={`h-8 w-8 rounded-full border-2 ${
                                                                siteSettings.colorScheme ===
                                                                scheme.value
                                                                    ? 'border-gray-300'
                                                                    : 'border-transparent'
                                                            } ${scheme.color}`}
                                                            title={scheme.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Шрифт
                                                </label>
                                                <select
                                                    value={siteSettings.font}
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'font',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="inter">
                                                        Inter
                                                    </option>
                                                    <option value="roboto">
                                                        Roboto
                                                    </option>
                                                    <option value="open-sans">
                                                        Open Sans
                                                    </option>
                                                    <option value="lato">
                                                        Lato
                                                    </option>
                                                    <option value="montserrat">
                                                        Montserrat
                                                    </option>
                                                    <option value="poppins">
                                                        Poppins
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Размер шрифта
                                                </label>
                                                <select
                                                    value={
                                                        siteSettings.fontSize
                                                    }
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'fontSize',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="small">
                                                        Мелкий
                                                    </option>
                                                    <option value="medium">
                                                        Средний
                                                    </option>
                                                    <option value="large">
                                                        Крупный
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Ширина контента
                                                </label>
                                                <select
                                                    value={siteSettings.layout}
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'layout',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="narrow">
                                                        Узкая
                                                    </option>
                                                    <option value="medium">
                                                        Средняя
                                                    </option>
                                                    <option value="wide">
                                                        Широкая
                                                    </option>
                                                    <option value="full">
                                                        На всю ширину
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Стиль шапки
                                                </label>
                                                <select
                                                    value={
                                                        siteSettings.headerStyle
                                                    }
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'headerStyle',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="default">
                                                        По умолчанию
                                                    </option>
                                                    <option value="minimal">
                                                        Минималистичный
                                                    </option>
                                                    <option value="bold">
                                                        Выделяющийся
                                                    </option>
                                                    <option value="transparent">
                                                        Прозрачный
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Стиль подвала
                                                </label>
                                                <select
                                                    value={
                                                        siteSettings.footerStyle
                                                    }
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'footerStyle',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="default">
                                                        По умолчанию
                                                    </option>
                                                    <option value="minimal">
                                                        Минималистичный
                                                    </option>
                                                    <option value="detailed">
                                                        Подробный
                                                    </option>
                                                    <option value="social">
                                                        С социальными сетями
                                                    </option>
                                                </select>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* SEO настройки */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>SEO настройки</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    SEO заголовок
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        siteSettings.seoTitle
                                                    }
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'seoTitle',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Введите SEO заголовок"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    SEO описание
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={
                                                        siteSettings.seoDescription
                                                    }
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'seoDescription',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Введите SEO описание"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    SEO ключевые слова
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        siteSettings.seoKeywords
                                                    }
                                                    onChange={(e) =>
                                                        handleSiteSettingChange(
                                                            'seoKeywords',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Введите ключевые слова через запятую"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Кнопка сохранения */}
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleSaveSettings}
                                            disabled={isSaving}
                                            className="w-full"
                                        >
                                            {isSaving
                                                ? 'Сохранение...'
                                                : 'Сохранить настройки'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default SiteConstructor;
