import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    FileText,
    Home,
    Trash2,
} from 'lucide-react';

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
    content?: string;
    status: string;
    template?: string;
    is_homepage: boolean;
    is_public: boolean;
    show_in_navigation: boolean;
    parent_id?: number;
    sort_order: number;
    image?: string;
    images?: string[];
    published_at?: string;
    created_at: string;
    updated_at: string;
    parent?: {
        id: number;
        title: string;
        slug: string;
    };
    children?: Array<{
        id: number;
        title: string;
        slug: string;
        sort_order: number;
    }>;
}

interface Props {
    site: Site;
    page: Page;
}

export default function ShowSitePage({ site, page }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Сайты', href: '/dashboard/sites' },
        { title: site.name, href: `/dashboard/sites/${site.id}` },
        { title: 'Страницы', href: `/dashboard/sites/${site.id}/pages` },
        { title: page.title },
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

    const handleDelete = () => {
        if (
            confirm(
                'Вы уверены, что хотите удалить эту страницу? Это действие нельзя отменить.',
            )
        ) {
            router.delete(`/dashboard/sites/${site.id}/pages/${page.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${page.title} - ${site.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <div className="mb-2 flex items-center space-x-2">
                                {page.is_homepage && (
                                    <Home className="h-5 w-5 text-primary" />
                                )}
                                <h1 className="text-3xl font-bold">
                                    {page.title}
                                </h1>
                                {getStatusBadge(page.status)}
                                {page.is_homepage && (
                                    <Badge variant="default">Главная</Badge>
                                )}
                                {!page.is_public && (
                                    <Badge variant="outline">Приватная</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                Страница сайта "{site.name}"
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link
                            href={`/dashboard/sites/${site.id}/pages/${page.id}/edit`}
                        >
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                        </Button>
                    </div>
                </div>

                {/* Page Info */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Images */}
                        {page.image && (
                            <Card>
                                <CardContent className="p-0">
                                    <img
                                        src={page.image || ''}
                                        alt={page.title}
                                        className="w-full h-64 object-cover rounded-t-lg"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Содержимое</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {page.excerpt && (
                                    <div>
                                        <h3 className="mb-2 font-semibold">
                                            Краткое описание
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {page.excerpt}
                                        </p>
                                    </div>
                                )}
                                {page.content && (
                                    <div>
                                        <h3 className="mb-2 font-semibold">
                                            Основное содержимое
                                        </h3>
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: page.content,
                                            }}
                                        />
                                    </div>
                                )}
                                {!page.content && !page.excerpt && (
                                    <p className="text-muted-foreground">
                                        Содержимое страницы не указано.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Images */}
                        {page.images && page.images.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Дополнительные изображения</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                        {page.images.map((imageUrl, index) => (
                                            <img
                                                key={index}
                                                src={imageUrl}
                                                alt={`${page.title} - ${index + 1}`}
                                                className="w-full h-32 object-cover rounded"
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Children Pages */}
                        {page.children && page.children.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Дочерние страницы</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {page.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/dashboard/sites/${site.id}/pages/${child.id}`}
                                                className="flex items-center justify-between rounded p-2 hover:bg-muted"
                                            >
                                                <span>{child.title}</span>
                                                <Badge variant="outline">
                                                    Порядок: {child.sort_order}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Page Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Информация о странице</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        URL (slug)
                                    </h4>
                                    <p className="text-sm">/{page.slug || '(не указан)'}</p>
                                </div>
                                {page.template && (
                                    <div>
                                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                            Шаблон
                                        </h4>
                                        <p className="text-sm">
                                            {page.template}
                                        </p>
                                    </div>
                                )}
                                {page.parent && (
                                    <div>
                                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                            Родительская страница
                                        </h4>
                                        <Link
                                            href={`/dashboard/sites/${site.id}/pages/${page.parent.id}`}
                                            className="text-primary text-sm hover:underline"
                                        >
                                            {page.parent.title}
                                        </Link>
                                    </div>
                                )}
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        Порядок сортировки
                                    </h4>
                                    <p className="text-sm">
                                        {page.sort_order}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        Создана
                                    </h4>
                                    <p className="text-sm">
                                        {page.created_at
                                            ? new Date(
                                                  page.created_at,
                                              ).toLocaleString('ru-RU')
                                            : 'Не указано'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        Обновлена
                                    </h4>
                                    <p className="text-sm">
                                        {page.updated_at
                                            ? new Date(
                                                  page.updated_at,
                                              ).toLocaleString('ru-RU')
                                            : 'Не указано'}
                                    </p>
                                </div>
                                {page.published_at && (
                                    <div>
                                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                            Опубликована
                                        </h4>
                                        <p className="text-sm">
                                            {new Date(
                                                page.published_at,
                                            ).toLocaleString('ru-RU')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Page Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Главная страница</span>
                                    <Badge
                                        variant={
                                            page.is_homepage
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {page.is_homepage ? 'Да' : 'Нет'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Публичная</span>
                                    <Badge
                                        variant={
                                            page.is_public
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {page.is_public ? 'Да' : 'Нет'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        В навигации
                                    </span>
                                    <Badge
                                        variant={
                                            page.show_in_navigation
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {page.show_in_navigation ? 'Да' : 'Нет'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

