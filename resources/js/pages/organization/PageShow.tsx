import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Copy,
    Edit,
    Eye,
    FileText,
    Globe,
    Trash2,
    Users,
} from 'lucide-react';

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: 'draft' | 'published' | 'private' | 'scheduled';
    template: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    seo_image: string;
    featured_image: string;
    is_homepage: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    url: string;
    parent?: Page;
    children?: Page[];
}

interface Organization {
    id: number;
    name: string;
    domain: string;
}

interface PageShowProps {
    organization: Organization;
    page: Page;
}

const PageShow: React.FC<PageShowProps> = ({ organization, page }) => {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: 'Черновик', variant: 'secondary' as const },
            published: { label: 'Опубликовано', variant: 'success' as const },
            private: { label: 'Приватная', variant: 'warning' as const },
            scheduled: { label: 'Запланировано', variant: 'info' as const },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.draft;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getTemplateIcon = (template: string) => {
        const iconMap = {
            default: <FileText className="h-4 w-4" />,
            'full-width': <Globe className="h-4 w-4" />,
            landing: <Globe className="h-4 w-4" />,
            blog: <FileText className="h-4 w-4" />,
            contact: <FileText className="h-4 w-4" />,
            about: <FileText className="h-4 w-4" />,
        };
        return (
            iconMap[template as keyof typeof iconMap] || (
                <FileText className="h-4 w-4" />
            )
        );
    };

    const handleDelete = () => {
        if (confirm('Вы уверены, что хотите удалить эту страницу?')) {
            router.delete(
                route('organization.pages.destroy', {
                    organization: organization.id,
                    page: page.id,
                }),
            );
        }
    };

    const handleDuplicate = () => {
        router.post(
            route('organization.pages.duplicate', {
                organization: organization.id,
                page: page.id,
            }),
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getBreadcrumbs = () => {
        const breadcrumbs = [];
        let currentPage = page;

        while (currentPage) {
            breadcrumbs.unshift({
                title: currentPage.title,
                url: currentPage.url,
                slug: currentPage.slug,
            });
            currentPage = currentPage.parent;
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <AppLayout>
            <Head title={`${page.title} - ${organization.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route(
                                'organization.pages.index',
                                organization.id,
                            )}
                        >
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад к списку
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {page.title}
                            </h1>
                            <div className="mt-2 flex items-center gap-2">
                                {getStatusBadge(page.status)}
                                {page.is_homepage && (
                                    <Badge variant="outline">
                                        Главная страница
                                    </Badge>
                                )}
                                {getTemplateIcon(page.template)}
                                <span className="text-muted-foreground text-sm">
                                    {page.template}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={page.url} target="_blank">
                            <Button variant="outline">
                                <Eye className="mr-2 h-4 w-4" />
                                Предварительный просмотр
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Действия</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route('organization.pages.edit', {
                                            organization: organization.id,
                                            page: page.id,
                                        })}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Редактировать
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDuplicate}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Дублировать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Удалить
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Breadcrumbs */}
                {breadcrumbs.length > 1 && (
                    <nav className="text-muted-foreground flex items-center space-x-2 text-sm">
                        <Link
                            href={route(
                                'organization.pages.index',
                                organization.id,
                            )}
                            className="hover:text-foreground"
                        >
                            Страницы
                        </Link>
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2"
                            >
                                <span>/</span>
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="text-foreground font-medium">
                                        {breadcrumb.title}
                                    </span>
                                ) : (
                                    <Link
                                        href={breadcrumb.url}
                                        className="hover:text-foreground"
                                    >
                                        {breadcrumb.title}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Page Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Содержимое страницы</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {page.excerpt && (
                                    <div className="mb-4">
                                        <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                                            Краткое описание
                                        </h3>
                                        <p className="text-sm">
                                            {page.excerpt}
                                        </p>
                                    </div>
                                )}
                                {page.content ? (
                                    <div className="prose prose-sm max-w-none">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: page.content.replace(
                                                    /\n/g,
                                                    '<br>',
                                                ),
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        Содержимое не указано
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* SEO Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>SEO информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {page.seo_title && (
                                    <div>
                                        <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                                            SEO заголовок
                                        </h3>
                                        <p className="text-sm">
                                            {page.seo_title}
                                        </p>
                                    </div>
                                )}
                                {page.seo_description && (
                                    <div>
                                        <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                                            SEO описание
                                        </h3>
                                        <p className="text-sm">
                                            {page.seo_description}
                                        </p>
                                    </div>
                                )}
                                {page.seo_keywords && (
                                    <div>
                                        <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                                            Ключевые слова
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {page.seo_keywords
                                                .split(',')
                                                .map((keyword, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {keyword.trim()}
                                                    </Badge>
                                                ))}
                                        </div>
                                    </div>
                                )}
                                {page.seo_image && (
                                    <div>
                                        <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                                            SEO изображение
                                        </h3>
                                        <img
                                            src={page.seo_image}
                                            alt="SEO изображение"
                                            className="h-32 w-32 rounded-md object-cover"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Child Pages */}
                        {page.children && page.children.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Дочерние страницы</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {page.children.map((child) => (
                                            <div
                                                key={child.id}
                                                className="flex items-center justify-between rounded-md border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getTemplateIcon(
                                                        child.template,
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={route(
                                                                'organization.pages.show',
                                                                {
                                                                    organization:
                                                                        organization.id,
                                                                    page: child.id,
                                                                },
                                                            )}
                                                            className="hover:text-primary font-medium"
                                                        >
                                                            {child.title}
                                                        </Link>
                                                        <p className="text-muted-foreground text-sm">
                                                            {child.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(
                                                        child.status,
                                                    )}
                                                    <Link
                                                        href={child.url}
                                                        target="_blank"
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Page Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Информация о странице</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                                        URL
                                    </h3>
                                    <Link
                                        href={page.url}
                                        target="_blank"
                                        className="text-primary break-all text-sm hover:underline"
                                    >
                                        {page.url}
                                    </Link>
                                </div>

                                <div>
                                    <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                                        Slug
                                    </h3>
                                    <p className="font-mono text-sm">
                                        {page.slug}
                                    </p>
                                </div>

                                {page.parent && (
                                    <div>
                                        <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                                            Родительская страница
                                        </h3>
                                        <Link
                                            href={route(
                                                'organization.pages.show',
                                                {
                                                    organization:
                                                        organization.id,
                                                    page: page.parent.id,
                                                },
                                            )}
                                            className="text-primary text-sm hover:underline"
                                        >
                                            {page.parent.title}
                                        </Link>
                                    </div>
                                )}

                                <Separator />

                                <div>
                                    <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                                        Временные метки
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock className="text-muted-foreground h-4 w-4" />
                                            <span>
                                                Создано:{' '}
                                                {formatDate(page.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-muted-foreground h-4 w-4" />
                                            <span>
                                                Обновлено:{' '}
                                                {formatDate(page.updated_at)}
                                            </span>
                                        </div>
                                        {page.published_at && (
                                            <div className="flex items-center gap-2">
                                                <Users className="text-muted-foreground h-4 w-4" />
                                                <span>
                                                    Опубликовано:{' '}
                                                    {formatDate(
                                                        page.published_at,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media */}
                        {page.featured_image && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Изображение страницы</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <img
                                        src={page.featured_image}
                                        alt={page.title}
                                        className="h-48 w-full rounded-md object-cover"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Быстрые действия</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link
                                    href={route('organization.pages.edit', {
                                        organization: organization.id,
                                        page: page.id,
                                    })}
                                    className="block"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Редактировать страницу
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleDuplicate}
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Дублировать страницу
                                </Button>
                                <Link
                                    href={page.url}
                                    target="_blank"
                                    className="block"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Открыть на сайте
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PageShow;
