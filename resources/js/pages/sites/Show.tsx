import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    ArrowLeft,
    Edit,
    FileText,
    Globe,
    Home,
    Plus,
    Search,
    Settings,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    template: string;
    site_type: string;
    status: string;
    is_public: boolean;
    is_maintenance_mode: boolean;
    logo?: string;
    favicon?: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    organization?: {
        id: number;
        name: string;
        slug: string;
    };
    domain?: {
        id: number;
        domain: string;
        custom_domain?: string;
    };
    pages_count: number;
    widgets_count: number;
}

interface Page {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    status: string;
    is_homepage: boolean;
    is_public: boolean;
    show_in_navigation: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    parent?: {
    id: number;
    title: string;
        slug: string;
    };
}

interface Props {
    site: Site;
    pages: {
        data: Page[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    pageFilters: {
        page_search?: string;
        page_status?: string;
        page_per_page?: string;
    };
}

export default function SiteShow({ site, pages, pageFilters }: Props) {
    const [pageSearch, setPageSearch] = useState(
        pageFilters.page_search || '',
    );
    const [pageStatus, setPageStatus] = useState(
        pageFilters.page_status || 'all',
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Сайты',
            href: '/dashboard/sites',
        },
        {
            title: site.name,
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

    const handlePageSearch = () => {
        router.get(`/dashboard/sites/${site.id}`, {
            page_search: pageSearch,
            page_status: pageStatus === 'all' ? '' : pageStatus,
            page_per_page: pageFilters.page_per_page || '10',
        });
    };

    const handlePageReset = () => {
        setPageSearch('');
        setPageStatus('all');
        router.get(`/dashboard/sites/${site.id}`);
    };

    const getPageStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="default">Опубликована</Badge>;
            case 'draft':
                return <Badge variant="secondary">Черновик</Badge>;
            case 'private':
                return <Badge variant="outline">Приватная</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

        return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${site.name} - Сайт`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard/sites">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">{site.name}</h1>
                            <p className="text-muted-foreground">
                                {site.description || 'Сайт организации'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/dashboard/sites/${site.id}/builder`}>
                            <Button variant="outline">
                                <Wrench className="mr-2 h-4 w-4" />
                                Конструктор
                            </Button>
                        </Link>
                        <Link href={`/dashboard/sites/${site.id}/pages`}>
                            <Button variant="outline">
                                <FileText className="mr-2 h-4 w-4" />
                                Страницы
                            </Button>
                        </Link>
                        <Link href={`/dashboard/sites/${site.id}/pages/create`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Создать страницу
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Site Info Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Статус
                            </CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {getStatusBadge(site.status)}
                            {site.is_maintenance_mode && (
                                <Badge variant="destructive" className="ml-2">
                                    Тех. работы
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Страниц
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {site.pages_count}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Виджетов
                            </CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {site.widgets_count}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Тип сайта
                            </CardTitle>
                            <Home className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge variant="outline">
                                {site.site_type === 'main'
                                    ? 'Главный'
                                    : 'Организации'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Site Details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Site Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Информация о сайте</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Название
                                        </label>
                                        <p className="text-sm">{site.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Slug
                                        </label>
                                        <p className="text-sm">/{site.slug}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Шаблон
                                        </label>
                                        <p className="text-sm">{site.template}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Публичный
                                        </label>
                                        <p className="text-sm">
                                            {site.is_public ? 'Да' : 'Нет'}
                                        </p>
                                    </div>
                                    {site.organization && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Организация
                                            </label>
                                            <p className="text-sm">
                                                {site.organization.name}
                                            </p>
                                        </div>
                                    )}
                                    {site.domain && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Домен
                                            </label>
                                            <p className="text-sm">
                                                {site.domain.custom_domain ||
                                                    site.domain.domain}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {site.description && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Описание
                                        </label>
                                        <p className="text-sm">{site.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pages Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Страницы сайта</CardTitle>
                                    <Link
                                        href={`/dashboard/sites/${site.id}/pages/create`}
                                    >
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Создать
                                        </Button>
                                    </Link>
                            </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Pages Filters */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Поиск страниц..."
                                        value={pageSearch}
                                        onChange={(e) =>
                                            setPageSearch(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === 'Enter' &&
                                            handlePageSearch()
                                        }
                                        className="flex-1"
                                    />
                                    <Select
                                        value={pageStatus}
                                        onValueChange={setPageStatus}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Все
                                            </SelectItem>
                                            <SelectItem value="published">
                                                Опубликованы
                                            </SelectItem>
                                            <SelectItem value="draft">
                                                Черновики
                                            </SelectItem>
                                            <SelectItem value="private">
                                                Приватные
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handlePageSearch}
                                        size="sm"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handlePageReset}
                                        size="sm"
                                    >
                                        Сбросить
                                    </Button>
                                </div>

                                {/* Pages List */}
                                <div className="space-y-2">
                                    {pages.data.map((page) => (
                                        <div
                                            key={page.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {page.is_homepage && (
                                                    <Home className="h-4 w-4 text-primary" />
                                                )}
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={`/dashboard/sites/${site.id}/pages/${page.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {page.title}
                                                        </Link>
                                                        {getPageStatusBadge(
                                                            page.status,
                                                        )}
                                                        {page.is_homepage && (
                                                            <Badge variant="default">
                                                                Главная
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {page.excerpt && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {page.excerpt}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        /{page.slug}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/dashboard/sites/${site.id}/pages/${page.id}/edit`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                    </div>
                                ))}
                        </div>

                                {/* Empty State */}
                                {pages.data.length === 0 && (
                                    <div className="py-8 text-center">
                                        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            Страницы не найдены
                                        </p>
                    </div>
                                )}

                                {/* Pagination */}
                                {pages.last_page > 1 && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Показано {pages.data.length} из{' '}
                                            {pages.total} страниц
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {pages.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={
                                                        link.active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            window.location.href =
                                                                link.url;
                                                        }
                                                    }}
                                                >
                                                    {link.label}
                                                </Button>
                                            ))}
                        </div>
                    </div>
                                )}
                            </CardContent>
                        </Card>
                            </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Действия</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link
                                    href={`/dashboard/sites/${site.id}/builder`}
                                    className="block"
                                >
                                    <Button variant="outline" className="w-full">
                                        <Wrench className="mr-2 h-4 w-4" />
                                        Открыть конструктор
                                    </Button>
                                </Link>
                                <Link
                                    href={`/dashboard/sites/${site.id}/pages`}
                                    className="block"
                                >
                                    <Button variant="outline" className="w-full">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Все страницы
                                    </Button>
                                </Link>
                                <Link
                                    href={`/dashboard/sites/${site.id}/pages/create`}
                                    className="block"
                                            >
                                    <Button className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Создать страницу
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Метаданные</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                            <div>
                                    <span className="text-muted-foreground">
                                        Создан:{' '}
                                    </span>
                                    {new Date(
                                        site.created_at,
                                    ).toLocaleDateString('ru-RU')}
                            </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Обновлен:{' '}
                                    </span>
                                    {new Date(
                                        site.updated_at,
                                    ).toLocaleDateString('ru-RU')}
                        </div>
                                {site.published_at && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            Опубликован:{' '}
                                        </span>
                                        {new Date(
                                            site.published_at,
                                        ).toLocaleDateString('ru-RU')}
                        </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
