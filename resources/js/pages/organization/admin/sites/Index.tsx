import { Badge } from '@/components/common/ui/badge';
import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    Edit,
    Eye,
    EyeOff,
    Globe,
    Layout,
    MoreHorizontal,
    Plus,
    Settings,
    Trash2,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    template: string;
    status: 'draft' | 'published' | 'archived';
    is_public: boolean;
    is_maintenance_mode: boolean;
    logo?: string;
    logo_url?: string;
    created_at: string;
    updated_at: string;
    domain: {
        id: number;
        domain: string;
        custom_domain?: string;
    };
    pages: Array<{
        id: number;
        title: string;
        status: string;
    }>;
}

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    organization: Organization;
    sites: Site[];
    templates: Record<string, any>;
}

export default function SitesIndex({ organization, sites, templates }: Props) {
    const [showActions, setShowActions] = useState<number | null>(null);

    const handleDelete = (site: Site) => {
        if (confirm(`Вы уверены, что хотите удалить сайт "${site.name}"?`)) {
            router.delete(
                route('organization.admin.sites.destroy', [
                    organization.id,
                    site.id,
                ]),
            );
        }
    };

    const handlePublish = (site: Site) => {
        router.patch(
            route('organization.admin.sites.publish', [
                organization.id,
                site.id,
            ]),
        );
    };

    const handleUnpublish = (site: Site) => {
        router.patch(
            route('organization.admin.sites.unpublish', [
                organization.id,
                site.id,
            ]),
        );
    };

    const handleArchive = (site: Site) => {
        router.patch(
            route('organization.admin.sites.archive', [
                organization.id,
                site.id,
            ]),
        );
    };

    const handleMaintenanceMode = (site: Site) => {
        if (site.is_maintenance_mode) {
            router.patch(
                route('organization.admin.sites.disable-maintenance', [
                    organization.id,
                    site.id,
                ]),
            );
        } else {
            const message = prompt(
                'Введите сообщение для режима обслуживания (необязательно):',
            );
            router.patch(
                route('organization.admin.sites.enable-maintenance', [
                    organization.id,
                    site.id,
                ]),
                { message },
            );
        }
    };

    const getStatusBadge = (site: Site) => {
        if (site.is_maintenance_mode) {
            return (
                <Badge variant="destructive" className="bg-orange-500">
                    Обслуживание
                </Badge>
            );
        }

        switch (site.status) {
            case 'published':
                return (
                    <Badge variant="default" className="bg-green-500">
                        Опубликован
                    </Badge>
                );
            case 'draft':
                return (
                    <Badge variant="secondary" className="bg-gray-500">
                        Черновик
                    </Badge>
                );
            case 'archived':
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-600"
                    >
                        Архивирован
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getTemplateName = (template: string) => {
        return templates[template]?.name || template;
    };

    const getSiteUrl = (site: Site) => {
        const domain = site.domain.custom_domain || site.domain.domain;
        return `http://${domain}`;
    };

    return (
        <>
            <Head title={`Сайты - ${organization.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Сайты
                        </h1>
                        <p className="text-gray-600">
                            Управление сайтами организации
                        </p>
                    </div>
                    <Link
                        href={route(
                            'organization.admin.sites.create',
                            organization.id,
                        )}
                    >
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Создать сайт
                        </Button>
                    </Link>
                </div>

                {sites.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Globe className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            Нет сайтов
                        </h3>
                        <p className="mt-2 text-gray-500">
                            Создайте первый сайт для вашей организации
                        </p>
                        <Link
                            href={route(
                                'organization.admin.sites.create',
                                organization.id,
                            )}
                        >
                            <Button className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Создать сайт
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sites.map((site) => (
                            <Card key={site.id} className="overflow-hidden">
                                <div className="relative">
                                    {site.logo_url && (
                                        <div className="h-48 bg-gray-100">
                                            <img
                                                src={site.logo_url}
                                                alt={site.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    {!site.logo_url && (
                                        <div className="flex h-48 items-center justify-center bg-gray-100">
                                            <Globe className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}

                                    <div className="absolute right-2 top-2">
                                        <div className="relative">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 rounded-full bg-white/80 p-0 hover:bg-white"
                                                onClick={() =>
                                                    setShowActions(
                                                        showActions === site.id
                                                            ? null
                                                            : site.id,
                                                    )
                                                }
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>

                                            {showActions === site.id && (
                                                <div className="absolute right-0 top-10 z-10 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <Link
                                                        href={route(
                                                            'organization.admin.sites.edit',
                                                            [
                                                                organization.id,
                                                                site.id,
                                                            ],
                                                        )}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Edit className="mr-3 h-4 w-4" />
                                                        Редактировать
                                                    </Link>

                                                    <Link
                                                        href={route(
                                                            'organization.admin.sites.builder',
                                                            [
                                                                organization.id,
                                                                site.id,
                                                            ],
                                                        )}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Layout className="mr-3 h-4 w-4" />
                                                        Конструктор
                                                    </Link>

                                                    <a
                                                        href={getSiteUrl(site)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Eye className="mr-3 h-4 w-4" />
                                                        Просмотр
                                                    </a>

                                                    {site.status ===
                                                    'published' ? (
                                                        <button
                                                            onClick={() =>
                                                                handleUnpublish(
                                                                    site,
                                                                )
                                                            }
                                                            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <EyeOff className="mr-3 h-4 w-4" />
                                                            Снять с публикации
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handlePublish(
                                                                    site,
                                                                )
                                                            }
                                                            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Eye className="mr-3 h-4 w-4" />
                                                            Опубликовать
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() =>
                                                            handleMaintenanceMode(
                                                                site,
                                                            )
                                                        }
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Wrench className="mr-3 h-4 w-4" />
                                                        {site.is_maintenance_mode
                                                            ? 'Отключить обслуживание'
                                                            : 'Режим обслуживания'}
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleArchive(site)
                                                        }
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Archive className="mr-3 h-4 w-4" />
                                                        Архивировать
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(site)
                                                        }
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                                    >
                                                        <Trash2 className="mr-3 h-4 w-4" />
                                                        Удалить
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {site.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {site.description ||
                                                    'Без описания'}
                                            </p>
                                        </div>
                                        {getStatusBadge(site)}
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Globe className="mr-2 h-4 w-4" />
                                            <span>
                                                {site.domain.custom_domain ||
                                                    site.domain.domain}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-500">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>
                                                {getTemplateName(site.template)}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="mr-2">📄</span>
                                            <span>
                                                {site.pages.length} страниц
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            Обновлен{' '}
                                            {new Date(
                                                site.updated_at,
                                            ).toLocaleDateString()}
                                        </span>

                                        <div className="flex space-x-2">
                                            <Link
                                                href={route(
                                                    'organization.admin.sites.edit',
                                                    [organization.id, site.id],
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Редактировать
                                                </Button>
                                            </Link>

                                            <Link
                                                href={route(
                                                    'organization.admin.sites.builder',
                                                    [organization.id, site.id],
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Layout className="mr-2 h-4 w-4" />
                                                    Конструктор
                                                </Button>
                                            </Link>

                                            <a
                                                href={getSiteUrl(site)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Просмотр
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
