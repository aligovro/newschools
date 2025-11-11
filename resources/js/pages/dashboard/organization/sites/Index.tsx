import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Edit,
    Eye,
    Globe,
    Plus,
    Settings,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Site {
    id: number;
    name: string;
    slug: string;
    description: string;
    template: string;
    status: 'draft' | 'published' | 'archived';
    is_public: boolean;
    is_maintenance_mode: boolean;
    created_at: string;
    updated_at: string;
    url?: string;
    pages_count?: number;
}

interface Props {
    organization: Organization;
    sites: {
        data: Site[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function OrganizationSitesIndex({ organization, sites }: Props) {
    const [selectedSites, setSelectedSites] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Админ панель',
            href: '/dashboard',
        },
        {
            title: 'Школы',
            href: '/dashboard/organizations',
        },
        {
            title: organization.name,
            href: `/dashboard/organizations/${organization.id}`,
        },
        {
            title: 'Сайты',
            href: `/dashboard/organizations/${organization.id}/sites`,
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

    const getTemplateBadge = (_template: string) => null;

    const handleDelete = (siteId: number) => {
        if (
            confirm(
                'Вы уверены, что хотите удалить этот сайт? Это действие нельзя отменить.',
            )
        ) {
            router.delete(
                `/dashboard/organizations/${organization.id}/sites/${siteId}`,
            );
        }
    };

    const handlePublish = (siteId: number) => {
        router.patch(
            `/dashboard/organizations/${organization.id}/sites/${siteId}/publish`,
        );
    };

    const handleUnpublish = (siteId: number) => {
        router.patch(
            `/dashboard/organizations/${organization.id}/sites/${siteId}/unpublish`,
        );
    };

    const handleArchive = (siteId: number) => {
        router.patch(
            `/dashboard/organizations/${organization.id}/sites/${siteId}/archive`,
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Сайты - ${organization.name}`} />

            <div className="space-x-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="ml-6 mt-6 flex flex-col items-start space-y-2">
                        <h1 className="text-3xl font-bold">Сайты</h1>
                        <p className="text-muted-foreground">
                            Управление сайтами организации
                        </p>
                    </div>
                    <Link
                        href={`/dashboard/organizations/${organization.id}/sites/create`}
                    >
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Создать сайт
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Всего сайтов
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {sites.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Опубликовано
                            </CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    sites.data.filter(
                                        (site) => site.status === 'published',
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Черновики
                            </CardTitle>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    sites.data.filter(
                                        (site) => site.status === 'draft',
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                В архиве
                            </CardTitle>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    sites.data.filter(
                                        (site) => site.status === 'archived',
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sites List */}
                <div className="grid gap-4">
                    {sites.data.map((site) => (
                        <Card key={site.id}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center space-x-2">
                                                <h3 className="text-lg font-semibold">
                                                    {site.name}
                                                </h3>
                                                {getStatusBadge(site.status)}
                                                {/* Template badge removed */}
                                                {site.is_maintenance_mode && (
                                                    <Badge variant="destructive">
                                                        Тех. работы
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mb-2 text-muted-foreground">
                                                {site.description}
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                <span>
                                                    Создан:{' '}
                                                    {new Date(
                                                        site.created_at,
                                                    ).toLocaleDateString(
                                                        'ru-RU',
                                                    )}
                                                </span>
                                                <span>
                                                    Обновлен:{' '}
                                                    {new Date(
                                                        site.updated_at,
                                                    ).toLocaleDateString(
                                                        'ru-RU',
                                                    )}
                                                </span>
                                                {site.pages_count && (
                                                    <span>
                                                        Страниц:{' '}
                                                        {site.pages_count}
                                                    </span>
                                                )}
                                            </div>
                                            {site.url && (
                                                <div className="mt-2">
                                                    <Link
                                                        href={site.url}
                                                        target="_blank"
                                                        className="flex items-center text-sm text-blue-600 hover:underline"
                                                    >
                                                        <Globe className="mr-1 h-3 w-3" />
                                                        {site.url}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Link
                                            href={`/dashboard/organizations/${organization.id}/sites/${site.id}/builder`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-1 h-4 w-4" />
                                                Редактировать
                                            </Button>
                                        </Link>

                                        <Link
                                            href={`/dashboard/organizations/${organization.id}/sites/${site.id}/edit`}
                                        >
                                            <Button variant="ghost" size="sm">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <div className="flex items-center space-x-1">
                                            {site.status === 'published' ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleUnpublish(site.id)
                                                    }
                                                >
                                                    Снять с публикации
                                                </Button>
                                            ) : site.status === 'draft' ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePublish(site.id)
                                                    }
                                                >
                                                    Опубликовать
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleArchive(site.id)
                                                    }
                                                >
                                                    Архивировать
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(site.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {sites.data.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">
                                Сайты не найдены
                            </h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                У этой организации пока нет сайтов. Создайте
                                первый сайт, чтобы начать.
                            </p>
                            <Link
                                href={`/dashboard/organizations/${organization.id}/sites/create`}
                            >
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Создать первый сайт
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
