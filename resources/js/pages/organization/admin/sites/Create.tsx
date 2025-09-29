import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Select } from '@/components/common/ui/select';
import { Textarea } from '@/components/common/ui/textarea';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Globe, Image, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface Domain {
    id: number;
    domain: string;
    custom_domain?: string;
    status: string;
}

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    organization: Organization;
    domains: Domain[];
    templates: Record<string, any>;
}

export default function SiteCreate({
    organization,
    domains,
    templates,
}: Props) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        domain_id: '',
        description: '',
        template: 'default',
        logo: null as File | null,
        favicon: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('organization.admin.sites.store', organization.id), {
            forceFormData: true,
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('favicon', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setFaviconPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const selectedTemplateConfig = templates[selectedTemplate] || {};

    return (
        <>
            <Head title={`Создать сайт - ${organization.name}`} />

            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Создать сайт
                        </h1>
                        <p className="text-gray-600">
                            Настройте новый сайт для организации
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Основная информация */}
                        <Card className="p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Основная информация
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Название сайта</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Введите название сайта"
                                        className="mt-1"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="domain_id">Домен</Label>
                                    <Select
                                        value={data.domain_id}
                                        onValueChange={(value) =>
                                            setData('domain_id', value)
                                        }
                                    >
                                        <option value="">Выберите домен</option>
                                        {domains.map((domain) => (
                                            <option
                                                key={domain.id}
                                                value={domain.id}
                                            >
                                                {domain.custom_domain ||
                                                    domain.domain}
                                            </option>
                                        ))}
                                    </Select>
                                    {errors.domain_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.domain_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Описание
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
                                        placeholder="Краткое описание сайта"
                                        className="mt-1"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Шаблон и дизайн */}
                        <Card className="p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Шаблон и дизайн
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="template">
                                        Шаблон сайта
                                    </Label>
                                    <Select
                                        value={data.template}
                                        onValueChange={(value) => {
                                            setData('template', value);
                                            setSelectedTemplate(value);
                                        }}
                                    >
                                        {Object.entries(templates).map(
                                            ([key, config]) => (
                                                <option key={key} value={key}>
                                                    {config.name}
                                                </option>
                                            ),
                                        )}
                                    </Select>
                                    {selectedTemplateConfig.description && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {selectedTemplateConfig.description}
                                        </p>
                                    )}
                                    {errors.template && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.template}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="logo">Логотип</Label>
                                        <div className="mt-1">
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="logo"
                                                className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                                            >
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="h-full w-full rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            Загрузить логотип
                                                        </p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        {errors.logo && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.logo}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="favicon">
                                            Фавиконка
                                        </Label>
                                        <div className="mt-1">
                                            <Input
                                                id="favicon"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFaviconChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="favicon"
                                                className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                                            >
                                                {faviconPreview ? (
                                                    <img
                                                        src={faviconPreview}
                                                        alt="Favicon preview"
                                                        className="h-full w-full rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <Image className="mx-auto h-8 w-8 text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            Загрузить фавиконку
                                                        </p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        {errors.favicon && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.favicon}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Предварительный просмотр шаблона */}
                    {selectedTemplateConfig && (
                        <Card className="p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Предварительный просмотр
                            </h2>
                            <div className="rounded-lg border bg-gray-50 p-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
                                        <Globe className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {data.name || 'Название сайта'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedTemplateConfig.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-600">
                                    <p>
                                        <strong>Цветовая схема:</strong>{' '}
                                        {selectedTemplateConfig.default_theme
                                            ?.primary_color || 'Не указано'}
                                    </p>
                                    <p>
                                        <strong>Доступные блоки:</strong>{' '}
                                        {selectedTemplateConfig.available_blocks?.join(
                                            ', ',
                                        ) || 'Не указано'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Создание...' : 'Создать сайт'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
