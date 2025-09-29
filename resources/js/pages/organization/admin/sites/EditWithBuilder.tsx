import { SiteBuilder } from '@/components/site-builder/SiteBuilder';
import { Button } from '@/components/ui/button';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Domain {
    id: number;
    domain: string;
    custom_domain?: string;
}

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    template: string;
    layout_config: any;
    theme_config: any;
    content_blocks: any;
    navigation_config: any;
    seo_config: any;
    custom_settings: any;
    logo?: string;
    favicon?: string;
    status: 'draft' | 'published' | 'archived';
    is_public: boolean;
    is_maintenance_mode: boolean;
    maintenance_message?: string;
    domain: Domain;
    created_at: string;
    updated_at: string;
}

interface Props {
    organization: Organization;
    site: Site;
    domains: Domain[];
    siteTemplates: Record<string, any>;
    contentBlocks: Record<string, any>;
}

export default function EditWithBuilder({
    organization,
    site,
    domains,
    siteTemplates,
    contentBlocks,
}: Props) {
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [builderContent, setBuilderContent] = useState(
        site.content_blocks || {},
    );

    const { data, setData, put, processing, errors } = useForm({
        name: site.name,
        domain_id: site.domain.id,
        slug: site.slug,
        description: site.description || '',
        template: site.template,
        layout_config: site.layout_config || {},
        theme_config: site.theme_config || {},
        content_blocks: site.content_blocks || {},
        navigation_config: site.navigation_config || {},
        seo_config: site.seo_config || {},
        custom_settings: site.custom_settings || {},
        is_public: site.is_public,
        is_maintenance_mode: site.is_maintenance_mode,
        maintenance_message: site.maintenance_message || '',
    });

    useEffect(() => {
        setData('content_blocks', builderContent);
    }, [builderContent, setData]);

    const handleSave = (content: any) => {
        setBuilderContent(content);
    };

    const handlePreview = () => {
        setIsPreviewMode(!isPreviewMode);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            route('organization.admin.sites.update', [
                organization.id,
                site.id,
            ]),
        );
    };

    if (isPreviewMode) {
        return (
            <>
                <Head title={`Предпросмотр - ${site.name}`} />
                <div className="flex h-screen flex-col">
                    <div className="border-b border-gray-200 bg-white px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold">
                                Предпросмотр сайта
                            </h1>
                            <Button variant="outline" onClick={handlePreview}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Вернуться к редактированию
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {/* Здесь будет отображение предпросмотра сайта */}
                        <div className="mx-auto max-w-4xl p-6">
                            <div className="rounded-lg bg-white p-8 shadow-lg">
                                <h1 className="mb-4 text-3xl font-bold">
                                    {site.name}
                                </h1>
                                <p className="mb-6 text-gray-600">
                                    {site.description}
                                </p>

                                {/* Отображение блоков контента */}
                                {builderContent.blocks?.map(
                                    (block: any, index: number) => (
                                        <div key={index} className="mb-6">
                                            <div className="rounded-lg bg-gray-100 p-4">
                                                <h3 className="mb-2 font-semibold">
                                                    Блок: {block.type}
                                                </h3>
                                                <pre className="text-sm text-gray-600">
                                                    {JSON.stringify(
                                                        block.content,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Редактирование - ${site.name}`} />

            <div className="flex h-screen flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                            <div>
                                <h1 className="text-xl font-semibold">
                                    Редактирование сайта
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {site.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={handlePreview}>
                                <Eye className="mr-2 h-4 w-4" />
                                Предпросмотр
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    <SiteBuilder
                        initialContent={builderContent}
                        onSave={handleSave}
                        onPreview={handlePreview}
                        className="h-full"
                    />
                </div>
            </div>
        </>
    );
}
