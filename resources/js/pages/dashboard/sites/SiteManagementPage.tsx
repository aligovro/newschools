import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Edit,
    Eye,
    FileText,
    Globe,
    Plus,
    Search,
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
    site_type: 'organization' | 'main';
    status: 'draft' | 'published' | 'archived';
    is_public: boolean;
    is_maintenance_mode: boolean;
    is_main_site: boolean;
    created_at: string;
    updated_at: string;
    pages_count: number;
    widgets_count: number;
    organization?: Organization;
    url?: string;
}

interface SiteTemplate {
    slug: string;
    name: string;
}

interface Filters {
    search?: string;
    status?: string;
    template?: string;
    organization_id?: string;
    sort_by?: string;
    sort_direction?: string;
    per_page?: string;
}

interface Props {
    sites: {
        data: Site[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    organizations: Organization[];
    templates: SiteTemplate[];
    filters: Filters;
    terminology?: {
        organization?: {
            singular_nominative?: string;
        };
    };
}

export default function SiteManagementPage({
    sites,
    organizations,
    templates,
    filters,
    terminology,
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [templateFilter, setTemplateFilter] = useState('all');
    const [organizationFilter, setOrganizationFilter] = useState(
        filters.organization_id || 'all',
    );
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(
        filters.sort_direction || 'desc',
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Админ панель',
            href: '/dashboard',
        },
        {
            title: 'Сайты',
            href: '/dashboard/sites',
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

    const handleSearch = () => {
        router.get('/dashboard/sites', {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
            template: '',
            organization_id:
                organizationFilter === 'all' ? '' : organizationFilter,
            sort_by: sortBy,
            sort_direction: sortDirection,
            per_page: filters.per_page,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setTemplateFilter('all');
        setOrganizationFilter('all');
        setSortBy('created_at');
        setSortDirection('desc');
        router.get('/dashboard/sites');
    };

    const handleDelete = (siteId: number) => {
        if (
            confirm(
                'Вы уверены, что хотите удалить этот сайт? Это действие нельзя отменить.',
            )
        ) {
            router.delete(`/dashboard/sites/${siteId}`);
        }
    };

    const handlePublish = (siteId: number) => {
        router.patch(`/dashboard/sites/${siteId}`, {
            status: 'published',
        });
    };

    const handleUnpublish = (siteId: number) => {
        router.patch(`/dashboard/sites/${siteId}`, {
            status: 'draft',
        });
    };

    const handleArchive = (siteId: number) => {
        router.patch(`/dashboard/sites/${siteId}`, {
            status: 'archived',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Управление сайтами" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Сайты</h1>
                        <p className="text-muted-foreground">
                            Управление всеми сайтами
                        </p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Создать сайт
                    </Button>
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

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Фильтры и поиск</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                            <div className="md:col-span-2">
                                <Input
                                    placeholder="Поиск по названию, slug, описанию..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Статус" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Все статусы
                                    </SelectItem>
                                    <SelectItem value="published">
                                        Опубликован
                                    </SelectItem>
                                    <SelectItem value="draft">
                                        Черновик
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Архив
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Template filter removed */}
                            <Select
                                value={organizationFilter}
                                onValueChange={setOrganizationFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Организация" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Все организации
                                    </SelectItem>
                                    {organizations.map((org) => (
                                        <SelectItem
                                            key={org.id}
                                            value={org.id.toString()}
                                        >
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex space-x-2">
                                <Button onClick={handleSearch}>
                                    <Search className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Сбросить
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                                {site.is_main_site && (
                                                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                                                        Главный сайт
                                                    </Badge>
                                                )}
                                                {getStatusBadge(site.status)}
                                                {getTemplateBadge(
                                                    site.template,
                                                )}
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
                                                {site.site_type === 'main' ? (
                                                    <span>Главный сайт</span>
                                                ) : (
                                                    <span>
                                                        {terminology
                                                            ?.organization
                                                            ?.singular_nominative ||
                                                            'Организация'}
                                                        :{' '}
                                                        {site.organization
                                                            ?.name ?? '—'}
                                                    </span>
                                                )}
                                                <span>
                                                    Создан:{' '}
                                                    {new Date(
                                                        site.created_at,
                                                    ).toLocaleDateString(
                                                        'ru-RU',
                                                    )}
                                                </span>
                                                <span>
                                                    Страниц: {site.pages_count}
                                                </span>
                                                <span>
                                                    Виджетов:{' '}
                                                    {site.widgets_count}
                                                </span>
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
                                            href={`/dashboard/sites/${site.id}`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-1 h-4 w-4" />
                                                Просмотр
                                            </Button>
                                        </Link>

                                        <Link
                                            href={`/dashboard/sites/${site.id}/pages`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <FileText className="mr-1 h-4 w-4" />
                                                Страницы ({site.pages_count})
                                            </Button>
                                        </Link>

                                        <Link
                                            href={`/dashboard/sites/${site.id}/builder`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-1 h-4 w-4" />
                                                Изменить
                                            </Button>
                                        </Link>

                                        <div className="flex items-center space-x-1">
                                            {site.status === 'published' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleUnpublish(site.id)
                                                    }
                                                >
                                                    Снять с публикации
                                                </Button>
                                            ) : site.status === 'draft' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePublish(site.id)
                                                    }
                                                >
                                                    Опубликовать
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleArchive(site.id)
                                                    }
                                                >
                                                    Архивировать
                                                </Button>
                                            )}

                                            {!site.is_main_site && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(site.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
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
                                По вашим критериям поиска сайты не найдены.
                            </p>
                            <Button onClick={handleReset}>
                                Сбросить фильтры
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {sites.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Показано {sites.data.length} из {sites.total} сайтов
                        </div>
                        <div className="flex items-center space-x-2">
                            {sites.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) {
                                            window.location.href = link.url;
                                        }
                                    }}
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
