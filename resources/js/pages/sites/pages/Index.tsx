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
import { Edit, Eye, FileText, Home, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Site {
    id: number;
    name: string;
    slug: string;
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
    filters: {
        search?: string;
        status?: string;
        template?: string;
    };
}

export default function SitePagesIndex({ site, pages, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Админ панель',
            href: '/dashboard',
        },
        {
            title: 'Сайты',
            href: '/dashboard/sites',
        },
        {
            title: site.name,
            href: `/dashboard/sites/${site.id}`,
        },
        {
            title: 'Страницы',
            href: `/dashboard/sites/${site.id}/pages`,
        },
    ];

    const getStatusBadge = (status: string) => {
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

    const handleSearch = () => {
        router.get(`/dashboard/sites/${site.id}/pages`, {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
            template: filters.template || '',
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('all');
        router.get(`/dashboard/sites/${site.id}/pages`);
    };

    const handleDelete = (pageId: number) => {
        if (
            confirm(
                'Вы уверены, что хотите удалить эту страницу? Это действие нельзя отменить.',
            )
        ) {
            router.delete(`/dashboard/sites/${site.id}/pages/${pageId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Страницы сайта - ${site.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Страницы</h1>
                        <p className="text-muted-foreground">
                            Управление страницами сайта "{site.name}"
                        </p>
                    </div>
                    <Link href={`/dashboard/sites/${site.id}/pages/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Создать страницу
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Всего страниц
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pages.total}
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
                                    pages.data.filter(
                                        (page) => page.status === 'published',
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
                                    pages.data.filter(
                                        (page) => page.status === 'draft',
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                                        Опубликована
                                    </SelectItem>
                                    <SelectItem value="draft">
                                        Черновик
                                    </SelectItem>
                                    <SelectItem value="private">
                                        Приватная
                                    </SelectItem>
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

                {/* Pages List */}
                <div className="grid gap-4">
                    {pages.data.map((page) => (
                        <Card key={page.id}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center space-x-2">
                                            {page.is_homepage && (
                                                <Home className="h-4 w-4 text-primary" />
                                            )}
                                            <h3 className="text-lg font-semibold">
                                                {page.title}
                                            </h3>
                                            {getStatusBadge(page.status)}
                                            {page.is_homepage && (
                                                <Badge variant="default">
                                                    Главная
                                                </Badge>
                                            )}
                                            {!page.is_public && (
                                                <Badge variant="outline">
                                                    Приватная
                                                </Badge>
                                            )}
                                        </div>
                                        {page.excerpt && (
                                            <p className="mb-2 text-muted-foreground">
                                                {page.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <span>Slug: /{page.slug}</span>
                                            {page.parent && (
                                                <span>
                                                    Родитель:{' '}
                                                    {page.parent.title}
                                                </span>
                                            )}
                                            <span>
                                                Создана:{' '}
                                                {new Date(
                                                    page.created_at,
                                                ).toLocaleDateString('ru-RU')}
                                            </span>
                                            {page.sort_order !== null && (
                                                <span>
                                                    Порядок: {page.sort_order}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Link
                                            href={`/dashboard/sites/${site.id}/pages/${page.id}`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-1 h-4 w-4" />
                                                Просмотр
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/dashboard/sites/${site.id}/pages/${page.id}/edit`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-1 h-4 w-4" />
                                                Редактировать
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(page.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {pages.data.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">
                                Страницы не найдены
                            </h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                По вашим критериям поиска страницы не найдены.
                            </p>
                            <Link
                                href={`/dashboard/sites/${site.id}/pages/create`}
                            >
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Создать страницу
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {pages.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Показано {pages.data.length} из {pages.total}{' '}
                            страниц
                        </div>
                        <div className="flex items-center space-x-2">
                            {pages.links.map((link, index) => (
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
